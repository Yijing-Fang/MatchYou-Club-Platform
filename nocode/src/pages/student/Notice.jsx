
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bell, Check, Trash2, Loader, MessageCircle, Info, Home, FileText, User } from "lucide-react";
import "@/styles/student.css";

const StudentNotice = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [noticeList, setNoticeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const storedInfo = localStorage.getItem("studentInfo");
    if (!storedInfo) {
      toast.error("请先登录");
      window.location.href = "/#/student/login";
      return;
    }
    
    const parsedInfo = JSON.parse(storedInfo);
    setStudentInfo(parsedInfo);
    loadNotices(parsedInfo.student_id);
  }, []);

  // 加载通知列表
  const loadNotices = async (studentId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notice")
        .select("*")
        .eq("student_id", studentId)
        .order("create_time", { ascending: false });
      
      if (error) {
        console.error("加载通知失败:", error);
        toast.error("加载通知失败");
        return;
      }
      
      setNoticeList(data || []);
    } catch (error) {
      console.error("加载通知异常:", error);
    } finally {
      setLoading(false);
    }
  };

  // 标记单条已读
  const markAsRead = async (noticeId) => {
    try {
      const { error } = await supabase
        .from("notice")
        .update({ is_read: true })
        .eq("notice_id", noticeId);
      
      if (error) {
        toast.error("操作失败");
        return;
      }
      
      setNoticeList(noticeList.map(n => 
        n.notice_id === noticeId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      toast.error("操作失败");
    }
  };

  // 标记全部已读
  const markAllAsRead = async () => {
    const unreadIds = noticeList.filter(n => !n.is_read).map(n => n.notice_id);
    if (unreadIds.length === 0) {
      toast.info("没有未读通知");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("notice")
        .update({ is_read: true })
        .in("notice_id", unreadIds);
      
      if (error) {
        toast.error("操作失败");
        return;
      }
      
      setNoticeList(noticeList.map(n => ({ ...n, is_read: true })));
      toast.success("已全部标记为已读");
    } catch (error) {
      toast.error("操作失败");
    }
  };

  // 删除通知
  const deleteNotice = async (noticeId) => {
    if (!confirm("确定删除这条通知吗？")) return;
    
    try {
      const { error } = await supabase
        .from("notice")
        .delete()
        .eq("notice_id", noticeId);
      
      if (error) {
        toast.error("删除失败");
        return;
      }
      
      setNoticeList(noticeList.filter(n => n.notice_id !== noticeId));
      toast.success("已删除");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  // 获取通知图标
  const getNoticeIcon = (type) => {
    switch (type) {
      case "招新通知":
        return <MessageCircle size={20} color="#1890ff" />;
      case "系统通知":
        return <Info size={20} color="#52c41a" />;
      default:
        return <Bell size={20} color="#999" />;
    }
  };

  // 过滤通知
  const filteredNotices = noticeList.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    return n.notice_type === activeTab;
  });

  // 获取未读数量
  const getUnreadCount = () => noticeList.filter(n => !n.is_read).length;

  // 返回首页
  const goBack = () => {
    window.location.href = "/#/student/index";
  };

  // 导航函数
  const goToApply = () => window.location.href = "/#/student/apply";
  const goToNotice = () => window.location.reload();
  const goToProfile = () => window.location.href = "/#/student/profilecenter";
  const goToForum = () => window.location.href = "/#/student/forum";
  const goToHome = () => window.location.href = "/#/student/index";

  if (!studentInfo) {
    return <div className="student-page">加载中...</div>;
  }

  return (
    <div className="student-page">
      <div className="student-container" style={{ minHeight: '100vh' }}>
        {/* 头部 */}
        <div style={{ 
          padding: '15px', 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <ArrowLeft size={24} color="#333" />
            </button>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>通知中心</span>
            {getUnreadCount() > 0 && (
              <span style={{
                background: '#f5222d',
                color: 'white',
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                {getUnreadCount()}
              </span>
            )}
          </div>
          <button 
            onClick={markAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#409EFF',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check size={16} />
            全部已读
          </button>
        </div>

        {/* 标签切换 */}
        <div style={{ 
          display: 'flex', 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0',
          overflowX: 'auto'
        }}>
          {[
            { key: 'all', label: '全部', count: noticeList.length },
            { key: 'unread', label: '未读', count: getUnreadCount() },
            { key: '招新通知', label: '招新' },
            { key: '系统通知', label: '系统' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: activeTab === tab.key ? '#409EFF' : '#666',
                borderBottom: activeTab === tab.key ? '2px solid #409EFF' : '2px solid transparent',
                fontWeight: activeTab === tab.key ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? '#409EFF' : '#999',
                  color: 'white',
                  fontSize: '11px',
                  padding: '1px 5px',
                  borderRadius: '8px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 通知列表 */}
        <div style={{ padding: '15px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <Loader size={32} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <div>加载中...</div>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔔</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无通知</div>
              <div style={{ fontSize: '13px' }}>有新消息时会在这里显示</div>
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <div 
                key={notice.notice_id} 
                onClick={() => !notice.is_read && markAsRead(notice.notice_id)}
                style={{
                  background: notice.is_read ? '#f5f5f5' : '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {/* 图标 */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: notice.is_read ? '#f0f0f0' : '#e6f7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getNoticeIcon(notice.notice_type)}
                </div>

                {/* 内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{ 
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: notice.notice_type === '招新通知' ? '#e6f7ff' : '#f6ffed',
                      color: notice.notice_type === '招新通知' ? '#1890ff' : '#52c41a'
                    }}>
                      {notice.notice_type || '通知'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(notice.create_time).toLocaleString()}
                    </span>
                    {!notice.is_read && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        background: '#f5222d',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: notice.is_read ? 400 : 600,
                    color: notice.is_read ? '#666' : '#333',
                    marginBottom: '6px',
                    lineHeight: 1.5
                  }}>
                    {notice.title}
                  </div>
                  
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666',
                    lineHeight: 1.6
                  }}>
                    {notice.content}
                  </div>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotice(notice.notice_id); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* 底部导航 */}
        <div className="bottom-nav" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div className="nav-item" onClick={goToHome}>
            <Home size={20} />
            <span>首页</span>
          </div>
          <div className="nav-item" onClick={goToApply}>
            <FileText size={20} />
            <span>我的报名</span>
          </div>
          <div className="nav-item active" onClick={goToNotice}>
            <Bell size={20} />
            <span>通知中心</span>
            {getUnreadCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '15px',
                background: '#f5222d',
                color: 'white',
                fontSize: '10px',
                padding: '2px 5px',
                borderRadius: '10px',
                minWidth: '16px',
                textAlign: 'center'
              }}>
                {getUnreadCount()}
              </span>
            )}
          </div>
          <div className="nav-item" onClick={goToForum}>
            <MessageCircle size={20} />
            <span>交友论坛</span>
          </div>
          <div className="nav-item" onClick={goToProfile}>
            <User size={20} />
            <span>个人中心</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentNotice;

