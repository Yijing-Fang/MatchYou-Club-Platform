import { useState, useEffect } from "react";
import { toast } from "sonner";
import ClubLayout from "./components/ClubLayout.jsx";

const ClubApply = () => {
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);

  const [applications, setApplications] = useState([
    { id: 1, name: "张三", studentId: "2026001001", major: "计算机科学与技术", tags: ["技术", "编程"], matchRate: 92, time: "2026-01-20", status: "待审核", batch: "", note: "" },
    { id: 2, name: "李四", studentId: "2026001002", major: "软件工程", tags: ["学术", "技术"], matchRate: 85, time: "2026-01-19", status: "待面试", batch: "第一批", note: "" },
    { id: 3, name: "王五", studentId: "2026001003", major: "网络工程", tags: ["技术"], matchRate: 78, time: "2026-01-18", status: "已录取", batch: "第一批", note: "技术能力强" },
    { id: 4, name: "赵六", studentId: "2026001004", major: "信息安全", tags: ["公益", "技术"], matchRate: 70, time: "2026-01-17", status: "未通过", batch: "", note: "面试表现一般" },
    { id: 5, name: "孙七", studentId: "2026001005", major: "数据科学", tags: ["学术"], matchRate: 88, time: "2026-01-16", status: "待审核", batch: "", note: "" },
  ]);

  const [batches] = useState(["第一批", "第二批", "第三批"]);

  const statusOptions = [
    { value: "all", label: "全部" },
    { value: "待审核", label: "待审核" },
    { value: "待面试", label: "待面试" },
    { value: "已录取", label: "已录取" },
    { value: "未通过", label: "未通过" },
  ];

  const getStatusTag = (status) => {
    const map = {
      "待审核": "club-tag-pending",
      "待面试": "club-tag-interview",
      "已录取": "club-tag-passed",
      "未通过": "club-tag-rejected",
    };
    return map[status] || "club-tag-pending";
  };

  const handleStatusChange = (id, newStatus) => {
    setApplications(applications.map(app => app.id === id ? { ...app, status: newStatus } : app));
    toast.success("状态已更新");
  };

  const handleBatchAssign = (id, batch) => {
    setApplications(applications.map(app => app.id === id ? { ...app, batch, status: "待面试" } : app));
    toast.success("面试批次已分配");
  };

  const handleNoteChange = (id, note) => {
    setApplications(applications.map(app => app.id === id ? { ...app, note } : app));
  };

  const handleSendNotification = (id) => {
    toast.success("通知已发送");
  };

  const handleExport = () => {
    toast.success("已开始导出Excel");
  };

  const handleBatchExport = () => {
    if (selectedItems.length === 0) {
      toast.error("请先选择要导出的项目");
      return;
    }
    toast.success(`已选择${selectedItems.length}条记录，开始导出`);
  };

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchSearch = !searchKeyword || 
      app.name.includes(searchKeyword) || 
      app.studentId.includes(searchKeyword) ||
      app.major.includes(searchKeyword);
    return matchStatus && matchSearch;
  });

  return (
    <ClubLayout title="报名管理">
      <div className="club-card">
        <div className="club-toolbar">
          <div className="club-toolbar-left">
            <div className="club-search">
              <input
                type="text"
                placeholder="搜索姓名、学号、专业"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button onClick={() => {}}>搜索</button>
            </div>
            <div className="club-filter-tags">
              {statusOptions.map(opt => (
                <span
                  key={opt.value}
                  className={`club-filter-tag ${statusFilter === opt.value ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </span>
              ))}
            </div>
          </div>
          <div className="club-toolbar-right">
            <button className="club-btn club-btn-primary club-btn-sm" onClick={handleBatchExport}>
              批量导出 ({selectedItems.length})
            </button>
            <button className="club-btn club-btn-default club-btn-sm" onClick={handleExport}>
              导出全部
            </button>
          </div>
        </div>

        <table className="club-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filteredApplications.map(a => a.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  checked={selectedItems.length === filteredApplications.length && filteredApplications.length > 0}
                />
              </th>
              <th>姓名</th>
              <th>学号</th>
              <th>专业</th>
              <th>兴趣标签</th>
              <th>匹配度</th>
              <th>报名时间</th>
              <th>状态</th>
              <th>面试批次</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map(app => (
              <tr key={app.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(app.id)}
                    onChange={() => toggleSelect(app.id)}
                  />
                </td>
                <td>{app.name}</td>
                <td>{app.studentId}</td>
                <td>{app.major}</td>
                <td>{app.tags.join(", ")}</td>
                <td>
                  <span style={{color: app.matchRate >= 80 ? '#52c41a' : app.matchRate >= 60 ? '#fa8c16' : '#f5222d'}}>
                    {app.matchRate}%
                  </span>
                </td>
                <td>{app.time}</td>
                <td>
                  <span className={`club-tag ${getStatusTag(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <select
                    className="club-form-select"
                    style={{width: '100px', padding: '4px 8px', fontSize: '13px'}}
                    value={app.batch}
                    onChange={(e) => handleBatchAssign(app.id, e.target.value)}
                  >
                    <option value="">未分配</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </td>
                <td className="actions">
                  <select
                    className="club-form-select"
                    style={{width: '90px', padding: '4px 8px', fontSize: '13px'}}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    <option value="待审核">待审核</option>
                    <option value="待面试">待面试</option>
                    <option value="已录取">已录取</option>
                    <option value="未通过">未通过</option>
                  </select>
                  <button 
                    className="club-btn club-btn-default club-btn-sm"
                    onClick={() => handleSendNotification(app.id)}
                  >
                    通知
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="club-pagination">
          <button disabled>上一页</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>下一页</button>
        </div>
      </div>

      <div className="club-card">
        <div className="club-card-title">批量备注管理</div>
        <div style={{fontSize: '14px', color: '#666'}}>
          选中报名记录后，可在此添加统一备注（功能开发中...）
        </div>
      </div>
    </ClubLayout>
  );
};

export default ClubApply;
