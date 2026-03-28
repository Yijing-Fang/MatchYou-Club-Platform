
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, GraduationCap, Building2, Users } from "lucide-react";
import { md5 } from "@/utils/md5";

const Login = () => {
  const navigate = useNavigate();
  const { userType } = useParams();
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ checking: true, ready: false, needManual: false });
  const [showSqlPanel, setShowSqlPanel] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [formData, setFormData] = useState({
    account: "",
    password: "",
  });
  const isMountedRef = useRef(true);

  const userTypeConfig = {
    student: {
      title: "新生登录",
      description: "使用学号登录系统",
      icon: <GraduationCap className="h-6 w-6" />,
      accountLabel: "学号",
      accountPlaceholder: "请输入学号（如：2026001001）",
      demoAccounts: [
        { id: "2026001001", password: "123456", name: "李同学" },
        { id: "2026002001", password: "123456", name: "王同学" }
      ],
      tableName: "student",
      idField: "student_id",
      useMd5: false
    },
    club: {
      title: "社团管理员登录",
      description: "使用学号登录系统",
      icon: <Building2 className="h-6 w-6" />,
      accountLabel: "学号",
      accountPlaceholder: "请输入学号（如：2025001001）",
      demoAccounts: [
        { id: "2025001001", password: "123456", name: "张社长" },
        { id: "2025002001", password: "123456", name: "刘社长" }
      ],
      tableName: "club_admin",
      idField: "student_id",
      useMd5: false
    },
    school: {
      title: "学校管理员登录",
      description: "使用用户名登录系统",
      icon: <Users className="h-6 w-6" />,
      accountLabel: "用户名",
      accountPlaceholder: "请输入用户名（如：school_admin）",
      demoAccounts: [
        { id: "school_admin", password: "123456", name: "张老师" }
      ],
      tableName: "school_admin",
      idField: "username",
      useMd5: false
    },
  };

  const config = userTypeConfig[userType];

  useEffect(() => {
    isMountedRef.current = true;
    
    // 测试 MD5
    const testHash = md5("123456");
    console.log("【MD5测试】'123456' 的 MD5:", testHash);
    console.log("【MD5测试】预期值:", "e10adc3949ba59abbe56e057f20f883e");
    console.log("【MD5测试】验证:", testHash === "e10adc3949ba59abbe56e057f20f883e" ? "✅ 通过" : "❌ 失败");
    
    if (config) {
      checkDatabase();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [userType]);

  const checkDatabase = async () => {
    if (!config) return;
    
    try {
      const { error } = await supabase
        .from(config.tableName)
        .select(config.idField)
        .limit(1)
        .maybeSingle();
      
      if (!isMountedRef.current) return;
      
      if (error && (error.message.includes("does not exist") || error.code === '42P01')) {
        console.log(`【数据库检查】${config.tableName} 表不存在`);
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
    if (!config) return;
    
    try {
      const checks = await Promise.all(
        config.demoAccounts.map(async (demo) => {
          const { data } = await supabase
            .from(config.tableName)
            .select(`${config.idField}, name, password, status`)
            .eq(config.idField, demo.id)
            .maybeSingle();
          return { id: demo.id, data };
        })
      );

      const { data: allRecords } = await supabase
        .from(config.tableName)
        .select(`${config.idField}, name`)
        .limit(5);

      if (!isMountedRef.current) return;

      const info = {
        demoAccounts: checks.map(c => ({
          id: c.id,
          exists: !!c.data,
          name: c.data?.name,
          status: c.data?.status,
          password: c.data?.password
        })),
        totalRecords: allRecords?.length || 0,
        allIds: allRecords?.map(r => r[config.idField]) || []
      };

      setDiagnosticInfo(info);
      
      const allExist = checks.every(c => c.data);
      if (!allExist) {
        toast.error("部分体验账号未找到，请执行SQL初始化数据");
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("【体验账号检查】异常:", error);
      setDiagnosticInfo({ error: error.message });
    }
  };

  if (!config) {
    return <div>无效的登录类型</div>;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!dbStatus.ready && dbStatus.needManual) {
      toast.error("请先创建数据库表");
      setShowSqlPanel(true);
      return;
    }
    
    setLoading(true);

    try {
      const { account, password } = formData;
      
      // 所有用户类型都使用明文密码
      const inputPassword = password;
      
      console.log(`【登录】输入账号:`, account);
      console.log(`【登录】输入密码:`, inputPassword);
      console.log(`【登录】密码验证方式: 明文比对`);

      const { data, error } = await supabase
        .from(config.tableName)
        .select("*")
        .eq(config.idField, account)
        .maybeSingle();

      if (error) {
        toast.error("数据库查询失败: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        toast.error(config.accountLabel + "不存在");
        setLoading(false);
        checkDemoAccounts();
        return;
      }

      console.log(`【登录】数据库密码:`, data.password);
      console.log(`【登录】密码匹配:`, data.password === inputPassword);
      
      if (data.password !== inputPassword) {
        toast.error("密码错误");
        
        setDiagnosticInfo(prev => ({
          ...(prev || {}),
          lastAttempt: {
            account: account,
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

      // 保存登录状态到本地存储
      const userData = { ...data, type: userType };
      localStorage.setItem("userInfo", JSON.stringify(userData));
      toast.success("登录成功");

      // 跳转到对应首页
      if (userType === "student") {
        navigate("/student/home");
      } else if (userType === "club") {
        navigate("/club/home");
      } else if (userType === "school") {
        navigate("/school/home");
      }
    } catch (error) {
      toast.error("登录失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoAccount) => {
    setFormData({ account: demoAccount.id, password: demoAccount.password });
    toast.info(`已填充体验账号: ${demoAccount.name} (${demoAccount.id}) / 密码: ${demoAccount.password}`);
  };

  const getManualSQL = () => {
    if (userType === "student") {
      return `-- 创建 student 表
CREATE TABLE IF NOT EXISTS student (
    student_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    college VARCHAR(50) NOT NULL,
    major VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL DEFAULT '2026级',
    phone VARCHAR(11),
    email VARCHAR(50) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    register_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入体验账号（密码使用明文 123456）
INSERT INTO student (student_id, name, password, college, major, grade, phone, email, status)
VALUES 
    ('2026001001', '李同学', '123456', '计算机学院', '计算机科学与技术', '2026级', '13800138001', '2026001001@school.edu.cn', 1),
    ('2026002001', '王同学', '123456', '文学院', '汉语言文学', '2026级', '13800138002', '2026002001@school.edu.cn', 1)
ON CONFLICT (student_id) DO NOTHING;`;
    } else if (userType === "club") {
      return `-- 创建 club_admin 表
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

-- 插入体验账号（密码使用明文 123456）
INSERT INTO club_admin (student_id, name, password, club_id, position, phone, status)
VALUES 
    ('2025001001', '张社长', '123456', 1, '社长', '13800138101', 1),
    ('2025002001', '刘社长', '123456', 2, '社长', '13800138102', 1)
ON CONFLICT (student_id) DO NOTHING;`;
    } else {
      return `-- 创建 school_admin 表
CREATE TABLE IF NOT EXISTS school_admin (
    school_admin_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    name VARCHAR(20) NOT NULL,
    phone VARCHAR(11),
    status SMALLINT NOT NULL DEFAULT 1,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入体验账号（密码使用明文 123456）
INSERT INTO school_admin (username, password, name, phone, status)
VALUES 
    ('school_admin', '123456', '张老师', '13800138201', 1)
ON CONFLICT (username) DO NOTHING;`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="p-2 bg-blue-100 rounded-full">{config.icon}</div>
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 数据库初始化提示 */}
          {dbStatus?.needManual && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-bold text-red-600 mb-2 text-sm">
                ⚠️ 数据库表未初始化
              </div>
              <button 
                onClick={() => setShowSqlPanel(!showSqlPanel)}
                className="w-full px-3 py-2 bg-red-100 border border-red-300 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
              >
                {showSqlPanel ? '收起操作指南 ▲' : '查看详细操作指南 ▼'}
              </button>
              {showSqlPanel && (
                <div className="mt-3">
                  <textarea 
                    readOnly
                    value={getManualSQL()}
                    className="w-full h-32 p-2 text-xs font-mono border border-red-200 rounded bg-red-50 resize-none mb-2"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getManualSQL());
                      toast.success("SQL 已复制到剪贴板");
                    }}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 mb-2"
                  >
                    📋 复制 SQL 语句
                  </button>
                  <button
                    onClick={checkDatabase}
                    className="w-full px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                  >
                    🔄 刷新检测
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 数据库状态显示 */}
          {dbStatus?.ready && diagnosticInfo && (
            <div className={`mb-4 p-3 rounded-lg border text-xs ${
              diagnosticInfo.demoAccounts?.every(a => a.exists) 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className={`font-bold mb-2 ${
                diagnosticInfo.demoAccounts?.every(a => a.exists) ? 'text-green-700' : 'text-yellow-700'
              }`}>
                📊 数据库状态
              </div>
              <div className="text-gray-600 space-y-1">
                <div>✅ {config.tableName} 表已创建</div>
                {config.demoAccounts.map((demo, idx) => {
                  const check = diagnosticInfo.demoAccounts?.find(a => a.id === demo.id);
                  return (
                    <div key={demo.id}>
                      👤 {demo.name} ({demo.id}): {check?.exists ? `✅ 存在` : '❌ 不存在'}
                    </div>
                  );
                })}
                <div>📈 总记录数: {diagnosticInfo.totalRecords || 0}</div>
                {diagnosticInfo.allIds && diagnosticInfo.allIds.length > 0 && (
                  <div className="mt-1 text-gray-500 text-[11px]">
                    已有{config.accountLabel}: {diagnosticInfo.allIds.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 体验账号提示 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-bold text-blue-700 mb-2 text-sm">
              🎓 体验账号（点击快速填充）：
            </div>
            {config.demoAccounts.map((demo) => (
              <div 
                key={demo.id}
                className="text-blue-600 cursor-pointer py-1 hover:bg-blue-100 rounded px-1 transition-colors text-xs"
                onClick={() => fillDemoAccount(demo)}
              >
                {demo.name}: {demo.id} / 密码: {demo.password}
              </div>
            ))}
          </div>

          {/* 登录错误诊断信息 */}
          {diagnosticInfo?.lastAttempt && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[11px]">
              <div className="font-bold text-red-600 mb-1">
                🔍 上次登录诊断
              </div>
              <div className="text-red-800 font-mono space-y-0.5">
                <div>{config.accountLabel}: {diagnosticInfo.lastAttempt.account}</div>
                <div>输入密码: {diagnosticInfo.lastAttempt.inputPassword}</div>
                <div>数据库密码: {diagnosticInfo.lastAttempt.dbPassword}</div>
                <div className="text-red-600 mt-1">⚠️ 密码不匹配！</div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">{config.accountLabel}</Label>
              <Input
                id="account"
                placeholder={config.accountPlaceholder}
                value={formData.account}
                onChange={(e) =>
                  setFormData({ ...formData, account: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                体验账号密码：123456（明文存储）
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || dbStatus.checking}
            >
              {loading ? "登录中..." : dbStatus.checking ? "检查数据库..." : "登录"}
            </Button>
          </form>

          {userType === "student" && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                还没有账号？{" "}
                <Link
                  to="/register/student"
                  className="text-blue-600 hover:underline"
                >
                  立即注册
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

