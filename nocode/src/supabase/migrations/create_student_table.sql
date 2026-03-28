-- ============================================
-- 迁移文件: 创建学生表 (student)
-- 说明: 存储新生用户信息，支撑账号体系
-- ============================================

-- 创建学生表
CREATE TABLE IF NOT EXISTS student (
    student_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    college VARCHAR(50) NOT NULL,
    major VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL DEFAULT '2026级',
    phone VARCHAR(11),
    email VARCHAR(50) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    register_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 表结构说明：
-- student_id: 学号，主键，唯一标识
-- name: 新生姓名
-- password: 登录密码，MD5加密存储
-- college: 学院
-- major: 专业
-- grade: 年级，默认2026级
-- phone: 绑定手机号
-- email: 学校邮箱，用于注册验证
-- status: 账号状态 1=正常 0=禁用
-- register_time: 注册时间，自动获取当前时间
