import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkAndInitDatabase, getManualSQL } from "@/utils/dbInit";
import "@/styles/student.css";

const StudentLogin = () => {
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
    // 组件挂载检查
    isMountedRef.current = true;
    
    checkDatabase();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkDatabase = async () => {
    try {
      const result = await checkAndInitDatabase();
      if (!isMountedRef.current) return;
      
      if (result.success) {
        setDbStatus({ checking: false, ready: true, needManual: false });
        checkDemoAccounts();
      } else {
        setDbStatus({ checking: false, ready: false, needManual: result.needManualSetup });
        if (result.needManualSetup) {
          toast.error("数据库表未创建，请查看下方操作指南");
        }
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      setDbStatus({ checking: false, ready: false, needManual: true });
    }
  };

  const checkDemoAccounts = async () => {
    try {
      const { data: account1 } = await supabase
        .from("student")
        .select("student_id, name, password, status")
        .eq("student_id", "2026001001")
        .maybeSingle();
      
      const { data: account2 } = await supabase
        .from("student")
        .select("student_id, name, password, status")
        .eq("student_id", "2026002001")
        .maybeSingle();

      const { data: allStudents } = await supabase
        .from("student")
        .select("student_id, name")
        .limit(5);

      if (!isMountedRef.current) return;

      const info = {
        account1: account1 ? { 
          exists: true, 
          name: account1.name, 
          status: account1.status
        } : { exists: false },
        account2: account2 ? { 
          exists: true, 
          name: account2.name, 
          status: account2.status
        } : { exists: false },
        totalStudents: allStudents?.length || 0,
        allStudentIds: allStudents?.map(s => s.student_id) || []
      };

      setDiagnosticInfo(info);
      
      if (!account1 && !account2) {
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
      // 使用明文密码
      const inputPassword = formData.password;
      console.log("【登录】输入学号:", formData.studentId);
      console.log("【登录】输入密码(明文):", inputPassword);

      const { data, error } = await supabase
        .from("student")
        .select("*")
        .eq("student_id", formData.studentId)
        .maybeSingle();

      if (error) {
        toast.error("数据库查询失败: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        toast.error("学号不存在，请先注册");
        setLoading(false);
        checkDemoAccounts();
        return;
      }

      console.log("【登录】数据库密码:", data.password);
      console.log("【登录】密码匹配:", data.password === inputPassword);
      
      // 直接比对明文密码
      if (data.password !== inputPassword) {
        toast.error("密码错误，请重新输入");
        
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

      // 登录成功
      localStorage.setItem("studentInfo", JSON.stringify(data));
      toast.success("登录成功");

      // 判断是否首次登录
      const registerTime = new Date(data.register_time || Date.now());
      const now = new Date();
      const diffHours = (now - registerTime) / (1000 * 60 * 60);
      
      setTimeout(() => {
        if (diffHours <= 24) {
          window.location.href = "/#/student/profile";
        } else {
          window.location.href = "/#/student/index";
        }
      }, 500);
      
    } catch (error) {
      toast.error("登录失败: " + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (type) => {
    if (type === 1) {
      setFormData({ studentId: "2026001001", password: "123456" });
      toast.info("已填充体验账号1: 2026001001 / 123456");
    } else {
      setFormData({ studentId: "2026002001", password: "123456" });
      toast.info("已填充体验账号2: 2026002001 / 123456");
    }
  };

  const manualSQL = getManualSQL();

  return (
    <div className="student-page">
      <div className="student-container">
        <div className="student-header">
          <h1>Match You社团-新生登录</h1>
        </div>

        {/* 数据库初始化提示 */}
        {dbStatus?.needManual && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '15px', 
            margin: '0 15px 20px',
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
                  value={manualSQL}
                  style={{
                    width: '100%',
                    height: '100px',
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
                    navigator.clipboard.writeText(manualSQL);
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
            margin: '0 15px 15px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold', color: diagnosticInfo.account1?.exists && diagnosticInfo.account2?.exists ? '#166534' : '#92400e', marginBottom: '8px' }}>
              📊 数据库状态
            </div>
            <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
              <div>✅ 数据表已创建</div>
              <div>👤 体验账号1 (2026001001): {diagnosticInfo.account1?.exists ? `✅ 存在 (${diagnosticInfo.account1.name})` : '❌ 不存在'}</div>
              <div>👤 体验账号2 (2026002001): {diagnosticInfo.account2?.exists ? `✅ 存在 (${diagnosticInfo.account2.name})` : '❌ 不存在'}</div>
              <div>📈 总用户数: {diagnosticInfo.totalStudents || 0}</div>
              {diagnosticInfo.allStudentIds && diagnosticInfo.allStudentIds.length > 0 && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#6b7280' }}>
                  已有学号: {diagnosticInfo.allStudentIds.join(', ')}
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
          margin: '0 15px 20px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '8px' }}>
            🎓 体验账号（点击快速填充）：
          </div>
          <div 
            style={{ color: '#0284c7', cursor: 'pointer', marginBottom: '4px', padding: '4px 0', borderRadius: '4px' }}
            onClick={() => fillDemoAccount(1)}
          >
            账号1: 2026001001 / 密码: 123456
          </div>
          <div 
            style={{ color: '#0284c7', cursor: 'pointer', padding: '4px 0', borderRadius: '4px' }}
            onClick={() => fillDemoAccount(2)}
          >
            账号2: 2026002001 / 密码: 123456
          </div>
        </div>

        {/* 登录错误诊断信息 */}
        {diagnosticInfo?.lastAttempt && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '12px', 
            margin: '0 15px 15px',
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
                ⚠️ 密码不匹配！
              </div>
            </div>
          </div>
        )}

        <form className="student-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">学号</label>
            <input
              type="text"
              id="studentId"
              className="form-input"
              placeholder="请输入学号"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              maxLength={16}
            />
          </div>

          <div className="form-links">
            <a href="/#/student/forget" style={{ marginRight: '15px' }}>
              忘记密码
            </a>
            <Link to="/student/register">
              还没有账号？去注册
            </Link>
          </div>

          <button
            type="submit"
            id="loginBtn"
            className="btn-primary"
            disabled={loading || dbStatus.checking}
          >
            {loading ? "登录中..." : dbStatus.checking ? "检查数据库..." : "登录"}
          </button>
        </form>

        <div className="student-footer">
          © 2026 Match You社团 版权所有
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
