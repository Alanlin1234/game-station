const express = require('express');
const path = require('path');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');
const reviewRoutes = require('./routes/reviews');
const categoryRoutes = require('./routes/categories');
const guideRoutes = require('./routes/guides');

// 导入中间件
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { corsMiddleware } = require('./middleware/auth');

const app = express();

// 基础中间件
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/reviews.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'reviews.html'));
});

app.get('/achievements.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'achievements.html'));
});

app.get('/categories.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'categories.html'));
});

app.get('/cookies.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cookies.html'));
});

app.get('/disclaimer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'disclaimer.html'));
});

app.get('/guides.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'guides.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/saved-games.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'saved-games.html'));
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

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/guides', guideRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'GameHub API 运行正常',
        timestamp: new Date().toISOString()
    });
});

// 404处理
app.use(notFound);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`🚀 GameHub 服务器运行在端口 ${PORT}`);
    console.log(`🔗 访问地址: http://${HOST}:${PORT}`);
    console.log(`🎮 游戏大厅: http://${HOST}:${PORT}/games`);
});

module.exports = app;
