/**
 * 游戏推荐系统
 * 基于用户行为和偏好推荐游戏
 */

const RecommendationSystem = (function() {
    // 配置
    const config = {
        storagePrefix: 'gameRecommendation_',
        maxRecommendations: 5,
        usePlayHistory: true,
        useRatings: true,
        useSimilarGames: true,
        refreshInterval: 24 * 60 * 60 * 1000, // 24小时
        apiEndpoint: '/api/recommendations' // 如果有后端API
    };

    // 游戏数据
    const gameData = {
        'snake': {
            name: '贪吃蛇',
            categories: ['休闲', '经典'],
            similar: ['tetris', 'pacman'],
            difficulty: 2
        },
        '2048': {
            name: '2048',
            categories: ['益智', '数字'],
            similar: ['memory', 'sudoku'],
            difficulty: 3
        },
        'memory': {
            name: '记忆配对',
            categories: ['益智', '记忆力'],
            similar: ['2048', 'sudoku'],
            difficulty: 2
        },
        'tictactoe': {
            name: '井字棋',
            categories: ['策略', '经典'],
            similar: ['chess', 'checkers'],
            difficulty: 1
        },
        'tetris': {
            name: '俄罗斯方块',
            categories: ['益智', '经典'],
            similar: ['snake', 'pacman'],
            difficulty: 3
        },
        'minesweeper': {
            name: '扫雷',
            categories: ['益智', '挑战'],
            similar: ['sudoku', '2048'],
            difficulty: 4
        },
        'breakout': {
            name: '弹球游戏',
            categories: ['休闲', '动作'],
            similar: ['snake', 'tetris'],
            difficulty: 2
        },
        'pacman': {
            name: '吃豆人',
            categories: ['动作', '经典'],
            similar: ['snake', 'tetris'],
            difficulty: 3
        },
        'sudoku': {
            name: '数独',
            categories: ['益智', '数字'],
            similar: ['2048', 'minesweeper'],
            difficulty: 4
        },
        'chess': {
            name: '国际象棋',
            categories: ['策略', '经典'],
            similar: ['tictactoe', 'checkers'],
            difficulty: 5
        },
        'checkers': {
            name: '跳棋',
            categories: ['策略', '经典'],
            similar: ['chess', 'tictactoe'],
            difficulty: 3
        }
    };

    // 私有方法
    function getGameId() {
        // 从URL获取游戏ID
        const path = window.location.pathname;
        const gameMatch = path.match(/\/games\/([^\/]+)\.html/);
        return gameMatch ? gameMatch[1] : null;
    }

    function getPlayHistory() {
        return JSON.parse(localStorage.getItem('gameHistory') || '[]');
    }

    function getRatings() {
        const allRatings = {};
        
        // 遍历所有游戏，获取评分
        Object.keys(gameData).forEach(gameId => {
            const ratings = JSON.parse(localStorage.getItem(`gameRating_${gameId}`) || '[]');
            if (ratings.length > 0) {
                allRatings[gameId] = ratings;
            }
        });
        
        return allRatings;
    }

    function getUserPreferences() {
        const playHistory = getPlayHistory();
        const ratings = getRatings();
        
        // 分析用户偏好的游戏类别
        const categoryPreferences = {};
        const difficultyPreference = { sum: 0, count: 0 };
        
        // 根据游戏历史分析
        playHistory.forEach(record => {
            const game = gameData[record.gameId];
            if (!game) return;
            
            // 增加类别权重
            game.categories.forEach(category => {
                if (!categoryPreferences[category]) {
                    categoryPreferences[category] = 0;
                }
                categoryPreferences[category] += record.duration / 60; // 按游戏时长（分钟）加权
            });
            
            // 记录难度偏好
            difficultyPreference.sum += game.difficulty;
            difficultyPreference.count++;
        });
        
        // 根据评分分析
        Object.keys(ratings).forEach(gameId => {
            const game = gameData[gameId];
            if (!game) return;
            
            const gameRatings = ratings[gameId];
            const userRating = getUserRating(gameRatings);
            
            if (userRating && userRating.rating >= 4) {
                // 用户喜欢的游戏，增加类别权重
                game.categories.forEach(category => {
                    if (!categoryPreferences[category]) {
                        categoryPreferences[category] = 0;
                    }
                    categoryPreferences[category] += userRating.rating;
                });
                
                // 记录难度偏好
                difficultyPreference.sum += game.difficulty;
                difficultyPreference.count++;
            }
        });
        
        // 计算平均难度偏好
        const avgDifficulty = difficultyPreference.count > 0 
            ? difficultyPreference.sum / difficultyPreference.count 
            : 3; // 默认中等难度
        
        return {
            categories: categoryPreferences,
            difficulty: avgDifficulty,
            playedGames: playHistory.map(record => record.gameId),
            ratedGames: Object.keys(ratings)
        };
    }

    function getUserRating(ratings) {
        const userId = localStorage.getItem('userId');
        if (!userId || !ratings) return null;
        
        return ratings.find(r => r.userId === userId);
    }

    function generateRecommendations() {
        const currentGameId = getGameId();
        const preferences = getUserPreferences();
        
        // 游戏评分
        const gameScores = {};
        
        // 为每个游戏计算推荐分数
        Object.keys(gameData).forEach(gameId => {
            // 跳过当前游戏
            if (gameId === currentGameId) return;
            
            // 跳过已经玩过的游戏（可选）
            // if (preferences.playedGames.includes(gameId)) return;
            
            const game = gameData[gameId];
            let score = 0;
            
            // 基于类别偏好
            game.categories.forEach(category => {
                if (preferences.categories[category]) {
                    score += preferences.categories[category];
                }
            });
            
            // 基于难度偏好（难度接近用户偏好的游戏得分更高）
            const difficultyDiff = Math.abs(game.difficulty - preferences.difficulty);
            score += (5 - difficultyDiff) * 2;
            
            // 基于相似游戏
            if (currentGameId && gameData[currentGameId]) {
                if (gameData[currentGameId].similar.includes(gameId)) {
                    score += 10; // 相似游戏加分
                }
            }
            
            // 热门游戏加分
            const gameStats = window.RatingSystem?.getRatingStats(gameId);
            if (gameStats && gameStats.count > 0) {
                score += Math.min(gameStats.count, 10); // 最多加10分
                score += gameStats.average * 2; // 评分高的游戏加分
            }
            
            gameScores[gameId] = score;
        });
        
        // 排序并返回推荐游戏
        const sortedGames = Object.keys(gameScores)
            .sort((a, b) => gameScores[b] - gameScores[a])
            .slice(0, config.maxRecommendations)
            .map(gameId => ({
                id: gameId,
                name: gameData[gameId].name,
                score: gameScores[gameId],
                categories: gameData[gameId].categories,
                difficulty: gameData[gameId].difficulty
            }));
        
        return sortedGames;
    }

    function displayRecommendations(container, recommendations) {
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = '<p class="text-center">暂无推荐游戏</p>';
            return;
        }
        
        // 显示推荐游戏
        recommendations.forEach(game => {
            // 获取游戏评分
            const gameStats = window.RatingSystem?.getRatingStats(game.id) || { average: 0, count: 0 };
            const rating = parseFloat(gameStats.average) || 0;
            
            // 创建游戏元素
            const gameElement = document.createElement('div');
            gameElement.className = 'recommended-game';
            
            // 随机图片
            const randomId = Math.floor(Math.random() * 1000);
            
            gameElement.innerHTML = `
                <img src="https://picsum.photos/id/${randomId}/80/80" class="me-3" alt="${game.name}">
                <div>
                    <h6 class="mb-1">${game.name}</h6>
                    <div class="small">
                        ${generateStarRating(rating)}
                        <span class="ms-1">${rating.toFixed(1)}</span>
                    </div>
                    <a href="${game.id}.html" class="btn btn-sm btn-primary mt-1">玩游戏</a>
                </div>
            `;
            
            container.appendChild(gameElement);
        });
    }

    function generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += '<i class="bi bi-star-fill text-warning"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="bi bi-star-half text-warning"></i>';
            } else {
                stars += '<i class="bi bi-star text-warning"></i>';
            }
        }
        return stars;
    }

    function fetchRecommendationsFromAPI() {
        const currentGameId = getGameId();
        const userId = localStorage.getItem('userId');
        
        return fetch(`${config.apiEndpoint}?gameId=${currentGameId}&userId=${userId}`)
            .then(response => response.json())
            .catch(() => {
                // 如果API失败，使用本地推荐
                return generateRecommendations();
            });
    }

    // 公共方法
    function init(options = {}) {
        // 合并配置
        Object.assign(config, options);
        
        // 获取推荐游戏容器
        const recommendedGamesContainer = document.getElementById('recommendedGames');
        if (!recommendedGamesContainer) return;
        
        // 检查是否需要刷新推荐
        const lastUpdate = localStorage.getItem(`${config.storagePrefix}lastUpdate`);
        const now = new Date().getTime();
        
        if (!lastUpdate || (now - parseInt(lastUpdate)) > config.refreshInterval) {
            // 生成新的推荐
            let recommendationsPromise;
            
            if (config.useAPI) {
                recommendationsPromise = fetchRecommendationsFromAPI();
            } else {
                recommendationsPromise = Promise.resolve(generateRecommendations());
            }
            
            recommendationsPromise.then(recommendations => {
                // 保存推荐结果
                localStorage.setItem(`${config.storagePrefix}recommendations`, JSON.stringify(recommendations));
                localStorage.setItem(`${config.storagePrefix}lastUpdate`, now.toString());
                
                // 显示推荐
                displayRecommendations(recommendedGamesContainer, recommendations);
            });
        } else {
            // 使用缓存的推荐
            const cachedRecommendations = JSON.parse(localStorage.getItem(`${config.storagePrefix}recommendations`) || '[]');
            displayRecommendations(recommendedGamesContainer, cachedRecommendations);
        }
    }

    function getRecommendations() {
        return JSON.parse(localStorage.getItem(`${config.storagePrefix}recommendations`) || '[]');
    }

    function refreshRecommendations() {
        localStorage.removeItem(`${config.storagePrefix}lastUpdate`);
        init();
    }

    // 公开API
    return {
        init: init,
        getRecommendations: getRecommendations,
        refreshRecommendations: refreshRecommendations
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    RecommendationSystem.init();
});