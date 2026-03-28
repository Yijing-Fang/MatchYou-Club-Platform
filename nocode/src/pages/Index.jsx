import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("【系统调试】首页加载完成");
    console.log("【系统调试】可用路径:");
    console.log("  - 新生登录: /student/login");
    console.log("  - 新生注册: /student/register");
    console.log("  - 社团登录: /login/club");
    console.log("  - 学校登录: /login/school");
  }, []);

  const userTypes = [
    {
      type: "student",
      title: "新生入口",
      description: "兴趣测评、社团推荐、在线报名",
      icon: <GraduationCap className="h-8 w-8 text-blue-500" />,
      color: "border-blue-200 hover:border-blue-400",
      path: "/student/login",
    },
    {
      type: "club",
      title: "社团管理员入口",
      description: "发布招新、管理报名、发送通知",
      icon: <Building2 className="h-8 w-8 text-green-500" />,
      color: "border-green-200 hover:border-green-400",
      path: "/login/club",
    },
    {
      type: "school",
      title: "学校管理员入口",
      description: "审核招新、数据统计、公告管理",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      color: "border-purple-200 hover:border-purple-400",
      path: "/login/school",
    },
  ];

  const handleNavigation = (path) => {
    console.log("【导航调试】点击入口，目标路径:", path);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Match You 社团招新智能匹配平台
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            为高校新生和社团搭建"智能匹配、高效招新、透明管理"的线上一站式平台
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {userTypes.map((item) => (
            <Card
              key={item.type}
              className={`cursor-pointer transition-all duration-300 border-2 ${item.color} hover:shadow-lg`}
              onClick={() => handleNavigation(item.path)}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full">
                  {item.icon}
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {item.description}
                </CardDescription>
                <Button className="w-full mt-6" variant="outline">
                  进入系统
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 体验账号提示 */}
        <div className="mt-12 max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 体验账号</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>新生体验账号:</strong> 学号 2026001001 / 密码 123456</p>
            <p><strong>社团管理员:</strong> 学号 2025001001 / 密码 123456</p>
            <p><strong>学校管理员:</strong> 用户名 school_admin / 密码 123456</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            实现"新生快速找到适配社团、社团高效招到目标成员、学校规范有序开展招新工作"的三方共赢目标
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
