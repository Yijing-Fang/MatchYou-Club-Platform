import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Student pages
import StudentLogin from "@/pages/student/Login";
import StudentRegister from "@/pages/student/Register";
import StudentProfile from "@/pages/student/Profile";
import StudentIndex from "@/pages/student/Index";
import StudentHome from "@/pages/student/Home";
import StudentApply from "@/pages/student/Apply";
import StudentNotice from "@/pages/student/Notice";
import ProfileCenter from "@/pages/student/ProfileCenter";
import Forum from "@/pages/student/Forum";

// Club pages
import ClubLogin from "@/pages/club/Login";
import ClubHome from "@/pages/club/Home";
import ClubInfo from "@/pages/club/Info";
import ClubRecruit from "@/pages/club/Recruit";
import ClubApply from "@/pages/club/Apply";
import ClubMember from "@/pages/club/Member";
import ClubData from "@/pages/club/Data";
import ClubFeedback from "@/pages/club/Feedback";

// School pages
import SchoolLogin from "@/pages/school/Login";
import SchoolHome from "@/pages/school/Home";
import SchoolAudit from "@/pages/school/Audit";
import SchoolData from "@/pages/school/Data";
import SchoolUser from "@/pages/school/User";
import SchoolEvaluate from "@/pages/school/Evaluate";
import SchoolSetting from "@/pages/school/Setting";

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          
          {/* Login routes */}
          <Route path="/login/:userType" element={<Login />} />
          <Route path="/register/student" element={<Register />} />
          
          {/* Student routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/index" element={<StudentIndex />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/apply" element={<StudentApply />} />
          <Route path="/student/notice" element={<StudentNotice />} />
          <Route path="/student/profilecenter" element={<ProfileCenter />} />
          <Route path="/student/forum" element={<Forum />} />
          
          {/* Club routes */}
          <Route path="/login/club" element={<ClubLogin />} />
          <Route path="/club/home" element={<ClubHome />} />
          <Route path="/club/info" element={<ClubInfo />} />
          <Route path="/club/recruit" element={<ClubRecruit />} />
          <Route path="/club/apply" element={<ClubApply />} />
          <Route path="/club/member" element={<ClubMember />} />
          <Route path="/club/data" element={<ClubData />} />
          <Route path="/club/feedback" element={<ClubFeedback />} />
          
          {/* School routes */}
          <Route path="/login/school" element={<SchoolLogin />} />
          <Route path="/school/home" element={<SchoolHome />} />
          <Route path="/school/audit" element={<SchoolAudit />} />
          <Route path="/school/data" element={<SchoolData />} />
          <Route path="/school/user" element={<SchoolUser />} />
          <Route path="/school/evaluate" element={<SchoolEvaluate />} />
          <Route path="/school/setting" element={<SchoolSetting />} />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      <Toaster />
    </>
  );
}

export default App;
