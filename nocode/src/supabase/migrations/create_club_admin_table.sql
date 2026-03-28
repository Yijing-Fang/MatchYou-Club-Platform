-- ============================================
-- 迁移文件: 创建社团管理员表 (club_admin)
-- 说明: 存储社团社长/骨干用户信息
-- ============================================

-- 创建社团管理员表
CREATE TABLE IF NOT EXISTS club_admin (
    admin_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(32) NOT NULL,
    club_id INTEGER NOT NULL DEFAULT 0,
    position VARCHAR(20) NOT NULL DEFAULT '社长',
    phone VARCHAR(11) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    register_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 表结构说明：
-- admin_id: 主键，自增
-- student_id: 关联学生表学号，唯一
-- name: 管理员姓名
-- password: 登录密码，MD5加密存储
-- club_id: 关联社团ID，暂设为0，后续修改
-- position: 职位（社长/骨干），默认社长
-- phone: 联系方式
-- status: 账号状态 1=正常 0=禁用
-- register_time: 注册时间
