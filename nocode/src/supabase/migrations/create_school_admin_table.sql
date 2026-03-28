-- ============================================
-- 迁移文件: 创建学校管理员表 (school_admin)
-- 说明: 存储学校社联管理员信息
-- ============================================

-- 创建学校管理员表
CREATE TABLE IF NOT EXISTS school_admin (
    school_admin_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    name VARCHAR(20) NOT NULL,
    phone VARCHAR(11),
    status TINYINT NOT NULL DEFAULT 1,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 表结构说明：
-- school_admin_id: 主键，自增
-- username: 登录用户名，唯一
-- password: 登录密码，MD5加密存储
-- name: 管理员姓名
-- phone: 联系方式
-- status: 账号状态 1=正常 0=禁用
-- create_time: 创建时间，平台初始化时创建
