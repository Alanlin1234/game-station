const express = require('express');
const router = express.Router();

// 简单的认证路由
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // 这里应该有真实的用户验证逻辑
    if (username && password) {
        res.json({ 
            success: true, 
            message: '登录成功',
            user: { username }
        });
    } else {
        res.status(400).json({ 
            success: false, 
            message: '用户名或密码不能为空' 
        });
    }
});

router.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    
    // 这里应该有真实的用户注册逻辑
    if (username && password && email) {
        res.json({ 
            success: true, 
            message: '注册成功',
            user: { username, email }
        });
    } else {
        res.status(400).json({ 
            success: false, 
            message: '请填写完整信息' 
        });
    }
});

router.post('/logout', (req, res) => {
    res.json({ 
        success: true, 
        message: '退出成功' 
    });
});

module.exports = router;