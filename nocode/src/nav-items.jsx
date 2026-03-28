import { HomeIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentHome from "./pages/student/Home.jsx";
import ClubHome from "./pages/club/Home.jsx";
import SchoolHome from "./pages/school/Home.jsx";
import StudentLogin from "./pages/student/Login.jsx";
import StudentRegister from "./pages/student/Register.jsx";
import StudentProfile from "./pages/student/Profile.jsx";
import StudentIndex from "./pages/student/Index.jsx";
// 社团管理员端页面
import ClubLogin from "./pages/club/Login.jsx";
import ClubInfo from "./pages/club/Info.jsx";
import ClubRecruit from "./pages/club/Recruit.jsx";
import ClubApply from "./pages/club/Apply.jsx";
import ClubData from "./pages/club/Data.jsx";
import ClubFeedback from "./pages/club/Feedback.jsx";
import ClubMember from "./pages/club/Member.jsx";
// 学校管理员端页面
import SchoolLogin from "./pages/school/Login.jsx";
import SchoolAudit from "./pages/school/Audit.jsx";
import SchoolData from "./pages/school/Data.jsx";
import SchoolUser from "./pages/school/User.jsx";
import SchoolEvaluate from "./pages/school/Evaluate.jsx";
import SchoolSetting from "./pages/school/Setting.jsx";

export const navItems = [
  {
    title: "首页",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "登录",
    to: "/login/:userType",
    page: <Login />,
  },
  {
    title: "注册",
    to: "/register/student",
    page: <Register />,
  },
  {
    title: "新生首页",
    to: "/student/home",
    page: <StudentHome />,
  },
  {
    title: "社团首页",
    to: "/club/home",
    page: <ClubHome />,
  },
  {
    title: "学校首页",
    to: "/school/home",
    page: <SchoolHome />,
  },
  // 新生端新页面
  {
    title: "新生登录",
    to: "/student/login",
    page: <StudentLogin />,
  },
  {
    title: "新生注册",
    to: "/student/register",
    page: <StudentRegister />,
  },
  {
    title: "兴趣画像",
    to: "/student/profile",
    page: <StudentProfile />,
  },
  {
    title: "新生端首页",
    to: "/student/index",
    page: <StudentIndex />,
  },
  // 社团管理员端页面
  {
    title: "社团登录",
    to: "/club/login",
    page: <ClubLogin />,
  },
  {
    title: "社团信息",
    to: "/club/info",
    page: <ClubInfo />,
  },
  {
    title: "招新设置",
    to: "/club/recruit",
    page: <ClubRecruit />,
  },
  {
    title: "报名管理",
    to: "/club/apply",
    page: <ClubApply />,
  },
  {
    title: "数据看板",
    to: "/club/data",
    page: <ClubData />,
  },
  {
    title: "咨询评价",
    to: "/club/feedback",
    page: <ClubFeedback />,
  },
  {
    title: "成员管理",
    to: "/club/member",
    page: <ClubMember />,
  },
  // 学校管理员端页面
  {
    title: "学校管理员登录",
    to: "/school/login",
    page: <SchoolLogin />,
  },
  {
    title: "招新审核",
    to: "/school/audit",
    page: <SchoolAudit />,
  },
  {
    title: "学校数据统计",
    to: "/school/data",
    page: <SchoolData />,
  },
  {
    title: "用户管理",
    to: "/school/user",
    page: <SchoolUser />,
  },
  {
    title: "评价管理",
    to: "/school/evaluate",
    page: <SchoolEvaluate />,
  },
  {
    title: "公告设置",
    to: "/school/setting",
    page: <SchoolSetting />,
  },
];
