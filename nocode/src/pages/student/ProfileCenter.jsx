import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Heart, 
  LogOut, 
  Edit2,
  ChevronRight,
  Tag,
  MessageCircle,
  Users,
  FileText,
  Bell,
  Home,
  ThumbsUp
} from "lucide-react";
import "@/styles/student.css";

const ProfileCenter = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applyCount, setApplyCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [forumCount, setForumCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const storedInfo = localStorage.getItem("studentInfo");
    const storedProfile = localStorage.getItem("studentProfile");
    
    if (!storedInfo) {
      toast.error("请先登录");
      window.location.href = "/#/student/login";
      return;
    }
    
    const parsedInfo = JSON.parse(storedInfo);
    setStudentInfo(parsedInfo);
    setEditForm({
      name: parsedInfo.name || "",
      phone: parsedInfo.phone || "",
      email: parsedInfo.email || ""
    });
    
    if (storedProfile) {
      setStudentProfile(JSON.parse(storedProfile));
    }
    
    loadCounts(parsedInfo.student_id);
    loadForumCount(parsedInfo.student_id);
    loadStudentFromDB(parsedInfo.student_id);
  }, []);

  // 从数据库加载最新学生信息
  const loadStudentFromDB = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from("student")
        .select("*")
        .eq("student_id", studentId)
        .single();
      
      if (!error && data) {
        setStudentInfo(data);
        localStorage.setItem("studentInfo", JSON.stringify(data));
      }
    } catch (error) {
      console.error("加载学生信息失败:", error);
    }
  };

  // 加载统计数量
  const loadCounts = async (studentId) => {
    try {
      // 获取报名数量
      const { count: applyCount, error: applyError } = await supabase
        .from("apply")
        .select("*", { count: 'exact', head: true })
        .eq("student_id", studentId);
      
      if (!applyError) {
        setApplyCount(applyCount || 0);
      }

      // 获取未读通知数量
      const { count: noticeCount, error: noticeError } = await supabase
        .from("notice")
        .select("*", { count: 'exact', head: true })
        .eq("student_id", studentId)
        .eq("is_read", false);
      
      if (!noticeError) {
        setNoticeCount(noticeCount || 0);
      }

      // 获取匹配成功次数（已通过审核的报名）
      const { count: matchCount, error: matchError } = await supabase
        .from("apply")
        .select("*", { count: 'exact', head: true })
        .eq("student_id", studentId)
        .eq("status", "已通过");
      
      if (!matchError) {
        setMatchCount(matchCount || 0);
      }
    } catch (error) {
      console.error("加载统计失败:", error);
    }
  };

  // 加载论坛发帖数
  const loadForumCount = async (studentId) => {
    try {
      const { count, error } = await supabase
        .from("forum_posts")
        .select("*", { count: 'exact', head: true })
        .eq("student_id", studentId)
        .eq("status", 1);
      
      if (!error) {
        setForumCount(count || 0);
      }
    } catch (error) {
      console.error("加载论坛统计失败:", error);
    }
  };

  // 退出登录
  const handleLogout = () => {
    if (!confirm("确定要退出登录吗？")) return;
    
    localStorage.removeItem("studentInfo");
    localStorage.removeItem("studentProfile");
    toast.success("已退出登录");
    window.location.href = "/#/student/login";
  };

  // 保存个人资料
  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error("姓名不能为空");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("student")
        .update({
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email
        })
        .eq("student_id", studentInfo.student_id);
      
      if (error) {
        toast.error("保存失败：" + error.message);
        return;
      }
      
      // 更新本地存储
      const updatedInfo = { ...studentInfo, ...editForm };
      setStudentInfo(updatedInfo);
      localStorage.setItem("studentInfo", JSON.stringify(updatedInfo));
      toast.success("个人资料已更新");
      setIsEditing(false);
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  // 返回首页
  const goBack = () => {
    window.location.href = "/#/student/index";
  };

  // 跳转到兴趣画像
  const goToProfileEdit = () => {
    window.location.href = "/#/student/profile";
  };

  // 跳转到我的报名
  const goToApply = () => {
    window.location.href = "/#/student/apply";
  };

  // 跳转到通知中心
  const goToNotice = () => {
    window.location.href = "/#/student/notice";
  };

  // 跳转到交友论坛
  const goToForum = () => {
    window.location.href = "/#/student/forum";
  };

  // 跳转到个人中心
  const goToProfileCenter = () => {
    window.location.href = "/#/student/profilecenter";
  };

  // 获取头像颜色
  const getAvatarColor = (name) => {
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9254DE'];
    return colors[name?.charCodeAt(0) % colors.length] || '#409EFF';
  };

  // 获取兴趣标签
  const getInterestTags = () => {
    if (studentProfile?.interestTags && studentProfile.interestTags.length > 0) {
      return studentProfile.interestTags;
    }
    // 尝试从 studentInfo.interest_tags 解析
    if (studentInfo?.interest_tags) {
      return studentInfo.interest_tags.split(',').map(t => t.trim()).filter(t => t);
    }
    return [];
  };

  if (!studentInfo) {
    return <div className="student-page">加载中...</div>;
  }

  const interestTags = getInterestTags();

  return (
    <div className="student-page">
      <div className="student-container" style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '70px' }}>
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
            <span style={{ fontSize: '18px', fontWeight: 600 }}>个人中心</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#f5222d',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={16} />
            退出
          </button>
        </div>

        {/* 用户信息卡片 */}
        <div style={{
          background: 'linear-gradient(135deg, #409EFF 0%, #66b1ff 100%)',
          padding: '30px 20px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 头像 */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 600,
              border: '3px solid rgba(255,255,255,0.5)'
            }}>
              {studentInfo.name?.charAt(0)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>
                {studentInfo.name}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>
                学号: {studentInfo.student_id}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                {studentInfo.college} · {studentInfo.major}
              </div>
            </div>
          </div>

          {/* 统计 */}
          <div style={{ 
            display: 'flex', 
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{applyCount}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>我的报名</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{noticeCount}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>未读通知</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{interestTags.length}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>兴趣标签</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{matchCount}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>匹配成功</div>
            </div>
          </div>
        </div>

        {/* 兴趣标签 */}
        <div style={{ padding: '15px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={18} color="#f56c6c" />
                <span style={{ fontSize: '15px', fontWeight: 600 }}>我的兴趣标签</span>
              </div>
              <button 
                onClick={goToProfileEdit}
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
                <Edit2 size={14} />
                编辑
              </button>
            </div>
            
            {interestTags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {interestTags.map((tag, idx) => (
                  <span key={idx} style={{
                    padding: '6px 14px',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    borderRadius: '16px',
                    fontSize: '13px',
                    border: '1px solid #bae6fd'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#999',
                fontSize: '13px'
              }}>
                还未设置兴趣标签，快去完善吧
                <button
                  onClick={goToProfileEdit}
                  style={{
                    display: 'block',
                    margin: '10px auto 0',
                    padding: '8px 20px',
                    background: '#409EFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  去设置
                </button>
              </div>
            )}
          </div>

          {/* 功能菜单 */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div 
              onClick={() => setIsEditing(true)}
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#e6f7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={18} color="#1890ff" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', color: '#333' }}>修改个人资料</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>编辑姓名、手机号等信息</div>
                </div>
              </div>
              <ChevronRight size={18} color="#999" />
            </div>

            <div 
              onClick={goToApply}
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#f0f9ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={18} color="#52c41a" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', color: '#333' }}>我的报名</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>查看报名状态和面试信息</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {applyCount > 0 && (
                  <span style={{
                    background: '#f5222d',
                    color: 'white',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>{applyCount}</span>
                )}
                <ChevronRight size={18} color="#999" />
              </div>
            </div>

            <div 
              onClick={goToNotice}
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#fff7e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bell size={18} color="#fa8c16" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', color: '#333' }}>通知中心</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>招新通知和系统消息</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {noticeCount > 0 && (
                  <span style={{
                    background: '#f5222d',
                    color: 'white',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>{noticeCount}</span>
                )}
                <ChevronRight size={18} color="#999" />
              </div>
            </div>

            <div 
              onClick={goToForum}
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageCircle size={18} color="#52c41a" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', color: '#333' }}>交友论坛</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>同学交流社区，分享经验</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {forumCount > 0 && (
                  <span style={{
                    background: '#409EFF',
                    color: 'white',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>{forumCount}</span>
                )}
                <ChevronRight size={18} color="#999" />
              </div>
            </div>

            <div 
              onClick={goToProfileEdit}
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#fff2f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Tag size={18} color="#f5222d" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', color: '#333' }}>完善兴趣画像</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>获得更精准的社团推荐</div>
                </div>
              </div>
              <ChevronRight size={18} color="#999" />
            </div>
          </div>

          {/* 基本信息 */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>基本信息</div>
            
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={16} color="#999" />
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>姓名</div>
                <div style={{ fontSize: '14px', color: '#333' }}>{studentInfo.name}</div>
              </div>
            </div>

            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GraduationCap size={16} color="#999" />
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>学号</div>
                <div style={{ fontSize: '14px', color: '#333' }}>{studentInfo.student_id}</div>
              </div>
            </div>

            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BookOpen size={16} color="#999" />
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>学院/专业</div>
                <div style={{ fontSize: '14px', color: '#333' }}>{studentInfo.college} / {studentInfo.major}</div>
              </div>
            </div>

            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={16} color="#999" />
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>年级</div>
                <div style={{ fontSize: '14px', color: '#333' }}>{studentInfo.grade}</div>
              </div>
            </div>

            {studentInfo.phone && (
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={16} color="#999" />
                <div>
                  <div style={{ fontSize: '12px', color: '#999' }}>手机号</div>
                  <div style={{ fontSize: '14px', color: '#333' }}>{studentInfo.phone}</div>
                </div>
              </div>
            )}

            {studentInfo.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={16} color="#999" />
                <div>
                  <div style={{ fontSize: '12px', color: '#999' }}>邮箱</div>
                  <div style={{ fontSize: '14px', color: '#333' }}>{studentInfo.email}</div>
                </div>
              </div>
            )}
          </div>

          {/* 版本信息 */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#999',
            fontSize: '12px'
          }}>
            <div>Match You 社团招新平台</div>
            <div style={{ marginTop: '4px' }}>版本 1.0.0</div>
          </div>
        </div>

        {/* 编辑资料弹窗 */}
        {isEditing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>修改个人资料</span>
                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>
              
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>姓名</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>手机号</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>邮箱</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      background: '#fff',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: 'none',
                      background: '#409EFF',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部导航 */}
        <div className="bottom-nav" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div className="nav-item" onClick={() => window.location.href = "/#/student/index"}>
            <Home size={20} />
            <span>首页</span>
          </div>
          <div className="nav-item" onClick={goToApply}>
            <FileText size={20} />
            <span>我的报名</span>
            {applyCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '15px',
                background: '#f5222d',
                color: 'white',
                fontSize: '10px',
                padding: '2px 5px',
                borderRadius: '10px'
              }}>{applyCount}</span>
            )}
          </div>
          <div className="nav-item" onClick={goToNotice}>
            <Bell size={20} />
            <span>通知中心</span>
            {noticeCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '15px',
                background: '#f5222d',
                color: 'white',
                fontSize: '10px',
                padding: '2px 5px',
                borderRadius: '10px'
              }}>{noticeCount}</span>
            )}
          </div>
          <div className="nav-item" onClick={goToForum}>
            <MessageCircle size={20} />
            <span>交友论坛</span>
          </div>
          <div className="nav-item active" onClick={goToProfileCenter}>
            <User size={20} />
            <span>个人中心</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCenter;
