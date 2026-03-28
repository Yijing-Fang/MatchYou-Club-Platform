import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/club.css";

const ClubLogin = () => {
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ checking: true, ready: false, needManual: false });
  const [showSqlPanel, setShowSqlPanel] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
  });
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    // 检查是否已登录
    const clubAdminInfo = localStorage.getItem("clubAdminInfo");
    if (clubAdminInfo) {
      window.location.href = "/#/club/info";
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
        .from("club_admin")
        .select("admin_id")
        .limit(1)
        .maybeSingle();
      
      if (!isMountedRef.current) return;
      
      if (error && (error.message.includes("does not exist") || error.code === '42P01')) {
        console.log("【数据库检查】club_admin 表不存在");
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
      const { data: account1 } = await supabase
        .from("club_admin")
        .select("student_id, name, password, status")
        .eq("student_id", "2025001001")
        .maybeSingle();
      
      const { data: account2 } = await supabase
        .from("club_admin")
        .select("student_id, name, password, status")
        .eq("student_id", "2025002001")
        .maybeSingle();

      const { data: allAdmins } = await supabase
        .from("club_admin")
        .select("student_id, name")
        .limit(5);

      if (!isMountedRef.current) return;

      const info = {
        account1: account1 ? { 
          exists: true, 
          name: account1.name, 
          status: account1.status,
          password: account1.password
        } : { exists: false },
        account2: account2 ? { 
          exists: true, 
          name: account2.name, 
          status: account2.status,
          password: account2.password
        } : { exists: false },
        totalAdmins: allAdmins?.length || 0,
        allAdminIds: allAdmins?.map(a => a.student_id) || []
      };

      setDiagnosticInfo(info);
      
      if (!account1 && !account2) {
        toast.error("体验账号未找到，请执行SQL初始化数据");
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("【体验账号检查】异常:", error);
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

    if (!formData.studentId.trim()) {
      toast.error("请输入学号");
      return;
    }
    if (!formData.password) {
      toast.error("请输入密码");
      return;
    }

    setLoading(true);

    try {
      // 直接使用明文密码
      const inputPassword = formData.password;
      console.log("【登录】输入学号:", formData.studentId);
      console.log("【登录】输入密码(明文):", inputPassword);

      const { data, error } = await supabase
        .from("club_admin")
        .select("*")
        .eq("student_id", formData.studentId)
        .maybeSingle();

      if (error) {
        toast.error("数据库查询失败: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        toast.error("学号不存在");
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
            studentId: formData.studentId,
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
      localStorage.setItem("clubAdminInfo", JSON.stringify(data));
      toast.success("登录成功");
      
      setTimeout(() => {
        window.location.href = "/#/club/info";
      }, 500);
    } catch (error) {
      toast.error("登录失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (type) => {
    if (type === 1) {
      setFormData({ studentId: "2025001001", password: "123456" });
      toast.info("已填充体验账号1: 2025001001 / 123456");
    } else {
      setFormData({ studentId: "2025002001", password: "123456" });
      toast.info("已填充体验账号2: 2025002001 / 123456");
    }
  };

  // 社团管理员专用 SQL - 使用明文密码
  const getClubAdminSQL = () => {
    return `-- 创建 club_admin 表（社团管理员表）
CREATE TABLE IF NOT EXISTS club_admin (
    admin_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    club_id INTEGER NOT NULL DEFAULT 0,
    position VARCHAR(20) NOT NULL DEFAULT '社长',
    phone VARCHAR(11) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    register_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入社团管理员体验账号（密码为明文: 123456）
INSERT INTO club_admin (student_id, name, password, club_id, position, phone, status)
VALUES 
    ('2025001001', '张社长', '123456', 1, '社长', '13800138101', 1),
    ('2025002001', '刘社长', '123456', 2, '社长', '13800138102', 1)
ON CONFLICT (student_id) DO NOTHING;`;
  };

  return (
    <div className="club-page">
      <div className="club-login-container">
        <div className="club-login-header">
          <h1>社团管理员登录</h1>
          <p>Match You社团招新管理平台</p>
        </div>

        {/* 数据库初始化提示 */}
        {dbStatus?.needManual && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '15px', 
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '10px', fontSize: '14px' }}>
              ⚠️ 数据库表未初始化
            </div>
            <div style={{ marginBottom: '12px' }}>
              <button 
                onClick={() => setShowSqlPanel(!showSqlPanel)}
                style={{
                  background: '#fee2e2',
                  border: '1px solid #f87171',
                  color: '#dc2626',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  width: '100%'
                }}
              >
                {showSqlPanel ? '收起操作指南 ▲' : '查看详细操作指南 ▼'}
              </button>
            </div>
            {showSqlPanel && (
              <div style={{ marginTop: '10px' }}>
                <textarea 
                  readOnly
                  value={getClubAdminSQL()}
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
                    navigator.clipboard.writeText(getClubAdminSQL());
                    toast.success("SQL 已复制到剪贴板");
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginBottom: '8px'
                  }}
                >
                  📋 复制 SQL 语句
                </button>
                <button
                  onClick={checkDatabase}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🔄 刷新检测
                </button>
              </div>
            )}
          </div>
        )}

        {/* 数据库状态显示 */}
        {dbStatus?.ready && diagnosticInfo && (
          <div style={{ 
            background: diagnosticInfo.account1?.exists && diagnosticInfo.account2?.exists ? '#f0fdf4' : '#fef3c7', 
            border: `1px solid ${diagnosticInfo.account1?.exists && diagnosticInfo.account2?.exists ? '#86efac' : '#fcd34d'}`, 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '15px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold', color: diagnosticInfo.account1?.exists && diagnosticInfo.account2?.exists ? '#166534' : '#92400e', marginBottom: '8px' }}>
              📊 数据库状态
            </div>
            <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
              <div>✅ club_admin 表已创建</div>
              <div>👤 体验账号1 (2025001001): {diagnosticInfo.account1?.exists ? `✅ 存在 (${diagnosticInfo.account1.name})` : '❌ 不存在'}</div>
              <div>👤 体验账号2 (2025002001): {diagnosticInfo.account2?.exists ? `✅ 存在 (${diagnosticInfo.account2.name})` : '❌ 不存在'}</div>
              <div>📈 总管理员数: {diagnosticInfo.totalAdmins || 0}</div>
              {diagnosticInfo.allAdminIds && diagnosticInfo.allAdminIds.length > 0 && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#6b7280' }}>
                  已有学号: {diagnosticInfo.allAdminIds.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 体验账号提示 */}
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '8px', 
          padding: '12px', 
          marginBottom: '20px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '8px' }}>
            🎓 体验账号（点击快速填充）：
          </div>
          <div 
            style={{ color: '#0284c7', cursor: 'pointer', marginBottom: '4px', padding: '4px 0', borderRadius: '4px' }}
            onClick={() => fillDemoAccount(1)}
          >
            账号1: 2025001001 / 密码: 123456
          </div>
          <div 
            style={{ color: '#0284c7', cursor: 'pointer', padding: '4px 0', borderRadius: '4px' }}
            onClick={() => fillDemoAccount(2)}
          >
            账号2: 2025002001 / 密码: 123456
          </div>
        </div>

        {/* 登录错误诊断信息 */}
        {diagnosticInfo?.lastAttempt && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '15px',
            fontSize: '11px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '6px' }}>
              🔍 上次登录诊断
            </div>
            <div style={{ color: '#7f1d1d', fontFamily: 'monospace', lineHeight: '1.5' }}>
              <div>学号: {diagnosticInfo.lastAttempt.studentId}</div>
              <div>输入密码: {diagnosticInfo.lastAttempt.inputPassword}</div>
              <div>数据库密码: {diagnosticInfo.lastAttempt.dbPassword}</div>
              <div style={{ marginTop: '4px', color: '#dc2626' }}>
                ⚠️ 密码不匹配！请确认数据库密码为明文"123456"
              </div>
            </div>
          </div>
        )}

        <form className="club-login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">学号</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入学号"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || dbStatus.checking}
            style={{ marginTop: '10px' }}
          >
            {loading ? "登录中..." : dbStatus.checking ? "检查数据库..." : "登录"}
          </button>
        </form>

        <div className="club-login-footer">
          © 2026 Match You社团 版权所有
        </div>
      </div>
    </div>
  );
};

export default ClubLogin;
