const express = require('express');
const path = require('path');

const app = express();

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS设置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname)));
app.use('/games', express.static(path.join(__dirname, 'games')));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 政策页面路由
app.get('/privacy.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.get('/terms.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'terms.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/sitemap.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'sitemap.html'));
});

app.get('/disclaimer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'disclaimer.html'));
});

app.get('/cookies.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cookies.html'));
});

// SEO文件路由
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// 游戏页面路由
app.get('/categories.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'categories.html'));
});

app.get('/guides.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'guides.html'));
});

app.get('/reviews.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'reviews.html'));
});

// 简化的API路由
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'GameHub API 运行正常',
        timestamp: new Date().toISOString()
    });
});

// 模拟游戏数据API
app.get('/api/games', (req, res) => {
    res.json({
        status: 'success',
        data: [
            { id: 1, name: '贪吃蛇', category: 'arcade', url: 'games/snake.html' },
            { id: 2, name: '2048', category: 'puzzle', url: 'games/2048.html' },
            { id: 3, name: '记忆翻牌', category: 'puzzle', url: 'games/memory.html' },
            { id: 4, name: '井字棋', category: 'strategy', url: 'games/tictactoe.html' }
        ]
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: '服务器内部错误'
    });
});

// 启动服务器
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 GameHub 服务器运行在端口 ${PORT}`);
    console.log(`🔗 访问地址: http://${HOST}:${PORT}`);
    console.log(`🎮 游戏大厅: http://${HOST}:${PORT}/games`);
    console.log('✅ 服务器启动成功！');
});

module.exports = app;