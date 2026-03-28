import { useState, useEffect } from "react";
import { toast } from "sonner";
import SchoolLayout from "./components/SchoolLayout.jsx";
import { 
  Search, 
  Filter,
  Star,
  Trash2,
  Download,
  Building2,
  MessageCircle
} from "lucide-react";

const SchoolEvaluate = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);

  // 模拟评价数据
  const [evaluations, setEvaluations] = useState([
    { 
      id: 1, 
      clubName: "计算机技术社团",
      userName: "李同学",
      studentId: "2026001001",
      rating: 5, 
      content: "社团氛围很好，学长很耐心，学到了很多编程知识！",
      tags: ["氛围好", "有收获", "学长nice"],
      time: "2026-01-20 14:30",
      isMalicious: false
    },
    { 
      id: 2, 
      clubName: "校园合唱团",
      userName: "王同学",
      studentId: "2026001002",
      rating: 4, 
      content: "活动很丰富，就是排练时间有时候会和课程冲突。",
      tags: ["活动丰富"],
      time: "2026-01-19 10:20",
      isMalicious: false
    },
    { 
      id: 3, 
      clubName: "篮球社",
      userName: "张同学",
      studentId: "2026001003",
      rating: 2, 
      content: "这个社团太差了，社长态度恶劣，建议大家不要来！垃圾社团！",
      tags: [],
      time: "2026-01-18 16:45",
      isMalicious: true
    },
    { 
      id: 4, 
      clubName: "公益志愿者协会",
      userName: "刘同学",
      studentId: "2026001004",
      rating: 5, 
      content: "很有意义的社团，参与了很多志愿活动，收获了满满的感动。",
      tags: ["有意义", "推荐", "有收获"],
      time: "2026-01-17 09:15",
      isMalicious: false
    },
    { 
      id: 5, 
      clubName: "文学社",
      userName: "陈同学",
      studentId: "2026001005",
      rating: 3, 
      content: "一般般吧，活动内容比较单一，希望能有更多创新。",
      tags: ["一般"],
      time: "2026-01-21 11:00",
      isMalicious: false
    },
  ]);

  const clubs = ["计算机技术社团", "校园合唱团", "篮球社", "公益志愿者协会", "文学社"];

  const handleDelete = (id) => {
    if (!confirm("确定要删除这条评价吗？删除后不可恢复。")) return;
    setEvaluations(evaluations.filter(e => e.id !== id));
    toast.success("评价已删除");
  };

  const handleBatchDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("请先选择要删除的评价");
      return;
    }
    if (!confirm(`确定要删除选中的 ${selectedItems.length} 条评价吗？`)) return;
    setEvaluations(evaluations.filter(e => !selectedItems.includes(e.id)));
    setSelectedItems([]);
    toast.success(`已删除 ${selectedItems.length} 条评价`);
  };

  const handleExport = () => {
    toast.success("评价记录导出成功");
  };

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={14} 
            fill={star <= rating ? "#faad14" : "#d9d9d9"} 
            color={star <= rating ? "#faad14" : "#d9d9d9"} 
          />
        ))}
      </div>
    );
  };

  const filteredEvaluations = evaluations.filter(item => {
    const matchClub = clubFilter === "all" || item.clubName === clubFilter;
    const matchStar = starFilter === "all" || item.rating === parseInt(starFilter);
    const matchSearch = !searchKeyword || 
      item.content.includes(searchKeyword) || 
      item.userName.includes(searchKeyword);
    return matchClub && matchStar && matchSearch;
  });

  return (
    <SchoolLayout title="评价管理">
      <div className="school-card">
        {/* 工具栏 */}
        <div className="school-toolbar">
          <div className="school-toolbar-left">
            <div className="school-search">
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                placeholder="搜索评价内容、用户名"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            <select 
              className="school-form-select" 
              style={{ width: '150px' }}
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
            >
              <option value="all">全部社团</option>
              {clubs.map(club => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
            <select 
              className="school-form-select" 
              style={{ width: '120px' }}
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
            >
              <option value="all">全部星级</option>
              <option value="5">5星</option>
              <option value="4">4星</option>
              <option value="3">3星</option>
              <option value="2">2星</option>
              <option value="1">1星</option>
            </select>
          </div>
          <div className="school-toolbar-right">
            <button 
              className="school-btn school-btn-danger school-btn-sm"
              onClick={handleBatchDelete}
              disabled={selectedItems.length === 0}
            >
              <Trash2 size={14} style={{ marginRight: '4px' }} />
              批量删除 ({selectedItems.length})
            </button>
            <button 
              className="school-btn school-btn-primary school-btn-sm"
              onClick={handleExport}
            >
              <Download size={14} style={{ marginRight: '4px' }} />
              导出记录
            </button>
          </div>
        </div>

        {/* 评价列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvaluations.map(item => (
            <div 
              key={item.id} 
              style={{ 
                border: '1px solid #e8e8e8', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: item.isMalicious ? '#fff1f0' : '#fff',
                borderColor: item.isMalicious ? '#ffa39e' : '#e8e8e8'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="#409EFF" />
                    <span style={{ fontWeight: 600 }}>{item.clubName}</span>
                  </div>
                  <span style={{ color: '#999', fontSize: '13px' }}>|</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={14} color="#666" />
                    <span style={{ fontSize: '14px' }}>{item.userName} ({item.studentId})</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {renderStars(item.rating)}
                  <span style={{ color: '#999', fontSize: '13px' }}>{item.time}</span>
                </div>
              </div>
              
              <div style={{ 
                fontSize: '14px', 
                color: item.isMalicious ? '#cf1322' : '#333', 
                lineHeight: '1.6',
                marginBottom: '12px',
                marginLeft: '28px'
              }}>
                {item.isMalicious && (
                  <span style={{ 
                    backgroundColor: '#ff4d4f', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginRight: '8px'
                  }}>
                    疑似恶意
                  </span>
                )}
                {item.content}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '28px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {item.tags.map(tag => (
                    <span 
                      key={tag} 
                      style={{ 
                        fontSize: '12px', 
                        padding: '4px 12px', 
                        backgroundColor: '#f0f9ff', 
                        color: '#409EFF', 
                        borderRadius: '4px' 
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button 
                  className="school-btn school-btn-danger school-btn-sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={14} style={{ marginRight: '4px' }} />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvaluations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <MessageCircle size={48} style={{ marginBottom: '16px', color: '#d9d9d9' }} />
            <p>暂无评价数据</p>
          </div>
        )}
      </div>
    </SchoolLayout>
  );
};

export default SchoolEvaluate;
