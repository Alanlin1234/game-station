const express = require('express');
const router = express.Router();

// 游戏攻略数据
const guides = [
    {
        id: 1,
        gameId: 'snake',
        title: '贪吃蛇游戏高分攻略',
        author: '游戏达人',
        date: '2024-01-15',
        views: 1250,
        likes: 89,
        difficulty: 'beginner',
        content: `
# 贪吃蛇游戏高分攻略

## 基本操作
- 使用方向键或WASD控制蛇的移动方向
- 吃到食物后蛇身会增长，得分增加
- 避免撞到墙壁或自己的身体

## 高分技巧
1. **保持冷静**：不要急于求成，稳扎稳打
2. **规划路线**：提前思考移动路径，避免困住自己
3. **边缘策略**：尽量沿着边缘移动，减少被困风险
4. **螺旋移动**：当蛇身较长时，采用螺旋形移动模式

## 进阶技巧
- 学会"甩尾"技巧，在紧急情况下快速转向
- 掌握"围墙"策略，利用墙壁辅助移动
- 练习"预判"能力，提前判断食物出现位置
        `,
        tags: ['贪吃蛇', '高分', '技巧', '新手']
    },
    {
        id: 2,
        gameId: '2048',
        title: '2048数字游戏必胜策略',
        author: '数学高手',
        date: '2024-01-14',
        views: 980,
        likes: 67,
        difficulty: 'intermediate',
        content: `
# 2048数字游戏必胜策略

## 游戏规则
- 使用方向键移动所有数字方块
- 相同数字的方块会合并成更大的数字
- 目标是创造出2048这个数字

## 核心策略
1. **选择主方向**：选择一个主要的移动方向（推荐右下角）
2. **保持最大数字在角落**：将最大的数字始终保持在选定的角落
3. **构建数字链**：按照2-4-8-16的顺序排列数字

## 实用技巧
- 避免随意移动，每一步都要有目的
- 尽量保持一行或一列的数字有序
- 当空间不足时，优先合并小数字
- 学会"蛇形"排列，提高空间利用率
        `,
        tags: ['2048', '策略', '数字', '益智']
    },
    {
        id: 3,
        gameId: 'memory',
        title: '记忆翻牌游戏记忆技巧',
        author: '记忆专家',
        date: '2024-01-13',
        views: 756,
        likes: 45,
        difficulty: 'beginner',
        content: `
# 记忆翻牌游戏记忆技巧

## 游戏目标
- 翻开卡片找到相同的图案进行配对
- 用最少的步数完成所有配对
- 挑战更快的完成时间

## 记忆方法
1. **位置记忆法**：记住每张卡片的具体位置
2. **图案分类法**：将相似的图案归类记忆
3. **故事联想法**：为图案编造小故事帮助记忆

## 提高技巧
- 第一轮先系统性地翻开所有卡片
- 优先记忆特殊或独特的图案
- 使用"分区记忆"，将游戏区域分成小块
- 保持专注，避免分心
        `,
        tags: ['记忆', '翻牌', '技巧', '训练']
    },
    {
        id: 4,
        gameId: 'tictactoe',
        title: '井字棋必胜战术指南',
        author: '策略大师',
        date: '2024-01-12',
        views: 634,
        likes: 38,
        difficulty: 'intermediate',
        content: `
# 井字棋必胜战术指南

## 基本规则
- 两名玩家轮流在3x3格子中放置标记
- 先连成一条线（横、竖、斜）的玩家获胜
- 如果格子填满仍无人获胜则为平局

## 必胜策略
1. **占据中心**：第一步尽量占据中心位置
2. **阻止对手**：优先阻止对手形成连线
3. **创造双威胁**：同时威胁两个方向的连线

## 开局技巧
- 先手：优先选择中心或角落
- 后手：如果对手占中心，选择角落；如果对手占角落，选择中心
- 避免选择边缘中点，除非有特殊战术需要
        `,
        tags: ['井字棋', '策略', '战术', '对战']
    }
];

// 获取所有攻略
router.get('/', (req, res) => {
    const { gameId, difficulty, sort } = req.query;
    let filteredGuides = [...guides];
    
    // 按游戏ID筛选
    if (gameId) {
        filteredGuides = filteredGuides.filter(guide => guide.gameId === gameId);
    }
    
    // 按难度筛选
    if (difficulty) {
        filteredGuides = filteredGuides.filter(guide => guide.difficulty === difficulty);
    }
    
    // 排序
    if (sort === 'views') {
        filteredGuides.sort((a, b) => b.views - a.views);
    } else if (sort === 'likes') {
        filteredGuides.sort((a, b) => b.likes - a.likes);
    } else {
        filteredGuides.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    res.json({
        success: true,
        guides: filteredGuides
    });
});

// 获取单个攻略详情
router.get('/:id', (req, res) => {
    const guideId = parseInt(req.params.id);
    const guide = guides.find(g => g.id === guideId);
    
    if (guide) {
        // 增加浏览量
        guide.views += 1;
        
        res.json({
            success: true,
            guide: guide
        });
    } else {
        res.status(404).json({
            success: false,
            message: '攻略未找到'
        });
    }
});

// 根据游戏ID获取攻略
router.get('/game/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const gameGuides = guides.filter(guide => guide.gameId === gameId);
    
    res.json({
        success: true,
        gameId: gameId,
        guides: gameGuides.sort((a, b) => b.views - a.views)
    });
});

// 搜索攻略
router.get('/search/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const matchedGuides = guides.filter(guide => 
        guide.title.toLowerCase().includes(query) ||
        guide.content.toLowerCase().includes(query) ||
        guide.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    res.json({
        success: true,
        query: query,
        guides: matchedGuides
    });
});

// 点赞攻略
router.post('/:id/like', (req, res) => {
    const guideId = parseInt(req.params.id);
    const guide = guides.find(g => g.id === guideId);
    
    if (guide) {
        guide.likes += 1;
        res.json({
            success: true,
            message: '点赞成功',
            likes: guide.likes
        });
    } else {
        res.status(404).json({
            success: false,
            message: '攻略未找到'
        });
    }
});

// 提交新攻略
router.post('/', (req, res) => {
    const { gameId, title, author, content, difficulty, tags } = req.body;
    
    if (!gameId || !title || !author || !content) {
        return res.status(400).json({
            success: false,
            message: '请填写完整的攻略信息'
        });
    }
    
    const newGuide = {
        id: guides.length + 1,
        gameId,
        title,
        author,
        date: new Date().toISOString().split('T')[0],
        views: 0,
        likes: 0,
        difficulty: difficulty || 'beginner',
        content,
        tags: tags || []
    };
    
    guides.push(newGuide);
    
    res.json({
        success: true,
        message: '攻略提交成功',
        guide: newGuide
    });
});

// 获取热门攻略
router.get('/hot/list', (req, res) => {
    const hotGuides = guides
        .sort((a, b) => (b.views * 0.7 + b.likes * 0.3) - (a.views * 0.7 + a.likes * 0.3))
        .slice(0, 5);
    
    res.json({
        success: true,
        guides: hotGuides
    });
});

// 获取攻略统计
router.get('/stats/overview', (req, res) => {
    const stats = {
        totalGuides: guides.length,
        totalViews: guides.reduce((sum, guide) => sum + guide.views, 0),
        totalLikes: guides.reduce((sum, guide) => sum + guide.likes, 0),
        averageViews: Math.round(guides.reduce((sum, guide) => sum + guide.views, 0) / guides.length),
        popularGame: 'snake', // 基于攻略数量
        difficultyDistribution: {
            beginner: guides.filter(g => g.difficulty === 'beginner').length,
            intermediate: guides.filter(g => g.difficulty === 'intermediate').length,
            advanced: guides.filter(g => g.difficulty === 'advanced').length
        }
    };
    
    res.json({
        success: true,
        stats: stats
    });
});

module.exports = router;