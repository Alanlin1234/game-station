/**
 * 游戏成就系统
 * 允许用户解锁游戏成就
 */

const AchievementSystem = (function() {
    // 配置
    const config = {
        storagePrefix: 'gameAchievements_',
        notificationDuration: 5000, // 通知显示时间（毫秒）
        syncWithCloud: false, // 是否与云端同步
        apiEndpoint: '/api/achievements' // 如果有后端API
    };

    // 成就定义
    const achievementDefinitions = {
        'snake': [
            {
                id: 'snake_beginner',
                name: '新手上路',
                description: '在贪吃蛇游戏中首次得分达到10分',
                icon: 'bi-egg',
                condition: (stats) => stats.score >= 10,
                points: 10
            },
            {
                id: 'snake_intermediate',
                name: '小有成就',
                description: '在贪吃蛇游戏中得分达到50分',
                icon: 'bi-award',
                condition: (stats) => stats.score >= 50,
                points: 20
            },
            {
                id: 'snake_advanced',
                name: '蛇王',
                description: '在贪吃蛇游戏中得分达到100分',
                icon: 'bi-trophy',
                condition: (stats) => stats.score >= 100,
                points: 50
            },
            {
                id: 'snake_master',
                name: '蛇神',
                description: '在贪吃蛇游戏中得分达到200分',
                icon: 'bi-trophy-fill',
                condition: (stats) => stats.score >= 200,
                points: 100
            },
            {
                id: 'snake_speed',
                name: '闪电蛇',
                description: '在专家难度下获得50分',
                icon: 'bi-lightning',
                condition: (stats) => stats.score >= 50 && stats.difficulty === 'expert',
                points: 75
            },
            {
                id: 'snake_addict',
                name: '蛇瘾',
                description: '玩贪吃蛇游戏超过10次',
                icon: 'bi-controller',
                condition: (stats) => stats.playCount >= 10,
                points: 30
            }
        ],
        '2048': [
            {
                id: '2048_beginner',
                name: '数字新手',
                description: '在2048游戏中首次达到256',
                icon: 'bi-123',
                condition: (stats) => stats.maxTile >= 256,
                points: 10
            },
            {
                id: '2048_intermediate',
                name: '数字达人',
                description: '在2048游戏中达到1024',
                icon: 'bi-calculator',
                condition: (stats) => stats.maxTile >= 1024,
                points: 30
            },
            {
                id: '2048_advanced',
                name: '数字大师',
                description: '在2048游戏中达到2048',
                icon: 'bi-trophy',
                condition: (stats) => stats.maxTile >= 2048,
                points: 100
            },
            {
                id: '2048_master',
                name: '数字王者',
                description: '在2048游戏中达到4096',
                icon: 'bi-trophy-fill',
                condition: (stats) => stats.maxTile >= 4096,
                points: 200
            }
        ],
        'memory': [
            {
                id: 'memory_beginner',
                name: '记忆新手',
                description: '完成一局记忆配对游戏',
                icon: 'bi-puzzle',
                condition: (stats) => stats.gamesCompleted >= 1,
                points: 10
            },
            {
                id: 'memory_fast',
                name: '快速记忆',
                description: '在30秒内完成一局记忆配对游戏',
                icon: 'bi-stopwatch',
                condition: (stats) => stats.fastestTime <= 30,
                points: 50
            },
            {
                id: 'memory_perfect',
                name: '完美记忆',
                description: '无错误完成一局记忆配对游戏',
                icon: 'bi-check-circle',
                condition: (stats) => stats.perfectGames >= 1,
                points: 75
            }
        ],
        'tictactoe': [
            {
                id: 'tictactoe_winner',
                name: '井字获胜者',
                description: '在井字棋游戏中获胜',
                icon: 'bi-x-lg',
                condition: (stats) => stats.wins >= 1,
                points: 10
            },
            {
                id: 'tictactoe_master',
                name: '井字大师',
                description: '在井字棋游戏中获胜10次',
                icon: 'bi-trophy',
                condition: (stats) => stats.wins >= 10,
                points: 50
            },
            {
                id: 'tictactoe_unbeatable',
                name: '无敌玩家',
                description: '在困难模式下战胜AI',
                icon: 'bi-robot',
                condition: (stats) => stats.hardModeWins >= 1,
                points: 100
            }
        ],
        // 通用成就
        'general': [
            {
                id: 'general_explorer',
                name: '游戏探索者',
                description: '玩过至少3种不同的游戏',
                icon: 'bi-globe',
                condition: (stats) => stats.uniqueGamesPlayed >= 3,
                points: 20
            },
            {
                id: 'general_addict',
                name: '游戏成瘾',
                description: '总游戏时间超过1小时',
                icon: 'bi-hourglass',
                condition: (stats) => stats.totalPlayTime >= 3600,
                points: 30
            },
            {
                id: 'general_social',
                name: '社交玩家',
                description: '分享游戏至少3次',
                icon: 'bi-share',
                condition: (stats) => stats.shareCount >= 3,
                points: 15
            }
        ]
    };

    // 私有方法
    function getStorageKey(key) {
        return `${config.storagePrefix}${key}`;
    }

    function getUserId() {
        // 获取或创建用户ID
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    function getGameIdFromUrl() {
        // 从URL获取游戏ID
        const path = window.location.pathname;
        const gameMatch = path.match(/\/games\/([^\/]+)\.html/);
        return gameMatch ? gameMatch[1] : null;
    }

    function getUnlockedAchievements() {
        return JSON.parse(localStorage.getItem(getStorageKey('unlocked')) || '{}');
    }

    function saveUnlockedAchievement(achievementId) {
        const unlockedAchievements = getUnlockedAchievements();
        
        if (!unlockedAchievements[achievementId]) {
            unlockedAchievements[achievementId] = {
                unlockedAt: new Date().toISOString()
            };
            
            localStorage.setItem(getStorageKey('unlocked'), JSON.stringify(unlockedAchievements));
            
            // 同步到服务器
            if (config.syncWithCloud) {
                syncWithServer({
                    type: 'achievement',
                    userId: getUserId(),
                    achievementId: achievementId,
                    unlockedAt: unlockedAchievements[achievementId].unlockedAt
                });
            }
            
            return true;
        }
        
        return false;
    }

    function syncWithServer(data) {
        if (!config.syncWithCloud) return Promise.resolve();
        
        return fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json());
    }

    function showNotification(achievement) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <i class="bi ${achievement.icon} text-warning"></i>
                <div>
                    <h6>成就解锁！</h6>
                    <p>${achievement.name}</p>
                    <small>${achievement.description}</small>
                </div>
                <button type="button" class="btn-close ms-3"></button>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 215, 0, 0.9);
                color: #000;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                transition: opacity 0.5s;
                animation: slideIn 0.5s forwards;
                max-width: 300px;
            }
            
            .achievement-notification-content {
                display: flex;
                align-items: center;
            }
            
            .achievement-notification i {
                font-size: 2rem;
                margin-right: 10px;
            }
            
            .achievement-notification h6 {
                margin: 0;
                font-weight: bold;
            }
            
            .achievement-notification p {
                margin: 0;
                font-weight: bold;
            }
            
            .achievement-notification small {
                display: block;
                margin-top: 5px;
                opacity: 0.8;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); }
                to { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 关闭按钮
        const closeBtn = notification.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        });
        
        // 自动关闭
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, config.notificationDuration);
    }

    function updateAchievementDisplay() {
        const achievementsContainer = document.getElementById('achievementsList');
        if (!achievementsContainer) return;
        
        const gameId = getGameIdFromUrl();
        if (!gameId || !achievementDefinitions[gameId]) return;
        
        const achievements = achievementDefinitions[gameId];
        const unlockedAchievements = getUnlockedAchievements();
        
        // 清空容器
        achievementsContainer.innerHTML = '';
        
        // 显示成就
        achievements.forEach(achievement => {
            const isUnlocked = unlockedAchievements[achievement.id];
            
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-item';
            achievementElement.innerHTML = `
                <div class="achievement-icon ${isUnlocked ? 'unlocked' : 'locked'}" id="achievement-${achievement.id}">
                    <i class="bi ${isUnlocked ? achievement.icon : 'bi-lock'}"></i>
                </div>
                <div>
                    <h6 class="mb-0">${achievement.name}</h6>
                    <small class="text-muted">${achievement.description}</small>
                </div>
            `;
            
            achievementsContainer.appendChild(achievementElement);
        });
    }

    function getUserStats() {
        // 获取用户统计数据
        const gameId = getGameIdFromUrl();
        
        // 游戏特定统计
        let gameStats = {};
        
        if (gameId) {
            // 从GameHistory获取游戏统计
            if (window.GameHistory) {
                const historyStats = window.GameHistory.getGameStats(gameId);
                if (historyStats) {
                    gameStats = {
                        ...historyStats,
                        playCount: historyStats.totalSessions
                    };
                }
            }
            
            // 从本地存储获取游戏特定统计
            const savedStats = JSON.parse(localStorage.getItem(getStorageKey(`stats_${gameId}`)) || '{}');
            gameStats = { ...gameStats, ...savedStats };
        }
        
        // 通用统计
        const generalStats = JSON.parse(localStorage.getItem(getStorageKey('generalStats')) || '{}');
        
        // 合并统计
        return { ...generalStats, ...gameStats };
    }

    function updateUserStats(stats) {
        const gameId = getGameIdFromUrl();
        
        if (gameId) {
            // 保存游戏特定统计
            const savedStats = JSON.parse(localStorage.getItem(getStorageKey(`stats_${gameId}`)) || '{}');
            const updatedStats = { ...savedStats, ...stats };
            localStorage.setItem(getStorageKey(`stats_${gameId}`), JSON.stringify(updatedStats));
        }
        
        // 更新通用统计
        if (stats.hasOwnProperty('shareCount') || stats.hasOwnProperty('uniqueGamesPlayed') || stats.hasOwnProperty('totalPlayTime')) {
            const generalStats = JSON.parse(localStorage.getItem(getStorageKey('generalStats')) || '{}');
            const updatedGeneralStats = { ...generalStats };
            
            if (stats.hasOwnProperty('shareCount')) {
                updatedGeneralStats.shareCount = (generalStats.shareCount || 0) + 1;
            }
            
            if (stats.hasOwnProperty('uniqueGamesPlayed') && gameId) {
                const playedGames = new Set(generalStats.playedGames || []);
                playedGames.add(gameId);
                updatedGeneralStats.playedGames = Array.from(playedGames);
                updatedGeneralStats.uniqueGamesPlayed = playedGames.size;
            }
            
            if (stats.hasOwnProperty('totalPlayTime')) {
                updatedGeneralStats.totalPlayTime = (generalStats.totalPlayTime || 0) + stats.totalPlayTime;
            }
            
            localStorage.setItem(getStorageKey('generalStats'), JSON.stringify(updatedGeneralStats));
        }
    }

    function checkAchievements(stats) {
        const gameId = getGameIdFromUrl();
        const unlockedAchievements = getUnlockedAchievements();
        const newlyUnlocked = [];
        
        // 检查游戏特定成就
        if (gameId && achievementDefinitions[gameId]) {
            achievementDefinitions[gameId].forEach(achievement => {
                if (!unlockedAchievements[achievement.id] && achievement.condition(stats)) {
                    if (saveUnlockedAchievement(achievement.id)) {
                        newlyUnlocked.push(achievement);
                    }
                }
            });
        }
        
        // 检查通用成就
        achievementDefinitions.general.forEach(achievement => {
            if (!unlockedAchievements[achievement.id] && achievement.condition(stats)) {
                if (saveUnlockedAchievement(achievement.id)) {
                    newlyUnlocked.push(achievement);
                }
            }
        });
        
        // 显示通知
        if (newlyUnlocked.length > 0) {
            // 更新显示
            updateAchievementDisplay();
            
            // 显示通知（一次只显示一个）
            showNotification(newlyUnlocked[0]);
            
            // 如果有多个成就，延迟显示
            if (newlyUnlocked.length > 1) {
                let delay = config.notificationDuration;
                
                for (let i = 1; i < newlyUnlocked.length; i++) {
                    setTimeout(() => {
                        showNotification(newlyUnlocked[i]);
                    }, delay);
                    
                    delay += config.notificationDuration;
                }
            }
        }
        
        return newlyUnlocked;
    }

    // 公共方法
    function init(options = {}) {
        // 合并配置
        Object.assign(config, options);
        
        // 更新成就显示
        updateAchievementDisplay();
        
        // 监听分享事件
        document.addEventListener('click', function(e) {
            const shareButton = e.target.closest('[data-share]');
            if (shareButton) {
                updateUserStats({ shareCount: 1 });
                checkAchievements(getUserStats());
            }
        });
        
        // 如果有GameHistory，监听游戏结束事件
        if (window.GameHistory) {
            const originalEndGame = window.GameHistory.endGame;
            
            window.GameHistory.endGame = function(completed = false) {
                // 调用原始方法
                originalEndGame.call(window.GameHistory, completed);
                
                // 更新统计并检查成就
                const stats = getUserStats();
                checkAchievements(stats);
            };
        }
    }

    function unlockAchievement(achievementId) {
        // 手动解锁成就
        const allAchievements = {};
        
        // 合并所有成就定义
        Object.keys(achievementDefinitions).forEach(gameId => {
            achievementDefinitions[gameId].forEach(achievement => {
                allAchievements[achievement.id] = achievement;
            });
        });
        
        const achievement = allAchievements[achievementId];
        if (!achievement) return false;
        
        if (saveUnlockedAchievement(achievementId)) {
            showNotification(achievement);
            updateAchievementDisplay();
            return true;
        }
        
        return false;
    }

    function updateScore(score, difficulty = 'medium') {
        const gameId = getGameIdFromUrl();
        if (!gameId) return;
        
        // 更新统计
        updateUserStats({
            score: score,
            difficulty: difficulty
        });
        
        // 检查成就
        checkAchievements(getUserStats());
    }

    function getAchievements(gameId = null) {
        if (gameId) {
            return achievementDefinitions[gameId] || [];
        }
        
        // 返回所有成就
        const allAchievements = [];
        
        Object.keys(achievementDefinitions).forEach(gameId => {
            achievementDefinitions[gameId].forEach(achievement => {
                allAchievements.push({
                    ...achievement,
                    gameId: gameId
                });
            });
        });
        
        return allAchievements;
    }

    function getUserAchievements() {
        const unlockedAchievements = getUnlockedAchievements();
        const allAchievements = getAchievements();
        
        return allAchievements.map(achievement => ({
            ...achievement,
            unlocked: !!unlockedAchievements[achievement.id],
            unlockedAt: unlockedAchievements[achievement.id] ? unlockedAchievements[achievement.id].unlockedAt : null
        }));
    }

    function getTotalPoints() {
        const unlockedAchievements = getUnlockedAchievements();
        const allAchievements = getAchievements();
        
        let totalPoints = 0;
        
        allAchievements.forEach(achievement => {
            if (unlockedAchievements[achievement.id]) {
                totalPoints += achievement.points;
            }
        });
        
        return totalPoints;
    }

    function displayAchievements(container, gameId = null) {
        if (!container) return;
        
        const achievements = gameId ? getAchievements(gameId) : getUserAchievements();
        const unlockedAchievements = getUnlockedAchievements();
        
        if (achievements.length === 0) {
            container.innerHTML = '<p class="text-center">暂无成就</p>';
            return;
        }
        
        let html = '';
        
        achievements.forEach(achievement => {
            const isUnlocked = unlockedAchievements[achievement.id];
            
            html += `
                <div class="achievement-item">
                    <div class="achievement-icon ${isUnlocked ? 'unlocked' : 'locked'}">
                        <i class="bi ${isUnlocked ? achievement.icon : 'bi-lock'}"></i>
                    </div>
                    <div>
                        <h6 class="mb-0">${achievement.name}</h6>
                        <small class="text-muted">${achievement.description}</small>
                        ${isUnlocked ? `<div class="small text-success">已解锁 • ${achievement.points}点</div>` : `<div class="small">${achievement.points}点</div>`}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // 公开API
    return {
        init: init,
        unlockAchievement: unlockAchievement,
        updateScore: updateScore,
        getAchievements: getAchievements,
        getUserAchievements: getUserAchievements,
        getTotalPoints: getTotalPoints,
        displayAchievements: displayAchievements
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    AchievementSystem.init();
});

// 全局访问
window.AchievementSystem = AchievementSystem;
