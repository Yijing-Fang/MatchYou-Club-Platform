import { useState, useEffect } from "react";
import { toast } from "sonner";
import SchoolLayout from "./components/SchoolLayout.jsx";
import { 
  Search, 
  Filter,
  UserX,
  UserCheck,
  GraduationCap,
  Building2,
  RefreshCw
} from "lucide-react";

const SchoolUser = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // 模拟新生数据
  const [students, setStudents] = useState([
    { id: 1, studentId: "2026001001", name: "李同学", college: "计算机学院", major: "计算机科学与技术", grade: "2026级", phone: "13800138001", status: 1, registerTime: "2026-01-20 14:30" },
    { id: 2, studentId: "2026001002", name: "王同学", college: "文学院", major: "汉语言文学", grade: "2026级", phone: "13800138002", status: 1, registerTime: "2026-01-19 10:20" },
    { id: 3, studentId: "2026001003", name: "张同学", college: "商学院", major: "工商管理", grade: "2026级", phone: "13800138003", status: 0, registerTime: "2026-01-18 16:45" },
    { id: 4, studentId: "2026001004", name: "刘同学", college: "法学院", major: "法学", grade: "2026级", phone: "13800138004", status: 1, registerTime: "2026-01-17 09:15" },
    { id: 5, studentId: "2026001005", name: "陈同学", college: "计算机学院", major: "软件工程", grade: "2026级", phone: "13800138005", status: 1, registerTime: "2026-01-21 11:00" },
  ]);

  // 模拟社团管理员数据
  const [clubAdmins, setClubAdmins] = useState([
    { id: 1, studentId: "2025001001", name: "张社长", clubName: "计算机技术社团", position: "社长", phone: "13800138101", status: 1, registerTime: "2026-01-15 14:30" },
    { id: 2, studentId: "2025001002", name: "李社长", clubName: "校园合唱团", position: "社长", phone: "13800138102", status: 1, registerTime: "2026-01-14 10:20" },
    { id: 3, studentId: "2025001003", name: "王社长", clubName: "篮球社", position: "社长", phone: "13800138103", status: 0, registerTime: "2026-01-13 16:45" },
    { id: 4, studentId: "2025001004", name: "赵社长", clubName: "公益志愿者协会", position: "社长", phone: "13800138104", status: 1, registerTime: "2026-01-12 09:15" },
  ]);

  const handleToggleStatus = (type, id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionText = newStatus === 0 ? "禁用" : "恢复";
    
    if (type === "student") {
      setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } else {
      setClubAdmins(clubAdmins.map(a => a.id === id ? { ...a, status: newStatus } : a));
    }
    
    toast.success(`已${actionText}账号，操作实时生效`);
  };

  const filteredStudents = students.filter(s => {
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? s.status === 1 : s.status === 0);
    const matchSearch = !searchKeyword || 
      s.name.includes(searchKeyword) || 
      s.studentId.includes(searchKeyword) ||
      s.college.includes(searchKeyword);
    return matchStatus && matchSearch;
  });

  const filteredAdmins = clubAdmins.filter(a => {
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? a.status === 1 : a.status === 0);
    const matchSearch = !searchKeyword || 
      a.name.includes(searchKeyword) || 
      a.studentId.includes(searchKeyword) ||
      a.clubName.includes(searchKeyword);
    return matchStatus && matchSearch;
  });

  return (
    <SchoolLayout title="用户管理">
      {/* 标签切换 */}
      <div className="school-card">
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          <button
            onClick={() => { setActiveTab("student"); setSearchKeyword(""); setStatusFilter("all"); }}
            style={{
              padding: '16px 32px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              cursor: 'pointer',
              borderBottom: activeTab === "student" ? '2px solid #409EFF' : '2px solid transparent',
              color: activeTab === "student" ? '#409EFF' : '#666',
              fontWeight: activeTab === "student" ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <GraduationCap size={18} />
            新生管理 ({students.length})
          </button>
          <button
            onClick={() => { setActiveTab("club"); setSearchKeyword(""); setStatusFilter("all"); }}
            style={{
              padding: '16px 32px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              cursor: 'pointer',
              borderBottom: activeTab === "club" ? '2px solid #409EFF' : '2px solid transparent',
              color: activeTab === "club" ? '#409EFF' : '#666',
              fontWeight: activeTab === "club" ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Building2 size={18} />
            社团管理员 ({clubAdmins.length})
          </button>
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
                placeholder={activeTab === "student" ? "搜索姓名、学号、学院" : "搜索姓名、学号、社团"}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            <select 
              className="school-form-select" 
              style={{ width: '120px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="active">正常</option>
              <option value="disabled">已禁用</option>
            </select>
          </div>
        </div>

        {/* 新生管理表格 */}
        {activeTab === "student" && (
          <table className="school-table">
            <thead>
              <tr>
                <th>学号</th>
                <th>姓名</th>
                <th>学院</th>
                <th>专业</th>
                <th>年级</th>
                <th>手机号</th>
                <th>注册时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.college}</td>
                  <td>{student.major}</td>
                  <td>{student.grade}</td>
                  <td>{student.phone}</td>
                  <td>{student.registerTime}</td>
                  <td>
                    <span className={`school-tag ${student.status === 1 ? 'school-tag-passed' : 'school-tag-rejected'}`}>
                      {student.status === 1 ? "正常" : "已禁用"}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className={`school-btn ${student.status === 1 ? 'school-btn-danger' : 'school-btn-success'} school-btn-sm`}
                      onClick={() => handleToggleStatus("student", student.id, student.status)}
                    >
                      {student.status === 1 ? (
                        <><UserX size={14} style={{ marginRight: '4px' }} /> 禁用</>
                      ) : (
                        <><UserCheck size={14} style={{ marginRight: '4px' }} /> 恢复</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 社团管理员表格 */}
        {activeTab === "club" && (
          <table className="school-table">
            <thead>
              <tr>
                <th>学号</th>
                <th>姓名</th>
                <th>所属社团</th>
                <th>职位</th>
                <th>手机号</th>
                <th>注册时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.studentId}</td>
                  <td>{admin.name}</td>
                  <td>{admin.clubName}</td>
                  <td>{admin.position}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.registerTime}</td>
                  <td>
                    <span className={`school-tag ${admin.status === 1 ? 'school-tag-passed' : 'school-tag-rejected'}`}>
                      {admin.status === 1 ? "正常" : "已禁用"}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className={`school-btn ${admin.status === 1 ? 'school-btn-danger' : 'school-btn-success'} school-btn-sm`}
                      onClick={() => handleToggleStatus("club", admin.id, admin.status)}
                    >
                      {admin.status === 1 ? (
                        <><UserX size={14} style={{ marginRight: '4px' }} /> 禁用</>
                      ) : (
                        <><UserCheck size={14} style={{ marginRight: '4px' }} /> 恢复</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SchoolLayout>
  );
};

export default SchoolUser;
