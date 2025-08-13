/**
 * 游戏页面整合文件
 * 用于将所有优化功能添加到游戏页面中
 */

document.addEventListener('DOMContentLoaded', function() {
    // 加载增强样式
    loadEnhancedStyles();
    
    // 加载社交分享功能
    loadSocialShare();
    
    // 加载评分系统
    loadRatingSystem();
    
    // 加载排行榜系统
    loadLeaderboard();
    
    // 加载游戏历史记录
    loadGameHistory();
    
    // 加载成就系统
    loadAchievements();
    
    // 加载游戏推荐系统
    loadRecommendationSystem();
    
    // 加载分析工具
    loadAnalytics();
});

/**
 * 加载成就系统
 */
function loadAchievements() {
    // 获取游戏ID
    const gameId = window.location.pathname.split('/').pop().replace('.html', '');
    
    // 定义游戏成就
    const gameAchievements = {
        snake: [
            { id: 'first_play', name: '初次尝试', description: '第一次玩贪吃蛇游戏', icon: 'bi-trophy' },
            { id: 'score_100', name: '小有成就', description: '在贪吃蛇游戏中获得100分', icon: 'bi-award' },
            { id: 'score_500', name: '蛇王', description: '在贪吃蛇游戏中获得500分', icon: 'bi-award-fill' },
            { id: 'play_10', name: '蛇瘾', description: '玩贪吃蛇游戏10次', icon: 'bi-controller' }
        ],
        '2048': [
            { id: 'first_play', name: '初次尝试', description: '第一次玩2048游戏', icon: 'bi-trophy' },
            { id: 'tile_512', name: '数字高手', description: '在2048游戏中合成出512方块', icon: 'bi-award' },
            { id: 'tile_2048', name: '2048达人', description: '在2048游戏中合成出2048方块', icon: 'bi-award-fill' },
            { id: 'play_10', name: '数字迷', description: '玩2048游戏10次', icon: 'bi-controller' }
        ],
        memory: [
            { id: 'first_play', name: '初次尝试', description: '第一次玩记忆翻牌游戏', icon: 'bi-trophy' },
            { id: 'perfect_match', name: '完美记忆', description: '在记忆翻牌游戏中无错误完成一局', icon: 'bi-award' },
            { id: 'fast_match', name: '闪电记忆', description: '在30秒内完成一局记忆翻牌游戏', icon: 'bi-award-fill' },
            { id: 'play_10', name: '记忆大师', description: '玩记忆翻牌游戏10次', icon: 'bi-controller' }
        ],
        tictactoe: [
            { id: 'first_play', name: '初次尝试', description: '第一次玩井字棋游戏', icon: 'bi-trophy' },
            { id: 'win_ai', name: '战胜电脑', description: '在井字棋游戏中战胜电脑', icon: 'bi-award' },
            { id: 'win_streak_3', name: '连胜王', description: '在井字棋游戏中连胜3局', icon: 'bi-award-fill' },
            { id: 'play_10', name: '井字迷', description: '玩井字棋游戏10次', icon: 'bi-controller' }
        ]
    };
    
    // 获取当前游戏的成就列表
    const currentGameAchievements = gameAchievements[gameId] || [];
    
    if (currentGameAchievements.length === 0) {
        return; // 如果没有为当前游戏定义成就，则退出
    }
    
    // 创建成就容器
    const achievementsContainer = document.createElement('div');
    achievementsContainer.className = 'achievements-container';
    achievementsContainer.innerHTML = `
        <h3>游戏成就</h3>
        <div class="achievements-list"></div>
    `;
    
    // 添加到页面
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.appendChild(achievementsContainer);
    }
    
    // 从本地存储加载成就数据
    const loadAchievements = function() {
        return JSON.parse(localStorage.getItem(`achievements_${gameId}`) || '{}');
    };
    
    // 保存成就数据
    const saveAchievement = function(achievementId) {
        const achievements = loadAchievements();
        
        if (!achievements[achievementId]) {
            achievements[achievementId] = {
                unlocked: true,
                date: new Date().toISOString()
            };
            
            localStorage.setItem(`achievements_${gameId}`, JSON.stringify(achievements));
            
            // 显示成就解锁通知
            showAchievementNotification(achievementId);
            
            return true; // 成就刚刚解锁
        }
        
        return false; // 成就已经解锁过
    };
    
    // 显示成就解锁通知
    const showAchievementNotification = function(achievementId) {
        const achievement = currentGameAchievements.find(a => a.id === achievementId);
        
        if (!achievement) return;
        
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon"><i class="bi ${achievement.icon}"></i></div>
            <div class="achievement-info">
                <div class="achievement-title">成就解锁: ${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 添加显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 自动关闭通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    };
    
    // 更新成就显示
    const updateAchievementsDisplay = function() {
        const achievements = loadAchievements();
        const achievementsList = document.querySelector('.achievements-list');
        
        achievementsList.innerHTML = '';
        
        currentGameAchievements.forEach(achievement => {
            const isUnlocked = achievements[achievement.id] && achievements[achievement.id].unlocked;
            
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon"><i class="bi ${achievement.icon}"></i></div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    ${isUnlocked ? `<div class="achievement-date">解锁于: ${new Date(achievements[achievement.id].date).toLocaleDateString()}</div>` : ''}
                </div>
            `;
            
            achievementsList.appendChild(achievementElement);
        });
    };
    
    // 初始化成就显示
    updateAchievementsDisplay();
    
    // 解锁"初次尝试"成就
    saveAchievement('first_play');
    
    // 更新游戏次数并检查相关成就
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    const currentGame = gameHistory.find(game => game.id === gameId);
    
    if (currentGame && currentGame.playCount >= 10) {
        saveAchievement('play_10');
    }
    
    // 监听游戏结束事件，检查分数相关成就
    window.addEventListener('gameOver', function(e) {
        if (e.detail && e.detail.score) {
            const score = e.detail.score;
            
            // 贪吃蛇游戏特定成就
            if (gameId === 'snake') {
                if (score >= 100) saveAchievement('score_100');
                if (score >= 500) saveAchievement('score_500');
            }
            
            // 2048游戏特定成就
            if (gameId === '2048') {
                // 2048游戏的成就检查通常在游戏内部逻辑中完成
            }
        }
    });
}

/**
 * 加载游戏推荐系统
 */
function loadRecommendationSystem() {
    // 获取游戏ID
    const gameId = window.location.pathname.split('/').pop().replace('.html', '');
    
    // 创建推荐容器
    const recommendationContainer = document.createElement('div');
    recommendationContainer.className = 'recommendation-container';
    recommendationContainer.innerHTML = `
        <h3>推荐游戏</h3>
        <div class="recommendation-list"></div>
    `;
    
    // 添加到页面
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.appendChild(recommendationContainer);
    }
    
    // 游戏数据
    const gamesData = {
        snake: {
            title: '贪吃蛇',
            desc: '经典的贪吃蛇游戏，挑战你的反应速度',
            url: 'snake.html',
            img: 'https://picsum.photos/id/237/400/200'
        },
        '2048': {
            title: '2048',
            desc: '数字合并益智游戏，挑战你的逻辑思维',
            url: '2048.html',
            img: 'https://picsum.photos/id/1/400/200'
        },
        memory: {
            title: '记忆配对',
            desc: '翻转卡片并找到匹配的对子，测试你的记忆力',
            url: 'memory.html',
            img: 'https://picsum.photos/id/20/400/200'
        },
        tictactoe: {
            title: '井字棋',
            desc: '经典的两人对战游戏，谁能先连成一线？',
            url: 'tictactoe.html',
            img: 'https://picsum.photos/id/100/400/200'
        }
    };
    
    // 游戏分类
    const gameCategories = {
        snake: ['休闲', '经典'],
        '2048': ['益智', '数字'],
        memory: ['益智', '记忆力'],
        tictactoe: ['策略', '经典']
    };
    
    // 获取游戏历史
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    
    // 基于历史记录和分类生成推荐
    const generateRecommendations = function() {
        // 如果没有历史记录，推荐所有游戏
        if (gameHistory.length === 0) {
            return Object.keys(gamesData).filter(id => id !== gameId);
        }
        
        // 获取当前游戏的分类
        const currentGameCategories = gameCategories[gameId] || [];
        
        // 计算每个游戏的推荐分数
        const scores = {};
        
        Object.keys(gamesData).forEach(id => {
            if (id === gameId) return; // 跳过当前游戏
            
            scores[id] = 0;
            
            // 基于分类相似度评分
            const categories = gameCategories[id] || [];
            categories.forEach(category => {
                if (currentGameCategories.includes(category)) {
                    scores[id] += 2;
                }
            });
            
            // 基于历史记录评分
            const historyItem = gameHistory.find(item => item.id === id);
            if (historyItem) {
                scores[id] += 1;
            }
        });
        
        // 按分数排序
        return Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    };
    
    // 显示推荐游戏
    const showRecommendations = function() {
        const recommendedGameIds = generateRecommendations();
        const recommendationList = document.querySelector('.recommendation-list');
        
        recommendationList.innerHTML = '';
        
        // 只显示前3个推荐
        recommendedGameIds.slice(0, 3).forEach(id => {
            const game = gamesData[id];
            
            if (!game) return;
            
            const gameElement = document.createElement('div');
            gameElement.className = 'recommendation-item';
            gameElement.innerHTML = `
                <div class="recommendation-img">
                    <img src="${game.img}" alt="${game.title}">
                </div>
                <div class="recommendation-info">
                    <h4>${game.title}</h4>
                    <p>${game.desc}</p>
                    <a href="${game.url}" class="btn btn-primary">开始游戏</a>
                </div>
            `;
            
            recommendationList.appendChild(gameElement);
        });
    };
    
    // 显示推荐
    showRecommendations();
}

/**
 * 加载分析工具
 */
function loadAnalytics() {
    // 获取游戏信息
    const gameId = window.location.pathname.split('/').pop().replace('.html', '');
    const gameName = document.querySelector('h1').textContent || '贪吃蛇游戏';
    
    // 记录页面访问
    const recordPageView = function() {
        const pageViews = JSON.parse(localStorage.getItem('pageViews') || '{}');
        
        if (!pageViews[gameId]) {
            pageViews[gameId] = 0;
        }
        
        pageViews[gameId]++;
        
        localStorage.setItem('pageViews', JSON.stringify(pageViews));
    };
    
    // 记录游戏开始
    const recordGameStart = function() {
        const gameStarts = JSON.parse(localStorage.getItem('gameStarts') || '{}');
        
        if (!gameStarts[gameId]) {
            gameStarts[gameId] = 0;
        }
        
        gameStarts[gameId]++;
        
        localStorage.setItem('gameStarts', JSON.stringify(gameStarts));
    };
    
    // 记录游戏结束
    const recordGameEnd = function(score, duration) {
        const gameEnds = JSON.parse(localStorage.getItem('gameEnds') || '{}');
        
        if (!gameEnds[gameId]) {
            gameEnds[gameId] = [];
        }
        
        gameEnds[gameId].push({
            score: score,
            duration: duration,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('gameEnds', JSON.stringify(gameEnds));
    };
    
    // 记录页面访问
    recordPageView();
    
    // 监听游戏开始事件
    window.addEventListener('gameStart', function() {
        recordGameStart();
    });
    
    // 监听游戏结束事件
    window.addEventListener('gameOver', function(e) {
        if (e.detail) {
            recordGameEnd(e.detail.score, e.detail.duration);
        }
    });
    
    // 发送分析数据到服务器（模拟）
    const sendAnalyticsData = function() {
        console.log('发送分析数据到服务器...');
        // 实际应用中，这里会发送数据到服务器
    };
    
    // 每分钟发送一次分析数据
    setInterval(sendAnalyticsData, 60000);
}
    // 更新评分显示
    const updateRatingDisplay = function(ratingsData) {
        const ratingValue = document.querySelector('.rating-value');
        const ratingCount = document.querySelector('.rating-count');
        
        ratingValue.textContent = ratingsData.average.toFixed(1);
        ratingCount.textContent = `${ratingsData.count} 人评分`;
        
        // 更新星星显示
        stars.forEach((star, index) => {
            if (index < Math.round(ratingsData.average)) {
                star.classList.remove('bi-star');
                star.classList.add('bi-star-fill');
            } else {
                star.classList.remove('bi-star-fill');
                star.classList.add('bi-star');
            }
        });
        
        // 更新评论显示
        const commentsContainer = document.querySelector('.rating-comments');
        commentsContainer.innerHTML = '';
        
        ratingsData.ratings.slice().reverse().forEach(rating => {
            if (rating.comment) {
                const commentElement = document.createElement('div');
                commentElement.className = 'rating-comment-item';
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-username">${rating.username}</span>
                        <span class="comment-rating">
                            ${Array(5).fill(0).map((_, i) => 
                                i < rating.rating ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>'
                            ).join('')}
                        </span>
                        <span class="comment-date">${new Date(rating.date).toLocaleDateString()}</span>
                    </div>
                    <div class="comment-text">${rating.comment}</div>
                `;
                commentsContainer.appendChild(commentElement);
            }
        });
    };
    
    // 初始化评分显示
    const ratingsData = loadRatings();
    updateRatingDisplay(ratingsData);
    
    // 星星鼠标悬停效果
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                } else {
                    s.classList.remove('bi-star-fill');
                    s.classList.add('bi-star');
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach((s, index) => {
                if (index < currentRating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                } else {
                    s.classList.remove('bi-star-fill');
                    s.classList.add('bi-star');
                }
            });
        });
        
        star.addEventListener('click', function() {
            currentRating = parseInt(this.getAttribute('data-rating'));
            
            stars.forEach((s, index) => {
                if (index < currentRating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                } else {
                    s.classList.remove('bi-star-fill');
                    s.classList.add('bi-star');
                }
            });
        });
    });
    
    // 提交评价
    const submitButton = document.querySelector('.submit-rating');
    submitButton.addEventListener('click', function() {
        if (currentRating === 0) {
            alert('请先选择评分星级！');
            return;
        }
        
        const commentText = document.querySelector('.rating-comment textarea').value;
        const updatedRatings = saveRating(currentRating, commentText);
        updateRatingDisplay(updatedRatings);
        
        // 重置评价表单
        document.querySelector('.rating-comment textarea').value = '';
        currentRating = 0;
        stars.forEach(s => {
            s.classList.remove('bi-star-fill');
            s.classList.add('bi-star');
        });
        
        // 显示成功消息
        alert('评价提交成功，感谢您的反馈！');
    });
}

/**
 * 加载排行榜系统
 */
function loadLeaderboard() {
    // 获取游戏ID
    const gameId = window.location.pathname.split('/').pop().replace('.html', '');
    
    // 创建排行榜容器
    const leaderboardContainer = document.createElement('div');
    leaderboardContainer.className = 'leaderboard-container';
    leaderboardContainer.innerHTML = `
        <h3>排行榜</h3>
        <div class="leaderboard-tabs">
            <button class="leaderboard-tab active" data-type="global">全球排行</button>
            <button class="leaderboard-tab" data-type="friends">好友排行</button>
            <button class="leaderboard-tab" data-type="weekly">本周排行</button>
        </div>
        <div class="leaderboard-content">
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>玩家</th>
                        <th>分数</th>
                        <th>日期</th>
                    </tr>
                </thead>
                <tbody id="leaderboard-data">
                    <tr>
                        <td colspan="4" class="leaderboard-empty">暂无排行数据</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="leaderboard-submit">
            <h4>提交你的分数</h4>
            <div class="score-input">
                <input type="number" id="score-input" placeholder="输入你的分数">
                <button id="submit-score">提交分数</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.appendChild(leaderboardContainer);
    }
    
    // 从本地存储加载排行榜数据
    const loadLeaderboardData = function(type = 'global') {
        const leaderboardData = JSON.parse(localStorage.getItem(`leaderboard_${gameId}_${type}`) || '[]');
        return leaderboardData;
    };
    
    // 保存分数到排行榜
    const saveScore = function(score, type = 'global') {
        const leaderboardData = loadLeaderboardData(type);
        const newScore = {
            username: localStorage.getItem('gamePortalUsername') || '匿名用户',
            score: parseInt(score),
            date: new Date().toISOString()
        };
        
        leaderboardData.push(newScore);
        
        // 按分数排序
        leaderboardData.sort((a, b) => b.score - a.score);
        
        // 只保留前100名
        if (leaderboardData.length > 100) {
            leaderboardData.length = 100;
        }
        
        localStorage.setItem(`leaderboard_${gameId}_${type}`, JSON.stringify(leaderboardData));
        
        return leaderboardData;
    };
    
    // 更新排行榜显示
    const updateLeaderboardDisplay = function(type = 'global') {
        const leaderboardData = loadLeaderboardData(type);
        const leaderboardBody = document.getElementById('leaderboard-data');
        
        if (leaderboardData.length === 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="4" class="leaderboard-empty">暂无排行数据</td>
                </tr>
            `;
            return;
        }
        
        leaderboardBody.innerHTML = '';
        
        leaderboardData.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.username}</td>
                <td>${entry.score}</td>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    };
    
    // 初始化排行榜显示
    updateLeaderboardDisplay('global');
    
    // 排行榜标签切换
    const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
    leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            leaderboardTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            updateLeaderboardDisplay(type);
        });
    });
    
    // 提交分数
    const submitScoreButton = document.getElementById('submit-score');
    submitScoreButton.addEventListener('click', function() {
        const scoreInput = document.getElementById('score-input');
        const score = scoreInput.value.trim();
        
        if (!score || isNaN(parseInt(score))) {
            alert('请输入有效的分数！');
            return;
        }
        
        const activeTab = document.querySelector('.leaderboard-tab.active');
        const type = activeTab.getAttribute('data-type');
        
        saveScore(score, type);
        updateLeaderboardDisplay(type);
        
        // 重置输入框
        scoreInput.value = '';
        
        // 显示成功消息
        alert('分数提交成功！');
    });
    
    // 监听游戏结束事件
    window.addEventListener('gameOver', function(e) {
        if (e.detail && e.detail.score) {
            const score = e.detail.score;
            
            // 自动保存分数到所有排行榜
            saveScore(score, 'global');
            saveScore(score, 'friends');
            saveScore(score, 'weekly');
            
            // 更新当前显示的排行榜
            const activeTab = document.querySelector('.leaderboard-tab.active');
            const type = activeTab.getAttribute('data-type');
            updateLeaderboardDisplay(type);
        }
    });
}

/**
 * 加载游戏历史记录
 */
function loadGameHistory() {
    // 获取游戏信息
    const gameId = window.location.pathname.split('/').pop().replace('.html', '');
    const gameName = document.querySelector('h1').textContent || '贪吃蛇游戏';
    
    // 记录游戏访问历史
    const recordGameVisit = function() {
        const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
        
        // 检查是否已存在该游戏的记录
        const existingIndex = gameHistory.findIndex(item => item.id === gameId);
        
        if (existingIndex !== -1) {
            // 更新现有记录
            gameHistory[existingIndex].lastPlayed = new Date().toISOString();
            gameHistory[existingIndex].playCount += 1;
        } else {
            // 添加新记录
            gameHistory.push({
                id: gameId,
                name: gameName,
                url: window.location.href,
                lastPlayed: new Date().toISOString(),
                playCount: 1
            });
        }
        
        // 按最近游玩时间排序
        gameHistory.sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
        
        // 只保留最近的20条记录
        if (gameHistory.length > 20) {
            gameHistory.length = 20;
        }
        
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    };
    
    // 记录当前游戏访问
    recordGameVisit();
    
    // 监听游戏结束事件，记录游戏分数
    window.addEventListener('gameOver', function(e) {
        if (e.detail && e.detail.score) {
            const gameScores = JSON.parse(localStorage.getItem(`gameScores_${gameId}`) || '[]');
            
            gameScores.push({
                score: e.detail.score,
                date: new Date().toISOString()
            });
            
            // 按分数排序
            gameScores.sort((a, b) => b.score - a.score);
            
            // 只保留最近的10条记录
            if (gameScores.length > 10) {
                gameScores.length = 10;
            }
            
            localStorage.setItem(`gameScores_${gameId}`, JSON.stringify(gameScores));
        }
    });
    
    // 创建"继续游戏"按钮
    const createContinueButton = function() {
        const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
        
        // 如果有历史记录且不是当前游戏，显示"继续游戏"按钮
        if (gameHistory.length > 0) {
            const lastGame = gameHistory[0];
            
            if (lastGame.id !== gameId) {
                const continueButton = document.createElement('div');
                continueButton.className = 'continue-game-button';
                continueButton.innerHTML = `
                    <a href="${lastGame.url}" class="btn btn-success">
                        <i class="bi bi-controller"></i> 继续游戏: ${lastGame.name}
                    </a>
                `;
                
                // 添加到页面
                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    gameContainer.appendChild(continueButton);
                }
            }
        }
    };
    
    // 创建"继续游戏"按钮
    createContinueButton();
}

/**
 * 加载成就系统
 */
function loadAchievements() {
    // 获取游戏ID
    const gameId = window.location.pathname.split('/').pop().replace('.html', '');
    
    // 定义游戏成就
    const gameAchievements = {
        snake: [
            { id: 'first_play', name: '初次尝试', description: '第一次玩贪吃蛇游戏', icon: 'bi-trophy' },
            { id: 'score_100', name: '小有成就', description: '在贪吃蛇游戏中获得100分', icon: 'bi-award' },
            { id: 'score_500', name: '蛇王', description: '在贪吃蛇游戏中获得500分', icon: 'bi-award-fill' },
            { id: 'play_10', name: '蛇瘾', description: '玩贪吃蛇游戏10次', icon: 'bi-controller' }
        ],
        '2048': [
            { id: 'first_play', name: '初次尝试', description: '第一次玩2048游戏', icon: 'bi-trophy' },
            { id: 'tile_512', name: '数字高手', description: '在2048游戏中合成出512方块', icon: 'bi-award' },
            { id: 'tile_2048', name: '2048达人', description: '在2048游戏中合成出2048方块', icon: 'bi-award-fill' },
            { id: 'play_10', name: '数字迷', description: '玩2048游戏10次', icon: 'bi-controller' }
        ],
        memory: [
            { id: 'first_play', name: '初次尝试', description: '第一次玩记忆翻牌游戏', icon: 'bi-trophy' },
            { id: 'perfect_match', name: '完美记忆', description: '在记忆翻牌游戏中无错误完成一局', icon: 'bi-award' },
            { id: 'fast_match', name: '闪电记忆', description: '在30秒内完成一局记忆翻牌游戏', icon: 'bi-award-fill' },
            { id: 'play_10', name: '记忆大师', description: '玩记忆翻牌游戏10次', icon: 'bi-controller' }
        ],
        tictactoe: [
            { id: 'first_play', name: '初次尝试', description: '第一次玩井字棋游戏', icon: 'bi-trophy' },
            { id: 'win_ai', name: '战胜电脑', description: '在井字棋游戏中战胜电脑', icon: 'bi-award' },
            { id: 'win_streak_3', name: '连胜王', description: '在井字棋游戏中连胜3局', icon: 'bi-award-fill' },
            { id: 'play_10', name: '井字迷', description: '玩井字棋游戏10次', icon: 'bi-controller' }
        ]
    };
    
    // 获取当前游戏的成就列表
    const currentGameAchievements = gameAchievements[gameId] || [];
    
    if (currentGameAchievements.length === 0) {
        return; // 如果没有为当前游戏定义成就，则退出
    }
    
    // 创建成就容器
    const achievementsContainer = document.createElement('div');
    achievementsContainer.className = 'achievements-container';
    achievementsContainer.innerHTML = `
        <h3>游戏成就</h3>
        <div class="achievements-list"></div>
    `;
    
    // 添加到页面
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.appendChild(achievementsContainer);
    }
    
    // 从本地存储加载成就数据
    const loadAchievements = function() {
        return JSON.parse(localStorage.getItem(`achievements_${gameId}`) || '{}');
    };
    
    // 保存成就数据
    const saveAchievement = function(achievementId) {
        const achievements = loadAchievements();
        
        if (!achievements[achievementId]) {
            achievements[achievementId] = {
                unlocked: true,
                date: new Date().toISOString()
            };
            
            localStorage.setItem(`achievements_${gameId}`, JSON.stringify(achievements));
            
            // 显示成就解锁通知
            showAchievementNotification(achievementId);
            
            return true; // 成就刚刚解锁
        }
        
        return false; // 成就已经解锁过
    };
    
    // 显示成就解锁通知
    const showAchievementNotification = function(achievementId) {
        const achievement = currentGameAchievements.find(a => a.id === achievementId);
        
        if (!achievement) return;
        
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon"><i class="bi ${achievement.icon}"></i></div>
            <div class="achievement-info">
                <div class="achievement-title">成就解锁: ${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 添加显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 自动关闭通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    };
    
    // 更新成就显示
    const updateAchievementsDisplay = function() {
        const achievements = loadAchievements();
        const achievementsList = document.querySelector('.achievements-list');
        
        achievementsList.innerHTML = '';
        
        currentGameAchievements.forEach(achievement => {
            const isUnlocked = achievements[achievement.id] && achievements[achievement.id].unlocked;
            
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon"><i class="bi ${achievement.icon}"></i></div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    ${isUnlocked ? `<div class="achievement-date">解锁于: ${new Date(achievements[achievement.id].date).toLocaleDateString()}</div>` : ''}
                </div>
            `;
            
            achievementsList.appendChild(achievementElement);
        });
    };
    
    // 初始化成就显示
    updateAchievementsDisplay();
    
    // 解锁"初次尝试"成就
    saveAchievement('first_play');
    
    // 更新游戏次数并检查相关成就
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    const currentGame = gameHistory.find(game => game.id === gameId);
    
    if (currentGame && currentGame.playCount >= 10) {
        saveAchievement('play_10');
    }
    
    // 监听游戏结束事件，检查分数相关成就
    window.addEventListener('gameOver', function(e) {
        if (e.detail && e.detail.score) {
            const score = e.detail.score;
            
            // 贪吃蛇游戏特定成就
            if (gameId === 'snake') {
                if (score >= 100) saveAchievement('score_100');
                if (score >= 500) saveAchievement('score_500');
            }