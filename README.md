# GameHub - 在线游戏平台

GameHub是一个现代化的在线游戏平台，提供多种免费的浏览器游戏，包括贪吃蛇、2048、记忆翻牌和井字棋等经典游戏。该平台具有用户账户系统、游戏进度保存、成就系统和社交分享功能。

## 功能特点

- **多种经典游戏**：提供多种经典浏览器游戏，无需下载，即可在线畅玩
- **用户账户系统**：注册登录功能，个人资料管理
- **游戏进度保存**：保存游戏进度，随时继续游戏
- **成就系统**：完成游戏挑战，解锁成就
- **社交分享**：分享游戏和成就到社交媒体
- **游戏评分和评论**：用户可以对游戏进行评分和评论
- **游戏推荐系统**：基于用户行为提供个性化游戏推荐
- **响应式设计**：适配各种设备，包括桌面电脑、平板和手机

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **UI框架**：自定义CSS，响应式设计
- **数据存储**：LocalStorage (客户端存储)
- **分析工具**：自定义分析模块，跟踪用户行为和游戏数据

## 项目结构

```
/
├── index.html                # 主页
├── games/                    # 游戏目录
│   ├── index.html            # 游戏列表页
│   ├── snake.html            # 贪吃蛇游戏
│   ├── 2048.html             # 2048游戏
│   ├── memory.html           # 记忆翻牌游戏
│   └── tictactoe.html        # 井字棋游戏
├── js/                       # JavaScript文件
│   └── auth.js               # 用户认证系统
├── api/                      # API模拟
│   └── recommendations.js    # 游戏推荐API
├── social-share.js           # 社交分享功能
├── rating.js                 # 游戏评分系统
├── recommendation.js         # 游戏推荐系统
├── game-history.js           # 游戏历史记录
├── achievements.js           # 成就系统
├── analytics.js              # 数据分析工具
├── leaderboard.js            # 游戏排行榜
├── enhanced-styles.css       # 增强样式
├── profile.html              # 用户个人资料页
├── achievements.html         # 用户成就页
├── saved-games.html          # 游戏存档页
└── README.md                 # 项目说明
```

## 安装和运行

1. 克隆仓库
```bash
git clone https://github.com/yourusername/gamehub.git
```

2. 进入项目目录
```bash
cd gamehub
```

3. 使用任意HTTP服务器运行项目，例如：
```bash
# 使用Python的HTTP服务器
python -m http.server 3000
```

4. 在浏览器中访问 `http://localhost:3000`

## 用户账户系统

目前，用户账户系统使用浏览器的LocalStorage进行模拟，所有数据都存储在客户端。在实际生产环境中，应该使用后端服务器和数据库来存储用户数据。

### 功能包括：

- 用户注册和登录
- 个人资料管理
- 游戏进度保存
- 成就系统
- 游戏存档管理

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 联系方式

项目链接：[https://github.com/yourusername/gamehub](https://github.com/yourusername/gamehub)