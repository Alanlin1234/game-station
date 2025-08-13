const express = require('express');
const router = express.Router();

// 游戏分类数据
const categories = [
    {
        id: 'arcade',
        name: '街机游戏',
        description: '经典的街机风格游戏，简单易上手',
        icon: 'fas fa-gamepad',
        color: '#ff6b6b',
        games: ['snake', 'tetris', 'pacman']
    },
    {
        id: 'puzzle',
        name: '益智游戏',
        description: '锻炼大脑的智力游戏',
        icon: 'fas fa-puzzle-piece',
        color: '#4ecdc4',
        games: ['2048', 'memory', 'sudoku']
    },
    {
        id: 'strategy',
        name: '策略游戏',
        description: '需要思考和规划的策略类游戏',
        icon: 'fas fa-chess',
        color: '#45b7d1',
        games: ['tictactoe', 'chess', 'checkers']
    },
    {
        id: 'action',
        name: '动作游戏',
        description: '快节奏的动作冒险游戏',
        icon: 'fas fa-running',
        color: '#f9ca24',
        games: ['runner', 'platformer', 'shooter']
    },
    {
        id: 'sports',
        name: '体育游戏',
        description: '各种体育运动模拟游戏',
        icon: 'fas fa-futbol',
        color: '#6c5ce7',
        games: ['soccer', 'basketball', 'tennis']
    },
    {
        id: 'racing',
        name: '竞速游戏',
        description: '刺激的赛车和竞速游戏',
        icon: 'fas fa-car',
        color: '#fd79a8',
        games: ['racing', 'motorcycle', 'formula']
    }
];

// 获取所有分类
router.get('/', (req, res) => {
    res.json({
        success: true,
        categories: categories
    });
});

// 获取单个分类信息
router.get('/:id', (req, res) => {
    const categoryId = req.params.id;
    const category = categories.find(c => c.id === categoryId);
    
    if (category) {
        res.json({
            success: true,
            category: category
        });
    } else {
        res.status(404).json({
            success: false,
            message: '分类未找到'
        });
    }
});

// 获取分类下的游戏
router.get('/:id/games', (req, res) => {
    const categoryId = req.params.id;
    const category = categories.find(c => c.id === categoryId);
    
    if (category) {
        // 这里应该从游戏数据库中获取实际的游戏信息
        const games = category.games.map(gameId => ({
            id: gameId,
            title: getGameTitle(gameId),
            description: getGameDescription(gameId),
            category: categoryId
        }));
        
        res.json({
            success: true,
            category: category.name,
            games: games
        });
    } else {
        res.status(404).json({
            success: false,
            message: '分类未找到'
        });
    }
});

// 获取分类统计信息
router.get('/:id/stats', (req, res) => {
    const categoryId = req.params.id;
    const category = categories.find(c => c.id === categoryId);
    
    if (category) {
        res.json({
            success: true,
            stats: {
                categoryName: category.name,
                totalGames: category.games.length,
                popularGame: category.games[0], // 假设第一个是最受欢迎的
                averageRating: 4.2, // 模拟数据
                totalPlays: Math.floor(Math.random() * 10000) + 1000
            }
        });
    } else {
        res.status(404).json({
            success: false,
            message: '分类未找到'
        });
    }
});

// 搜索分类
router.get('/search/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const matchedCategories = categories.filter(category => 
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
    );
    
    res.json({
        success: true,
        query: query,
        categories: matchedCategories
    });
});

// 辅助函数：获取游戏标题
function getGameTitle(gameId) {
    const titles = {
        'snake': '贪吃蛇',
        'tetris': '俄罗斯方块',
        'pacman': '吃豆人',
        '2048': '2048',
        'memory': '记忆翻牌',
        'sudoku': '数独',
        'tictactoe': '井字棋',
        'chess': '国际象棋',
        'checkers': '跳棋',
        'runner': '跑酷游戏',
        'platformer': '平台跳跃',
        'shooter': '射击游戏',
        'soccer': '足球',
        'basketball': '篮球',
        'tennis': '网球',
        'racing': '赛车',
        'motorcycle': '摩托车',
        'formula': '方程式赛车'
    };
    return titles[gameId] || gameId;
}

// 辅助函数：获取游戏描述
function getGameDescription(gameId) {
    const descriptions = {
        'snake': '经典的贪吃蛇游戏',
        'tetris': '经典的俄罗斯方块',
        'pacman': '经典的吃豆人游戏',
        '2048': '数字合并益智游戏',
        'memory': '记忆力训练游戏',
        'sudoku': '经典数独游戏',
        'tictactoe': '井字棋策略游戏',
        'chess': '国际象棋',
        'checkers': '跳棋游戏',
        'runner': '无尽跑酷游戏',
        'platformer': '平台跳跃游戏',
        'shooter': '射击类游戏',
        'soccer': '足球运动游戏',
        'basketball': '篮球运动游戏',
        'tennis': '网球运动游戏',
        'racing': '赛车竞速游戏',
        'motorcycle': '摩托车竞速',
        'formula': '方程式赛车'
    };
    return descriptions[gameId] || '精彩的游戏体验';
}

module.exports = router;