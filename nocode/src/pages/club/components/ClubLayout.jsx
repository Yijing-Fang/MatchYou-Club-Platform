import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { 
  Info, 
  Settings, 
  Users, 
  BarChart3, 
  MessageSquare, 
  UserCheck,
  LogOut,
  Menu,
  X
} from "lucide-react";

const ClubLayout = ({ children, title }) => {
  const location = useLocation();
  const [adminInfo, setAdminInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const clubAdminInfo = localStorage.getItem("clubAdminInfo");
    if (!clubAdminInfo) {
      toast.error("请先登录");
      window.location.href = "/#/club/login";
      return;
    }
    setAdminInfo(JSON.parse(clubAdminInfo));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clubAdminInfo");
    toast.success("已退出登录");
    window.location.href = "/#/club/login";
  };

  const menuItems = [
    { path: "/club/info", label: "社团信息", icon: Info },
    { path: "/club/recruit", label: "招新设置", icon: Settings },
    { path: "/club/apply", label: "报名管理", icon: Users },
    { path: "/club/data", label: "数据看板", icon: BarChart3 },
    { path: "/club/feedback", label: "咨询评价", icon: MessageSquare },
    { path: "/club/member", label: "成员管理", icon: UserCheck },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.hash === `#${path}`;
  };

  if (!adminInfo) {
    return <div className="club-page">加载中...</div>;
  }

  return (
    <div className="club-page club-layout">
      {/* 移动端菜单按钮 */}
      <button 
        className="club-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* 遮罩层 - 移动端侧边栏打开时显示 */}
      {sidebarOpen && (
        <div 
          className="club-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* 侧边栏 - 固定定位，覆盖模式 */}
      <div className={`club-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="club-logo">
          <h2>社团管理平台</h2>
          <p>Match You</p>
        </div>
        
        <nav className="club-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.path}
                href={`/#${item.path}`}
                className={`club-menu-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/#${item.path}`;
                  setSidebarOpen(false);
                }}
              >
                <span className="club-menu-icon">
                  <Icon size={18} />
                </span>
                <span className="club-menu-text">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* 主内容区 - 全屏宽度，不被侧边栏推开 */}
      <div className="club-main">
        <header className="club-header">
          <div className="club-header-left">
            <h1 className="club-header-title">{title}</h1>
          </div>
          <div className="club-header-right">
            <div className="club-admin-info">
              <span>{adminInfo?.name}</span>
              <span style={{ color: '#999' }}>|</span>
              <span>{adminInfo?.position}</span>
            </div>
            <button className="club-logout-btn" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              退出
            </button>
          </div>
        </header>

        <main className="club-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClubLayout;
