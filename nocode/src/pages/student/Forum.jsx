import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Heart, 
  MessageCircle, 
  Home, 
  FileText, 
  Bell, 
  User,
  Send,
  X,
  TrendingUp,
  Clock,
  Filter
} from "lucide-react";
import "@/styles/student.css";

const Forum = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest, hottest
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  
  // 发帖表单
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    tags: []
  });

  const tags = ["全部", "技术", "音乐", "体育", "公益", "学术", "文化", "舞蹈", "求助", "经验分享", "推荐"];
  const tagColors = {
    "技术": "#409EFF",
    "音乐": "#E6A23C",
    "体育": "#67C23A",
    "公益": "#F56C6C",
    "学术": "#9254DE",
    "文化": "#FF7D00",
    "舞蹈": "#FF4D4F",
    "求助": "#FAAD14",
    "经验分享": "#52C41A",
    "推荐": "#1890FF"
  };

  useEffect(() => {
    const storedInfo = localStorage.getItem("studentInfo");
    if (!storedInfo) {
      toast.error("请先登录");
      window.location.href = "/#/student/login";
      return;
    }
    
    const parsedInfo = JSON.parse(storedInfo);
    setStudentInfo(parsedInfo);
    loadPosts();
    loadLikedPosts(parsedInfo.student_id);
  }, []);

  // 加载帖子列表
  const loadPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("forum_posts")
        .select("*")
        .eq("status", 1);
      
      if (selectedTag !== "all") {
        query = query.ilike("tags", `%${selectedTag}%`);
      }
      
      if (searchKeyword.trim()) {
        query = query.or(`title.ilike.%${searchKeyword}%,content.ilike.%${searchKeyword}%`);
      }
      
      // 排序
      if (sortBy === "newest") {
        query = query.order("create_time", { ascending: false });
      } else {
        query = query.order("like_count", { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast.error("加载帖子失败");
        return;
      }
      
      setPosts(data || []);
    } catch (error) {
      console.error("加载帖子异常:", error);
    } finally {
      setLoading(false);
    }
  };

  // 加载用户点赞过的帖子
  const loadLikedPosts = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from("forum_likes")
        .select("post_id")
        .eq("student_id", studentId);
      
      if (!error && data) {
        setLikedPosts(new Set(data.map(item => item.post_id)));
      }
    } catch (error) {
      console.error("加载点赞记录失败:", error);
    }
  };

  // 加载评论
  const loadComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select("*")
        .eq("post_id", postId)
        .eq("status", 1)
        .order("create_time", { ascending: true });
      
      if (error) {
        toast.error("加载评论失败");
        return;
      }
      
      setComments(data || []);
    } catch (error) {
      console.error("加载评论异常:", error);
    }
  };

  // 发布帖子
  const handlePost = async () => {
    if (!postForm.title.trim()) {
      toast.error("请输入标题");
      return;
    }
    if (!postForm.content.trim()) {
      toast.error("请输入内容");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("forum_posts")
        .insert([{
          student_id: studentInfo.student_id,
          student_name: studentInfo.name,
          title: postForm.title,
          content: postForm.content,
          tags: postForm.tags.join(","),
          status: 1
        }]);
      
      if (error) {
        toast.error("发布失败：" + error.message);
        return;
      }
      
      toast.success("发布成功！");
      setShowPostModal(false);
      setPostForm({ title: "", content: "", tags: [] });
      loadPosts();
    } catch (error) {
      toast.error("发布失败");
    }
  };

  // 点赞/取消点赞
  const toggleLike = async (postId, e) => {
    e.stopPropagation();
    
    if (!studentInfo) return;
    
    try {
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        // 取消点赞
        await supabase
          .from("forum_likes")
          .delete()
          .eq("post_id", postId)
          .eq("student_id", studentInfo.student_id);
        
        // 更新点赞数
        await supabase.rpc("decrement_like_count", { post_id: postId });
        
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        
        setPosts(posts.map(p => 
          p.post_id === postId ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p
        ));
      } else {
        // 点赞
        await supabase
          .from("forum_likes")
          .insert([{
            post_id: postId,
            student_id: studentInfo.student_id
          }]);
        
        // 更新点赞数
        await supabase.rpc("increment_like_count", { post_id: postId });
        
        setLikedPosts(prev => new Set([...prev, postId]));
        
        setPosts(posts.map(p => 
          p.post_id === postId ? { ...p, like_count: p.like_count + 1 } : p
        ));
      }
    } catch (error) {
      console.error("点赞操作失败:", error);
    }
  };

  // 发布评论
  const handleComment = async () => {
    if (!commentText.trim()) {
      toast.error("请输入评论内容");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("forum_comments")
        .insert([{
          post_id: selectedPost.post_id,
          student_id: studentInfo.student_id,
          student_name: studentInfo.name,
          content: commentText,
          parent_id: 0,
          status: 1
        }]);
      
      if (error) {
        toast.error("评论失败：" + error.message);
        return;
      }
      
      // 更新评论数
      await supabase
        .from("forum_posts")
        .update({ comment_count: selectedPost.comment_count + 1 })
        .eq("post_id", selectedPost.post_id);
      
      toast.success("评论成功！");
      setCommentText("");
      loadComments(selectedPost.post_id);
      
      // 更新本地帖子数据
      setSelectedPost({
        ...selectedPost,
        comment_count: selectedPost.comment_count + 1
      });
      setPosts(posts.map(p => 
        p.post_id === selectedPost.post_id 
          ? { ...p, comment_count: p.comment_count + 1 } 
          : p
      ));
    } catch (error) {
      toast.error("评论失败");
    }
  };

  // 切换标签选择
  const toggleTag = (tag) => {
    if (tag === "全部") {
      setSelectedTag("all");
      return;
    }
    setSelectedTag(tag === selectedTag ? "all" : tag);
  };

  // 选择帖子标签
  const togglePostTag = (tag) => {
    if (tag === "全部") return;
    setPostForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // 打开帖子详情
  const openPostDetail = (post) => {
    setSelectedPost(post);
    loadComments(post.post_id);
  };

  // 格式化时间
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return "刚刚";
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  // 导航函数
  const goBack = () => window.location.href = "/#/student/index";
  const goToApply = () => window.location.href = "/#/student/apply";
  const goToNotice = () => window.location.href = "/#/student/notice";
  const goToProfile = () => window.location.href = "/#/student/profilecenter";
  const goToForum = () => window.location.href = "/#/student/forum";
  const goToHome = () => window.location.href = "/#/student/index";

  if (!studentInfo) {
    return <div className="student-page">加载中...</div>;
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <ArrowLeft size={24} color="#333" />
            </button>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>交友论坛</span>
          </div>
          <button 
            onClick={() => setShowPostModal(true)}
            style={{
              background: '#409EFF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            发帖
          </button>
        </div>

        {/* 搜索栏 */}
        <div style={{ padding: '12px 15px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="搜索帖子..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadPosts()}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              onClick={loadPosts}
              style={{
                padding: '10px 16px',
                background: '#409EFF',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              搜索
            </button>
          </div>
          
          {/* 标签筛选 */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: (tag === "全部" ? selectedTag === "all" : selectedTag === tag) ? '#409EFF' : '#f0f0f0',
                  color: (tag === "全部" ? selectedTag === "all" : selectedTag === tag) ? 'white' : '#666'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {/* 排序选项 */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
            <button
              onClick={() => setSortBy("newest")}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: sortBy === "newest" ? '#409EFF' : '#666',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <Clock size={14} />
              最新
            </button>
            <button
              onClick={() => setSortBy("hottest")}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: sortBy === "hottest" ? '#409EFF' : '#666',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <TrendingUp size={14} />
              最热
            </button>
          </div>
        </div>

        {/* 帖子列表 */}
        <div style={{ padding: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <div>加载中...</div>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无帖子</div>
              <div style={{ fontSize: '13px' }}>快来发布第一条帖子吧！</div>
            </div>
          ) : (
            posts.map(post => (
              <div 
                key={post.post_id}
                onClick={() => openPostDetail(post)}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer'
                }}
              >
                {/* 头部信息 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `hsl(${post.student_id?.charCodeAt(0) * 20}, 70%, 50%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600
                  }}>
                    {post.student_name?.charAt(0) || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{post.student_name || '匿名用户'}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{formatTime(post.create_time)}</div>
                  </div>
                </div>
                
                {/* 标题内容 */}
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px', lineHeight: 1.4 }}>
                  {post.title}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.content}
                </div>
                
                {/* 标签 */}
                {post.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {post.tags.split(',').filter(t => t).map((tag, idx) => (
                      <span key={idx} style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: tagColors[tag] ? `${tagColors[tag]}20` : '#f0f0f0',
                        color: tagColors[tag] || '#666'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 互动数据 */}
                <div style={{ display: 'flex', gap: '20px', paddingTop: '12px', borderTop: '1px solid #f5f5f5' }}>
                  <button 
                    onClick={(e) => toggleLike(post.post_id, e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: likedPosts.has(post.post_id) ? '#f5222d' : '#999',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Heart size={16} fill={likedPosts.has(post.post_id) ? '#f5222d' : 'none'} />
                    {post.like_count || 0}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#999' }}>
                    <MessageCircle size={16} />
                    {post.comment_count || 0}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#999' }}>
                    <Filter size={16} />
                    {post.view_count || 0}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 发帖弹窗 */}
        {showPostModal && (
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
              maxWidth: '500px',
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
                <span style={{ fontSize: '16px', fontWeight: 600 }}>发布新帖</span>
                <button onClick={() => setShowPostModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>标题</label>
                  <input
                    type="text"
                    placeholder="请输入标题..."
                    value={postForm.title}
                    onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>内容</label>
                  <textarea
                    placeholder="分享你的想法、经验或问题..."
                    value={postForm.content}
                    onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '120px',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>选择标签</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tags.filter(t => t !== "全部").map(tag => (
                      <button
                        key={tag}
                        onClick={() => togglePostTag(tag)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '16px',
                          border: `1px solid ${postForm.tags.includes(tag) ? tagColors[tag] || '#409EFF' : '#e0e0e0'}`,
                          fontSize: '13px',
                          cursor: 'pointer',
                          background: postForm.tags.includes(tag) ? `${tagColors[tag] || '#409EFF'}20` : '#fff',
                          color: postForm.tags.includes(tag) ? tagColors[tag] || '#409EFF' : '#666'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowPostModal(false)}
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
                    onClick={handlePost}
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
                    发布
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 帖子详情弹窗 */}
        {selectedPost && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#fff',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 详情头部 */}
            <div style={{ 
              padding: '15px', 
              background: '#fff', 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={24} color="#333" />
              </button>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>帖子详情</span>
            </div>
            
            {/* 详情内容 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {/* 帖子信息 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `hsl(${selectedPost.student_id?.charCodeAt(0) * 20}, 70%, 50%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 600
                }}>
                  {selectedPost.student_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>{selectedPost.student_name || '匿名用户'}</div>
                  <div style={{ fontSize: '13px', color: '#999' }}>{formatTime(selectedPost.create_time)}</div>
                </div>
              </div>
              
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '12px', lineHeight: 1.4 }}>
                {selectedPost.title}
              </div>
              <div style={{ fontSize: '15px', color: '#444', marginBottom: '16px', lineHeight: 1.8 }}>
                {selectedPost.content}
              </div>
              
              {/* 标签 */}
              {selectedPost.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {selectedPost.tags.split(',').filter(t => t).map((tag, idx) => (
                    <span key={idx} style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      background: tagColors[tag] ? `${tagColors[tag]}20` : '#f0f0f0',
                      color: tagColors[tag] || '#666'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 互动按钮 */}
              <div style={{ display: 'flex', gap: '24px', padding: '16px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', marginBottom: '20px' }}>
                <button 
                  onClick={(e) => toggleLike(selectedPost.post_id, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: likedPosts.has(selectedPost.post_id) ? '#f5222d' : '#666',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={20} fill={likedPosts.has(selectedPost.post_id) ? '#f5222d' : 'none'} />
                  {selectedPost.like_count || 0} 点赞
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#666' }}>
                  <MessageCircle size={20} />
                  {selectedPost.comment_count || 0} 评论
                </div>
              </div>
              
              {/* 评论列表 */}
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>评论 ({comments.length})</div>
                
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <div style={{ fontSize: '14px' }}>暂无评论，来说两句吧~</div>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.comment_id} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: `hsl(${comment.student_id?.charCodeAt(0) * 20}, 70%, 50%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {comment.student_name?.charAt(0) || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{comment.student_name || '匿名用户'}</span>
                          <span style={{ fontSize: '12px', color: '#999' }}>{formatTime(comment.create_time)}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>{comment.content}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* 评论输入 */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="写下你的评论..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleComment}
                  style={{
                    padding: '10px 20px',
                    background: '#409EFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Send size={16} />
                  发送
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 底部导航 */}
        <div className="bottom-nav" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div className="nav-item" onClick={goToHome}>
            <Home size={20} />
            <span>首页</span>
          </div>
          <div className="nav-item" onClick={goToApply}>
            <FileText size={20} />
            <span>我的报名</span>
          </div>
          <div className="nav-item" onClick={goToNotice}>
            <Bell size={20} />
            <span>通知中心</span>
          </div>
          <div className="nav-item active" onClick={goToForum}>
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

export default Forum;
