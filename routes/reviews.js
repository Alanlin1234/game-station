const express = require('express');
const router = express.Router();

// 模拟评论数据
const reviews = [
    {
        id: 1,
        gameId: 'snake',
        username: '游戏爱好者',
        rating: 5,
        comment: '经典的贪吃蛇游戏，操作流畅，画面简洁，非常好玩！',
        date: '2024-01-15',
        helpful: 12
    },
    {
        id: 2,
        gameId: '2048',
        username: '益智达人',
        rating: 4,
        comment: '很有挑战性的数字游戏，需要策略思考，推荐！',
        date: '2024-01-14',
        helpful: 8
    },
    {
        id: 3,
        gameId: 'memory',
        username: '记忆高手',
        rating: 4,
        comment: '锻炼记忆力的好游戏，适合全家一起玩。',
        date: '2024-01-13',
        helpful: 6
    },
    {
        id: 4,
        gameId: 'tictactoe',
        username: '策略玩家',
        rating: 3,
        comment: '简单的井字棋游戏，AI难度适中。',
        date: '2024-01-12',
        helpful: 4
    }
];

// 获取所有评论
router.get('/', (req, res) => {
    res.json({
        success: true,
        reviews: reviews.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
});

// 根据游戏ID获取评论
router.get('/game/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    const gameReviews = reviews.filter(review => review.gameId === gameId);
    
    res.json({
        success: true,
        gameId: gameId,
        reviews: gameReviews.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
});

// 提交新评论
router.post('/', (req, res) => {
    const { gameId, username, rating, comment } = req.body;
    
    if (!gameId || !username || !rating || !comment) {
        return res.status(400).json({
            success: false,
            message: '请填写完整的评论信息'
        });
    }
    
    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: '评分必须在1-5之间'
        });
    }
    
    const newReview = {
        id: reviews.length + 1,
        gameId,
        username,
        rating: parseInt(rating),
        comment,
        date: new Date().toISOString().split('T')[0],
        helpful: 0
    };
    
    reviews.push(newReview);
    
    res.json({
        success: true,
        message: '评论提交成功',
        review: newReview
    });
});

// 点赞评论
router.post('/:id/helpful', (req, res) => {
    const reviewId = parseInt(req.params.id);
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
        review.helpful += 1;
        res.json({
            success: true,
            message: '点赞成功',
            helpful: review.helpful
        });
    } else {
        res.status(404).json({
            success: false,
            message: '评论未找到'
        });
    }
});

// 删除评论（管理员功能）
router.delete('/:id', (req, res) => {
    const reviewId = parseInt(req.params.id);
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex !== -1) {
        reviews.splice(reviewIndex, 1);
        res.json({
            success: true,
            message: '评论删除成功'
        });
    } else {
        res.status(404).json({
            success: false,
            message: '评论未找到'
        });
    }
});

// 获取评论统计
router.get('/stats', (req, res) => {
    const stats = {
        totalReviews: reviews.length,
        averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
        ratingDistribution: {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length
        }
    };
    
    res.json({
        success: true,
        stats: stats
    });
});

module.exports = router;