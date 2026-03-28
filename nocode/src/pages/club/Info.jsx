import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ClubLayout from "./components/ClubLayout.jsx";
import { Edit2, Save, X, Bell, Info, CheckCircle, AlertCircle, Building2, Phone, User, Tag, Calendar, Users, Clock, BarChart3 } from "lucide-react";

const ClubInfo = () => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  
  // 社团信息状态
  const [clubInfo, setClubInfo] = useState({
    club_id: null,
    club_name: "",
    category: "技术",
    description: "",
    leader_name: "",
    contact_phone: "",
    club_tags: "",
    recruit_status: "未开始",
    quota: 50,
    frequency: "每周1次",
    difficulty: "中等",
    start_time: "",
    end_time: "",
    status: 1,
  });
  
  // 保存原始数据用于取消恢复
  const [originalClubInfo, setOriginalClubInfo] = useState(null);

  // 公告数据（仅编辑模式下使用）
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "2026春季招新开始啦！", content: "欢迎热爱技术的同学加入，一起成长进步！", time: "2026-01-15", status: "已发布" },
    { id: 2, title: "技术分享会预告", content: "本周五晚7点，线上分享前端开发技巧", time: "2026-01-10", status: "草稿" },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [showEditor, setShowEditor] = useState(false);

  const categories = ["音乐", "舞蹈", "体育", "公益", "学术", "技术", "文化", "其他"];
  const difficulties = ["容易", "中等", "困难"];
  const frequencies = ["每周1次", "每周2-3次", "每月1-2次"];
  const recruitStatuses = ["未开始", "招新中", "已结束"];

  // 测试通知数据（当数据库无数据时显示）
  const demoNotices = [
    {
      notice_id: 1,
      title: "社团信息审核通过",
      content: "恭喜！您的社团信息已通过学校管理员审核，可以正常开展招新活动。",
      type: "审核通过",
      is_read: false,
      create_time: new Date(Date.now() - 86400000).toISOString()
    },
    {
      notice_id: 2,
      title: "招新系统使用指南",
      content: "欢迎使用Match You社团招新平台！请在【招新设置】中配置招新时间和面试安排。",
      type: "系统公告",
      is_read: false,
      create_time: new Date(Date.now() - 172800000).toISOString()
    },
    {
      notice_id: 3,
      title: "春季招新活动提醒",
      content: "2026年春季招新即将开始，请提前准备好社团介绍材料和宣传图片。",
      type: "系统公告",
      is_read: true,
      create_time: new Date(Date.now() - 259200000).toISOString()
    }
  ];

  // 初始化加载数据
  useEffect(() => {
    const clubAdminInfo = localStorage.getItem("clubAdminInfo");
    if (clubAdminInfo) {
      const parsed = JSON.parse(clubAdminInfo);
      setAdminInfo(parsed);
      loadClubInfo(parsed.club_id);
      loadNotices(parsed.student_id);
    }
  }, []);

  // 加载社团信息
  const loadClubInfo = async (clubId) => {
    if (!clubId) {
      toast.error("未找到关联的社团信息");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("club")
        .select("*")
        .eq("club_id", clubId)
        .maybeSingle();

      if (error) {
        console.error("加载社团信息失败:", error);
        toast.error("加载社团信息失败");
        return;
      }

      if (data) {
        const info = {
          club_id: data.club_id,
          club_name: data.club_name || "",
          category: data.category || "技术",
          description: data.description || "",
          leader_name: data.leader_name || "",
          contact_phone: data.contact_phone || "",
          club_tags: data.club_tags || "",
          recruit_status: data.recruit_status || "未开始",
          quota: data.quota || 50,
          frequency: data.frequency || "每周1次",
          difficulty: data.difficulty || "中等",
          start_time: data.start_time || "",
          end_time: data.end_time || "",
          status: data.status || 1,
        };
        setClubInfo(info);
        setOriginalClubInfo(info);
      } else {
        // 如果没有找到社团数据，使用默认数据
        const defaultInfo = {
          club_id: clubId,
          club_name: "计算机技术社团",
          category: "技术",
          description: "探索编程世界，参加各类技术竞赛，提升实战能力。每周有技术分享会，欢迎热爱技术的同学加入！",
          leader_name: "张社长",
          contact_phone: "13800138101",
          club_tags: "技术,编程,竞赛",
          recruit_status: "招新中",
          quota: 50,
          frequency: "每周2-3次",
          difficulty: "中等",
          start_time: "2026-02-01",
          end_time: "2026-03-01",
          status: 1,
        };
        setClubInfo(defaultInfo);
        setOriginalClubInfo(defaultInfo);
      }
    } catch (error) {
      console.error("加载社团信息异常:", error);
      toast.error("加载社团信息异常");
    } finally {
      setLoading(false);
    }
  };

  // 加载系统通知
  const loadNotices = async (studentId) => {
    if (!studentId) return;
    
    setNoticesLoading(true);
    try {
      const { data, error } = await supabase
        .from("notice")
        .select("*")
        .eq("student_id", studentId)
        .order("create_time", { ascending: false })
        .limit(5);

      if (error) {
        console.error("加载通知失败:", error);
        // 使用测试数据
        setNotices(demoNotices);
        return;
      }

      // 如果没有数据，使用测试数据
      if (!data || data.length === 0) {
        setNotices(demoNotices);
      } else {
        setNotices(data);
      }
    } catch (error) {
      console.error("加载通知异常:", error);
      setNotices(demoNotices);
    } finally {
      setNoticesLoading(false);
    }
  };

  // 进入编辑模式
  const handleEdit = () => {
    setOriginalClubInfo({ ...clubInfo });
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancel = () => {
    if (originalClubInfo) {
      setClubInfo(originalClubInfo);
    }
    setIsEditing(false);
    setShowEditor(false);
    toast.info("已取消编辑");
  };

  // 保存修改
  const handleSave = async () => {
    if (!clubInfo.club_id) {
      toast.error("社团ID不存在");
      return;
    }

    // 表单验证
    if (!clubInfo.club_name.trim()) {
      toast.error("请输入社团名称");
      return;
    }
    if (!clubInfo.description.trim()) {
      toast.error("请输入社团简介");
      return;
    }
    if (!clubInfo.contact_phone.trim()) {
      toast.error("请输入联系方式");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("club")
        .update({
          club_name: clubInfo.club_name,
          category: clubInfo.category,
          description: clubInfo.description,
          leader_name: clubInfo.leader_name,
          contact_phone: clubInfo.contact_phone,
          club_tags: clubInfo.club_tags,
          recruit_status: clubInfo.recruit_status,
          quota: clubInfo.quota,
          frequency: clubInfo.frequency,
          difficulty: clubInfo.difficulty,
          start_time: clubInfo.start_time || null,
          end_time: clubInfo.end_time || null,
        })
        .eq("club_id", clubInfo.club_id);

      if (error) {
        toast.error("保存失败：" + error.message);
        return;
      }

      setOriginalClubInfo({ ...clubInfo });
      setIsEditing(false);
      toast.success("社团信息保存成功");
    } catch (error) {
      toast.error("保存失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  // 添加公告（仅编辑模式下）
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("请填写完整公告信息");
      return;
    }
    const announcement = {
      id: Date.now(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      time: new Date().toISOString().split('T')[0],
      status: "草稿"
    };
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: "", content: "" });
    setShowEditor(false);
    toast.success("公告已添加");
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast.success("公告已删除");
  };

  // 获取通知图标
  const getNoticeIcon = (type) => {
    switch (type) {
      case "审核通过":
        return <CheckCircle size={18} color="#52c41a" />;
      case "审核拒绝":
        return <AlertCircle size={18} color="#f5222d" />;
      case "系统公告":
        return <Info size={18} color="#1890ff" />;
      default:
        return <Bell size={18} color="#999" />;
    }
  };

  // 获取通知类型颜色
  const getNoticeTypeColor = (type) => {
    switch (type) {
      case "审核通过":
        return { bg: "#f6ffed", color: "#52c41a", border: "#b7eb8f" };
      case "审核拒绝":
        return { bg: "#fff1f0", color: "#f5222d", border: "#ffa39e" };
      case "系统公告":
        return { bg: "#e6f7ff", color: "#1890ff", border: "#91d5ff" };
      default:
        return { bg: "#f5f5f5", color: "#666", border: "#d9d9d9" };
    }
  };

  // 标记通知已读
  const markNoticeAsRead = async (noticeId) => {
    try {
      await supabase
        .from("notice")
        .update({ is_read: true })
        .eq("notice_id", noticeId);
      
      setNotices(notices.map(n => 
        n.notice_id === noticeId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("标记已读失败:", error);
    }
  };

  // 空值显示组件
  const EmptyValue = ({ text = "未设置" }) => (
    <span style={{ color: '#999', fontStyle: 'italic' }}>{text}</span>
  );

  // 信息展示项组件
  const InfoItem = ({ icon: Icon, label, value, placeholder = "未设置" }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: '12px',
      padding: '16px',
      background: '#fafafa',
      borderRadius: '8px',
      marginBottom: '12px'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#e6f7ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={18} color="#1890ff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '15px', color: value ? '#333' : '#999', fontWeight: 500 }}>
          {value || placeholder}
        </div>
      </div>
    </div>
  );

  return (
    <ClubLayout title="社团信息管理">
      {/* 系统通知面板 */}
      <div className="club-card" style={{ marginBottom: '20px', borderLeft: '4px solid #1890ff' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: notices.length > 0 ? '16px' : '0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={20} color="#1890ff" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>系统通知</div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {noticesLoading ? '加载中...' : 
                  notices.filter(n => !n.is_read).length > 0 
                    ? `您有 ${notices.filter(n => !n.is_read).length} 条未读通知` 
                    : '暂无新通知'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#999' }}>
            共 {notices.length} 条通知
          </div>
        </div>

        {noticesLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>加载中...</div>
        ) : notices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notices.slice(0, 3).map((notice) => {
              const style = getNoticeTypeColor(notice.type);
              return (
                <div 
                  key={notice.notice_id}
                  onClick={() => !notice.is_read && markNoticeAsRead(notice.notice_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 16px',
                    background: notice.is_read ? '#fafafa' : style.bg,
                    border: `1px solid ${notice.is_read ? '#f0f0f0' : style.border}`,
                    borderRadius: '8px',
                    cursor: notice.is_read ? 'default' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {getNoticeIcon(notice.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: notice.is_read ? 400 : 600,
                        color: notice.is_read ? '#666' : '#333'
                      }}>
                        {notice.title}
                      </span>
                      {!notice.is_read && (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          background: '#f5222d',
                          borderRadius: '50%'
                        }} />
                      )}
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: style.color,
                        color: '#fff'
                      }}>
                        {notice.type || '通知'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                      {notice.content}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                      {new Date(notice.create_time).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px', 
            color: '#999',
            background: '#fafafa',
            borderRadius: '8px'
          }}>
            <Bell size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div>暂无系统通知</div>
          </div>
        )}
      </div>

      {/* 操作按钮区 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center',
        marginBottom: '20px',
        gap: '12px'
      }}>
        {!isEditing ? (
          <button 
            className="club-btn club-btn-primary"
            onClick={handleEdit}
            disabled={loading}
          >
            <Edit2 size={16} style={{ marginRight: '6px' }} />
            编辑
          </button>
        ) : (
          <>
            <button 
              className="club-btn club-btn-default"
              onClick={handleCancel}
              disabled={loading}
            >
              <X size={16} style={{ marginRight: '6px' }} />
              取消
            </button>
            <button 
              className="club-btn club-btn-success"
              onClick={handleSave}
              disabled={loading}
            >
              <Save size={16} style={{ marginRight: '6px' }} />
              {loading ? "保存中..." : "保存"}
            </button>
          </>
        )}
      </div>

      {/* 社团信息展示 - 查看模式 */}
      {!isEditing ? (
        <>
          {/* 基本信息卡片 */}
          <div className="club-card" style={{ marginBottom: '20px' }}>
            <div className="club-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#1890ff" />
              基本信息
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <InfoItem 
                icon={Building2} 
                label="社团名称" 
                value={clubInfo.club_name} 
                placeholder="请输入社团名称"
              />
              <InfoItem 
                icon={Tag} 
                label="社团类别" 
                value={clubInfo.category} 
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <InfoItem 
                icon={Info} 
                label="社团简介" 
                value={clubInfo.description} 
                placeholder="请输入社团简介，介绍社团的活动内容和特色..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
              <InfoItem 
                icon={User} 
                label="负责人" 
                value={clubInfo.leader_name} 
                placeholder="请输入负责人姓名"
              />
              <InfoItem 
                icon={Phone} 
                label="联系方式" 
                value={clubInfo.contact_phone} 
                placeholder="请输入手机号"
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                padding: '16px',
                background: '#fafafa',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Tag size={18} color="#52c41a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>社团标签</div>
                  {clubInfo.club_tags ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {clubInfo.club_tags.split(',').map((tag, idx) => (
                        <span key={idx} style={{
                          padding: '4px 12px',
                          background: '#e6f7ff',
                          color: '#1890ff',
                          borderRadius: '12px',
                          fontSize: '13px'
                        }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyValue text="未设置标签，建议添加如：技术、编程、竞赛等" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 招新设置卡片 */}
          <div className="club-card" style={{ marginBottom: '20px' }}>
            <div className="club-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#52c41a" />
              招新设置
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <InfoItem 
                icon={BarChart3} 
                label="招新状态" 
                value={clubInfo.recruit_status} 
              />
              <InfoItem 
                icon={Users} 
                label="招新人数" 
                value={clubInfo.quota ? `${clubInfo.quota} 人` : ""} 
                placeholder="未设置"
              />
              <InfoItem 
                icon={Clock} 
                label="活动频率" 
                value={clubInfo.frequency} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
              <InfoItem 
                icon={Calendar} 
                label="招新开始时间" 
                value={clubInfo.start_time} 
                placeholder="未设置"
              />
              <InfoItem 
                icon={Calendar} 
                label="招新结束时间" 
                value={clubInfo.end_time} 
                placeholder="未设置"
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '16px',
                background: '#fafafa',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#fff7e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <BarChart3 size={18} color="#fa8c16" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>面试难度</div>
                  <div style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>
                    {clubInfo.difficulty || <EmptyValue />}
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  background: clubInfo.difficulty === '容易' ? '#f6ffed' : 
                             clubInfo.difficulty === '困难' ? '#fff1f0' : '#fff7e6',
                  color: clubInfo.difficulty === '容易' ? '#52c41a' : 
                         clubInfo.difficulty === '困难' ? '#f5222d' : '#fa8c16',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500
                }}>
                  {clubInfo.difficulty || '未设置'}
                </div>
              </div>
            </div>
          </div>

          {/* 素材管理卡片 */}
          <div className="club-card" style={{ marginBottom: '20px' }}>
            <div className="club-card-title">素材管理</div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '16px',
              padding: '20px',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>封面图片</div>
                <div style={{ fontSize: '12px', color: '#999' }}>查看模式下不可编辑</div>
              </div>
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🖼️</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>活动照片</div>
                <div style={{ fontSize: '12px', color: '#999' }}>查看模式下不可编辑</div>
              </div>
            </div>
          </div>

          {/* 招新公告卡片 */}
          <div className="club-card">
            <div className="club-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>招新公告</span>
              <span style={{ fontSize: '13px', color: '#999' }}>共 {announcements.length} 条</span>
            </div>
            
            {announcements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map(item => (
                  <div key={item.id} style={{
                    padding: '16px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>{item.title}</span>
                      <span className={`club-tag ${item.status === '已发布' ? 'club-tag-passed' : 'club-tag-pending'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', lineHeight: '1.5' }}>
                      {item.content}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>发布时间: {item.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                暂无公告
              </div>
            )}
          </div>
        </>
      ) : (
        /* 编辑模式表单 */
        <>
          {/* 社团信息表单 */}
          <div className="club-card" style={{ opacity: loading ? 0.7 : 1 }}>
            <div className="club-card-title">基本信息</div>
            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">社团名称 <span className="required">*</span></label>
                <input
                  type="text"
                  className="club-form-input"
                  value={clubInfo.club_name}
                  onChange={(e) => setClubInfo({...clubInfo, club_name: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div className="club-form-group">
                <label className="club-form-label">社团类别 <span className="required">*</span></label>
                <select
                  className="club-form-select"
                  value={clubInfo.category}
                  onChange={(e) => setClubInfo({...clubInfo, category: e.target.value})}
                  disabled={loading}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="club-form-group">
              <label className="club-form-label">社团简介 <span className="required">*</span></label>
              <textarea
                className="club-form-textarea"
                rows={4}
                value={clubInfo.description}
                onChange={(e) => setClubInfo({...clubInfo, description: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">负责人 <span className="required">*</span></label>
                <input
                  type="text"
                  className="club-form-input"
                  value={clubInfo.leader_name}
                  onChange={(e) => setClubInfo({...clubInfo, leader_name: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div className="club-form-group">
                <label className="club-form-label">联系方式 <span className="required">*</span></label>
                <input
                  type="text"
                  className="club-form-input"
                  value={clubInfo.contact_phone}
                  onChange={(e) => setClubInfo({...clubInfo, contact_phone: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="club-form-group">
              <label className="club-form-label">社团标签</label>
              <input
                type="text"
                className="club-form-input"
                placeholder="多个标签用逗号分隔，如：编程,技术,创新"
                value={clubInfo.club_tags}
                onChange={(e) => setClubInfo({...clubInfo, club_tags: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>

          <div className="club-card" style={{ opacity: loading ? 0.7 : 1 }}>
            <div className="club-card-title">招新设置</div>
            
            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">招新状态</label>
                <select
                  className="club-form-select"
                  value={clubInfo.recruit_status}
                  onChange={(e) => setClubInfo({...clubInfo, recruit_status: e.target.value})}
                  disabled={loading}
                >
                  {recruitStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="club-form-group">
                <label className="club-form-label">招新人数</label>
                <input
                  type="number"
                  className="club-form-input"
                  value={clubInfo.quota}
                  onChange={(e) => setClubInfo({...clubInfo, quota: parseInt(e.target.value) || 0})}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">活动频率</label>
                <select
                  className="club-form-select"
                  value={clubInfo.frequency}
                  onChange={(e) => setClubInfo({...clubInfo, frequency: e.target.value})}
                  disabled={loading}
                >
                  {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="club-form-group">
                <label className="club-form-label">面试难度</label>
                <select
                  className="club-form-select"
                  value={clubInfo.difficulty}
                  onChange={(e) => setClubInfo({...clubInfo, difficulty: e.target.value})}
                  disabled={loading}
                >
                  {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">招新开始时间</label>
                <input
                  type="date"
                  className="club-form-input"
                  value={clubInfo.start_time}
                  onChange={(e) => setClubInfo({...clubInfo, start_time: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div className="club-form-group">
                <label className="club-form-label">招新结束时间</label>
                <input
                  type="date"
                  className="club-form-input"
                  value={clubInfo.end_time}
                  onChange={(e) => setClubInfo({...clubInfo, end_time: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="club-card" style={{ opacity: loading ? 0.7 : 1 }}>
            <div className="club-card-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>素材管理</span>
              <span style={{ fontSize: '13px', color: '#999' }}>
                编辑模式下可上传
              </span>
            </div>
            
            <div className="club-form-group">
              <label className="club-form-label">封面图片</label>
              <div 
                className="club-upload"
                style={{ cursor: 'pointer' }}
                onClick={() => toast.info("图片上传功能开发中")}
              >
                <div className="club-upload-icon">📷</div>
                <div className="club-upload-text">
                  点击上传封面图（建议尺寸 1200×400）
                </div>
              </div>
            </div>

            <div className="club-form-group">
              <label className="club-form-label">活动照片</label>
              <div 
                className="club-upload"
                style={{ cursor: 'pointer' }}
                onClick={() => toast.info("图片上传功能开发中")}
              >
                <div className="club-upload-icon">🖼️</div>
                <div className="club-upload-text">
                  点击上传活动照片（支持多张）
                </div>
              </div>
            </div>
          </div>

          {/* 招新公告 - 仅在编辑模式下可操作 */}
          <div className="club-card" style={{ opacity: loading ? 0.7 : 1 }}>
            <div className="club-card-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>招新公告</span>
              <button 
                className="club-btn club-btn-primary club-btn-sm" 
                onClick={() => setShowEditor(true)}
              >
                + 发布公告
              </button>
            </div>

            {showEditor && (
              <div style={{marginBottom: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px'}}>
                <div className="club-form-group">
                  <label className="club-form-label">公告标题</label>
                  <input
                    type="text"
                    className="club-form-input"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div className="club-form-group">
                  <label className="club-form-label">公告内容</label>
                  <textarea
                    className="club-form-textarea"
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div style={{display: 'flex', gap: '12px'}}>
                  <button 
                    className="club-btn club-btn-primary club-btn-sm" 
                    onClick={handleAddAnnouncement}
                    disabled={loading}
                  >
                    保存
                  </button>
                  <button 
                    className="club-btn club-btn-default club-btn-sm" 
                    onClick={() => setShowEditor(false)}
                    disabled={loading}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <table className="club-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>发布时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.time}</td>
                    <td>
                      <span className={`club-tag ${item.status === '已发布' ? 'club-tag-passed' : 'club-tag-pending'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="club-btn club-btn-default club-btn-sm">编辑</button>
                      <button 
                        className="club-btn club-btn-danger club-btn-sm" 
                        onClick={() => handleDeleteAnnouncement(item.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {announcements.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                暂无公告
              </div>
            )}
          </div>

          {/* 底部操作栏（编辑模式下显示） */}
          <div style={{
            position: 'sticky',
            bottom: '24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            padding: '16px 24px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            <button 
              className="club-btn club-btn-default" 
              onClick={handleCancel}
              disabled={loading}
            >
              <X size={16} style={{ marginRight: '6px' }} />
              取消
            </button>
            <button 
              className="club-btn club-btn-success" 
              onClick={handleSave}
              disabled={loading}
            >
              <Save size={16} style={{ marginRight: '6px' }} />
              {loading ? "保存中..." : "保存修改"}
            </button>
          </div>
        </>
      )}
    </ClubLayout>
  );
};

export default ClubInfo;
