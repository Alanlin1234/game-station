const express = require('express');
const path = require('path');

const app = express();

// 设置静态文件目录
app.use(express.static(__dirname));

// 处理所有路由，返回对应的HTML文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access at: http://0.0.0.0:${port}`);
});