import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, MapPin, User, CheckCircle, XCircle, Loader } from "lucide-react";
import "@/styles/student.css";

const StudentApply = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [applyList, setApplyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const storedInfo = localStorage.getItem("studentInfo");
    if (!storedInfo) {
      toast.error("请先登录");
      window.location.href = "/#/student/login";
      return;
    }
    
    const parsedInfo = JSON.parse(storedInfo);
    setStudentInfo(parsedInfo);
    loadApplyList(parsedInfo.student_id);
  }, []);

  // 加载报名列表
  const loadApplyList = async (studentId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("apply")
        .select(`
          *,
          club:club_id (club_name, club_tags, interview_time, interview_location)
        `)
        .eq("student_id", studentId)
        .order("apply_time", { ascending: false });
      
      if (error) {
        console.error("加载报名列表失败:", error);
        toast.error("加载报名列表失败");
        return;
      }
      
      setApplyList(data || []);
    } catch (error) {
      console.error("加载报名列表异常:", error);
      toast.error("加载失败");
    } finally {
      setLoading(false);
    }
  };

  // 取消报名
  const handleCancel = async (applyId) => {
    if (!confirm("确定要取消这个报名吗？")) {
      return;
    }
    
    setCancellingId(applyId);
    try {
      const { error } = await supabase
        .from("apply")
        .update({ status: "已取消" })
        .eq("apply_id", applyId);
      
      if (error) {
        toast.error("取消失败: " + error.message);
        return;
      }
      
      toast.success("已取消报名");
      loadApplyList(studentInfo.student_id);
    } catch (error) {
      toast.error("取消失败");
    } finally {
      setCancellingId(null);
    }
  };

  // 获取状态标签样式
  const getStatusStyle = (status) => {
    const map = {
      "待审核": { bg: "#fff7e6", color: "#fa8c16", border: "#ffd591" },
      "已通过": { bg: "#f6ffed", color: "#52c41a", border: "#b7eb8f" },
      "已拒绝": { bg: "#fff1f0", color: "#f5222d", border: "#ffa39e" },
      "已取消": { bg: "#f5f5f5", color: "#999", border: "#d9d9d9" },
      "面试中": { bg: "#e6f7ff", color: "#1890ff", border: "#91d5ff" }
    };
    return map[status] || map["待审核"];
  };

  // 返回首页
  const goBack = () => {
    window.location.href = "/#/student/index";
  };

  if (!studentInfo) {
    return <div className="student-page">加载中...</div>;
  }

  return (
    <div className="student-page">
      <div className="student-container" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
        {/* 头部 */}
        <div style={{ 
          padding: '15px', 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <ArrowLeft size={24} color="#333" />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>我的报名</span>
        </div>

        {/* 统计 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '10px', 
          padding: '15px',
          background: '#f5f5f5'
        }}>
          {[
            { label: '全部', count: applyList.length, color: '#333' },
            { label: '待审核', count: applyList.filter(a => a.status === '待审核').length, color: '#fa8c16' },
            { label: '已通过', count: applyList.filter(a => a.status === '已通过').length, color: '#52c41a' },
            { label: '已拒绝', count: applyList.filter(a => a.status === '已拒绝').length, color: '#f5222d' }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: '#fff', 
              padding: '12px 8px', 
              borderRadius: '8px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 600, color: item.color }}>{item.count}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* 报名列表 */}
        <div style={{ padding: '15px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <Loader size={32} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <div>加载中...</div>
            </div>
          ) : applyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无报名记录</div>
              <div style={{ fontSize: '13px' }}>快去首页发现并报名心仪的社团吧</div>
              <button 
                onClick={() => window.location.href = "/#/student/index"}
                style={{
                  marginTop: '20px',
                  padding: '10px 24px',
                  background: '#409EFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                去浏览社团
              </button>
            </div>
          ) : (
            applyList.map((apply) => {
              const statusStyle = getStatusStyle(apply.status);
              return (
                <div key={apply.apply_id} style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {/* 头部：社团名称和状态 */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                        {apply.club?.club_name || '未知社团'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        报名号: {apply.apply_id}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`
                    }}>
                      {apply.status}
                    </span>
                  </div>

                  {/* 社团标签 */}
                  {apply.club?.club_tags && (
                    <div style={{ marginBottom: '12px' }}>
                      {apply.club.club_tags.split(',').slice(0, 3).map((tag, idx) => (
                        <span key={idx} style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          background: '#f0f0f0',
                          color: '#666',
                          borderRadius: '10px',
                          marginRight: '6px'
                        }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 报名信息 */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      报名时间: {new Date(apply.apply_time).toLocaleString()}
                    </div>
                    
                    {apply.interview_time && (
                      <div style={{ fontSize: '13px', color: '#1890ff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} />
                        面试: {apply.interview_time} @ {apply.interview_location || '待定'}
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  {apply.status === '待审核' && (
                    <button
                      onClick={() => handleCancel(apply.apply_id)}
                      disabled={cancellingId === apply.apply_id}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#fff',
                        color: '#f5222d',
                        border: '1px solid #ffa39e',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {cancellingId === apply.apply_id ? (
                        <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> 取消中...</>
                      ) : (
                        <><XCircle size={16} /> 取消报名</>
                      )}
                    </button>
                  )}

                  {apply.status === '已通过' && (
                    <div style={{
                      padding: '10px',
                      background: '#f6ffed',
                      color: '#52c41a',
                      borderRadius: '6px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle size={16} />
                      恭喜您已通过审核，请按时参加面试
                    </div>
                  )}

                  {apply.status === '已拒绝' && (
                    <div style={{
                      padding: '10px',
                      background: '#fff1f0',
                      color: '#f5222d',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      很遗憾，本次未能通过审核，欢迎关注其他社团
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentApply;
