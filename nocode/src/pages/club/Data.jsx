import { useState, useEffect } from "react";
import { toast } from "sonner";
import ClubLayout from "./components/ClubLayout.jsx";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer 
} from "recharts";

const ClubData = () => {
  const [timeRange, setTimeRange] = useState("7days");

  // 模拟数据
  const stats = {
    views: 12580,
    applications: 256,
    admitted: 48,
    passRate: 68.5,
    progress: 48, // 招新进度 48/50
  };

  const trendData = [
    { date: "01-15", views: 800, applications: 20 },
    { date: "01-16", views: 950, applications: 25 },
    { date: "01-17", views: 1100, applications: 30 },
    { date: "01-18", views: 1200, applications: 35 },
    { date: "01-19", views: 1400, applications: 42 },
    { date: "01-20", views: 1600, applications: 48 },
    { date: "01-21", views: 1800, applications: 56 },
  ];

  const collegeData = [
    { name: "计算机学院", value: 45, color: "#409EFF" },
    { name: "软件学院", value: 30, color: "#52c41a" },
    { name: "信息学院", value: 25, color: "#faad14" },
    { name: "其他学院", value: 15, color: "#f5222d" },
  ];

  const handleExportExcel = () => {
    toast.success("Excel报表导出成功");
  };

  const handleExportPDF = () => {
    toast.success("PDF报表导出成功");
  };

  return (
    <ClubLayout title="数据看板">
      <div className="club-stats">
        <div className="club-stat-card">
          <div className="club-stat-value">{stats.views.toLocaleString()}</div>
          <div className="club-stat-label">页面浏览量</div>
          <div className="club-stat-trend up">↑ 12.5% 较上周</div>
        </div>
        <div className="club-stat-card">
          <div className="club-stat-value">{stats.applications}</div>
          <div className="club-stat-label">报名人数</div>
          <div className="club-stat-trend up">↑ 8.3% 较上周</div>
        </div>
        <div className="club-stat-card">
          <div className="club-stat-value">{stats.admitted}</div>
          <div className="club-stat-label">已录取人数</div>
          <div className="club-stat-trend up">↑ 15.2% 较上周</div>
        </div>
        <div className="club-stat-card">
          <div className="club-stat-value">{stats.passRate}%</div>
          <div className="club-stat-label">面试通过率</div>
          <div className="club-stat-trend down">↓ 2.1% 较上周</div>
        </div>
      </div>

      <div className="club-card">
        <div className="club-card-title">招新进度</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px'}}>
          <span style={{fontSize: '14px', color: '#666'}}>目标人数：50人</span>
          <span style={{fontSize: '14px', color: '#666'}}>已录取：{stats.progress}人</span>
          <span style={{fontSize: '14px', color: '#666'}}>剩余：{50 - stats.progress}人</span>
        </div>
        <div className="club-progress">
          <div 
            className="club-progress-bar" 
            style={{width: `${(stats.progress / 50) * 100}%`, backgroundColor: stats.progress >= 40 ? '#52c41a' : '#409EFF'}}
          />
        </div>
        <div style={{textAlign: 'right', marginTop: '8px', fontSize: '13px', color: '#666'}}>
          完成度：{((stats.progress / 50) * 100).toFixed(1)}%
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px'}}>
        <div className="club-chart-container">
          <div className="club-chart-title">报名趋势（近7天）</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" name="浏览量" stroke="#409EFF" />
              <Line type="monotone" dataKey="applications" name="报名人数" stroke="#52c41a" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="club-chart-container">
          <div className="club-chart-title">学院分布</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={collegeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {collegeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="club-chart-container">
        <div className="club-chart-title">每日报名统计</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="applications" name="报名人数" fill="#409EFF" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="club-card">
        <div className="club-card-title">数据导出</div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="club-btn club-btn-primary" onClick={handleExportExcel}>
            📊 导出Excel报表
          </button>
          <button className="club-btn club-btn-default" onClick={handleExportPDF}>
            📄 导出PDF报表
          </button>
        </div>
      </div>
    </ClubLayout>
  );
};

export default ClubData;
