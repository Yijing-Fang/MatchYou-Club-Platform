import { useState, useEffect } from "react";
import { toast } from "sonner";
import ClubLayout from "./components/ClubLayout.jsx";

const ClubMember = () => {
  const [members, setMembers] = useState([
    { id: 1, name: "张三", studentId: "2026001001", major: "计算机科学与技术", grade: "2026级", phone: "13800138001", joinTime: "2026-01-15", status: "正式成员" },
    { id: 2, name: "李四", studentId: "2026001002", major: "软件工程", grade: "2026级", phone: "13800138002", joinTime: "2026-01-14", status: "正式成员" },
    { id: 3, name: "王五", studentId: "2026001003", major: "网络工程", grade: "2026级", phone: "13800138003", joinTime: "2026-01-13", status: "试用期" },
    { id: 4, name: "赵六", studentId: "2026001004", major: "信息安全", grade: "2026级", phone: "13800138004", joinTime: "2026-01-12", status: "正式成员" },
    { id: 5, name: "孙七", studentId: "2026001005", major: "数据科学", grade: "2026级", phone: "13800138005", joinTime: "2026-01-11", status: "正式成员" },
  ]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [messageText, setMessageText] = useState("");

  const handleExport = () => {
    toast.success("成员名单导出成功");
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error("请输入通知内容");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("请选择要发送通知的成员");
      return;
    }
    toast.success(`已向${selectedMembers.length}位成员发送通知`);
    setMessageText("");
    setSelectedMembers([]);
  };

  const toggleSelect = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m.id));
    }
  };

  const filteredMembers = members.filter(m => 
    !searchKeyword || 
    m.name.includes(searchKeyword) || 
    m.studentId.includes(searchKeyword) ||
    m.major.includes(searchKeyword)
  );

  return (
    <ClubLayout title="成员管理">
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
              <button>搜索</button>
            </div>
          </div>
          <div className="club-toolbar-right">
            <button className="club-btn club-btn-primary club-btn-sm" onClick={handleExport}>
              导出名单
            </button>
          </div>
        </div>

        <div style={{marginBottom: '16px', fontSize: '14px', color: '#666'}}>
          共 {members.length} 名成员，已选择 {selectedMembers.length} 人
        </div>

        <table className="club-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedMembers.length === members.length && members.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>姓名</th>
              <th>学号</th>
              <th>专业</th>
              <th>年级</th>
              <th>手机号</th>
              <th>加入时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleSelect(member.id)}
                  />
                </td>
                <td>{member.name}</td>
                <td>{member.studentId}</td>
                <td>{member.major}</td>
                <td>{member.grade}</td>
                <td>{member.phone}</td>
                <td>{member.joinTime}</td>
                <td>
                  <span className={`club-tag ${member.status === '正式成员' ? 'club-tag-passed' : 'club-tag-interview'}`}>
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="club-pagination">
          <button disabled>上一页</button>
          <button className="active">1</button>
          <button disabled>下一页</button>
        </div>
      </div>

      <div className="club-card">
        <div className="club-card-title">批量发送通知</div>
        <div className="club-form-group">
          <label className="club-form-label">通知内容</label>
          <textarea
            className="club-form-textarea"
            rows={3}
            placeholder="输入要发送的通知内容..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button 
            className="club-btn club-btn-primary"
            onClick={handleSendMessage}
            disabled={selectedMembers.length === 0 || !messageText.trim()}
          >
            发送通知 ({selectedMembers.length}人)
          </button>
          <span style={{fontSize: '13px', color: '#999'}}>
            {selectedMembers.length === 0 ? "请先选择成员" : `将向${selectedMembers.length}位成员发送通知`}
          </span>
        </div>
      </div>
    </ClubLayout>
  );
};

export default ClubMember;
