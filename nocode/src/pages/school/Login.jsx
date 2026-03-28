import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/school.css";

const SchoolLogin = () => {
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ checking: true, ready: false, needManual: false });
  const [showSqlPanel, setShowSqlPanel] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    // 检查是否已登录
    const schoolAdminInfo = localStorage.getItem("schoolAdminInfo");
    if (schoolAdminInfo) {
      window.location.href = "/#/school/audit";
      return;
    }
    
    checkDatabase();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkDatabase = async () => {
    try {
      const { error } = await supabase
        .from("school_admin")
        .select("school_admin_id")
        .limit(1)
        .maybeSingle();
      
      if (!isMountedRef.current) return;
      
      if (error && (error.message.includes("does not exist") || error.code === '42P01')) {
        console.log("【数据库检查】school_admin 表不存在");
        setDbStatus({ checking: false, ready: false, needManual: true });
        return;
      }
      
      if (error) {
        console.error("【数据库检查】错误:", error);
        setDbStatus({ checking: false, ready: false, needManual: true });
        return;
      }
      
      setDbStatus({ checking: false, ready: true, needManual: false });
      checkDemoAccounts();
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("【数据库检查】异常:", error);
      setDbStatus({ checking: false, ready: false, needManual: true });
    }
  };

  const checkDemoAccounts = async () => {
    try {
      const { data: account } = await supabase
        .from("school_admin")
        .select("username, name, password, status")
        .eq("username", "school_admin")
        .maybeSingle();

      const { data: allAdmins } = await supabase
        .from("school_admin")
        .select("username, name")
        .limit(5);

      if (!isMountedRef.current) return;

      const info = {
        account: account ? { 
          exists: true, 
          name: account.name, 
          status: account.status,
          password: account.password
        } : { exists: false },
        totalAdmins: allAdmins?.length || 0,
        allUsernames: allAdmins?.map(a => a.username) || []
      };

      setDiagnosticInfo(info);
      
      if (!account) {
        toast.error("体验账号未找到，请执行SQL初始化数据");
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      setDiagnosticInfo({ error: error.message });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!dbStatus.ready && dbStatus.needManual) {
      toast.error("请先创建数据库表");
      setShowSqlPanel(true);
      return;
    }

    if (!formData.username.trim()) {
      toast.error("请输入用户名");
      return;
    }
    if (!formData.password) {
      toast.error("请输入密码");
      return;
    }

    setLoading(true);

    try {
      // 仅允许 school_admin 登录
      if (formData.username !== "school_admin") {
        toast.error("用户名不存在");
        setLoading(false);
        return;
      }

      // 直接使用明文密码
      const inputPassword = formData.password;
      console.log("【登录】输入用户名:", formData.username);
      console.log("【登录】输入密码(明文):", inputPassword);

      const { data, error } = await supabase
        .from("school_admin")
        .select("*")
        .eq("username", formData.username)
        .maybeSingle();

      if (error) {
        toast.error("数据库查询失败: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        toast.error("用户名不存在");
        setLoading(false);
        checkDemoAccounts();
        return;
      }

      console.log("【登录】数据库密码:", data.password);
      console.log("【登录】密码匹配:", data.password === inputPassword);
      
      // 直接比对明文密码
      if (data.password !== inputPassword) {
        toast.error("密码错误");
        
        setDiagnosticInfo(prev => ({
          ...(prev || {}),
          lastAttempt: {
            username: formData.username,
            inputPassword: inputPassword,
            dbPassword: data.password,
            match: false
          }
        }));
        
        setLoading(false);
        return;
      }

      if (data.status !== 1) {
        toast.error("账号已被禁用");
        setLoading(false);
        return;
      }

      // 保存登录信息
      localStorage.setItem("schoolAdminInfo", JSON.stringify(data));
      toast.success("登录成功");
      
      setTimeout(() => {
        window.location.href = "/#/school/audit";
      }, 500);
    } catch (error) {
      toast.error("登录失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setFormData({ username: "school_admin", password: "123456" });
    toast.info("已填充体验账号: school_admin / 123456");
  };

  // 学校管理员专用 SQL - 使用明文密码
  const getSchoolAdminSQL = () => {
    return `-- 创建 school_admin 表（学校管理员表）
CREATE TABLE IF NOT EXISTS school_admin (
    school_admin_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    phone VARCHAR(11),
    status SMALLINT NOT NULL DEFAULT 1,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入学校管理员体验账号（密码为明文: 123456）
INSERT INTO school_admin (username, name, password, phone, status)
VALUES 
    ('school_admin', '张老师', '123456', '13800138201', 1)
ON CONFLICT (username) DO NOTHING;`;
  };

  return (
    <div className="school-page">
      <div className="school-login-container">
        <div className="school-login-header">
          <h1>学校管理员登录</h1>
          <p>学校社联最高权限管理平台</p>
        </div>

        {/* 数据库初始化提示 */}
        {dbStatus?.needManual && (
          <div className="school-alert school-alert-error" style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
              ⚠️ 数据库表未初始化
            </div>
            <div style={{ marginBottom: '12px' }}>
              <button 
                onClick={() => setShowSqlPanel(!showSqlPanel)}
                className="school-btn school-btn-sm"
                style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#dc2626', width: '100%' }}
              >
                {showSqlPanel ? '收起操作指南 ▲' : '查看详细操作指南 ▼'}
              </button>
            </div>
            {showSqlPanel && (
              <div style={{ marginTop: '10px' }}>
                <textarea 
                  readOnly
                  value={getSchoolAdminSQL()}
                  style={{
                    width: '100%',
                    height: '150px',
                    padding: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    background: '#fef2f2',
                    resize: 'none',
                    marginBottom: '8px'
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getSchoolAdminSQL());
                    toast.success("SQL 已复制到剪贴板");
                  }}
                  className="school-btn school-btn-error school-btn-sm"
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  📋 复制 SQL 语句
                </button>
                <button
                  onClick={checkDatabase}
                  className="school-btn school-btn-success school-btn-sm"
                  style={{ width: '100%' }}
                >
                  🔄 刷新检测
                </button>
              </div>
            )}
          </div>
        )}

        {/* 数据库状态显示 */}
        {dbStatus?.ready && diagnosticInfo && (
          <div className={`school-alert ${diagnosticInfo.account?.exists ? 'school-alert-success' : 'school-alert-warning'}`} style={{ marginBottom: '15px', fontSize: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              📊 数据库状态
            </div>
            <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
              <div>✅ school_admin 表已创建</div>
              <div>👤 体验账号 (school_admin): {diagnosticInfo.account?.exists ? `✅ 存在 (${diagnosticInfo.account.name})` : '❌ 不存在'}</div>
              <div>📈 总管理员数: {diagnosticInfo.totalAdmins || 0}</div>
            </div>
          </div>
        )}

        {/* 体验账号提示 */}
        <div className="school-alert school-alert-info" style={{ marginBottom: '20px', fontSize: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            🎓 体验账号（点击快速填充）：
          </div>
          <div 
            style={{ color: '#0284c7', cursor: 'pointer', padding: '4px 0', borderRadius: '4px' }}
            onClick={fillDemoAccount}
          >
            用户名: school_admin / 密码: 123456
          </div>
        </div>

        {/* 登录错误诊断信息 */}
        {diagnosticInfo?.lastAttempt && (
          <div className="school-alert school-alert-error" style={{ marginBottom: '15px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              🔍 上次登录诊断
            </div>
            <div style={{ fontFamily: 'monospace', lineHeight: '1.5' }}>
              <div>用户名: {diagnosticInfo.lastAttempt.username}</div>
              <div>输入密码: {diagnosticInfo.lastAttempt.inputPassword}</div>
              <div>数据库密码: {diagnosticInfo.lastAttempt.dbPassword}</div>
              <div style={{ marginTop: '4px', color: '#dc2626' }}>
                ⚠️ 密码不匹配！请确认数据库密码为明文"123456"
              </div>
            </div>
          </div>
        )}

        <form className="school-login-form" onSubmit={handleLogin}>
          <div className="school-form-group">
            <label className="school-form-label">用户名</label>
            <input
              type="text"
              className="school-form-input"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="school-form-group">
            <label className="school-form-label">密码</label>
            <input
              type="password"
              className="school-form-input"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="school-btn school-btn-primary"
            disabled={loading || dbStatus.checking}
            style={{ marginTop: '10px', width: '100%' }}
          >
            {loading ? "登录中..." : dbStatus.checking ? "检查数据库..." : "登录"}
          </button>
        </form>

        <div className="school-login-footer">
          © 2026 Match You社团 版权所有
        </div>
      </div>
    </div>
  );
};

export default SchoolLogin;
