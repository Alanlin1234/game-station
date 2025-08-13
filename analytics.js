/**
 * 游戏数据分析工具
 * 跟踪用户行为和游戏数据
 */

const GameAnalytics = (function() {
    // 配置
    const config = {
        storagePrefix: 'gameAnalytics_',
        sendToServer: false, // 是否发送到服务器
        apiEndpoint: '/api/analytics',
        sessionTimeout: 30 * 60 * 1000, // 会话超时时间（毫秒）
        samplingRate: 1.0, // 采样率（0-1）
        anonymizeIp: true, // 是否匿名化IP
        trackClicks: true, // 是否跟踪点击
        trackPageViews: true, // 是否跟踪页面浏览
        trackGameEvents: true // 是否跟踪游戏事件
    };

    // 当前会话
    let sessionId = null;
    let sessionStartTime = null;
    let lastActivityTime = null;
    let pageViewCount = 0;
    let eventCount = 0;

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

    function getClientInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer || null
        };
    }

    function startSession() {
        // 创建新会话
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        sessionStartTime = new Date();
        lastActivityTime = sessionStartTime;
        pageViewCount = 0;
        eventCount = 0;
        
        // 保存会话信息
        localStorage.setItem(getStorageKey('currentSession'), JSON.stringify({
            id: sessionId,
            startTime: sessionStartTime.toISOString(),
            clientInfo: getClientInfo()
        }));
        
        // 记录会话开始事件
        trackEvent('session_start', {
            referrer: document.referrer || null,
            landingPage: window.location.href
        });
    }

    function resumeSession() {
        // 尝试恢复会话
        const savedSession = localStorage.getItem(getStorageKey('currentSession'));
        
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                const lastActivity = localStorage.getItem(getStorageKey('lastActivity'));
                
                if (lastActivity) {
                    const now = new Date();
                    const lastActivityTime = new Date(lastActivity);
                    
                    // 如果会话未超时，恢复会话
                    if ((now - lastActivityTime) < config.sessionTimeout) {
                        sessionId = session.id;
                        sessionStartTime = new Date(session.startTime);
                        return true;
                    }
                }
            } catch (e) {
                console.error('Error resuming analytics session:', e);
            }
        }
        
        // 无法恢复会话，创建新会话
        startSession();
        return false;
    }

    function updateActivity() {
        lastActivityTime = new Date();
        localStorage.setItem(getStorageKey('lastActivity'), lastActivityTime.toISOString());
    }

    function sendToServer(eventData) {
        if (!config.sendToServer) return Promise.resolve();
        
        return fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        }).catch(error => {
            console.error('Error sending analytics data:', error);
        });
    }

    function saveLocally(eventType, eventData) {
        try {
            // 获取现有事件
            const events = JSON.parse(localStorage.getItem(getStorageKey('events')) || '[]');
            
            // 添加新事件
            events.push({
                type: eventType,
                data: eventData,
                timestamp: new Date().toISOString()
            });
            
            // 限制存储的事件数量
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }
            
            // 保存事件
            localStorage.setItem(getStorageKey('events'), JSON.stringify(events));
        } catch (e) {
            console.error('Error saving analytics event locally:', e);
        }
    }

    function getGameIdFromUrl() {
        // 从URL获取游戏ID
        const path = window.location.pathname;
        const gameMatch = path.match(/\/games\/([^\/]+)\.html/);
        return gameMatch ? gameMatch[1] : null;
    }

    function shouldSample() {
        // 根据采样率决定是否记录事件
        return Math.random() < config.samplingRate;
    }

    // 公共方法
    function init(options = {}) {
        // 合并配置
        Object.assign(config, options);
        
        // 恢复或创建会话
        resumeSession();
        
        // 记录页面浏览
        if (config.trackPageViews) {
            trackPageView();
        }
        
        // 添加事件监听器
        if (config.trackClicks) {
            document.addEventListener('click', function(e) {
                // 跟踪点击事件
                const target = e.target.closest('a, button, [role="button"], .clickable');
                if (target) {
                    const data = {
                        elementType: target.tagName.toLowerCase(),
                        elementId: target.id || null,
                        elementClass: target.className || null,
                        elementText: target.innerText?.trim().substring(0, 50) || null,
                        href: target.href || null
                    };
                    
                    trackEvent('click', data);
                }
            });
        }
        
        // 页面卸载时记录会话结束
        window.addEventListener('beforeunload', function() {
            trackEvent('session_end', {
                duration: Math.floor((new Date() - sessionStartTime) / 1000),
                pageViews: pageViewCount,
                events: eventCount
            });
        });
        
        // 定期更新活动时间
        setInterval(updateActivity, 60000);
    }

    function trackPageView(url = null, title = null) {
        if (!shouldSample()) return;
        
        const pageUrl = url || window.location.href;
        const pageTitle = title || document.title;
        const gameId = getGameIdFromUrl();
        
        const data = {
            userId: getUserId(),
            sessionId: sessionId,
            url: pageUrl,
            title: pageTitle,
            gameId: gameId,
            timestamp: new Date().toISOString()
        };
        
        // 发送到服务器
        sendToServer({
            type: 'pageview',
            data: data
        });
        
        // 保存到本地
        saveLocally('pageview', data);
        
        // 更新页面浏览计数
        pageViewCount++;
        
        // 更新活动时间
        updateActivity();
    }

    function trackEvent(eventName, eventData = {}) {
        if (!shouldSample() || !config.trackGameEvents) return;
        
        const data = {
            userId: getUserId(),
            sessionId: sessionId,
            eventName: eventName,
            url: window.location.href,
            gameId: getGameIdFromUrl(),
            timestamp: new Date().toISOString(),
            ...eventData
        };
        
        // 发送到服务器
        sendToServer({
            type: 'event',
            data: data
        });
        
        // 保存到本地
        saveLocally('event', data);
        
        // 更新事件计数
        eventCount++;
        
        // 更新活动时间
        updateActivity();
    }

    function trackGameStart(gameId, difficulty = 'medium') {
        trackEvent('game_start', {
            gameId: gameId,
            difficulty: difficulty
        });
    }

    function trackGameEnd(gameId, score, duration, completed = false) {
        trackEvent('game_end', {
            gameId: gameId,
            score: score,
            duration: duration,
            completed: completed
        });
    }

    function trackAchievement(achievementId) {
        trackEvent('achievement_unlocked', {
            achievementId: achievementId
        });
    }

    function getSessionData() {
        return {
            id: sessionId,
            startTime: sessionStartTime,
            duration: Math.floor((new Date() - sessionStartTime) / 1000),
            pageViews: pageViewCount,
            events: eventCount
        };
    }

    function getStoredEvents(limit = null) {
        try {
            const events = JSON.parse(localStorage.getItem(getStorageKey('events')) || '[]');
            
            if (limit && limit > 0) {
                return events.slice(-limit);
            }
            
            return events;
        } catch (e) {
            console.error('Error retrieving analytics events:', e);
            return [];
        }
    }

    function clearStoredEvents() {
        localStorage.removeItem(getStorageKey('events'));
    }

    function generateReport() {
        // 生成简单的分析报告
        const events = getStoredEvents();
        const gameEvents = events.filter(e => e.data.gameId);
        
        // 游戏统计
        const gameStats = {};
        gameEvents.forEach(event => {
            const gameId = event.data.gameId;
            if (!gameId) return;
            
            if (!gameStats[gameId]) {
                gameStats[gameId] = {
                    views: 0,
                    starts: 0,
                    completions: 0,
                    averageScore: 0,
                    totalScore: 0,
                    scoreCount: 0
                };
            }
            
            if (event.type === 'pageview') {
                gameStats[gameId].views++;
            } else if (event.type === 'event') {
                if (event.data.eventName === 'game_start') {
                    gameStats[gameId].starts++;
                } else if (event.data.eventName === 'game_end') {
                    if (event.data.completed) {
                        gameStats[gameId].completions++;
                    }
                    
                    if (event.data.score !== undefined) {
                        gameStats[gameId].totalScore += event.data.score;
                        gameStats[gameId].scoreCount++;
                        gameStats[gameId].averageScore = gameStats[gameId].totalScore / gameStats[gameId].scoreCount;
                    }
                }
            }
        });
        
        // 计算转化率
        Object.keys(gameStats).forEach(gameId => {
            const stats = gameStats[gameId];
            stats.viewToStartRate = stats.views > 0 ? (stats.starts / stats.views) : 0;
            stats.startToCompletionRate = stats.starts > 0 ? (stats.completions / stats.starts) : 0;
        });
        
        return {
            sessionCount: new Set(events.map(e => e.data.sessionId)).size,
            userCount: new Set(events.map(e => e.data.userId)).size,
            pageViews: events.filter(e => e.type === 'pageview').length,
            totalEvents: events.length,
            gameStats: gameStats
        };
    }

    // 公开API
    return {
        init: init,
        trackPageView: trackPageView,
        trackEvent: trackEvent,
        trackGameStart: trackGameStart,
        trackGameEnd: trackGameEnd,
        trackAchievement: trackAchievement,
        getSessionData: getSessionData,
        getStoredEvents: getStoredEvents,
        clearStoredEvents: clearStoredEvents,
        generateReport: generateReport
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    GameAnalytics.init();
});

// 全局访问
window.GameAnalytics = GameAnalytics;