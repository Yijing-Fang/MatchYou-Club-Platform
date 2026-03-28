-- ============================================
-- 迁移文件: 创建交友论坛相关表
-- 说明: 支持帖子、评论、点赞功能
-- ============================================

-- 1. 创建论坛帖子表
CREATE TABLE IF NOT EXISTS forum_posts (
    post_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    student_name VARCHAR(20),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    tags VARCHAR(200),
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    status SMALLINT DEFAULT 1,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建论坛评论表（支持二级评论）
CREATE TABLE IF NOT EXISTS forum_comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    student_name VARCHAR(20),
    content TEXT NOT NULL,
    parent_id INTEGER DEFAULT 0,
    status SMALLINT DEFAULT 1,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建论坛点赞表
CREATE TABLE IF NOT EXISTS forum_likes (
    like_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, student_id)
);

-- 4. 插入测试帖子数据
INSERT INTO forum_posts (student_id, student_name, title, content, tags, like_count, comment_count, status, create_time) VALUES
('2026001001', '李同学', '计算机社团面试经验分享', '刚参加了计算机技术社团的面试，来分享一下经验。首先会问你一些基础的编程知识，然后是项目经历。面试官很友好，大家不用紧张！', '技术,经验分享', 15, 3, 1, NOW() - INTERVAL '2 hours'),
('2026001002', '王同学', '合唱团招新求助', '想问一下合唱团面试需要准备什么？我唱歌一般但很想尝试，有没有学长学姐给点建议？', '音乐,求助', 8, 5, 1, NOW() - INTERVAL '5 hours'),
('2026001003', '张同学', '公益志愿者协会真的很赞', '上周参加了公益协会的支教活动，虽然很累但是很有意义！推荐大家都来试试~', '公益,推荐', 23, 7, 1, NOW() - INTERVAL '1 day'),
('2026001004', '刘同学', '篮球队训练时间冲突怎么办', '想加入篮球社但是训练时间和我的课程冲突了，有没有解决办法？社团可以调整吗？', '体育,求助', 5, 2, 1, NOW() - INTERVAL '3 hours'),
('2026001005', '陈同学', '文学社写作工坊体验', '今天参加了文学社的写作工坊，老师讲得特别好！学到了很多写作技巧，推荐喜欢文字的同学加入。', '文化,体验', 12, 4, 1, NOW() - INTERVAL '6 hours'),
('2026001006', '赵同学', '多个社团怎么选择？', '同时被技术社团和摄影协会录取了，两个都很喜欢，但时间可能不够，大家有什么建议吗？', '求助,选择', 18, 8, 1, NOW() - INTERVAL '12 hours'),
('2026001007', '孙同学', '舞蹈团零基础可以加入吗', '完全没有舞蹈基础，但是很喜欢跳舞，舞蹈团招收零基础的新生吗？', '舞蹈,求助', 10, 6, 1, NOW() - INTERVAL '1 day'),
('2026001008', '周同学', '社团活动与学习平衡技巧', '分享一些我平衡社团和学习的小技巧：1.制定时间表 2.优先完成学业 3.选择真正感兴趣的社团', '经验分享,学习', 31, 9, 1, NOW() - INTERVAL '2 days');

-- 5. 插入测试评论数据
INSERT INTO forum_comments (post_id, student_id, student_name, content, parent_id, status, create_time) VALUES
(1, '2026001009', '吴同学', '谢谢分享！很有用', 0, 1, NOW() - INTERVAL '1 hour'),
(1, '2026001010', '郑同学', '请问面试大概多长时间？', 0, 1, NOW() - INTERVAL '30 minutes'),
(1, '2026001001', '李同学', '回复郑同学：大概20分钟左右', 2, 1, NOW() - INTERVAL '15 minutes'),
(2, '2026001011', '钱同学', '我去年加入了，需要准备一首清唱歌曲', 0, 1, NOW() - INTERVAL '2 hours'),
(2, '2026001012', '冯同学', '不用太担心，合唱团更看重态度', 0, 1, NOW() - INTERVAL '1 hour'),
(3, '2026001013', '朱同学', '我也想参加支教，怎么报名？', 0, 1, NOW() - INTERVAL '10 hours'),
(4, '2026001014', '何同学', '可以跟社长沟通，一般会理解的', 0, 1, NOW() - INTERVAL '1 hour'),
(5, '2026001015', '林同学', '写作工坊是每周几？', 0, 1, NOW() - INTERVAL '3 hours');

-- 6. 插入测试点赞数据
INSERT INTO forum_likes (post_id, student_id, create_time) VALUES
(1, '2026001002', NOW()),
(1, '2026001003', NOW()),
(1, '2026001004', NOW()),
(3, '2026001001', NOW()),
(3, '2026001002', NOW()),
(6, '2026001005', NOW());
