import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, GraduationCap } from "lucide-react";

// 纯JavaScript MD5实现
const md5 = (string) => {
  const utf8_encode = (str) => {
    str = str.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < str.length; n++) {
      const c = str.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };

  const str = utf8_encode(string);
  
  const rotateLeft = (n, s) => (n << s) | (n >>> (32 - s));
  const addUnsigned = (l, x) => {
    const lX = (l & 0x80000000) | (x & 0x80000000);
    if ((l & 0x3FFFFFFF) + (x & 0x3FFFFFFF) & 0x80000000) {
      return (l & 0x3FFFFFFF) + (x & 0x3FFFFFFF) + 0x80000000;
    }
    return (l & 0x3FFFFFFF) + (x & 0x3FFFFFFF);
  };

  const f = (x, y, z) => (x & y) | (~x & z);
  const g = (x, y, z) => (x & z) | (y & ~z);
  const h = (x, y, z) => x ^ y ^ z;
  const i = (x, y, z) => y ^ (x | ~z);

  const ff = (a, b, c, d, x, s, ac) => {
    let result = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(result, s), b);
  };

  const gg = (a, b, c, d, x, s, ac) => {
    let result = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(result, s), b);
  };

  const hh = (a, b, c, d, x, s, ac) => {
    let result = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(result, s), b);
  };

  const ii = (a, b, c, d, x, s, ac) => {
    let result = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(result, s), b);
  };

  const convertToWordArray = (str) => {
    let lMessageLength = str.length;
    let lNumberOfWordsTemp1 = lMessageLength + 8;
    let lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    let lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    let lWordArray = new Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lBytePosition = (lByteCount - (lByteCount % 4)) / 4;
      lWordArray[lBytePosition] =
        (lWordArray[lBytePosition] | (str.charCodeAt(lByteCount) << ((lByteCount % 4) * 8)));
      lByteCount++;
    }
    lBytePosition = (lByteCount - (lByteCount % 4)) / 4;
    lWordArray[lBytePosition] = lWordArray[lBytePosition] | (0x80 << ((lByteCount % 4) * 8));
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  const wordToHex = (lValue) => {
    let wordToHexValue = "";
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const wordToHexValueTemp = "0" + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  };

  let x = convertToWordArray(str);
  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;

  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    let AA = a, BB = b, CC = c, DD = d;
    
    a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
    
    a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    
    a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = hh(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    
    a = ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = ii(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  const temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return temp.toLowerCase();
};

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    password: "",
    confirmPassword: "",
    college: "",
    major: "",
    grade: "2026级",
    phone: "",
    email: "",
  });

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("密码长度至少为6位");
      return;
    }

    setLoading(true);

    try {
      const encryptedPassword = md5(formData.password);

      const { data, error } = await supabase.from("student").insert([
        {
          student_id: formData.student_id,
          name: formData.name,
          password: encryptedPassword,
          college: formData.college,
          major: formData.major,
          grade: formData.grade,
          phone: formData.phone,
          email: formData.email,
          status: 1,
        },
      ]);

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("该学号已注册");
        } else {
          toast.error("注册失败：" + error.message);
        }
        setLoading(false);
        return;
      }

      toast.success("注册成功，请登录");
      navigate("/login/student");
    } catch (error) {
      toast.error("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="p-2 bg-blue-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">新生注册</CardTitle>
          <CardDescription>创建您的新生账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">学号 *</Label>
                <Input
                  id="student_id"
                  placeholder="如：2026001001"
                  value={formData.student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  placeholder="请输入真实姓名"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">密码 *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少6位"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码 *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college">学院 *</Label>
                <Input
                  id="college"
                  placeholder="如：计算机学院"
                  value={formData.college}
                  onChange={(e) =>
                    setFormData({ ...formData, college: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">专业 *</Label>
                <Input
                  id="major"
                  placeholder="如：计算机科学与技术"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">年级 *</Label>
                <select
                  id="grade"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                >
                  <option value="2026级">2026级</option>
                  <option value="2025级">2025级</option>
                  <option value="2024级">2024级</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  placeholder="用于找回密码"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">学校邮箱 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="如：2026001001@school.edu.cn"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中..." : "注册"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                已有账号？{" "}
                <Link
                  to="/login/student"
                  className="text-blue-600 hover:underline"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
