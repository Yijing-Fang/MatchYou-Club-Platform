import { useState, useEffect } from "react";
import { toast } from "sonner";
import ClubLayout from "./components/ClubLayout.jsx";

const ClubRecruit = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [recruitInfo, setRecruitInfo] = useState({
    startTime: "2026-02-01",
    endTime: "2026-03-01",
    quota: 50,
    gradeLimit: "2026级",
    majorLimit: "",
    status: "进行中",
    requirements: "热爱技术，有编程基础优先",
    fee: "50元/学期",
    feeUsage: "用于购买技术书籍、服务器租赁等",
    frequency: "每周1-2次",
    difficulty: "中等",
  });

  const [batches, setBatches] = useState([
    { id: 1, time: "2026-02-15 14:00", location: "教学楼A301", note: "技术面" },
    { id: 2, time: "2026-02-22 14:00", location: "教学楼A302", note: "综合面" },
  ]);

  const [newBatch, setNewBatch] = useState({ time: "", location: "", note: "" });

  const [formFields, setFormFields] = useState([
    { id: 1, label: "姓名", type: "text", required: true },
    { id: 2, label: "学号", type: "text", required: true },
    { id: 3, label: "专业", type: "text", required: true },
    { id: 4, label: "手机号", type: "text", required: true },
    { id: 5, label: "兴趣爱好", type: "textarea", required: false },
  ]);

  const difficulties = ["容易", "中等", "困难"];
  const frequencies = ["每周1次", "每周2-3次", "每月1-2次", "不定期"];

  const handleAddBatch = () => {
    if (!newBatch.time || !newBatch.location) {
      toast.error("请填写完整批次信息");
      return;
    }
    setBatches([...batches, { ...newBatch, id: Date.now() }]);
    setNewBatch({ time: "", location: "", note: "" });
    toast.success("面试批次已添加");
  };

  const handleDeleteBatch = (id) => {
    setBatches(batches.filter(b => b.id !== id));
    toast.success("批次已删除");
  };

  const handleAddField = () => {
    const newField = { id: Date.now(), label: "", type: "text", required: false };
    setFormFields([...formFields, newField]);
  };

  const handleUpdateField = (id, key, value) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const handleDeleteField = (id) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("招新设置已保存");
      setLoading(false);
    }, 800);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("已提交学校审核");
      setLoading(false);
    }, 800);
  };

  const tabs = [
    { key: "basic", label: "基础信息" },
    { key: "batch", label: "面试安排" },
    { key: "form", label: "报名表单" },
  ];

  return (
    <ClubLayout title="招新设置">
      <div className="club-card">
        <div style={{display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: '24px'}}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #409EFF' : '2px solid transparent',
                color: activeTab === tab.key ? '#409EFF' : '#666',
                fontWeight: activeTab === tab.key ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "basic" && (
          <div>
            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">招新开始时间 <span className="required">*</span></label>
                <input
                  type="date"
                  className="club-form-input"
                  value={recruitInfo.startTime}
                  onChange={(e) => setRecruitInfo({...recruitInfo, startTime: e.target.value})}
                />
              </div>
              <div className="club-form-group">
                <label className="club-form-label">招新结束时间 <span className="required">*</span></label>
                <input
                  type="date"
                  className="club-form-input"
                  value={recruitInfo.endTime}
                  onChange={(e) => setRecruitInfo({...recruitInfo, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">招新人数 <span className="required">*</span></label>
                <input
                  type="number"
                  className="club-form-input"
                  value={recruitInfo.quota}
                  onChange={(e) => setRecruitInfo({...recruitInfo, quota: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="club-form-group">
                <label className="club-form-label">年级限制</label>
                <input
                  type="text"
                  className="club-form-input"
                  placeholder="如：2026级，不填则无限制"
                  value={recruitInfo.gradeLimit}
                  onChange={(e) => setRecruitInfo({...recruitInfo, gradeLimit: e.target.value})}
                />
              </div>
            </div>

            <div className="club-form-group">
              <label className="club-form-label">专业限制</label>
              <input
                type="text"
                className="club-form-input"
                placeholder="如：计算机学院，不填则无限制"
                value={recruitInfo.majorLimit}
                onChange={(e) => setRecruitInfo({...recruitInfo, majorLimit: e.target.value})}
              />
            </div>

            <div className="club-form-group">
              <label className="club-form-label">招新要求</label>
              <textarea
                className="club-form-textarea"
                rows={3}
                value={recruitInfo.requirements}
                onChange={(e) => setRecruitInfo({...recruitInfo, requirements: e.target.value})}
              />
            </div>

            <div className="club-form-row">
              <div className="club-form-group">
                <label className="club-form-label">会费标准</label>
                <input
                  type="text"
                  className="club-form-input"
                  value={recruitInfo.fee}
                  onChange={(e) => setRecruitInfo({...recruitInfo, fee: e.target.value})}
                />
              </div>
              <div className="club-form-group">
                <label className="club-form-label">活动频率</label>
                <select
                  className="club-form-select"
                  value={recruitInfo.frequency}
                  onChange={(e) => setRecruitInfo({...recruitInfo, frequency: e.target.value})}
                >
                  {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="club-form-group">
              <label className="club-form-label">会费用途说明</label>
              <textarea
                className="club-form-textarea"
                rows={2}
                value={recruitInfo.feeUsage}
                onChange={(e) => setRecruitInfo({...recruitInfo, feeUsage: e.target.value})}
              />
            </div>

            <div className="club-form-group">
              <label className="club-form-label">面试难度</label>
              <div style={{display: 'flex', gap: '12px'}}>
                {difficulties.map(d => (
                  <label key={d} style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
                    <input
                      type="radio"
                      name="difficulty"
                      value={d}
                      checked={recruitInfo.difficulty === d}
                      onChange={(e) => setRecruitInfo({...recruitInfo, difficulty: e.target.value})}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div>
            <div className="club-batch-card">
              <div className="club-batch-header">
                <span className="club-batch-title">添加面试批次</span>
              </div>
              <div className="club-form-row">
                <div className="club-form-group">
                  <label className="club-form-label">面试时间 <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    className="club-form-input"
                    value={newBatch.time}
                    onChange={(e) => setNewBatch({...newBatch, time: e.target.value})}
                  />
                </div>
                <div className="club-form-group">
                  <label className="club-form-label">面试地点 <span className="required">*</span></label>
                  <input
                    type="text"
                    className="club-form-input"
                    placeholder="如：教学楼A301"
                    value={newBatch.location}
                    onChange={(e) => setNewBatch({...newBatch, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="club-form-group">
                <label className="club-form-label">备注</label>
                <input
                  type="text"
                  className="club-form-input"
                  placeholder="如：技术面/综合面"
                  value={newBatch.note}
                  onChange={(e) => setNewBatch({...newBatch, note: e.target.value})}
                />
              </div>
              <button className="club-btn club-btn-primary club-btn-sm" onClick={handleAddBatch}>
                添加批次
              </button>
            </div>

            {batches.map(batch => (
              <div key={batch.id} className="club-batch-card">
                <div className="club-batch-header">
                  <span className="club-batch-title">第{batches.indexOf(batch) + 1}批</span>
                  <div className="club-batch-actions">
                    <button className="club-btn club-btn-danger club-btn-sm" onClick={() => handleDeleteBatch(batch.id)}>删除</button>
                  </div>
                </div>
                <div style={{fontSize: '14px', color: '#666', lineHeight: '1.8'}}>
                  <div>⏰ 时间：{batch.time}</div>
                  <div>📍 地点：{batch.location}</div>
                  {batch.note && <div>📝 备注：{batch.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "form" && (
          <div>
            <div style={{marginBottom: '16px'}}>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '12px'}}>
                自定义报名表单字段，设置报名时需要填写的信息
              </p>
              <button className="club-btn club-btn-primary club-btn-sm" onClick={handleAddField}>
                + 添加字段
              </button>
            </div>

            {formFields.map((field, index) => (
              <div key={field.id} style={{display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '4px'}}>
                <div style={{flex: 1}}>
                  <label className="club-form-label">字段名称</label>
                  <input
                    type="text"
                    className="club-form-input"
                    value={field.label}
                    onChange={(e) => handleUpdateField(field.id, 'label', e.target.value)}
                  />
                </div>
                <div style={{width: '120px'}}>
                  <label className="club-form-label">类型</label>
                  <select
                    className="club-form-select"
                    value={field.type}
                    onChange={(e) => handleUpdateField(field.id, 'type', e.target.value)}
                  >
                    <option value="text">文本框</option>
                    <option value="textarea">多行文本</option>
                    <option value="select">下拉框</option>
                    <option value="file">上传框</option>
                  </select>
                </div>
                <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', paddingBottom: '10px'}}>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => handleUpdateField(field.id, 'required', e.target.checked)}
                  />
                  必填
                </label>
                <button className="club-btn club-btn-danger club-btn-sm" onClick={() => handleDeleteField(field.id)}>
                  删除
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0'}}>
          <button className="club-btn club-btn-default" onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "保存草稿"}
          </button>
          <button className="club-btn club-btn-success" onClick={handleSubmit} disabled={loading}>
            {loading ? "提交中..." : "保存并提交审核"}
          </button>
        </div>
      </div>
    </ClubLayout>
  );
};

export default ClubRecruit;
