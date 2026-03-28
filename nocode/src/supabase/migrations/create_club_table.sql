-- 创建 club（社团）表
CREATE TABLE IF NOT EXISTS club (
    club_id SERIAL PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL DEFAULT '其他',
    club_tags VARCHAR(200),
    description TEXT,
    recruit_status VARCHAR(20) NOT NULL DEFAULT '未开始',
    quota INTEGER NOT NULL DEFAULT 50,
    frequency VARCHAR(20),
    difficulty VARCHAR(20) DEFAULT '中等',
    leader_name VARCHAR(20),
    contact_phone VARCHAR(11),
    start_time DATE,
    end_time DATE,
    status SMALLINT NOT NULL DEFAULT 1,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 apply（报名表）表（如果不存在）
CREATE TABLE IF NOT EXISTS apply (
    apply_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    club_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT '待审核',
    apply_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    interview_time VARCHAR(50),
    interview_location VARCHAR(100),
    note TEXT
);

-- 创建 notice（通知表）（如果不存在）
CREATE TABLE IF NOT EXISTS notice (
    notice_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    type VARCHAR(20) DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT false,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试社团数据（包含各种兴趣标签）
INSERT INTO club (club_name, category, club_tags, description, recruit_status, quota, frequency, difficulty, leader_name, contact_phone, start_time, end_time, status) VALUES
('计算机技术社团', '技术', '技术,编程,竞赛', '探索编程世界，参加各类技术竞赛，提升实战能力。每周有技术分享会，欢迎热爱技术的同学加入！', '招新中', 50, '每周2-3次', '中等', '张社长', '13800138101', '2026-02-01', '2026-03-01', 1),
('校园合唱团', '音乐', '音乐,唱歌,表演', '用歌声传递情感，参加校内外的各类演出活动。无论你是美声还是流行，这里都有你的舞台！', '招新中', 30, '每周2-3次', '中等', '李社长', '13800138102', '2026-02-15', '2026-03-15', 1),
('篮球社', '体育', '体育,篮球,运动', '热爱篮球，挥洒汗水！定期训练、友谊赛、校联赛，一起在球场上燃烧青春！', '招新中', 40, '每周2-3次', '容易', '王社长', '13800138103', '2026-02-01', '2026-02-28', 1),
('公益志愿者协会', '公益', '公益,志愿者,社会服务', '奉献爱心，服务社会。组织支教、环保、敬老等志愿活动，让大学生活更有意义！', '招新中', 100, '每月1-2次', '容易', '赵社长', '13800138104', '2026-02-10', '2026-03-10', 1),
('文学社', '文化', '文化,文学,写作', '以文会友，书写青春。读书分享、写作工坊、诗歌朗诵，在文字中寻找共鸣。', '招新中', 25, '每周1次', '中等', '孙社长', '13800138105', '2026-02-05', '2026-03-05', 1),
('舞蹈团', '舞蹈', '舞蹈,表演,艺术', '街舞、民族舞、现代舞，各种风格任你选择。舞台已经准备好，就等你来发光！', '招新中', 35, '每周2-3次', '困难', '周社长', '13800138106', '2026-02-01', '2026-02-20', 1),
('摄影协会', '文化', '文化,摄影,艺术', '用镜头记录美好瞬间。摄影技巧分享、外拍活动、作品展览，一起发现生活中的美。', '招新中', 30, '每周1次', '容易', '吴社长', '13800138107', '2026-02-08', '2026-03-08', 1),
('辩论社', '学术', '学术,辩论,思辨', '以辩会友，以论求知。逻辑思辨、口才训练、校际比赛，在这里成为更好的自己！', '招新中', 20, '每周2-3次', '困难', '郑社长', '13800138108', '2026-02-01', '2026-02-25', 1),
('足球社', '体育', '体育,足球,运动', '绿茵场上的奔跑，团队配合的默契。无论你是新手还是高手，都欢迎加入！', '招新中', 45, '每周2-3次', '中等', '陈社长', '13800138109', '2026-02-01', '2026-03-01', 1),
('心理互助社', '公益', '公益,心理,互助', '关注心理健康，传递温暖力量。心理沙龙、互助小组，一起成长。', '招新中', 40, '每月1-2次', '容易', '林社长', '13800138110', '2026-02-12', '2026-03-12', 1),
('人工智能俱乐部', '技术', '技术,AI,编程', '探索AI前沿技术，机器学习、深度学习实战项目，面向未来的技术社团！', '招新中', 25, '每周2-3次', '困难', '黄社长', '13800138111', '2026-02-01', '2026-03-01', 1),
('吉他社', '音乐', '音乐,吉他,乐器', '从零基础到弹唱高手，专业教学、定期路演，用音乐点亮大学生活！', '招新中', 30, '每周1次', '中等', '何社长', '13800138112', '2026-02-20', '2026-03-20', 1),
('瑜伽社', '体育', '体育,瑜伽,健身', '身心合一，舒缓压力。专业教练指导，适合所有水平的同学。', '招新中', 35, '每周1次', '容易', '高社长', '13800138113', '2026-02-01', '2026-03-01', 1),
('英语角', '学术', '学术,英语,语言', '沉浸式英语环境，口语练习、文化交流、英语电影赏析，提升语言能力！', '招新中', 50, '每周1次', '容易', '马社长', '13800138114', '2026-02-01', '2026-03-01', 1),
('环保协会', '公益', '公益,环保,绿色', '践行绿色生活，组织环保活动，为美丽校园和地球贡献力量。', '招新中', 60, '每月1-2次', '容易', '罗社长', '13800138115', '2026-02-01', '2026-03-01', 1);

-- 插入一些测试报名数据（用于测试剩余名额计算）
INSERT INTO apply (student_id, club_id, status, apply_time) VALUES
('2026001001', 1, '待审核', NOW()),
('2026001002', 1, '已通过', NOW()),
('2026001003', 2, '待审核', NOW()),
('2026001004', 3, '待审核', NOW()),
('2026001005', 3, '已通过', NOW()),
('2026001006', 3, '已通过', NOW()),
('2026001007', 4, '待审核', NOW());

-- 插入测试通知
INSERT INTO notice (student_id, title, content, type, is_read, create_time) VALUES
('2026001001', '欢迎来到Match You平台', '完善你的兴趣画像，获取精准社团推荐！', 'system', false, NOW()),
('2026001001', '计算机技术社团招新啦', '计算机技术社团正在进行招新，点击查看详情。', 'recruit', false, NOW());
