const express = require('express');
const router = express.Router();

// 用户数据（实际项目中应该使用数据库）
const users = [];

// 获取用户信息
router.get('/profile/:id', (req, res) => {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);
    
    if (user) {
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                joinDate: user.joinDate,
                gamesPlayed: user.gamesPlayed || 0,
                highScores: user.highScores || {}
            }
        });
    } else {
        res.status(404).json({
            success: false,
            message: '用户未找到'
        });
    }
});

// 更新用户游戏记录
router.post('/game-record', (req, res) => {
    const { userId, gameId, score, playTime } = req.body;
    
    // 这里应该有真实的数据存储逻辑
    res.json({
        success: true,
        message: '游戏记录已保存',
        data: {
            userId,
            gameId,
            score,
            playTime,
            timestamp: new Date().toISOString()
        }
    });
});

// 获取用户游戏统计
router.get('/stats/:id', (req, res) => {
    const userId = req.params.id;
    
    // 模拟统计数据
    res.json({
        success: true,
        stats: {
            totalGamesPlayed: 25,
            totalPlayTime: '2小时30分钟',
            favoriteGame: '贪吃蛇',
            highestScore: 1250,
            achievements: [
                { name: '新手玩家', description: '完成第一个游戏' },
                { name: '游戏达人', description: '游戏时间超过1小时' }
            ]
        }
    });
});

// 获取排行榜
router.get('/leaderboard/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    
    // 模拟排行榜数据
    const leaderboard = [
        { rank: 1, username: '游戏高手', score: 2500 },
        { rank: 2, username: '挑战者', score: 2200 },
        { rank: 3, username: '新星玩家', score: 1800 },
        { rank: 4, username: '努力玩家', score: 1500 },
        { rank: 5, username: '休闲玩家', score: 1200 }
    ];
    
    res.json({
        success: true,
        gameId: gameId,
        leaderboard: leaderboard
    });
});

module.exports = router;