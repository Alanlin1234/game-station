/**
 * 游戏评分系统
 * 允许用户对游戏进行评分和评论
 */

const RatingSystem = (function() {
    // 配置
    const config = {
        storagePrefix: 'gameRating_',
        apiEndpoint: '/api/ratings', // 如果有后端API
        defaultStars: 5,
        useLocalStorage: true, // 如果没有后端，使用localStorage存储评分
        animationSpeed: 300
    };

    // 缓存DOM元素
    let elements = {};

    // 私有方法
    function getGameId() {
        // 从URL获取游戏ID
        const path = window.location.pathname;
        const gameMatch = path.match(/\/games\/([^\/]+)\.html/);
        return gameMatch ? gameMatch[1] : 'unknown';
    }

    function getStorageKey(gameId) {
        return `${config.storagePrefix}${gameId}`;
    }

    function saveRating(gameId, rating, comment = '') {
        const data = {
            gameId: gameId,
            rating: rating,
            comment: comment,
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };

        if (config.useLocalStorage) {
            // 保存到本地存储
            const ratings = JSON.parse(localStorage.getItem(getStorageKey(gameId)) || '[]');
            
            // 检查用户是否已经评分过
            const existingIndex = ratings.findIndex(r => r.userId === data.userId);
            if (existingIndex >= 0) {
                ratings[existingIndex] = data;
            } else {
                ratings.push(data);
            }
            
            localStorage.setItem(getStorageKey(gameId), JSON.stringify(ratings));
            
            // 更新全局游戏评分统计
            updateGameRatingStats(gameId, ratings);
            
            return Promise.resolve(data);
        } else {
            // 发送到API
            return fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json());
        }
    }

    function updateGameRatingStats(gameId, ratings) {
        if (!ratings || ratings.length === 0) return;
        
        // 计算平均分
        const sum = ratings.reduce((total, r) => total + r.rating, 0);
        const average = sum / ratings.length;
        
        // 保存游戏评分统计
        const allGameStats = JSON.parse(localStorage.getItem('gameRatingStats') || '{}');
        allGameStats[gameId] = {
            average: average.toFixed(1),
            count: ratings.length,
            updated: new Date().toISOString()
        };
        
        localStorage.setItem('gameRatingStats', JSON.stringify(allGameStats));
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

    function loadUserRating(gameId) {
        const userId = getUserId();
        
        if (config.useLocalStorage) {
            const ratings = JSON.parse(localStorage.getItem(getStorageKey(gameId)) || '[]');
            return ratings.find(r => r.userId === userId) || null;
        } else {
            // 从API加载
            return fetch(`${config.apiEndpoint}/${gameId}/user/${userId}`)
                .then(response => response.json())
                .catch(() => null);
        }
    }

    function loadGameRatings(gameId) {
        if (config.useLocalStorage) {
            return Promise.resolve(JSON.parse(localStorage.getItem(getStorageKey(gameId)) || '[]'));
        } else {
            // 从API加载
            return fetch(`${config.apiEndpoint}/${gameId}`)
                .then(response => response.json())
                .catch(() => []);
        }
    }

    function renderStars(container, rating, interactive = true) {
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 1; i <= config.defaultStars; i++) {
            const star = document.createElement('i');
            star.className = i <= rating ? 'bi bi-star-fill active' : 'bi bi-star';
            star.setAttribute('data-rating', i);
            
            if (interactive) {
                star.addEventListener('mouseover', function() {
                    highlightStars(container, i);
                });
                
                star.addEventListener('mouseout', function() {
                    const currentRating = parseInt(container.getAttribute('data-current-rating') || '0');
                    highlightStars(container, currentRating);
                });
                
                star.addEventListener('click', function() {
                    setRating(container, i);
                });
            }
            
            container.appendChild(star);
        }
        
        if (rating > 0) {
            container.setAttribute('data-current-rating', rating);
            highlightStars(container, rating);
        }
    }

    function highlightStars(container, rating) {
        if (!container) return;
        
        const stars = container.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'bi bi-star-fill active';
            } else {
                star.className = 'bi bi-star';
            }
        });
    }

    function setRating(container, rating) {
        if (!container) return;
        
        container.setAttribute('data-current-rating', rating);
        highlightStars(container, rating);
        
        // 触发评分事件
        const event = new CustomEvent('rating:change', {
            detail: { rating: rating }
        });
        container.dispatchEvent(event);
        
        // 如果有评分值显示元素，更新它
        const ratingValueEl = document.getElementById('ratingValue');
        if (ratingValueEl) {
            ratingValueEl.textContent = `${rating}/5`;
        }
        
        // 保存评分
        const gameId = getGameId();
        saveRating(gameId, rating).then(() => {
            showRatingNotification(rating);
            updateRatingCountDisplay();
        });
    }

    function showRatingNotification(rating) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'rating-notification';
        notification.innerHTML = `
            <div class="rating-notification-content">
                <i class="bi bi-star-fill text-warning"></i>
                <div>
                    <h6>评分已保存！</h6>
                    <p>感谢您的${rating}星评价</p>
                </div>
                <button type="button" class="btn-close ms-3"></button>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .rating-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.9);
                color: #000;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                transition: opacity 0.5s;
                animation: slideIn 0.5s forwards;
            }
            
            .rating-notification-content {
                display: flex;
                align-items: center;
            }
            
            .rating-notification i {
                font-size: 2rem;
                margin-right: 10px;
            }
            
            .rating-notification h6 {
                margin: 0;
                font-weight: bold;
            }
            
            .rating-notification p {
                margin: 0;
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
        
        // 3秒后自动关闭
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, 3000);
    }

    function updateRatingCountDisplay() {
        const ratingCountEl = document.getElementById('ratingCount');
        if (!ratingCountEl) return;
        
        const gameId = getGameId();
        loadGameRatings(gameId).then(ratings => {
            ratingCountEl.textContent = ratings.length;
        });
    }

    function initCommentSystem() {
        const commentForm = document.getElementById('commentForm');
        if (!commentForm) return;
        
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentText = document.getElementById('commentText').value.trim();
            if (!commentText) return;
            
            addComment(commentText);
            document.getElementById('commentText').value = '';
        });
        
        // 加载评论
        loadComments();
    }

    function addComment(text) {
        const gameId = getGameId();
        const comments = JSON.parse(localStorage.getItem(`gameComments_${gameId}`) || '[]');
        
        // 获取用户名
        const playerName = localStorage.getItem('playerName') || '游客' + Math.floor(Math.random() * 1000);
        
        comments.push({
            name: playerName,
            text: text,
            date: new Date().toISOString()
        });
        
        localStorage.setItem(`gameComments_${gameId}`, JSON.stringify(comments));
        loadComments();
    }

    function loadComments() {
        const commentsContainer = document.getElementById('commentsContainer');
        if (!commentsContainer) return;
        
        const gameId = getGameId();
        const comments = JSON.parse(localStorage.getItem(`gameComments_${gameId}`) || '[]');
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="text-center">还没有评论，来发表第一条吧！</p>';
            return;
        }
        
        let commentsHtml = '';
        comments.reverse().forEach(comment => {
            const date = new Date(comment.date);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            commentsHtml += `
                <div class="comment-item">
                    <div class="d-flex justify-content-between">
                        <h6>${comment.name}</h6>
                        <small>${formattedDate}</small>
                    </div>
                    <p>${comment.text}</p>
                </div>
                <hr style="border-color: rgba(255, 255, 255, 0.1);">
            `;
        });
        
        commentsContainer.innerHTML = commentsHtml;
    }

    // 公共方法
    function init(options = {}) {
        // 合并配置
        Object.assign(config, options);
        
        // 初始化评分系统
        const gameId = getGameId();
        const ratingContainer = document.getElementById('gameRating');
        
        if (ratingContainer) {
            // 加载用户之前的评分
            loadUserRating(gameId).then(userRating => {
                const rating = userRating ? userRating.rating : 0;
                renderStars(ratingContainer, rating);
            });
            
            // 更新评分计数
            updateRatingCountDisplay();
        }
        
        // 初始化评论系统
        initCommentSystem();
    }

    function getRatingStats(gameId = null) {
        const allGameStats = JSON.parse(localStorage.getItem('gameRatingStats') || '{}');
        
        if (gameId) {
            return allGameStats[gameId] || { average: 0, count: 0 };
        }
        
        return allGameStats;
    }

    // 公开API
    return {
        init: init,
        getRatingStats: getRatingStats,
        renderStars: renderStars
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    RatingSystem.init();
});