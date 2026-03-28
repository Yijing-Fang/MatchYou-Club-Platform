-- ============================================
-- 迁移文件: 插入体验账号数据
-- 说明: 密码123456的MD5值: e10adc3949ba59abbe56e057f20f883e
-- ============================================

-- 插入新生体验账号
INSERT INTO student (student_id, name, password, college, major, grade, phone, email, status)
VALUES 
    ('2026001001', '李同学', 'e10adc3949ba59abbe56e057f20f883e', '计算机学院', '计算机科学与技术', '2026级', '13800138001', '2026001001@school.edu.cn', 1),
    ('2026002001', '王同学', 'e10adc3949ba59abbe56e057f20f883e', '文学院', '汉语言文学', '2026级', '13800138002', '2026002001@school.edu.cn', 1)
ON CONFLICT (student_id) DO NOTHING;

-- 插入社团管理员体验账号
INSERT INTO club_admin (student_id, name, password, club_id, position, phone, status)
VALUES 
    ('2025001001', '张社长', 'e10adc3949ba59abbe56e057f20f883e', 0, '社长', '13800138101', 1),
    ('2025002001', '刘社长', 'e10adc3949ba59abbe56e057f20f883e', 0, '社长', '13800138102', 1)
ON CONFLICT (student_id) DO NOTHING;

-- 插入学校管理员体验账号
INSERT INTO school_admin (username, password, name, phone, status)
VALUES 
    ('school_admin', 'e10adc3949ba59abbe56e057f20f883e', '张老师', '13800138201', 1)
ON CONFLICT (username) DO NOTHING;
