
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Search, User, Home, FileText, Bell, MessageCircle } from "lucide-react";
import "@/styles/student.css";

const StudentIndex = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyList, setApplyList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);
  const [dbError, setDbError] = useState(null);
  
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    frequency: "",
    difficulty: "",
    scale: "",
    status: "all",
  });

  const categories = ["音乐", "舞蹈", "体育", "公益", "学术", "技术", "文化", "其他"];
  const frequencies = ["每周1次", "每周2-3次", "每月1-2次"];
  const difficulties = ["容易", "中等", "困难"];
  const scales = ["小型（≤50人）", "中型（51-100人）", "大型（≥101人）"];
  const statuses = ["招新中", "未开始", "已结束"];

  // 获取学生信息和社团数据
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
    
    // 修复：优先从 studentProfile 读取，如果没有则尝试从 studentInfo.interest_tags 读取
    let profileData = null;
    if (storedProfile) {
      profileData = JSON.parse(storedProfile);
    } else if (parsedInfo.interest_tags) {
      // 直接从 student 表的 interest_tags 字段解析
      const tags = parsedInfo.interest_tags.split(',').map(t => t.trim()).filter(t => t);
      profileData = { interestTags: tags };
    }
    
    if (profileData) {
      setStudentProfile(profileData);
      console.log("【调试】已加载学生兴趣标签:", profileData.interestTags);
    } else {
      console.log("【调试】未找到兴趣标签");
    }
    
    loadClubs();
    loadApplyList(parsedInfo.student_id);
    loadNotices(parsedInfo.student_id);
  }, []);

  // 从 Supabase 加载社团数据
  const loadClubs = async () => {
    setLoading(true);
    setDbError(null);
    try {
      console.log("【调试】开始加载社团数据...");
      
      // 先检查 club 表是否存在
      const { data: testData, error: testError } = await supabase
        .from("club")
        .select("club_id")
        .limit(1);
      
      if (testError) {
        console.error("【调试】club表访问错误:", testError);
        if (testError.message.includes("does not exist") || testError.code === '42P01') {
          setDbError("club表不存在，请先执行数据库初始化SQL");
          toast.error("数据库未初始化，请先创建club表");
          setLoading(false);
          return;
        }
      }
      
      // 查询所有社团（先不筛选状态，看看有多少数据）
      const { data: allClubs, error: countError } = await supabase
        .from("club")
        .select("*");
      
      if (countError) {
        console.error("【调试】查询所有社团失败:", countError);
      } else {
        console.log("【调试】数据库中社团总数:", allClubs?.length || 0);
        console.log("【调试】所有社团状态:", allClubs?.map(c => ({ name: c.club_name, status: c.recruit_status })));
      }
      
      // 查询状态为"招新中"的社团
      const { data: clubsData, error: clubsError } = await supabase
        .from("club")
        .select("*")
        .eq("recruit_status", "招新中");
      
      if (clubsError) {
        console.error("【调试】加载社团失败:", clubsError);
        setDbError("加载社团列表失败: " + clubsError.message);
        toast.error("加载社团列表失败");
        setLoading(false);
        return;
      }

      console.log("【调试】加载到招新中社团数量:", clubsData?.length || 0);

      if (!clubsData || clubsData.length === 0) {
        console.log("【调试】警告：没有招新中的社团");
        // 如果没有招新中的社团，尝试加载所有社团显示给用户
        const { data: anyClubs } = await supabase.from("club").select("*");
        console.log("【调试】尝试加载所有社团:", anyClubs?.length || 0);
      }

      // 计算每个社团的已报名人数
      const { data: applyData, error: applyError } = await supabase
        .from("apply")
        .select("club_id, status");
      
      if (applyError) {
        console.error("【调试】加载报名数据失败:", applyError);
      }

      // 计算每个社团的已报名人数
      const applyCountMap = {};
      if (applyData) {
        applyData.forEach(apply => {
          if (apply.status !== "已取消") {
            applyCountMap[apply.club_id] = (applyCountMap[apply.club_id] || 0) + 1;
          }
        });
      }

      console.log("【调试】报名统计:", applyCountMap);

      // 处理社团数据，计算剩余名额和匹配度
      const processedClubs = clubsData.map(club => {
        const applied = applyCountMap[club.club_id] || 0;
        const quota = club.quota || 50;
        const remaining = Math.max(0, quota - applied);
        
        return {
          ...club,
          remaining,
          applied,
          club_tags: club.club_tags || "",
          category: club.category || "其他"
        };
      }).filter(club => {
        // 只保留剩余名额大于0的社团
        return club.remaining > 0;
      });

      console.log("【调试】处理后符合条件的社团数量:", processedClubs.length);
      setClubs(processedClubs);
      
      if (processedClubs.length === 0) {
        console.log("【调试】警告：处理后没有符合条件的社团（可能名额已满）");
      }
    } catch (error) {
      console.error("【调试】加载社团异常:", error);
      setDbError("加载社团列表异常: " + error.message);
      toast.error("加载社团列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载学生的报名列表
  const loadApplyList = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from("apply")
        .select(`
          *,
          club:club_id (club_name, club_tags)
        `)
        .eq("student_id", studentId)
        .order("apply_time", { ascending: false });
      
      if (error) {
        console.error("加载报名列表失败:", error);
        return;
      }
      
      setApplyList(data || []);
    } catch (error) {
      console.error("加载报名列表异常:", error);
    }
  };

  // 加载通知列表
  const loadNotices = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from("notice")
        .select("*")
        .eq("student_id", studentId)
        .order("create_time", { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("加载通知失败:", error);
        return;
      }
      
      setNoticeList(data || []);
    } catch (error) {
      console.error("加载通知异常:", error);
    }
  };

  // 计算匹配度
  const calculateMatchRate = (clubTags) => {
    if (!studentProfile || !studentProfile.interestTags || studentProfile.interestTags.length === 0) {
      return null;
    }
    
    if (!clubTags) return 0;
    
    const studentTags = studentProfile.interestTags.map(tag => tag.trim().toLowerCase()).filter(t => t);
    const clubTagList = clubTags.split(",").map(tag => tag.trim().toLowerCase()).filter(t => t);
    
    if (clubTagList.length === 0) return 0;
    
    const matchedTags = studentTags.filter(tag => clubTagList.includes(tag));
    const matchCount = matchedTags.length;
    
    if (studentTags.length === 0) return 0;
    
    const matchRate = Math.round((matchCount / studentTags.length) * 100);
    
    return matchRate;
  };

  // 过滤和排序社团
  const getFilteredAndSortedClubs = () => {
    let filtered = clubs.filter(club => {
      const matchSearch = !searchKeyword || 
        (club.club_name && club.club_name.includes(searchKeyword)) || 
        (club.description && club.description.includes(searchKeyword));
      
      const matchCategory = filterOptions.categories.length === 0 || 
        (club.category && filterOptions.categories.includes(club.category));
      
      const matchStatus = filterOptions.status === "all" || 
        club.recruit_status === filterOptions.status;
      
      const matchDifficulty = !filterOptions.difficulty || 
        club.difficulty === filterOptions.difficulty;
      
      const matchFrequency = !filterOptions.frequency || 
        club.frequency === filterOptions.frequency;
      
      return matchSearch && matchCategory && matchStatus && matchDifficulty && matchFrequency;
    });

    // 计算匹配度并排序
    const clubsWithMatchRate = filtered.map(club => ({
      ...club,
      matchRate: calculateMatchRate(club.club_tags)
    }));

    clubsWithMatchRate.sort((a, b) => {
      if (a.matchRate === null && b.matchRate === null) {
        return (a.club_name || "").localeCompare(b.club_name || "");
      }
      if (a.matchRate === null) return 1;
      if (b.matchRate === null) return -1;
      if (b.matchRate !== a.matchRate) {
        return b.matchRate - a.matchRate;
      }
      return (a.club_name || "").localeCompare(b.club_name || "");
    });

    return clubsWithMatchRate;
  };

  // 处理搜索
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      toast.info("请输入搜索关键词");
      return;
    }
    toast.info(`搜索: ${searchKeyword}`);
  };

  // 应用筛选
  const applyFilter = () => {
    setShowFilter(false);
    const count = getFilteredAndSortedClubs().length;
    toast.success(`筛选完成，找到 ${count} 个社团`);
  };

  // 重置筛选
  const resetFilter = () => {
    setFilterOptions({
      categories: [],
      frequency: "",
      difficulty: "",
      scale: "",
      status: "all",
    });
  };

  // 切换类别选择
  const toggleCategory = (category) => {
    setFilterOptions((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  // 跳转到社团详情
  const goToClubDetail = (clubId) => {
    const club = clubs.find(c => c.club_id === clubId);
    if (club) {
      localStorage.setItem("currentClub", JSON.stringify(club));
    }
    window.location.href = `/#/student/club/${clubId}`;
  };

  // 跳转到我的报名
  const goToMyApply = () => {
    window.location.href = "/#/student/apply";
  };

  // 跳转到通知中心
  const goToNotice = () => {
    window.location.href = "/#/student/notice";
  };

  // 跳转到个人中心
  const goToProfile = () => {
    window.location.href = "/#/student/profilecenter";
  };

  // 跳转到交友论坛
  const goToForum = () => {
    window.location.href = "/#/student/forum";
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("studentInfo");
    localStorage.removeItem("studentProfile");
    toast.success("已退出登录");
    window.location.href = "/#/student/login";
  };

  // 获取未读通知数
  const getUnreadNoticeCount = () => {
    return noticeList.filter(n => !n.is_read).length;
  };

  const filteredClubs = getFilteredAndSortedClubs();

  if (!studentInfo) {
    return <div className="student-page">加载中...</div>;
  }

  return (
    <div className="student-page">
      <div className="student-container" style={{ overflowY: 'auto', maxHeight: '100vh', paddingBottom: '60px' }}>
        {/* 导航栏 */}
        <div className="student-navbar">
          <div className="navbar-logo">Match You</div>
          <div className="navbar-search">
            <input
              type="text"
              placeholder="搜索社团名称、关键词"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>
              <Search size={16} />
            </button>
          </div>
          <div className="navbar-icon" onClick={goToProfile}>
            <User size={20} />
          </div>
        </div>

        {/* 用户欢迎信息 */}
        <div style={{ padding: '10px 15px', background: '#f0f9ff', borderBottom: '1px solid #e6f4ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#0369a1' }}>
            欢迎，{studentInfo?.name || '同学'} 
            {studentProfile?.interestTags && studentProfile.interestTags.length > 0 ? (
              <span style={{ fontSize: '12px', color: '#0284c7', marginLeft: '8px' }}>
                已设置 {studentProfile.interestTags.length} 个兴趣标签
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: '#fa8c16', marginLeft: '8px' }}>
                未设置兴趣标签
              </span>
            )}
          </span>
          <span 
            style={{ fontSize: '12px', color: '#0284c7', cursor: 'pointer' }}
            onClick={handleLogout}
          >
            [退出]
          </span>
        </div>

        {/* 智能推荐提示 */}
        {studentProfile?.interestTags && studentProfile.interestTags.length > 0 ? (
          <div style={{ padding: '12px 15px', background: '#f6ffed', borderBottom: '1px solid #b7eb8f' }}>
            <div style={{ fontSize: '13px', color: '#389e0d', fontWeight: 500 }}>
              🎯 根据您的兴趣标签为您智能推荐
            </div>
            <div style={{ fontSize: '12px', color: '#52c41a', marginTop: '4px' }}>
              您的标签: {studentProfile.interestTags.join('、')}
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 15px', background: '#fff7e6', borderBottom: '1px solid #ffd591' }}>
            <div style={{ fontSize: '13px', color: '#d46b08', fontWeight: 500 }}>
              💡 完善兴趣标签可获得更精准的推荐
            </div>
            <div 
              style={{ fontSize: '12px', color: '#fa8c16', marginTop: '4px', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => window.location.href = "/#/student/profile"}
            >
              点击完善兴趣画像 →
            </div>
          </div>
        )}

        {/* 数据库错误提示 */}
        {dbError && (
          <div style={{ padding: '15px', background: '#fff1f0', borderBottom: '1px solid #ffa39e', margin: '10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#cf1322', fontWeight: 600, marginBottom: '8px' }}>
              ⚠️ 数据库连接问题
            </div>
            <div style={{ fontSize: '12px', color: '#a8071a', marginBottom: '10px' }}>
              {dbError}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              可能的原因：
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li>club表尚未创建</li>
                <li>数据库迁移未执行</li>
                <li>没有招新中的社团数据</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              刷新页面
            </button>
            <button 
              onClick={() => {
                // 显示诊断信息
                loadClubs();
                toast.info("正在重新加载数据...");
              }}
              style={{
                padding: '8px 16px',
                background: '#409EFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              重新加载
            </button>
          </div>
        )}

        {/* 筛选按钮 */}
        <div style={{ padding: '10px 15px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            style={{ width: 'auto', padding: '0 20px', height: '36px' }}
            onClick={() => setShowFilter(true)}
          >
            筛选
          </button>
          <span style={{ fontSize: '13px', color: '#666' }}>
            共 {filteredClubs.length} 个社团
          </span>
        </div>

        {/* 社团列表 */}
        <div className="club-list">
          {loading ? (
            <div className="loading-more">加载中...</div>
          ) : filteredClubs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#999',
              width: '100%'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '16px', marginBottom: '8px', color: '#666', fontWeight: 500 }}>
                暂无匹配社团
              </div>
              <div style={{ fontSize: '13px', marginBottom: '8px', lineHeight: '1.6' }}>
                {dbError ? "数据库连接异常，请检查网络或联系管理员" : 
                 clubs.length === 0 ? "当前数据库中没有正在招新的社团" : 
                 "请尝试调整筛选条件或搜索关键词"}
              </div>
              {clubs.length === 0 && !dbError && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontSize: '12px', color: '#666', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>可能的原因：</div>
                  <ul style={{ marginLeft: '16px', lineHeight: '1.8' }}>
                    <li>club表中没有数据</li>
                    <li>所有社团的 recruit_status 都不是 "招新中"</li>
                    <li>所有社团的名额都已满（quota - 已报名 ≤ 0）</li>
                  </ul>
                  <div style={{ marginTop: '8px', color: '#409EFF' }}>
                    请执行 SQL 文件：src/supabase/migrations/create_club_table.sql
                  </div>
                </div>
              )}
              <button 
                onClick={() => window.location.reload()}
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
                刷新页面
              </button>
            </div>
          ) : (
            filteredClubs.map((club) => (
              <div
                key={club.club_id}
                className="club-card"
                onClick={() => goToClubDetail(club.club_id)}
              >
                <img
                  src={`https://nocode.meituan.com/photo/search?keyword=${encodeURIComponent((club.category || 'club') + ',campus')}&width=300&height=120`}
                  alt={club.club_name}
                  className="club-cover"
                />
                <div className="club-info">
                  <div className="club-name">{club.club_name}</div>
                  
                  {club.matchRate !== null && club.matchRate !== undefined ? (
                    <div className="club-match" style={{ 
                      color: club.matchRate >= 80 ? '#52c41a' : club.matchRate >= 50 ? '#fa8c16' : '#999',
                      fontWeight: club.matchRate >= 80 ? 600 : 400
                    }}>
                      {club.matchRate}% 匹配
                      {club.matchRate >= 80 && ' 🔥'}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>
                      {club.category || '综合社团'}
                    </div>
                  )}
                  
                  {club.club_tags && (
                    <div style={{ fontSize: '11px', color: '#666', margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {club.club_tags.split(',').slice(0, 3).map((tag, idx) => (
                        <span key={idx} style={{ 
                          background: '#f0f0f0', 
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          marginRight: '4px',
                          display: 'inline-block'
                        }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="club-desc">{club.description || '暂无描述'}</div>
                  
                  <div className="club-status" style={{ 
                    color: club.remaining > 0 ? '#409EFF' : '#999',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      {club.recruit_status === '招新中' ? (
                        club.remaining > 0 ? `招新中·剩余${club.remaining}名额` : '名额已满'
                      ) : (
                        club.recruit_status || '未开始'
                      )}
                    </span>
                    {club.difficulty && (
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '2px 6px', 
                        background: club.difficulty === '容易' ? '#f6ffed' : club.difficulty === '困难' ? '#fff1f0' : '#e6f7ff',
                        color: club.difficulty === '容易' ? '#52c41a' : club.difficulty === '困难' ? '#f5222d' : '#1890ff',
                        borderRadius: '3px'
                      }}>
                        {club.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 筛选面板 */}
        <div className={`overlay ${showFilter ? 'show' : ''}`} onClick={() => setShowFilter(false)}></div>
        <div className={`filter-panel ${showFilter ? 'open' : ''}`}>
          <div style={{ padding: '15px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>筛选条件</span>
            <button onClick={() => setShowFilter(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>
          
          <div className="filter-section">
            <div className="filter-title">类别筛选</div>
            <div className="filter-options">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`filter-option ${filterOptions.categories.includes(cat) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">活动频率</div>
            <div className="filter-options">
              {frequencies.map((freq) => (
                <span
                  key={freq}
                  className={`filter-option ${filterOptions.frequency === freq ? 'selected' : ''}`}
                  onClick={() => setFilterOptions({ ...filterOptions, frequency: filterOptions.frequency === freq ? "" : freq })}
                >
                  {freq}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">面试难度</div>
            <div className="filter-options">
              {difficulties.map((diff) => (
                <span
                  key={diff}
                  className={`filter-option ${filterOptions.difficulty === diff ? 'selected' : ''}`}
                  onClick={() => setFilterOptions({ ...filterOptions, difficulty: filterOptions.difficulty === diff ? "" : diff })}
                >
                  {diff}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">招新状态</div>
            <div className="filter-options">
              {statuses.map((status) => (
                <span
                  key={status}
                  className={`filter-option ${filterOptions.status === status ? 'selected' : ''}`}
                  onClick={() => setFilterOptions({ ...filterOptions, status: filterOptions.status === status ? "all" : status })}
                >
                  {status}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-buttons">
            <button className="btn-reset" onClick={resetFilter}>重置</button>
            <button className="btn-confirm" onClick={applyFilter}>确定</button>
          </div>
        </div>

        {/* 底部导航 */}
        <div className="bottom-nav">
          <div className="nav-item active">
            <Home size={20} />
            <span>首页</span>
          </div>
          <div className="nav-item" onClick={goToMyApply}>
            <FileText size={20} />
            <span>我的报名</span>
            {applyList.filter(a => a.status === '待审核').length > 0 && (
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
                {applyList.filter(a => a.status === '待审核').length}
              </span>
            )}
          </div>
          <div className="nav-item" onClick={goToNotice}>
            <Bell size={20} />
            <span>通知中心</span>
            {getUnreadNoticeCount() > 0 && (
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
                {getUnreadNoticeCount()}
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

export default StudentIndex;

