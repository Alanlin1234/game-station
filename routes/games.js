const express = require('express');
const router = express.Router();

// 游戏数据
const games = [
    {
        id: 'snake',
        title: '贪吃蛇',
        description: '经典的贪吃蛇游戏，挑战你的反应速度',
        category: 'arcade',
        difficulty: 'easy',
        rating: 4.5
    },
    {
        id: '2048',
        title: '2048',
        description: '数字合并益智游戏，挑战你的逻辑思维',
        category: 'puzzle',
        difficulty: 'medium',
        rating: 4.7
    },
    {
        id: 'memory',
        title: '记忆翻牌',
        description: '锻炼记忆力的翻牌配对游戏',
        category: 'puzzle',
        difficulty: 'easy',
        rating: 4.3
    },
    {
        id: 'tictactoe',
        title: '井字棋',
        description: '经典的策略对战游戏',
        category: 'strategy',
        difficulty: 'easy',
        rating: 4.2
    }
];

// 获取所有游戏
router.get('/', (req, res) => {
    res.json({
        success: true,
        games: games
    });
});

// 根据分类获取游戏
router.get('/category/:category', (req, res) => {
    const category = req.params.category;
    const filteredGames = games.filter(game => game.category === category);
    
    res.json({
        success: true,
        category: category,
        games: filteredGames
    });
});

// 获取单个游戏信息
router.get('/:id', (req, res) => {
    const gameId = req.params.id;
    const game = games.find(g => g.id === gameId);
    
    if (game) {
        res.json({
            success: true,
            game: game
        });
    } else {
        res.status(404).json({
            success: false,
            message: '游戏未找到'
        });
    }
});

// 提交游戏评分
router.post('/:id/rate', (req, res) => {
    const gameId = req.params.id;
    const { rating } = req.body;
    
    const game = games.find(g => g.id === gameId);
    
    if (game && rating >= 1 && rating <= 5) {
        // 这里应该有真实的评分存储逻辑
        res.json({
            success: true,
            message: '评分提交成功',
            rating: rating
        });
    } else {
        res.status(400).json({
            success: false,
            message: '无效的游戏ID或评分'
        });
    }
});

module.exports = router;