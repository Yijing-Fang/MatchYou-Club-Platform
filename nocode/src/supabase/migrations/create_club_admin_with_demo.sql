-- ============================================
-- 迁移文件: 创建社团管理员表并插入体验账号
-- 说明: 使用明文密码 123456
-- ============================================

-- 创建 club_admin 表（社团管理员表）
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

-- 表结构说明：
-- admin_id: 主键，自增
-- student_id: 学号，唯一标识
-- name: 管理员姓名
-- password: 登录密码，明文存储
-- club_id: 关联社团ID
-- position: 职位（社长/副社长/骨干等）
-- phone: 联系方式
-- status: 账号状态 1=正常 0=禁用
-- register_time: 注册时间

-- 插入社团管理员体验账号（密码为明文: 123456）
INSERT INTO club_admin (student_id, name, password, club_id, position, phone, status)
VALUES 
    ('2025001001', '张社长', '123456', 1, '社长', '13800138101', 1),
    ('2025002001', '刘社长', '123456', 2, '社长', '13800138102', 1)
ON CONFLICT (student_id) DO NOTHING;
