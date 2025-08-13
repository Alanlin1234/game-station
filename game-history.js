/**
 * 游戏历史记录系统
 * 记录用户的游戏历史和进度
 */

const GameHistory = (function() {
    // 配置
    const config = {
        storagePrefix: 'gameHistory_',
        maxHistoryItems: 50,
        syncWithCloud: false, // 是否与云端同步
        apiEndpoint: '/api/history', // 如果有后端API
        autoSaveInterval: 60000 // 自动保存间隔（毫秒）
    };

    // 当前游戏会话
    let currentSession = null;
    let autoSaveTimer = null;

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

    function saveToLocalStorage(data) {
        // 获取现有历史记录
        const history = JSON.parse(localStorage.getItem(getStorageKey('records')) || '[]');
        
        // 添加新记录
        history.unshift(data);
        
        // 限制历史记录数量
        if (history.length > config.maxHistoryItems) {
            history.length = config.maxHistoryItems;
        }
        
        // 保存到本地存储
        localStorage.setItem(getStorageKey('records'), JSON.stringify(history));
        
        // 更新游戏统计
        updateGameStats(data.gameId, data);
    }

    function updateGameStats(gameId, sessionData) {
        // 获取游戏统计
        const allGameStats = JSON.parse(localStorage.getItem(getStorageKey('stats')) || '{}');
        
        // 更新或创建游戏统计
        if (!allGameStats[gameId]) {
            allGameStats[gameId] = {
                totalSessions: 0,
                totalTime: 0,
                highScore: 0,
                lastPlayed: null
            };
        }
        
        const stats = allGameStats[gameId];
        stats.totalSessions++;
        stats.totalTime += sessionData.duration;
        stats.lastPlayed = sessionData.endTime;
        
        if (sessionData.score > stats.highScore) {
            stats.highScore = sessionData.score;
        }
        
        // 保存更新后的统计
        localStorage.setItem(getStorageKey('stats'), JSON.stringify(allGameStats));
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

    function autoSave() {
        if (!currentSession) return;
        
        // 更新持续时间
        const now = new Date();
        currentSession.duration = Math.floor((now - new Date(currentSession.startTime)) / 1000);
        
        // 保存当前会话
        localStorage.setItem(getStorageKey('currentSession'), JSON.stringify(currentSession));
    }

    function getGameIdFromUrl() {
        // 从URL获取游戏ID
        const path = window.location.pathname;
        const gameMatch = path.match(/\/games\/([^\/]+)\.html/);
        return gameMatch ? gameMatch[1] : 'unknown';
    }

    // 公共方法
    function startGame(gameId = null) {
        // 如果没有提供游戏ID，尝试从URL获取
        if (!gameId) {
            gameId = getGameIdFromUrl();
        }
        
        // 结束之前的会话（如果有）
        if (currentSession) {
            endGame();
        }
        
        // 创建新会话
        currentSession = {
            id: 'session_' + Math.random().toString(36).substr(2, 9),
            userId: getUserId(),
            gameId: gameId,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            score: 0,
            completed: false,
            difficulty: getDifficulty()
        };
        
        // 保存当前会话
        localStorage.setItem(getStorageKey('currentSession'), JSON.stringify(currentSession));
        
        // 启动自动保存
        autoSaveTimer = setInterval(autoSave, config.autoSaveInterval);
        
        return currentSession;
    }

    function getDifficulty() {
        // 尝试从页面获取难度设置
        const difficultySelect = document.getElementById('difficultyLevel');
        return difficultySelect ? difficultySelect.value : 'medium';
    }

    function updateScore(score) {
        if (!currentSession) return;
        
        currentSession.score = score;
        autoSave();
    }

    function endGame(completed = false) {
        if (!currentSession) return;
        
        // 停止自动保存
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
        }
        
        // 更新会话数据
        currentSession.endTime = new Date().toISOString();
        currentSession.duration = Math.floor((new Date(currentSession.endTime) - new Date(currentSession.startTime)) / 1000);
        currentSession.completed = completed;
        
        // 保存到历史记录
        saveToLocalStorage(currentSession);
        
        // 同步到服务器
        syncWithServer(currentSession);
        
        // 清除当前会话
        localStorage.removeItem(getStorageKey('currentSession'));
        currentSession = null;
    }

    function saveGameProgress(gameId, progressData) {
        // 保存游戏进度
        const allProgress = JSON.parse(localStorage.getItem(getStorageKey('progress')) || '{}');
        
        allProgress[gameId] = {
            ...progressData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(getStorageKey('progress'), JSON.stringify(allProgress));
        
        // 同步到服务器
        if (config.syncWithCloud) {
            syncWithServer({
                type: 'progress',
                userId: getUserId(),
                gameId: gameId,
                data: progressData
            });
        }
    }

    function loadGameProgress(gameId) {
        // 加载游戏进度
        const allProgress = JSON.parse(localStorage.getItem(getStorageKey('progress')) || '{}');
        return allProgress[gameId] || null;
    }

    function getHistory(limit = null) {
        // 获取历史记录
        const history = JSON.parse(localStorage.getItem(getStorageKey('records')) || '[]');
        
        if (limit && limit > 0) {
            return history.slice(0, limit);
        }
        
        return history;
    }

    function getGameStats(gameId = null) {
        // 获取游戏统计
        const allGameStats = JSON.parse(localStorage.getItem(getStorageKey('stats')) || '{}');
        
        if (gameId) {
            return allGameStats[gameId] || null;
        }
        
        return allGameStats;
    }

    function clearHistory() {
        // 清除历史记录
        localStorage.removeItem(getStorageKey('records'));
        
        // 同步到服务器
        if (config.syncWithCloud) {
            syncWithServer({
                type: 'clearHistory',
                userId: getUserId()
            });
        }
    }

    function resumeSession() {
        // 恢复之前的会话（如果有）
        const savedSession = localStorage.getItem(getStorageKey('currentSession'));
        
        if (savedSession) {
            currentSession = JSON.parse(savedSession);
            
            // 检查是否是同一个游戏
            const currentGameId = getGameIdFromUrl();
            
            if (currentSession.gameId === currentGameId) {
                // 更新开始时间（如果会话已经很旧）
                const now = new Date();
                const sessionStart = new Date(currentSession.startTime);
                
                // 如果会话超过1小时，重新开始
                if ((now - sessionStart) > 3600000) {
                    return startGame(currentGameId);
                }
                
                // 启动自动保存
                autoSaveTimer = setInterval(autoSave, config.autoSaveInterval);
                
                return currentSession;
            } else {
                // 不是同一个游戏，结束之前的会话
                endGame();
                return startGame(currentGameId);
            }
        }
        
        return null;
    }

    function init(options = {}) {
        // 合并配置
        Object.assign(config, options);
        
        // 尝试恢复会话
        resumeSession();
        
        // 添加页面卸载事件
        window.addEventListener('beforeunload', function() {
            // 自动保存当前会话
            if (currentSession) {
                autoSave();
            }
        });
        
        // 显示历史记录（如果有容器）
        const historyContainer = document.getElementById('gameHistoryContainer');
        if (historyContainer) {
            displayHistory(historyContainer);
        }
    }

    function displayHistory(container, limit = 5) {
        if (!container) return;
        
        const history = getHistory(limit);
        
        if (history.length === 0) {
            container.innerHTML = '<p class="text-center">暂无游戏历史记录</p>';
            return;
        }
        
        let historyHtml = '<ul class="list-group">';
        
        history.forEach(session => {
            const date = new Date(session.startTime);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            historyHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${session.gameId}</strong>
                        <small class="d-block text-muted">${formattedDate}</small>
                    </div>
                    <div>
                        <span class="badge bg-primary rounded-pill">得分: ${session.score}</span>
                        <span class="badge bg-secondary rounded-pill">时长: ${formatDuration(session.duration)}</span>
                    </div>
                </li>
            `;
        });
        
        historyHtml += '</ul>';
        container.innerHTML = historyHtml;
    }

    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes === 0) {
            return `${remainingSeconds}秒`;
        }
        
        return `${minutes}分${remainingSeconds}秒`;
    }

    // 公开API
    return {
        init: init,
        startGame: startGame,
        endGame: endGame,
        updateScore: updateScore,
        saveGameProgress: saveGameProgress,
        loadGameProgress: loadGameProgress,
        getHistory: getHistory,
        getGameStats: getGameStats,
        clearHistory: clearHistory,
        displayHistory: displayHistory
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    GameHistory.init();
});

// 全局访问
window.GameHistory = GameHistory;