import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/student.css";

const StudentProfile = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  
  const [profileData, setProfileData] = useState({
    timeInvest: "",
    interestTags: [],
    testAnswers: {},
  });

  const interestTagsList = ["音乐", "舞蹈", "体育", "公益", "学术", "技术", "文化", "其他"];
  
  const testQuestions = [
    {
      id: 1,
      question: "周末更愿意做什么？",
      options: ["A.排练节目", "B.支教", "C.写代码", "D.打球"],
    },
    {
      id: 2,
      question: "面对新活动，你更倾向于？",
      options: ["A.参与文艺表演", "B.参与学术研讨", "C.参与体育竞技", "D.参与公益活动"],
    },
    {
      id: 3,
      question: "你更擅长哪种能力？",
      options: ["A.艺术表达", "B.逻辑思维", "C.运动能力", "D.沟通协调"],
    },
    {
      id: 4,
      question: "你希望社团活动的频率是？",
      options: ["A.每周1次", "B.每周2-3次", "C.每月1-2次", "D.不定期"],
    },
    {
      id: 5,
      question: "你加入社团的核心目的是？",
      options: ["A.培养兴趣", "B.提升技能", "C.认识朋友", "D.丰富履历"],
    },
  ];

  useEffect(() => {
    const storedInfo = localStorage.getItem("studentInfo");
    if (!storedInfo) {
      toast.error("请先登录");
      window.location.href = "/#/student/login";
      return;
    }
    setStudentInfo(JSON.parse(storedInfo));
  }, []);

  const toggleInterestTag = (tag) => {
    setProfileData((prev) => {
      const currentTags = prev.interestTags;
      if (currentTags.includes(tag)) {
        return { ...prev, interestTags: currentTags.filter((t) => t !== tag) };
      }
      if (currentTags.length >= 5) {
        toast.error("最多选择5个兴趣标签");
        return prev;
      }
      return { ...prev, interestTags: [...currentTags, tag] };
    });
  };

  const handleTestAnswer = (questionId, answer) => {
    setProfileData((prev) => ({
      ...prev,
      testAnswers: { ...prev.testAnswers, [questionId]: answer },
    }));
  };

  const handleSubmit = async (skipTest = false) => {
    // 验证基本信息
    if (!profileData.timeInvest) {
      toast.error("请选择每周可投入时间");
      return;
    }
    if (profileData.interestTags.length === 0) {
      toast.error("请至少选择1个兴趣标签");
      return;
    }

    setLoading(true);

    try {
      // 保存兴趣画像到localStorage
      const profileInfo = {
        studentId: studentInfo?.student_id,
        timeInvest: profileData.timeInvest,
        interestTags: profileData.interestTags,
        testAnswers: skipTest ? {} : profileData.testAnswers,
        updateTime: new Date().toISOString(),
      };
      
      localStorage.setItem("studentProfile", JSON.stringify(profileInfo));
      toast.success("兴趣画像完善成功");

      // 使用location.href跳转
      setTimeout(() => {
        window.location.href = "/#/student/index";
      }, 1500);
    } catch (error) {
      toast.error("提交失败: " + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-group">
      <label className="form-label">每周可投入时间</label>
      <select
        id="timeInvest"
        className="form-select"
        value={profileData.timeInvest}
        onChange={(e) => setProfileData({ ...profileData, timeInvest: e.target.value })}
      >
        <option value="">请选择</option>
        <option value="1-2小时">1-2小时</option>
        <option value="3-5小时">3-5小时</option>
        <option value="6-8小时">6-8小时</option>
        <option value="8小时以上">8小时以上</option>
      </select>
      <button
        id="step1Next"
        className="btn-primary"
        style={{ marginTop: '30px' }}
        onClick={() => {
          if (!profileData.timeInvest) {
            toast.error("请选择每周可投入时间");
            return;
          }
          setCurrentStep(2);
        }}
      >
        下一步
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="form-group">
        <label className="form-label">选择你的兴趣标签（最多5个）</label>
        <div className="interest-tags">
          {interestTagsList.map((tag) => (
            <span
              key={tag}
              className={`interest-tag ${profileData.interestTags.includes(tag) ? 'selected' : ''}`}
              onClick={() => toggleInterestTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
          上一步
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            if (profileData.interestTags.length === 0) {
              toast.error("请至少选择1个兴趣标签");
              return;
            }
            setCurrentStep(3);
          }}
        >
          下一步
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div style={{ marginBottom: '20px' }}>
        {testQuestions.map((q) => (
          <div key={q.id} className="test-question">
            <p>{q.id}. {q.question}</p>
            <div className="test-options">
              {q.options.map((option) => (
                <label key={option} className="test-option">
                  <input
                    type="radio"
                    name={`question_${q.id}`}
                    value={option}
                    checked={profileData.testAnswers[q.id] === option}
                    onChange={() => handleTestAnswer(q.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginBottom: '15px' }}>
        兴趣测评可选，跳过可直接提交
      </p>
      
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
            上一步
          </button>
          <button
            id="submitProfile"
            className="btn-primary"
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            {loading ? "提交中..." : "提交"}
          </button>
        </div>
        <button
          className="btn-secondary"
          onClick={() => handleSubmit(true)}
          disabled={loading}
        >
          跳过
        </button>
      </div>
    </div>
  );

  if (!studentInfo) {
    return <div className="student-page">加载中...</div>;
  }

  return (
    <div className="student-page">
      <div className="student-container">
        <div className="student-header">
          <h1>完善你的兴趣画像</h1>
        </div>

        {/* 步骤指示器 */}
        <div className="step-indicator">
          <div className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <span className="step-label">基本信息</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <span className="step-label">兴趣标签</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">兴趣测评</span>
          </div>
        </div>

        <div className="student-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
