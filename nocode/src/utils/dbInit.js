import { supabase } from "@/integrations/supabase/client";

// 数据库初始化工具 - 学生表检查
export const checkAndInitDatabase = async () => {
  console.log("【数据库初始化】开始检查数据库表...");
  
  try {
    // 检查 student 表是否存在 - 使用 maybeSingle 避免报错
    const { data: studentData, error: checkError } = await supabase
      .from("student")
      .select("student_id")
      .limit(1)
      .maybeSingle();
    
    // 如果表不存在,错误信息会包含 "relation" 和 "does not exist"
    if (checkError && checkError.message) {
      console.log("【数据库初始化】检测到错误:", checkError.message);
      
      if (checkError.message.includes("does not exist") || checkError.code === '42P01') {
        console.log("【数据库初始化】student 表不存在");
        return {
          success: false,
          message: "数据库表不存在,需要手动初始化",
          needManualSetup: true
        };
      } else {
        console.error("【数据库初始化】检查表时发生错误:", checkError);
        return { 
          success: false, 
          message: checkError.message,
          needManualSetup: false
        };
      }
    }
    
    // 检查 club_admin 表
    const { error: clubError } = await supabase
      .from("club_admin")
      .select("admin_id")
      .limit(1)
      .maybeSingle();
      
    if (clubError && (clubError.message.includes("does not exist") || clubError.code === '42P01')) {
      console.log("【数据库初始化】club_admin 表不存在");
      return {
        success: false,
        message: "club_admin 表不存在",
        needManualSetup: true
      };
    }
    
    // 检查 school_admin 表
    const { error: schoolError } = await supabase
      .from("school_admin")
      .select("school_admin_id")
      .limit(1)
      .maybeSingle();
      
    if (schoolError && (schoolError.message.includes("does not exist") || schoolError.code === '42P01')) {
      console.log("【数据库初始化】school_admin 表不存在");
      return {
        success: false,
        message: "school_admin 表不存在",
        needManualSetup: true
      };
    }
    
    console.log("【数据库初始化】所有数据库表已存在");
    return { success: true, message: "数据库已就绪" };
    
  } catch (error) {
    console.error("【数据库初始化】异常:", error);
    return { 
      success: false, 
      message: error.message || "数据库检查失败", 
      needManualSetup: true 
    };
  }
};

// 检查社团管理员表
export const checkClubAdminTable = async () => {
  try {
    const { error } = await supabase
      .from("club_admin")
      .select("admin_id")
      .limit(1)
      .maybeSingle();
      
    if (error && (error.message.includes("does not exist") || error.code === '42P01')) {
      return { exists: false, error: null };
    }
    
    if (error) {
      return { exists: false, error };
    }
    
    return { exists: true, error: null };
  } catch (error) {
    return { exists: false, error };
  }
};

// 手动执行的 SQL 语句,显示给用户
export const getManualSQL = () => {
  return `-- 1. 创建 student 表（新生用户表）
CREATE TABLE IF NOT EXISTS student (
    student_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    college VARCHAR(50) NOT NULL,
    major VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL DEFAULT '2026级',
    phone VARCHAR(11),
    email VARCHAR(50) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    register_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建 club_admin 表（社团管理员表）
CREATE TABLE IF NOT EXISTS club_admin (
    admin_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    club_id INTEGER NOT NULL DEFAULT 0,
    position VARCHAR(20) NOT NULL DEFAULT '社长',
    phone VARCHAR(11) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    register_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建 school_admin 表（学校管理员表）
CREATE TABLE IF NOT EXISTS school_admin (
    school_admin_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    name VARCHAR(20) NOT NULL,
    phone VARCHAR(11),
    status SMALLINT NOT NULL DEFAULT 1,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 插入体验账号（密码: 123456）
INSERT INTO student (student_id, name, password, college, major, grade, phone, email, status)
VALUES 
    ('2026001001', '李同学', 'e10adc3949ba59abbe56e057f20f883e', '计算机学院', '计算机科学与技术', '2026级', '13800138001', '2026001001@school.edu.cn', 1),
    ('2026002001', '王同学', 'e10adc3949ba59abbe56e057f20f883e', '文学院', '汉语言文学', '2026级', '13800138002', '2026002001@school.edu.cn', 1)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO club_admin (student_id, name, password, club_id, position, phone, status)
VALUES 
    ('2025001001', '张社长', 'e10adc3949ba59abbe56e057f20f883e', 1, '社长', '13800138101', 1),
    ('2025002001', '刘社长', 'e10adc3949ba59abbe56e057f20f883e', 2, '社长', '13800138102', 1)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO school_admin (username, password, name, phone, status)
VALUES 
    ('school_admin', 'e10adc3949ba59abbe56e057f20f883e', '张老师', '13800138201', 1)
ON CONFLICT (username) DO NOTHING;`;
};

// 获取社团管理员专用SQL
export const getClubAdminSQL = () => {
  return `-- 创建 club_admin 表（社团管理员表）
CREATE TABLE IF NOT EXISTS club_admin (
    admin_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    club_id INTEGER NOT NULL DEFAULT 0,
    position VARCHAR(20) NOT NULL DEFAULT '社长',
    phone VARCHAR(11) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    register_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入社团管理员体验账号（密码: 123456 的 MD5: e10adc3949ba59abbe56e057f20f883e）
INSERT INTO club_admin (student_id, name, password, club_id, position, phone, status)
VALUES 
    ('2025001001', '张社长', 'e10adc3949ba59abbe56e057f20f883e', 1, '社长', '13800138101', 1),
    ('2025002001', '刘社长', 'e10adc3949ba59abbe56e057f20f883e', 2, '社长', '13800138102', 1)
ON CONFLICT (student_id) DO NOTHING;`;
};
