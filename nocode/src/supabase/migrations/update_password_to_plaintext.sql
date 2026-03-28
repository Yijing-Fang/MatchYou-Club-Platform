-- ============================================
-- 迁移文件: 将现有账号密码更新为明文
-- 说明: 用于修复 MD5 加密问题，直接使用明文密码
-- ============================================

-- 更新社团管理员账号密码为明文
UPDATE club_admin 
SET password = '123456' 
WHERE student_id IN ('2025001001', '2025002001');

-- 更新学生账号密码为明文
UPDATE student 
SET password = '123456' 
WHERE student_id IN ('2026001001', '2026002001');

-- 更新学校管理员账号密码为明文
UPDATE school_admin 
SET password = '123456' 
WHERE username = 'school_admin';
