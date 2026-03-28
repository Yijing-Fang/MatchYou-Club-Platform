import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/student.css";

// 纯JavaScript MD5实现，不依赖浏览器API
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
  const hex_tab = "0123456789abcdef";
  
  const rotateLeft = (n, s) => (n << s) | (n >>> (32 - s));
  const addUnsigned = (l, x) => {
    const lX = (l & 0x80000000) | (x & 0x80000000);
    const lY = (l & 0x40000000) | (x & 0x40000000);
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
    let wordToHexValue = "",
      wordToHexValueTemp = "",
      lByte;
    for (let lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = "0" + lByte.toString(16);
      wordToHexValue =
        wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
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

const StudentRegister = () => {
  const [loading, setLoading] = useState(false);
  const [checkingStudentId, setCheckingStudentId] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    major: "",
    grade: "2026级",
  });

  // 学院-专业联动数据
  const collegeMajorMap = {
    "计算机学院": ["计算机科学与技术", "软件工程", "网络工程"],
    "文学院": ["汉语言文学", "新闻学", "广告学"],
    "外国语学院": ["英语", "日语", "法语"],
    "法学院": ["法学", "知识产权"],
    "商学院": ["工商管理", "会计学", "市场营销"],
  };

  const colleges = Object.keys(collegeMajorMap);

  useEffect(() => {
    console.log("【页面调试】注册页加载完成");
    console.log("【页面调试】跳转到登录页的路径: /#/student/login");
    
    // 测试MD5加密
    const testHash = md5("123456");
    console.log("【页面调试】MD5测试 - '123456'的加密结果:", testHash);
    console.log("【页面调试】预期结果:", "e10adc3949ba59abbe56e057f20f883e");
    console.log("【页面调试】MD5验证:", testHash === "e10adc3949ba59abbe56e057f20f883e" ? "✅ 通过" : "❌ 失败");
  }, []);

  // 学号失去焦点时验证是否已存在
  const checkStudentIdExists = async () => {
    if (!formData.studentId || formData.studentId.length < 10) return;
    
    setCheckingStudentId(true);
    console.log("【调试】检查学号是否存在:", formData.studentId);
    
    const { data, error } = await supabase
      .from("student")
      .select("student_id")
      .eq("student_id", formData.studentId)
      .single();
    
    if (data) {
      console.log("【调试】学号已存在");
      toast.error("该学号已注册");
    } else {
      console.log("【调试】学号可用");
    }
    setCheckingStudentId(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("【事件调试】注册按钮被点击");

    // 验证所有必填字段
    if (!formData.studentId.trim()) {
      toast.error("请输入学号");
      return;
    }
    if (formData.studentId.length < 10 || formData.studentId.length > 20) {
      toast.error("学号长度应为10-20位");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("请输入姓名");
      return;
    }
    if (formData.name.length < 2 || formData.name.length > 20) {
      toast.error("姓名长度应为2-20位");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("请输入学校邮箱");
      return;
    }
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("邮箱格式不正确");
      return;
    }
    if (!formData.password) {
      toast.error("请设置密码");
      return;
    }
    if (formData.password.length < 6 || formData.password.length > 16) {
      toast.error("密码长度应为6-16位");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("两次密码不一致");
      return;
    }
    if (!formData.college) {
      toast.error("请选择学院");
      return;
    }
    if (!formData.major) {
      toast.error("请选择专业");
      return;
    }

    console.log("【调试】所有验证通过，准备提交");
    setLoading(true);

    try {
      const encryptedPassword = md5(formData.password);
      console.log("【调试】密码已加密:", encryptedPassword);

      const { error } = await supabase.from("student").insert([
        {
          student_id: formData.studentId,
          name: formData.name,
          password: encryptedPassword,
          email: formData.email,
          college: formData.college,
          major: formData.major,
          grade: formData.grade,
          status: 1,
        },
      ]);

      if (error) {
        console.error("【调试】注册失败:", error);
        if (error.message.includes("duplicate") || error.code === '23505') {
          toast.error("该学号已注册");
        } else {
          toast.error("注册失败：" + error.message);
        }
        setLoading(false);
        return;
      }

      console.log("【调试】注册成功");
      toast.success("注册成功，即将跳转至兴趣画像页");

      // 获取刚注册的用户信息
      const { data } = await supabase
        .from("student")
        .select("*")
        .eq("student_id", formData.studentId)
        .single();
      
      if (data) {
        localStorage.setItem("studentInfo", JSON.stringify(data));
      }
      
      // 使用location.href跳转
      setTimeout(() => {
        window.location.href = "/#/student/profile";
      }, 1500);
    } catch (error) {
      console.error("【调试】注册异常:", error);
      toast.error("注册失败: " + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-page">
      <div className="student-container">
        <div className="student-header">
          <h1>Match You社团-新生注册</h1>
        </div>

        <form className="student-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">学号</label>
            <input
              type="text"
              id="studentId"
              className="form-input"
              placeholder="请输入学号"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              onBlur={checkStudentIdExists}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label className="form-label">姓名</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="请输入姓名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label className="form-label">学校邮箱</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="请输入学校邮箱"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="请设置密码（6-16位）"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              maxLength={16}
            />
          </div>

          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="请确认密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              maxLength={16}
            />
          </div>

          <div className="form-group">
            <label className="form-label">学院</label>
            <select
              id="college"
              className="form-select"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value, major: "" })}
            >
              <option value="">请选择学院</option>
              {colleges.map((college) => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">专业</label>
            <select
              id="major"
              className="form-select"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              disabled={!formData.college}
            >
              <option value="">请选择专业</option>
              {formData.college && collegeMajorMap[formData.college].map((major) => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">年级</label>
            <select
              id="grade"
              className="form-select"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            >
              <option value="2026级">2026级</option>
              <option value="2025级">2025级</option>
            </select>
          </div>

          <div className="form-links">
            <a href="/#/student/login">
              已有账号？去登录
            </a>
          </div>

          <button
            type="submit"
            id="registerBtn"
            className="btn-primary"
            disabled={loading || checkingStudentId}
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <div className="student-footer">
          © 2026 Match You社团 版权所有
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
