import { useState, useEffect } from "react";
import { toast } from "sonner";
import SchoolLayout from "./components/SchoolLayout.jsx";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Search,
  Calendar,
  Building2,
  User
} from "lucide-react";

const SchoolAudit = () => {
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // 模拟招新审核数据
  const [auditList, setAuditList] = useState([
    { 
      id: 1, 
      clubName: "计算机技术社团", 
      category: "技术",
      leader: "张社长",
      startTime: "2026-02-01", 
      endTime: "2026-03-01",
      quota: 50,
      requirements: "热爱技术，有编程基础优先",
      fee: "50元/学期",
      status: "待审核",
      submitTime: "2026-01-20 14:30",
      reason: ""
    },
    { 
      id: 2, 
      clubName: "校园合唱团", 
      category: "音乐",
      leader: "李社长",
      startTime: "2026-02-15", 
      endTime: "2026-03-15",
      quota: 30,
      requirements: "热爱音乐，有声乐基础",
      fee: "30元/学期",
      status: "已通过",
      submitTime: "2026-01-19 10:20",
      reason: ""
    },
    { 
      id: 3, 
      clubName: "篮球社", 
      category: "体育",
      leader: "王社长",
      startTime: "2026-02-01", 
      endTime: "2026-02-28",
      quota: 40,
      requirements: "热爱篮球，身体素质良好",
      fee: "40元/学期",
      status: "已拒绝",
      submitTime: "2026-01-18 16:45",
      reason: "招新时间与其他大型活动冲突，建议调整"
    },
    { 
      id: 4, 
      clubName: "公益志愿者协会", 
      category: "公益",
      leader: "赵社长",
      startTime: "2026-02-10", 
      endTime: "2026-03-10",
      quota: 100,
      requirements: "热心公益，有奉献精神",
      fee: "免费",
      status: "待审核",
      submitTime: "2026-01-20 09:15",
      reason: ""
    },
    { 
      id: 5, 
      clubName: "文学社", 
      category: "文化",
      leader: "孙社长",
      startTime: "2026-02-05", 
      endTime: "2026-03-05",
      quota: 25,
      requirements: "热爱文学，有写作特长",
      fee: "20元/学期",
      status: "待审核",
      submitTime: "2026-01-21 11:00",
      reason: ""
    },
  ]);

  const statusOptions = [
    { value: "all", label: "全部" },
    { value: "待审核", label: "待审核" },
    { value: "已通过", label: "已通过" },
    { value: "已拒绝", label: "已拒绝" },
  ];

  const getStatusTag = (status) => {
    const map = {
      "待审核": "school-tag-pending",
      "已通过": "school-tag-passed",
      "已拒绝": "school-tag-rejected",
    };
    return map[status] || "school-tag-pending";
  };

  const handleViewDetail = (item) => {
    setCurrentItem(item);
    setShowDetailModal(true);
  };

  const handleApprove = (id) => {
    setAuditList(auditList.map(item => item.id === id ? { ...item, status: "已通过" } : item));
    toast.success("审核通过");
    setShowDetailModal(false);
  };

  const handleRejectClick = (item) => {
    setCurrentItem(item);
    setRejectReason("");
    setShowRejectModal(true);
    setShowDetailModal(false);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      toast.error("请填写拒绝理由");
      return;
    }
    setAuditList(auditList.map(item => 
      item.id === currentItem.id ? { ...item, status: "已拒绝", reason: rejectReason } : item
    ));
    toast.success("已拒绝并通知社团");
    setShowRejectModal(false);
    setRejectReason("");
  };

  const handleBatchApprove = () => {
    if (selectedItems.length === 0) {
      toast.error("请先选择要审核的项目");
      return;
    }
    setAuditList(auditList.map(item => 
      selectedItems.includes(item.id) && item.status === "待审核" ? { ...item, status: "已通过" } : item
    ));
    toast.success(`已批量通过 ${selectedItems.length} 个申请`);
    setSelectedItems([]);
  };

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const filteredList = auditList.filter(item => {
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchSearch = !searchKeyword || 
      item.clubName.includes(searchKeyword) || 
      item.leader.includes(searchKeyword) ||
      item.category.includes(searchKeyword);
    return matchStatus && matchSearch;
  });

  const pendingCount = auditList.filter(item => item.status === "待审核").length;

  return (
    <SchoolLayout title="招新审核">
      {/* 统计卡片 */}
      <div className="school-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="school-stat-card">
          <div className="school-stat-value">{auditList.length}</div>
          <div className="school-stat-label">招新申请总数</div>
        </div>
        <div className="school-stat-card">
          <div className="school-stat-value" style={{ color: '#fa8c16' }}>{pendingCount}</div>
          <div className="school-stat-label">待审核</div>
        </div>
        <div className="school-stat-card">
          <div className="school-stat-value" style={{ color: '#52c41a' }}>
            {auditList.filter(i => i.status === "已通过").length}
          </div>
          <div className="school-stat-label">已通过</div>
        </div>
        <div className="school-stat-card">
          <div className="school-stat-value" style={{ color: '#f5222d' }}>
            {auditList.filter(i => i.status === "已拒绝").length}
          </div>
          <div className="school-stat-label">已拒绝</div>
        </div>
      </div>

      <div className="school-card">
        {/* 工具栏 */}
        <div className="school-toolbar">
          <div className="school-toolbar-left">
            <div className="school-search">
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                placeholder="搜索社团名称、负责人"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            <div className="school-filter-tags">
              {statusOptions.map(opt => (
                <span
                  key={opt.value}
                  className={`school-filter-tag ${statusFilter === opt.value ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </span>
              ))}
            </div>
          </div>
          <div className="school-toolbar-right">
            <button 
              className="school-btn school-btn-success school-btn-sm"
              onClick={handleBatchApprove}
              disabled={selectedItems.length === 0}
            >
              批量通过 ({selectedItems.length})
            </button>
          </div>
        </div>

        {/* 数据表格 */}
        <table className="school-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filteredList.filter(i => i.status === "待审核").map(i => i.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  checked={selectedItems.length > 0 && selectedItems.length === filteredList.filter(i => i.status === "待审核").length}
                />
              </th>
              <th>社团名称</th>
              <th>类别</th>
              <th>负责人</th>
              <th>招新时间</th>
              <th>名额</th>
              <th>会费</th>
              <th>提交时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(item => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    disabled={item.status !== "待审核"}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="#409EFF" />
                    {item.clubName}
                  </div>
                </td>
                <td>{item.category}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color="#666" />
                    {item.leader}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    <div>{item.startTime}</div>
                    <div style={{ color: '#999' }}>至 {item.endTime}</div>
                  </div>
                </td>
                <td>{item.quota}人</td>
                <td>{item.fee}</td>
                <td>{item.submitTime}</td>
                <td>
                  <span className={`school-tag ${getStatusTag(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="school-btn school-btn-default school-btn-sm"
                    onClick={() => handleViewDetail(item)}
                  >
                    <Eye size={14} style={{ marginRight: '4px' }} />
                    查看
                  </button>
                  {item.status === "待审核" && (
                    <>
                      <button 
                        className="school-btn school-btn-success school-btn-sm"
                        onClick={() => handleApprove(item.id)}
                      >
                        <CheckCircle size={14} style={{ marginRight: '4px' }} />
                        通过
                      </button>
                      <button 
                        className="school-btn school-btn-danger school-btn-sm"
                        onClick={() => handleRejectClick(item)}
                      >
                        <XCircle size={14} style={{ marginRight: '4px' }} />
                        拒绝
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 详情弹窗 */}
      {showDetailModal && currentItem && (
        <div className="school-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="school-modal" onClick={(e) => e.stopPropagation()}>
            <div className="school-modal-header">
              <h3>招新详情</h3>
              <button className="school-modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="school-modal-body">
              <div className="school-detail-item">
                <span className="school-detail-label">社团名称：</span>
                <span className="school-detail-value">{currentItem.clubName}</span>
              </div>
              <div className="school-detail-item">
                <span className="school-detail-label">社团类别：</span>
                <span className="school-detail-value">{currentItem.category}</span>
              </div>
              <div className="school-detail-item">
                <span className="school-detail-label">负责人：</span>
                <span className="school-detail-value">{currentItem.leader}</span>
              </div>
              <div className="school-detail-item">
                <span className="school-detail-label">招新时间：</span>
                <span className="school-detail-value">{currentItem.startTime} 至 {currentItem.endTime}</span>
              </div>
              <div className="school-detail-item">
                <span className="school-detail-label">招新名额：</span>
                <span className="school-detail-value">{currentItem.quota}人</span>
              </div>
              <div className="school-detail-item">
                <span className="school-detail-label">会费标准：</span>
                <span className="school-detail-value">{currentItem.fee}</span>
              </div>
              <div className="school-detail-item">
                <span className="school-detail-label">招新要求：</span>
                <span className="school-detail-value">{currentItem.requirements}</span>
              </div>
              <div className="school-detail-item">
                <span className="school-detail-label">当前状态：</span>
                <span className={`school-tag ${getStatusTag(currentItem.status)}`}>
                  {currentItem.status}
                </span>
              </div>
              {currentItem.reason && (
                <div className="school-detail-item">
                  <span className="school-detail-label">拒绝理由：</span>
                  <span className="school-detail-value" style={{ color: '#f5222d' }}>{currentItem.reason}</span>
                </div>
              )}
            </div>
            <div className="school-modal-footer">
              {currentItem.status === "待审核" && (
                <>
                  <button 
                    className="school-btn school-btn-success"
                    onClick={() => handleApprove(currentItem.id)}
                  >
                    通过
                  </button>
                  <button 
                    className="school-btn school-btn-danger"
                    onClick={() => handleRejectClick(currentItem)}
                  >
                    拒绝
                  </button>
                </>
              )}
              <button 
                className="school-btn school-btn-default"
                onClick={() => setShowDetailModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 拒绝理由弹窗 */}
      {showRejectModal && (
        <div className="school-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="school-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="school-modal-header">
              <h3>填写拒绝理由</h3>
              <button className="school-modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="school-modal-body">
              <div className="school-form-group">
                <label className="school-form-label">拒绝理由 <span style={{ color: '#f5222d' }}>*</span></label>
                <textarea
                  className="school-form-textarea"
                  rows={4}
                  placeholder="请输入拒绝理由，将同步通知社团..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  * 拒绝理由必填，将自动推送给社团管理员
                </p>
              </div>
            </div>
            <div className="school-modal-footer">
              <button 
                className="school-btn school-btn-danger"
                onClick={handleRejectConfirm}
              >
                确认拒绝
              </button>
              <button 
                className="school-btn school-btn-default"
                onClick={() => setShowRejectModal(false)}
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

export default SchoolAudit;
