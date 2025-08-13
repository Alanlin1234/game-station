# GameHub 游戏站后端

一个功能完整的游戏网站后端API系统，基于Node.js + Express + MongoDB构建。

## 🚀 功能特性

### 用户系统
- ✅ 用户注册/登录/邮箱验证
- ✅ 密码重置/找回密码
- ✅ 用户资料管理/头像上传
- ✅ 用户等级系统/成就系统
- ✅ 角色权限管理（用户/版主/管理员）

### 游戏系统
- ✅ 游戏分类管理
- ✅ 游戏增删改查
- ✅ 游戏搜索/筛选/排序
- ✅ 热门游戏/推荐游戏
- ✅ 游戏收藏/统计
- ✅ 原创游戏 + iframe嵌入游戏

### 评论系统
- ✅ 游戏评论/评分
- ✅ 评论点赞/举报
- ✅ 管理员回复
- ✅ 评论筛选/排序

### 安全特性
- ✅ JWT身份验证
- ✅ 密码加密存储
- ✅ 速率限制防护
- ✅ 输入验证/数据清洗
- ✅ XSS/CSRF防护

## 📁 项目结构

```
游戏站/
├── models/                 # 数据库模型
│   ├── User.js            # 用户模型
│   ├── Game.js            # 游戏模型
│   ├── Review.js          # 评论模型
│   └── Category.js        # 分类模型
├── routes/                # API路由
│   ├── auth.js            # 认证路由
│   ├── users.js           # 用户路由
│   ├── games.js           # 游戏路由
│   ├── reviews.js         # 评论路由
│   ├── categories.js      # 分类路由
│   └── guides.js          # 游戏指南路由
├── middleware/            # 中间件
│   ├── auth.js            # 认证中间件
│   └── errorHandler.js    # 错误处理中间件
├── utils/                 # 工具函数
│   └── sendEmail.js       # 邮件发送
├── scripts/               # 脚本文件
│   └── initData.js        # 数据初始化脚本
├── server.js              # 服务器入口
├── package.json           # 项目配置
├── config.env             # 环境变量
└── README.md              # 项目说明
```

## 🛠️ 安装部署

### 1. 环境要求
- Node.js >= 14.0.0
- MongoDB >= 4.0.0
- npm 或 yarn

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `config.env.example` 为 `config.env` 并修改配置：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/gamehub

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. 启动数据库
确保MongoDB服务正在运行：
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. 初始化数据
```bash
node scripts/initData.js
```

### 6. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 📚 API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/forgot-password` - 忘记密码
- `PUT /api/auth/reset-password/:token` - 重置密码

### 游戏相关
- `GET /api/games` - 获取游戏列表
- `GET /api/games/popular` - 获取热门游戏
- `GET /api/games/recommended` - 获取推荐游戏
- `GET /api/games/search` - 搜索游戏
- `GET /api/games/:id` - 获取游戏详情
- `POST /api/games/:id/favorite` - 收藏游戏

### 评论相关
- `GET /api/reviews` - 获取评论列表
- `GET /api/reviews/game/:gameId` - 获取游戏评论
- `POST /api/reviews` - 发表评论
- `PUT /api/reviews/:id` - 更新评论
- `DELETE /api/reviews/:id` - 删除评论
- `POST /api/reviews/:id/helpful` - 点赞评论

### 分类相关
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/popular` - 获取热门分类
- `GET /api/categories/:id` - 获取分类详情

### 用户相关
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `PUT /api/users/password` - 修改密码
- `GET /api/users/reviews` - 获取用户评论
- `GET /api/users/stats` - 获取用户统计

## 🎮 游戏列表

### 原创游戏
1. **Poor Bunny** - 平台跳跃游戏
2. **Color Match** - 颜色匹配游戏
3. **Snake Classic** - 经典贪吃蛇
4. **Memory Cards** - 记忆翻牌游戏
5. **Bubble Shooter** - 泡泡射击游戏
6. **2048** - 数字合并游戏

### iframe嵌入游戏
1. **Tetris** - 俄罗斯方块
2. **Slither.io** - 多人在线蛇类游戏
3. **Agar.io** - 细胞吞噬游戏
4. **Diep.io** - 坦克射击游戏
5. **Krunker.io** - 3D射击游戏
6. **Surviv.io** - 生存射击游戏
7. **Racing Games** - 赛车游戏

## 🔧 开发指南

### 添加新游戏
1. 在 `scripts/initData.js` 中添加游戏数据
2. 运行 `node scripts/initData.js` 初始化数据
3. 或者通过API接口添加游戏

### 自定义游戏
1. 创建游戏HTML文件
2. 上传到服务器或CDN
3. 在数据库中更新游戏URL

### 扩展功能
- 添加更多游戏分类
- 实现游戏排行榜
- 添加游戏成就系统
- 实现多人游戏功能

## 🚨 注意事项

1. **安全配置**：生产环境请修改JWT密钥和数据库密码
2. **邮件服务**：如需邮件功能，请配置SMTP服务
3. **文件上传**：建议使用云存储服务存储图片和文件
4. **数据库备份**：定期备份MongoDB数据
5. **HTTPS**：生产环境请使用HTTPS协议

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过以下方式联系：
- 邮箱：support@gamehub.com
- GitHub：https://github.com/gamehub 