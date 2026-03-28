import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Building2, Users, FileEdit, Bell } from "lucide-react";
import { toast } from "sonner";

const ClubHome = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      toast.error("请先登录");
      navigate("/login/club");
      return;
    }

    const parsedUserInfo = JSON.parse(storedUserInfo);
    if (parsedUserInfo.type !== "club") {
      toast.error("无权访问");
      navigate("/");
      return;
    }

    setUserInfo(parsedUserInfo);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    toast.success("已退出登录");
    navigate("/");
  };

  const menuItems = [
    {
      title: "发布招新",
      description: "创建新的招新活动",
      icon: <FileEdit className="h-6 w-6 text-blue-500" />,
      onClick: () => toast.info("功能开发中..."),
    },
    {
      title: "报名管理",
      description: "查看和处理报名信息",
      icon: <Users className="h-6 w-6 text-green-500" />,
      onClick: () => toast.info("功能开发中..."),
    },
    {
      title: "通知发送",
      description: "向报名者发送通知",
      icon: <Bell className="h-6 w-6 text-orange-500" />,
      onClick: () => toast.info("功能开发中..."),
    },
  ];

  if (!userInfo) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold">社团管理中心</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {userInfo.name}（{userInfo.position}）
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">功能菜单</h2>
          <p className="text-gray-600">管理您的社团招新工作</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={item.onClick}
            >
              <CardHeader>
                <div className="mb-2">{item.icon}</div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  进入
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClubHome;
