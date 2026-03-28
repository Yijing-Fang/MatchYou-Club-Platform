-- ============================================
-- 修正版 SQL：使用正确的英文表名和列名
-- 说明: 密码123456的MD5值: e10adc3949ba59abbe56e057f20f883e
-- ============================================

-- 1. 创建 student 表（新生用户表）
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
    ('2025001001', '张社长', 'e10adc3949ba59abbe56e057f20f883e', 0, '社长', '13800138101', 1),
    ('2025002001', '刘社长', 'e10adc3949ba59abbe56e057f20f883e', 0, '社长', '13800138102', 1)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO school_admin (username, password, name, phone, status)
VALUES 
    ('school_admin', 'e10adc3949ba59abbe56e057f20f883e', '张老师', '13800138201', 1)
ON CONFLICT (username) DO NOTHING;
