import { useState, useEffect } from "react";
import { toast } from "sonner";
import ClubLayout from "./components/ClubLayout.jsx";
import { Star, Star as StarEmpty } from "lucide-react";

const ClubFeedback = () => {
  const [activeTab, setActiveTab] = useState("consult");

  const [consults, setConsults] = useState([
    { id: 1, question: "请问社团平时活动多吗？", time: "2026-01-20 14:30", isAnonymous: false, user: "张三", status: "未回复", reply: "" },
    { id: 2, question: "没有编程基础可以加入吗？", time: "2026-01-19 10:15", isAnonymous: true, user: "", status: "已回复", reply: "欢迎加入！我们有新手培训~" },
    { id: 3, question: "会费可以退吗？", time: "2026-01-18 16:45", isAnonymous: false, user: "李四", status: "未回复", reply: "" },
  ]);

  const [evaluations, setEvaluations] = useState([
    { id: 1, rating: 5, content: "社团氛围很好，学到了很多！", tags: ["氛围好", "有收获"], time: "2026-01-20", user: "王五", reply: "" },
    { id: 2, rating: 4, content: "活动安排合理，就是时间有点紧。", tags: ["活动丰富"], time: "2026-01-19", user: "赵六", reply: "感谢反馈，我们会优化时间安排~" },
    { id: 3, rating: 5, content: "学长学姐很耐心，推荐加入！", tags: ["学长nice", "推荐"], time: "2026-01-18", user: "孙七", reply: "" },
  ]);

  const [replyText, setReplyText] = useState({});

  const handleReplyConsult = (id) => {
    const text = replyText[id];
    if (!text || !text.trim()) {
      toast.error("请输入回复内容");
      return;
    }
    setConsults(consults.map(c => c.id === id ? { ...c, status: "已回复", reply: text } : c));
    setReplyText({ ...replyText, [id]: "" });
    toast.success("回复成功");
  };

  const handleQuickReply = (id, reply) => {
    setConsults(consults.map(c => c.id === id ? { ...c, status: "已回复", reply } : c));
    toast.success("快捷回复成功");
  };

  const handleReplyEvaluation = (id, reply) => {
    if (!reply || !reply.trim()) {
      toast.error("请输入回复内容");
      return;
    }
    setEvaluations(evaluations.map(e => e.id === id ? { ...e, reply } : e));
    toast.success("回复成功");
  };

  const renderStars = (rating) => {
    return (
      <div style={{display: 'flex', gap: '2px'}}>
        {[1, 2, 3, 4, 5].map(star => (
          star <= rating ? 
            <Star key={star} size={16} fill="#faad14" color="#faad14" /> :
            <StarEmpty key={star} size={16} color="#d9d9d9" />
        ))}
      </div>
    );
  };

  return (
    <ClubLayout title="咨询与评价管理">
      <div className="club-card">
        <div style={{display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: '24px'}}>
          <button
            onClick={() => setActiveTab("consult")}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              borderBottom: activeTab === "consult" ? '2px solid #409EFF' : '2px solid transparent',
              color: activeTab === "consult" ? '#409EFF' : '#666',
              fontWeight: activeTab === "consult" ? 600 : 400,
            }}
          >
            咨询管理 ({consults.filter(c => c.status === "未回复").length})
          </button>
          <button
            onClick={() => setActiveTab("evaluation")}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              borderBottom: activeTab === "evaluation" ? '2px solid #409EFF' : '2px solid transparent',
              color: activeTab === "evaluation" ? '#409EFF' : '#666',
              fontWeight: activeTab === "evaluation" ? 600 : 400,
            }}
          >
            评价管理 ({evaluations.length})
          </button>
        </div>

        {activeTab === "consult" && (
          <div>
            {consults.map(consult => (
              <div key={consult.id} style={{borderBottom: '1px solid #f0f0f0', padding: '20px 0'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{fontSize: '14px', color: '#666'}}>
                      {consult.isAnonymous ? "匿名用户" : consult.user}
                    </span>
                    {consult.isAnonymous && (
                      <span style={{fontSize: '12px', padding: '2px 8px', background: '#f0f0f0', borderRadius: '4px', color: '#999'}}>
                        匿名
                      </span>
                    )}
                  </div>
                  <span style={{fontSize: '13px', color: '#999'}}>{consult.time}</span>
                </div>
                
                <div style={{fontSize: '15px', color: '#333', marginBottom: '16px', lineHeight: '1.6'}}>
                  Q: {consult.question}
                </div>

                {consult.status === "已回复" ? (
                  <div style={{background: '#f6ffed', padding: '12px', borderRadius: '4px', border: '1px solid #b7eb8f'}}>
                    <div style={{fontSize: '13px', color: '#52c41a', marginBottom: '4px'}}>已回复：</div>
                    <div style={{fontSize: '14px', color: '#333'}}>{consult.reply}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap'}}>
                      {["欢迎加入！", "请关注公众号", "请加QQ群咨询", "请联系社长"].map(reply => (
                        <button
                          key={reply}
                          className="club-btn club-btn-default club-btn-sm"
                          onClick={() => handleQuickReply(consult.id, reply)}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: '12px'}}>
                      <input
                        type="text"
                        className="club-form-input"
                        placeholder="输入回复内容..."
                        value={replyText[consult.id] || ""}
                        onChange={(e) => setReplyText({...replyText, [consult.id]: e.target.value})}
                        style={{flex: 1}}
                      />
                      <button 
                        className="club-btn club-btn-primary"
                        onClick={() => handleReplyConsult(consult.id)}
                      >
                        回复
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "evaluation" && (
          <div>
            {evaluations.map(evaluation => (
              <div key={evaluation.id} style={{borderBottom: '1px solid #f0f0f0', padding: '20px 0'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    {renderStars(evaluation.rating)}
                    <span style={{fontSize: '13px', color: '#999'}}>{evaluation.user}</span>
                  </div>
                  <span style={{fontSize: '13px', color: '#999'}}>{evaluation.time}</span>
                </div>
                
                <div style={{fontSize: '15px', color: '#333', marginBottom: '12px', lineHeight: '1.6'}}>
                  {evaluation.content}
                </div>

                <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
                  {evaluation.tags.map(tag => (
                    <span key={tag} style={{fontSize: '12px', padding: '4px 12px', background: '#f0f9ff', color: '#409EFF', borderRadius: '4px'}}>
                      {tag}
                    </span>
                  ))}
                </div>

                {evaluation.reply ? (
                  <div style={{background: '#f6ffed', padding: '12px', borderRadius: '4px', border: '1px solid #b7eb8f'}}>
                    <div style={{fontSize: '13px', color: '#52c41a', marginBottom: '4px'}}>管理员回复：</div>
                    <div style={{fontSize: '14px', color: '#333'}}>{evaluation.reply}</div>
                  </div>
                ) : (
                  <div style={{display: 'flex', gap: '12px'}}>
                    <input
                      type="text"
                      className="club-form-input"
                      placeholder="回复评价..."
                      id={`eval-reply-${evaluation.id}`}
                      style={{flex: 1}}
                    />
                    <button 
                      className="club-btn club-btn-primary"
                      onClick={() => {
                        const input = document.getElementById(`eval-reply-${evaluation.id}`);
                        handleReplyEvaluation(evaluation.id, input.value);
                        input.value = "";
                      }}
                    >
                      回复
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ClubLayout>
  );
};

export default ClubFeedback;
