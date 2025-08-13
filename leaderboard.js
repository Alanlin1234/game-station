/**
 * 游戏排行榜系统
 * 显示各个游戏的最高分和最佳玩家
 */

class LeaderboardSystem {
    constructor() {
        this.leaderboards = this.loadLeaderboards();
        this.currentUser = this.getCurrentUser();
        this.initLeaderboardSystem();
    }

    // 初始化排行榜系统
    initLeaderboardSystem() {
        // 创建排行榜按钮
        this.createLeaderboardButtons();
        
        // 创建排行榜模态框
        this.createLeaderboardModal();
    }

    // 创建排行榜按钮
    createLeaderboardButtons() {
        // 为每个游戏卡片添加排行榜按钮
        document.querySelectorAll('.game-card').forEach(card => {
            const gameKey = card.getAttribute('data-game');
            if (!gameKey) return;
            
            // 检查是否已有排行榜按钮
            if (card.querySelector('.leaderboard-btn')) return;
            
            // 创建排行榜按钮
            const leaderboardBtn = document.createElement('button');
            leaderboardBtn.className = 'action-btn leaderboard-btn';
            leaderboardBtn.innerHTML = '<i class="fas fa-trophy"></i> 排行榜';
            leaderboardBtn.setAttribute('data-game', gameKey);
            
            // 添加点击事件
            leaderboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showLeaderboard(gameKey);
            });
            
            // 添加到游戏卡片
            const gameContent = card.querySelector('.game-content');
            if (gameContent) {
                const playBtn = gameContent.querySelector('.play-game-btn');
                if (playBtn) {
                    playBtn.parentNode.insertBefore(leaderboardBtn, playBtn.nextSibling);
                } else {
                    gameContent.appendChild(leaderboardBtn);
                }
            }
        });
        
        // 为当前游戏添加排行榜按钮
        const gameActions = document.querySelector('.game-actions');
        if (gameActions && !gameActions.querySelector('.leaderboard-btn')) {
            const leaderboardBtn = document.createElement('button');
            leaderboardBtn.className = 'action-btn';
            leaderboardBtn.innerHTML = '<i class="fas fa-trophy"></i> 排行榜';
            
            leaderboardBtn.addEventListener('click', () => {
                const gameFrame = document.getElementById('game-frame');
                const gameUrl = gameFrame.src;
                const gameKey = this.getGameKeyFromUrl(gameUrl);
                if (gameKey) {
                    this.showLeaderboard(gameKey);
                }
            });
            
            gameActions.appendChild(leaderboardBtn);
        }
    }

    // 创建排行榜模态框
    createLeaderboardModal() {
        // 检查是否已存在排行榜模态框
        if (document.getElementById('leaderboardModal')) return;
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'leaderboard-modal';
        modal.id = 'leaderboardModal';
        modal.innerHTML = `
            <div class="leaderboard-modal-content">
                <span class="close-modal">&times;</span>
                <h3 id="leaderboard-title">游戏排行榜</h3>
                
                <div class="leaderboard-tabs">
                    <div class="leaderboard-tab active" data-tab="global">全球排行</div>
                    <div class="leaderboard-tab" data-tab="friends">好友排行</div>
                    <div class="leaderboard-tab" data-tab="weekly">本周排行</div>
                </div>
                
                <div class="leaderboard-content active" id="global-leaderboard">
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>玩家</th>
                                <th>分数</th>
                                <th>日期</th>
                            </tr>
                        </thead>
                        <tbody id="global-leaderboard-body">
                            <!-- 由JavaScript动态填充 -->
                        </tbody>
                    </table>
                </div>
                
                <div class="leaderboard-content" id="friends-leaderboard">
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>好友</th>
                                <th>分数</th>
                                <th>日期</th>
                            </tr>
                        </thead>
                        <tbody id="friends-leaderboard-body">
                            <!-- 由JavaScript动态填充 -->
                        </tbody>
                    </table>
                </div>
                
                <div class="leaderboard-content" id="weekly-leaderboard">
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>玩家</th>
                                <th>分数</th>
                                <th>日期</th>
                            </tr>
                        </thead>
                        <tbody id="weekly-leaderboard-body">
                            <!-- 由JavaScript动态填充 -->
                        </tbody>
                    </table>
                </div>
                
                <div class="your-rank" id="your-rank">
                    <!-- 由JavaScript动态填充 -->
                </div>
                
                <div class="leaderboard-login-prompt" style="display:none;">
                    <p>请先<a href="#" id="leaderboard-login-link">登录</a>后查看您的排名</p>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .leaderboard-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.7);
                overflow: auto;
            }
            
            .leaderboard-modal-content {
                background-color: white;
                margin: 10% auto;
                padding: 2rem;
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                position: relative;
            }
            
            .close-modal {
                position: absolute;
                top: 1rem;
                right: 1.5rem;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
            }
            
            .leaderboard-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
                margin: 1.5rem 0;
            }
            
            .leaderboard-tab {
                padding: 0.8rem 1.5rem;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                font-weight: 500;
            }
            
            .leaderboard-tab.active {
                border-bottom-color: var(--primary);
                color: var(--primary);
            }
            
            .leaderboard-content {
                display: none;
            }
            
            .leaderboard-content.active {
                display: block;
            }
            
            .leaderboard-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 1.5rem;
            }
            
            .leaderboard-table th,
            .leaderboard-table td {
                padding: 0.8rem;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            
            .leaderboard-table th {
                font-weight: 600;
                color: var(--dark);
            }
            
            .leaderboard-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            
            .leaderboard-table tr.highlight {
                background-color: #f0f7ff;
                font-weight: 500;
            }
            
            .your-rank {
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1.5rem;
                font-weight: 500;
            }
            
            .rank-1 {
                color: gold;
            }
            
            .rank-2 {
                color: silver;
            }
            
            .rank-3 {
                color: #cd7f32;
            }
            
            .leaderboard-btn {
                margin-top: 0.5rem;
            }
            
            @media (max-width: 768px) {
                .leaderboard-modal-content {
                    width: 95%;
                    margin: 5% auto;
                    padding: 1.5rem;
                }
                
                .leaderboard-table th,
                .leaderboard-table td {
                    padding: 0.5rem;
                    font-size: 0.9rem;
                }
            }
        `;
        
        // 添加到文档
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // 关闭模态框
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // 标签切换
        const tabs = modal.querySelectorAll('.leaderboard-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有标签的活动状态
                tabs.forEach(t => t.classList.remove('active'));
                // 添加当前标签的活动状态
                this.classList.add('active');
                
                // 显示对应的内容
                const tabId = this.getAttribute('data-tab');
                const tabContents = document.querySelectorAll('.leaderboard-content');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabId}-leaderboard`).classList.add('active');
            });
        });
        
        // 登录链接
        const loginLink = document.getElementById('leaderboard-login-link');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'none';
                
                // 显示登录模态框
                if (window.UserAuth && typeof window.UserAuth.showLoginModal === 'function') {
                    window.UserAuth.showLoginModal();
                }
            });
        }
    }

    // 显示排行榜
    showLeaderboard(gameKey) {
        const modal = document.getElementById('leaderboardModal');
        if (!modal) return;
        
        // 设置游戏标题
        const gameTitle = this.getGameTitle(gameKey);
        document.getElementById('leaderboard-title').textContent = `${gameTitle} 排行榜`;
        
        // 加载排行榜数据
        this.loadLeaderboardData(gameKey);
        
        // 显示模态框
        modal.style.display = 'block';
    }

    // 加载排行榜数据
    loadLeaderboardData(gameKey) {
        // 获取排行榜数据
        const leaderboard = this.getGameLeaderboard(gameKey);
        
        // 加载全球排行榜
        this.loadLeaderboardTable('global', leaderboard.global);
        
        // 加载好友排行榜
        this.loadLeaderboardTable('friends', leaderboard.friends);
        
        // 加载本周排行榜
        this.loadLeaderboardTable('weekly', leaderboard.weekly);
        
        // 显示用户排名
        this.showUserRank(gameKey);
    }

    // 加载排行榜表格
    loadLeaderboardTable(type, data) {
        const tableBody = document.getElementById(`${type}-leaderboard-body`);
        if (!tableBody) return;
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 如果没有数据，显示提示
        if (!data || data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" style="text-align:center;">暂无排行数据</td>`;
            tableBody.appendChild(row);
            return;
        }
        
        // 添加排行数据
        data.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // 如果是当前用户，高亮显示
            if (this.currentUser && entry.userId === this.currentUser.id) {
                row.className = 'highlight';
            }
            
            // 设置排名样式
            let rankClass = '';
            if (index === 0) rankClass = 'rank-1';
            else if (index === 1) rankClass = 'rank-2';
            else if (index === 2) rankClass = 'rank-3';
            
            row.innerHTML = `
                <td><span class="${rankClass}">${index + 1}</span></td>
                <td>${entry.username}</td>
                <td>${entry.score}</td>
                <td>${this.formatDate(entry.date)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    // 显示用户排名
    showUserRank(gameKey) {
        const yourRankElement = document.getElementById('your-rank');
        const loginPrompt = document.querySelector('.leaderboard-login-prompt');
        
        // 检查是否已登录
        if (!this.currentUser) {
            yourRankElement.style.display = 'none';
            loginPrompt.style.display = 'block';
            return;
        }
        
        yourRankElement.style.display = 'block';
        loginPrompt.style.display = 'none';
        
        // 获取用户排名
        const userRank = this.getUserRank(gameKey);
        
        if (userRank) {
            yourRankElement.innerHTML = `
                <strong>您的排名：</strong> 第 ${userRank.rank} 名
                <span style="margin-left:1rem;">最高分：${userRank.score}</span>
                <span style="margin-left:1rem;">日期：${this.formatDate(userRank.date)}</span>
            `;
        } else {
            yourRankElement.innerHTML = `
                <strong>您尚未上榜</strong>
                <span style="margin-left:1rem;">开始游戏，创造您的最高分！</span>
            `;
        }
    }

    // 提交分数
    submitScore(gameKey, score) {
        // 检查是否已登录
        if (!this.currentUser) return;
        
        // 检查分数是否有效
        if (!score || isNaN(score) || score <= 0) return;
        
        // 创建分数记录
        const scoreRecord = {
            userId: this.currentUser.id,
            username: this.currentUser.username,
            score: score,
            date: new Date().toISOString()
        };
        
        // 初始化游戏排行榜
        if (!this.leaderboards[gameKey]) {
            this.leaderboards[gameKey] = {
                global: [],
                friends: [],
                weekly: []
            };
        }
        
        // 更新全球排行榜
        this.updateLeaderboard(this.leaderboards[gameKey].global, scoreRecord);
        
        // 更新本周排行榜
        this.updateLeaderboard(this.leaderboards[gameKey].weekly, scoreRecord, true);
        
        // 更新好友排行榜（如果有好友系统）
        if (this.currentUser.friends) {
            this.updateFriendsLeaderboard(gameKey, scoreRecord);
        }
        
        // 保存排行榜数据
        this.saveLeaderboards();
        
        // 记录分析事件
        this.trackLeaderboardEvent(gameKey, score);
    }

    // 更新排行榜
    updateLeaderboard(leaderboard, scoreRecord, weeklyOnly = false) {
        // 如果是本周排行榜，过滤掉一周前的记录
        if (weeklyOnly) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            leaderboard = leaderboard.filter(record => {
                return new Date(record.date) >= oneWeekAgo;
            });
        }
        
        // 检查用户是否已有记录
        const existingIndex = leaderboard.findIndex(record => record.userId === scoreRecord.userId);
        
        if (existingIndex !== -1) {
            // 如果新分数更高，更新记录
            if (scoreRecord.score > leaderboard[existingIndex].score) {
                leaderboard[existingIndex] = scoreRecord;
            }
        } else {
            // 添加新记录
            leaderboard.push(scoreRecord);
        }
        
        // 按分数排序
        leaderboard.sort((a, b) => b.score - a.score);
        
        // 限制排行榜长度
        if (leaderboard.length > 100) {
            leaderboard = leaderboard.slice(0, 100);
        }
        
        return leaderboard;
    }

    // 更新好友排行榜
    updateFriendsLeaderboard(gameKey, scoreRecord) {
        // 获取好友ID列表
        const friendIds = this.currentUser.friends || [];
        
        // 如果没有好友，只添加自己
        if (friendIds.length === 0) {
            this.leaderboards[gameKey].friends = [scoreRecord];
            return;
        }
        
        // 获取好友分数记录
        const friendScores = this.leaderboards[gameKey].global.filter(record => {
            return record.userId === this.currentUser.id || friendIds.includes(record.userId);
        });
        
        // 更新好友排行榜
        this.leaderboards[gameKey].friends = friendScores.sort((a, b) => b.score - a.score);
    }

    // 获取游戏排行榜
    getGameLeaderboard(gameKey) {
        if (!this.leaderboards[gameKey]) {
            return {
                global: [],
                friends: [],
                weekly: []
            };
        }
        
        // 过滤本周排行榜
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weekly = this.leaderboards[gameKey].weekly.filter(record => {
            return new Date(record.date) >= oneWeekAgo;
        });
        
        return {
            global: this.leaderboards[gameKey].global || [],
            friends: this.leaderboards[gameKey].friends || [],
            weekly: weekly
        };
    }

    // 获取用户排名
    getUserRank(gameKey) {
        if (!this.currentUser || !this.leaderboards[gameKey]) return null;
        
        // 在全球排行榜中查找用户记录
        const globalIndex = this.leaderboards[gameKey].global.findIndex(record => record.userId === this.currentUser.id);
        
        if (globalIndex !== -1) {
            const record = this.leaderboards[gameKey].global[globalIndex];
            return {
                rank: globalIndex + 1,
                score: record.score,
                date: record.date
            };
        }
        
        return null;
    }

    // 获取游戏标题
    getGameTitle(gameKey) {
        // 从游戏数据中获取标题
        if (window.gamesData && window.gamesData[gameKey]) {
            return window.gamesData[gameKey].title;
        }
        
        // 从游戏卡片中获取标题
        const gameCard = document.querySelector(`.game-card[data-game="${gameKey}"]`);
        if (gameCard) {
            const titleElement = gameCard.querySelector('.game-title');
            if (titleElement) {
                return titleElement.textContent;
            }
        }
        
        // 默认标题
        return '游戏';
    }

    // 从URL获取游戏键
    getGameKeyFromUrl(url) {
        // 从游戏数据中查找匹配的URL
        if (window.gamesData) {
            for (const key in window.gamesData) {
                if (window.gamesData[key].url === url) {
                    return key;
                }
            }
        }
        
        // 从URL中提取游戏名称
        const match = url.match(/\/([^\/]+)\.html$/);
        if (match) {
            return match[1];
        }
        
        return null;
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 加载排行榜数据
    loadLeaderboards() {
        try {
            const leaderboardsData = localStorage.getItem('gameLeaderboards');
            return leaderboardsData ? JSON.parse(leaderboardsData) : {};
        } catch (error) {
            console.error('Failed to load leaderboards:', error);
            return {};
        }
    }

    // 保存排行榜数据
    saveLeaderboards() {
        try {
            localStorage.setItem('gameLeaderboards', JSON.stringify(this.leaderboards));
        } catch (error) {
            console.error('Failed to save leaderboards:', error);
        }
    }

    // 获取当前用户
    getCurrentUser() {
        if (window.UserAuth && window.UserAuth.currentUser) {
            return window.UserAuth.currentUser;
        }
        return null;
    }

    // 跟踪排行榜事件
    trackLeaderboardEvent(gameKey, score) {
        if (window.Analytics) {
            window.Analytics.trackEvent('leaderboard_score', {
                game: gameKey,
                score: score,
                timestamp: new Date().toISOString()
            });
        }
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.LeaderboardSystem = new LeaderboardSystem();
});