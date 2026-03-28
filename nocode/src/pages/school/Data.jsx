import { useState, useEffect } from "react";
import { toast } from "sonner";
import SchoolLayout from "./components/SchoolLayout.jsx";
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
import { 
  Download, 
  Filter,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Target
} from "lucide-react";

const SchoolData = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // 模拟全校统计数据
  const stats = {
    clubCount: 45,
    totalApply: 1258,
    totalAdmitted: 486,
    applyRate: 38.6,
  };

  // 社团热度排行数据
  const clubRanking = [
    { name: "计算机技术社团", applyCount: 156, admitted: 48, rate: 30.8 },
    { name: "校园合唱团", applyCount: 142, admitted: 35, rate: 24.6 },
    { name: "篮球社", applyCount: 138, admitted: 42, rate: 30.4 },
    { name: "公益志愿者协会", applyCount: 125, admitted: 50, rate: 40.0 },
    { name: "文学社", applyCount: 98, admitted: 28, rate: 28.6 },
    { name: "舞蹈团", applyCount: 89, admitted: 25, rate: 28.1 },
    { name: "摄影协会", applyCount: 76, admitted: 22, rate: 28.9 },
    { name: "辩论社", applyCount: 68, admitted: 20, rate: 29.4 },
  ];

  // 兴趣分布数据
  const interestData = [
    { name: "技术", value: 298, color: "#409EFF" },
    { name: "音乐", value: 256, color: "#52c41a" },
    { name: "体育", value: 198, color: "#faad14" },
    { name: "公益", value: 186, color: "#f5222d" },
    { name: "文化", value: 165, color: "#722ed1" },
    { name: "学术", value: 98, color: "#13c2c2" },
    { name: "舞蹈", value: 57, color: "#eb2f96" },
  ];

  // 学院报名数据
  const collegeData = [
    { name: "计算机学院", applyCount: 245, admitted: 78 },
    { name: "软件学院", applyCount: 198, admitted: 65 },
    { name: "信息学院", applyCount: 156, admitted: 52 },
    { name: "文学院", applyCount: 134, admitted: 45 },
    { name: "商学院", applyCount: 128, admitted: 42 },
    { name: "法学院", applyCount: 98, admitted: 35 },
    { name: "外国语学院", applyCount: 87, admitted: 30 },
    { name: "艺术学院", applyCount: 76, admitted: 28 },
    { name: "其他学院", applyCount: 136, admitted: 111 },
  ];

  // 报名趋势数据
  const trendData = [
    { date: "01-15", apply: 45, admitted: 12 },
    { date: "01-16", apply: 52, admitted: 15 },
    { date: "01-17", apply: 48, admitted: 18 },
    { date: "01-18", apply: 65, admitted: 22 },
    { date: "01-19", apply: 78, admitted: 28 },
    { date: "01-20", apply: 92, admitted: 35 },
    { date: "01-21", apply: 105, admitted: 42 },
  ];

  const handleExportExcel = () => {
    toast.success("Excel报表导出成功");
  };

  const handleExportPDF = () => {
    toast.success("PDF报表导出成功");
  };

  return (
    <SchoolLayout title="全校数据统计">
      {/* 总览统计 */}
      <div className="school-stats">
        <div className="school-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Building2 size={24} color="#409EFF" />
            <span style={{ fontSize: '14px', color: '#666' }}>招新社团数</span>
          </div>
          <div className="school-stat-value">{stats.clubCount}</div>
          <div className="school-stat-trend up">↑ 较上期增加 5 个</div>
        </div>
        <div className="school-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={24} color="#52c41a" />
            <span style={{ fontSize: '14px', color: '#666' }}>总报名人数</span>
          </div>
          <div className="school-stat-value">{stats.totalApply.toLocaleString()}</div>
          <div className="school-stat-trend up">↑ 12.5% 较上期</div>
        </div>
        <div className="school-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <GraduationCap size={24} color="#faad14" />
            <span style={{ fontSize: '14px', color: '#666' }}>总录取人数</span>
          </div>
          <div className="school-stat-value">{stats.totalAdmitted.toLocaleString()}</div>
          <div className="school-stat-trend up">↑ 8.3% 较上期</div>
        </div>
        <div className="school-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Target size={24} color="#f5222d" />
            <span style={{ fontSize: '14px', color: '#666' }}>平均录取率</span>
          </div>
          <div className="school-stat-value">{stats.applyRate}%</div>
          <div className="school-stat-trend down">↓ 2.1% 较上期</div>
        </div>
      </div>

      {/* 筛选工具栏 */}
      <div className="school-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Filter size={18} color="#666" />
            <select 
              className="school-form-select" 
              style={{ width: '150px' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">近7天</option>
              <option value="30days">近30天</option>
              <option value="90days">近90天</option>
              <option value="thisSemester">本学期</option>
            </select>
            <select 
              className="school-form-select" 
              style={{ width: '150px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">全部类别</option>
              <option value="tech">技术</option>
              <option value="music">音乐</option>
              <option value="sports">体育</option>
              <option value="charity">公益</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="school-btn school-btn-primary school-btn-sm" onClick={handleExportExcel}>
              <Download size={14} style={{ marginRight: '4px' }} />
              导出Excel
            </button>
            <button className="school-btn school-btn-default school-btn-sm" onClick={handleExportPDF}>
              导出PDF
            </button>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {/* 社团热度排行 */}
        <div className="school-chart-container" style={{ gridColumn: 'span 2' }}>
          <div className="school-chart-title">
            <TrendingUp size={18} style={{ marginRight: '8px' }} />
            社团热度排行（报名人数TOP8）
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clubRanking} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="applyCount" name="报名人数" fill="#409EFF" />
              <Bar dataKey="admitted" name="录取人数" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 兴趣分布饼图 */}
        <div className="school-chart-container">
          <div className="school-chart-title">兴趣分布</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={interestData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {interestData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 学院报名柱状图 */}
        <div className="school-chart-container">
          <div className="school-chart-title">各学院报名情况</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collegeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applyCount" name="报名人数" fill="#409EFF" />
              <Bar dataKey="admitted" name="录取人数" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 报名趋势 */}
        <div className="school-chart-container" style={{ gridColumn: 'span 2' }}>
          <div className="school-chart-title">报名趋势</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="apply" name="报名人数" stroke="#409EFF" strokeWidth={2} />
              <Line type="monotone" dataKey="admitted" name="录取人数" stroke="#52c41a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SchoolLayout>
  );
};

export default SchoolData;
