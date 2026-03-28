import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { 
  CheckCircle, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

const SchoolLayout = ({ children, title }) => {
  const location = useLocation();
  const [adminInfo, setAdminInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const schoolAdminInfo = localStorage.getItem("schoolAdminInfo");
    if (!schoolAdminInfo) {
      toast.error("请先登录");
      window.location.href = "/#/school/login";
      return;
    }
    setAdminInfo(JSON.parse(schoolAdminInfo));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("schoolAdminInfo");
    toast.success("已退出登录");
    window.location.href = "/#/school/login";
  };

  const menuItems = [
    { path: "/school/audit", label: "招新审核", icon: CheckCircle },
    { path: "/school/data", label: "数据统计", icon: BarChart3 },
    { path: "/school/user", label: "用户管理", icon: Users },
    { path: "/school/evaluate", label: "评价管理", icon: MessageSquare },
    { path: "/school/setting", label: "公告设置", icon: Megaphone },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.hash === `#${path}`;
  };

  if (!adminInfo) {
    return <div className="school-page">加载中...</div>;
  }

  return (
    <div className="school-page">
      <button 
        className="school-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      <div className={`school-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="school-logo">
          <h2>学校社联管理</h2>
          <p>最高权限后台</p>
        </div>
        
        <nav className="school-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.path}
                href={`/#${item.path}`}
                className={`school-menu-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/#${item.path}`;
                  setSidebarOpen(false);
                }}
              >
                <span className="school-menu-icon">
                  <Icon size={18} />
                </span>
                <span className="school-menu-text">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="school-main">
        <header className="school-header">
          <div className="school-header-left">
            <h1 className="school-header-title">{title}</h1>
          </div>
          <div className="school-header-right">
            <div className="school-admin-info">
              <span>{adminInfo?.name}</span>
              <span style={{ color: '#999' }}>|</span>
              <span>超级管理员</span>
            </div>
            <button className="school-logout-btn" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              退出
            </button>
          </div>
        </header>

        <main className="school-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SchoolLayout;
