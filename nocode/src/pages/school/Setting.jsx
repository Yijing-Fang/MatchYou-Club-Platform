import { useState, useEffect } from "react";
import { toast } from "sonner";
import SchoolLayout from "./components/SchoolLayout.jsx";
import { 
  Plus,
  Edit2,
  Trash2,
  Send,
  Settings,
  Bell,
  Clock,
  Shield,
  Save
} from "lucide-react";

const SchoolSetting = () => {
  const [activeTab, setActiveTab] = useState("notice");
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", type: "all" });

  // 系统设置
  const [systemSettings, setSystemSettings] = useState({
    recruitStartTime: "2026-02-01",
    recruitEndTime: "2026-03-31",
    notificationChannel: "all",
    privacyRule: "public",
    allowNewRegister: true,
  });

  // 模拟公告数据
  const [notices, setNotices] = useState([
    { 
      id: 1, 
      title: "2026春季招新正式开始", 
      content: "全校社团招新活动正式启动，请各位同学积极报名参与！",
      type: "all",
      publishTime: "2026-01-20 09:00",
      status: "已发布",
      readCount: 1258
    },
    { 
      id: 2, 
      title: "社团管理员培训通知", 
      content: "将于本周五下午2点举行社团管理员培训，请各社团社长准时参加。",
      type: "club",
      publishTime: "2026-01-19 14:30",
      status: "已发布",
      readCount: 45
    },
    { 
      id: 3, 
      title: "招新系统维护公告", 
      content: "系统将于今晚22:00-24:00进行维护，期间可能无法访问。",
      type: "all",
      publishTime: "2026-01-18 10:00",
      status: "草稿",
      readCount: 0
    },
  ]);

  const handleSaveNotice = () => {
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      toast.error("请填写完整公告信息");
      return;
    }

    if (editingNotice) {
      setNotices(notices.map(n => n.id === editingNotice.id ? { 
        ...n, 
        title: noticeForm.title,
        content: noticeForm.content,
        type: noticeForm.type
      } : n));
      toast.success("公告已更新");
    } else {
      const newNotice = {
        id: Date.now(),
        title: noticeForm.title,
        content: noticeForm.content,
        type: noticeForm.type,
        publishTime: new Date().toLocaleString(),
        status: "已发布",
        readCount: 0
      };
      setNotices([newNotice, ...notices]);
      toast.success("公告已发布并推送给所有用户");
    }
    
    setShowNoticeModal(false);
    setEditingNotice(null);
    setNoticeForm({ title: "", content: "", type: "all" });
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setNoticeForm({ title: notice.title, content: notice.content, type: notice.type });
    setShowNoticeModal(true);
  };

  const handleDelete = (id) => {
    if (!confirm("确定要删除这条公告吗？")) return;
    setNotices(notices.filter(n => n.id !== id));
    toast.success("公告已删除");
  };

  const handleSaveSettings = () => {
    toast.success("系统设置已保存并生效");
  };

  const getTypeLabel = (type) => {
    const map = { all: "全体成员", student: "新生", club: "社团管理员" };
    return map[type] || type;
  };

  return (
    <SchoolLayout title="公告与系统设置">
      {/* 标签切换 */}
      <div className="school-card">
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          <button
            onClick={() => setActiveTab("notice")}
            style={{
              padding: '16px 32px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              cursor: 'pointer',
              borderBottom: activeTab === "notice" ? '2px solid #409EFF' : '2px solid transparent',
              color: activeTab === "notice" ? '#409EFF' : '#666',
              fontWeight: activeTab === "notice" ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Bell size={18} />
            公告管理
          </button>
          <button
            onClick={() => setActiveTab("system")}
            style={{
              padding: '16px 32px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              cursor: 'pointer',
              borderBottom: activeTab === "system" ? '2px solid #409EFF' : '2px solid transparent',
              color: activeTab === "system" ? '#409EFF' : '#666',
              fontWeight: activeTab === "system" ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Settings size={18} />
            系统设置
          </button>
        </div>
      </div>

      {/* 公告管理 */}
      {activeTab === "notice" && (
        <div className="school-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>全校公告列表</h3>
            <button 
              className="school-btn school-btn-primary school-btn-sm"
              onClick={() => {
                setEditingNotice(null);
                setNoticeForm({ title: "", content: "", type: "all" });
                setShowNoticeModal(true);
              }}
            >
              <Plus size={14} style={{ marginRight: '4px' }} />
              发布公告
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notices.map(notice => (
              <div 
                key={notice.id} 
                style={{ 
                  border: '1px solid #e8e8e8', 
                  borderRadius: '8px', 
                  padding: '20px',
                  backgroundColor: notice.status === "草稿" ? '#f5f5f5' : '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{notice.title}</h4>
                      <span className={`school-tag ${notice.status === "已发布" ? 'school-tag-passed' : 'school-tag-pending'}`}>
                        {notice.status}
                      </span>
                      <span className="school-tag school-tag-info">
                        {getTypeLabel(notice.type)}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                      {notice.content}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="school-btn school-btn-default school-btn-sm"
                      onClick={() => handleEdit(notice)}
                    >
                      <Edit2 size={14} style={{ marginRight: '4px' }} />
                      编辑
                    </button>
                    <button 
                      className="school-btn school-btn-danger school-btn-sm"
                      onClick={() => handleDelete(notice.id)}
                    >
                      <Trash2 size={14} style={{ marginRight: '4px' }} />
                      删除
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#999' }}>
                  <span>发布时间: {notice.publishTime}</span>
                  <span>阅读量: {notice.readCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 系统设置 */}
      {activeTab === "system" && (
        <div className="school-card">
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} />
            全局设置
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 招新时间段设置 */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#409EFF" />
                招新时间段
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="school-form-group">
                  <label className="school-form-label">开始时间</label>
                  <input
                    type="date"
                    className="school-form-input"
                    value={systemSettings.recruitStartTime}
                    onChange={(e) => setSystemSettings({...systemSettings, recruitStartTime: e.target.value})}
                  />
                </div>
                <div className="school-form-group">
                  <label className="school-form-label">结束时间</label>
                  <input
                    type="date"
                    className="school-form-input"
                    value={systemSettings.recruitEndTime}
                    onChange={(e) => setSystemSettings({...systemSettings, recruitEndTime: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 通知渠道设置 */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#52c41a" />
                通知渠道
              </h4>
              <div className="school-form-group">
                <label className="school-form-label">默认通知方式</label>
                <select
                  className="school-form-select"
                  value={systemSettings.notificationChannel}
                  onChange={(e) => setSystemSettings({...systemSettings, notificationChannel: e.target.value})}
                >
                  <option value="all">站内信+邮件+短信</option>
                  <option value="email">仅邮件</option>
                  <option value="sms">仅短信</option>
                  <option value="internal">仅站内信</option>
                </select>
              </div>
            </div>

            {/* 隐私规则设置 */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#faad14" />
                隐私与权限
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="school-form-group">
                  <label className="school-form-label">信息公开范围</label>
                  <select
                    className="school-form-select"
                    value={systemSettings.privacyRule}
                    onChange={(e) => setSystemSettings({...systemSettings, privacyRule: e.target.value})}
                  >
                    <option value="public">完全公开</option>
                    <option value="internal">仅校内可见</option>
                    <option value="member">仅报名成员可见</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={systemSettings.allowNewRegister}
                    onChange={(e) => setSystemSettings({...systemSettings, allowNewRegister: e.target.checked})}
                  />
                  <span>允许新用户注册</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
              <button 
                className="school-btn school-btn-primary"
                onClick={handleSaveSettings}
              >
                <Save size={16} style={{ marginRight: '8px' }} />
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 公告编辑弹窗 */}
      {showNoticeModal && (
        <div className="school-modal-overlay" onClick={() => setShowNoticeModal(false)}>
          <div className="school-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="school-modal-header">
              <h3>{editingNotice ? "编辑公告" : "发布公告"}</h3>
              <button className="school-modal-close" onClick={() => setShowNoticeModal(false)}>×</button>
            </div>
            <div className="school-modal-body">
              <div className="school-form-group">
                <label className="school-form-label">公告标题 <span style={{ color: '#f5222d' }}>*</span></label>
                <input
                  type="text"
                  className="school-form-input"
                  placeholder="请输入公告标题"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})}
                />
              </div>
              <div className="school-form-group">
                <label className="school-form-label">公告内容 <span style={{ color: '#f5222d' }}>*</span></label>
                <textarea
                  className="school-form-textarea"
                  rows={6}
                  placeholder="请输入公告内容"
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({...noticeForm, content: e.target.value})}
                />
              </div>
              <div className="school-form-group">
                <label className="school-form-label">推送范围</label>
                <select
                  className="school-form-select"
                  value={noticeForm.type}
                  onChange={(e) => setNoticeForm({...noticeForm, type: e.target.value})}
                >
                  <option value="all">全体成员</option>
                  <option value="student">仅新生</option>
                  <option value="club">仅社团管理员</option>
                </select>
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                * 公告发布后将自动推送给所选范围的用户
              </p>
            </div>
            <div className="school-modal-footer">
              <button 
                className="school-btn school-btn-primary"
                onClick={handleSaveNotice}
              >
                <Send size={14} style={{ marginRight: '4px' }} />
                {editingNotice ? "保存修改" : "立即发布"}
              </button>
              <button 
                className="school-btn school-btn-default"
                onClick={() => setShowNoticeModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
};

export default SchoolSetting;
