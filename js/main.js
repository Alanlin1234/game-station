/**
 * 游戏乐园 - 主要JavaScript文件
 * 用于加载和初始化所有优化功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检测当前页面类型
    const isHomePage = document.location.pathname === '/' || document.location.pathname.endsWith('index.html');
    const isGamePage = document.location.pathname.includes('/games/') && !document.location.pathname.endsWith('index.html');
    const isGameListPage = document.location.pathname.endsWith('/games/index.html');
    
    // 加载分析工具
    if (typeof initAnalytics === 'function') {
        initAnalytics();
    }
    
    // 加载社交分享功能（在游戏页面）
    if (isGamePage && typeof initSocialShare === 'function') {
        initSocialShare();
    }
    
    // 加载评分系统（在游戏页面）
    if (isGamePage && typeof initRatingSystem === 'function') {
        initRatingSystem();
    }
    
    // 加载游戏推荐系统
    if ((isHomePage || isGamePage) && typeof initRecommendationSystem === 'function') {
        initRecommendationSystem();
    }
    
    // 加载游戏历史记录
    if (typeof initGameHistory === 'function') {
        initGameHistory();
    }
    
    // 加载成就系统（在游戏页面）
    if (isGamePage && typeof initAchievements === 'function') {
        initAchievements();
    }
    
    // 加载排行榜系统（在游戏页面）
    if (isGamePage && typeof initLeaderboard === 'function') {
        initLeaderboard();
    }
    
    // 添加用户登录/注册功能
    setupAuthButtons();
    
    // 添加搜索功能增强
    enhanceSearch();
    
    // 添加深色模式切换
    setupDarkModeToggle();
    
    // 添加响应式导航增强
    enhanceNavigation();
    
    // 添加页面过渡动画
    addPageTransitions();
});

/**
 * 设置认证按钮
 */
function setupAuthButtons() {
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    if (!navbarNav) return;
    
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('gamePortalLoggedIn') === 'true';
    
    if (isLoggedIn) {
        // 已登录状态
        const username = localStorage.getItem('gamePortalUsername') || '用户';
        
        // 创建用户下拉菜单
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown ms-lg-auto';
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle me-1"></i> ${username}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="../profile.html"><i class="bi bi-person me-2"></i>个人资料</a></li>
                <li><a class="dropdown-item" href="../saved-games.html"><i class="bi bi-bookmark me-2"></i>已保存游戏</a></li>
                <li><a class="dropdown-item" href="../achievements.html"><i class="bi bi-trophy me-2"></i>我的成就</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>退出登录</a></li>
            </ul>
        `;
        navbarNav.appendChild(userDropdown);
        
        // 添加退出登录功能
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('gamePortalLoggedIn');
            localStorage.removeItem('gamePortalUsername');
            window.location.reload();
        });
    } else {
        // 未登录状态
        const authButtons = document.createElement('li');
        authButtons.className = 'nav-item ms-lg-auto';
        authButtons.innerHTML = `
            <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">登录</button>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerModal">注册</button>
        `;
        navbarNav.appendChild(authButtons);
        
        // 创建登录模态框
        createAuthModals();
    }
}

/**
 * 创建认证模态框
 */
function createAuthModals() {
    // 检查模态框是否已存在
    if (document.getElementById('loginModal')) return;
    
    // 创建登录模态框
    const loginModal = document.createElement('div');
    loginModal.className = 'modal fade';
    loginModal.id = 'loginModal';
    loginModal.tabIndex = '-1';
    loginModal.setAttribute('aria-labelledby', 'loginModalLabel');
    loginModal.setAttribute('aria-hidden', 'true');
    
    loginModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="loginModalLabel">登录</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label">电子邮箱</label>
                            <input type="email" class="form-control" id="loginEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">密码</label>
                            <input type="password" class="form-control" id="loginPassword" required>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">记住我</label>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">登录</button>
                        </div>
                    </form>
                </div>
                <div class="modal-footer justify-content-center">
                    <p>还没有账号？ <a href="#" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-dismiss="modal">立即注册</a></p>
                </div>
            </div>
        </div>
    `;
    
    // 创建注册模态框
    const registerModal = document.createElement('div');
    registerModal.className = 'modal fade';
    registerModal.id = 'registerModal';
    registerModal.tabIndex = '-1';
    registerModal.setAttribute('aria-labelledby', 'registerModalLabel');
    registerModal.setAttribute('aria-hidden', 'true');
    
    registerModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="registerModalLabel">注册</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="mb-3">
                            <label for="registerUsername" class="form-label">用户名</label>
                            <input type="text" class="form-control" id="registerUsername" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerEmail" class="form-label">电子邮箱</label>
                            <input type="email" class="form-control" id="registerEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerPassword" class="form-label">密码</label>
                            <input type="password" class="form-control" id="registerPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="confirmPassword" class="form-label">确认密码</label>
                            <input type="password" class="form-control" id="confirmPassword" required>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                            <label class="form-check-label" for="agreeTerms">我同意<a href="../terms.html" target="_blank">使用条款</a>和<a href="../privacy.html" target="_blank">隐私政策</a></label>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">注册</button>
                        </div>
                    </form>
                </div>
                <div class="modal-footer justify-content-center">
                    <p>已有账号？ <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">立即登录</a></p>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到页面
    document.body.appendChild(loginModal);
    document.body.appendChild(registerModal);
    
    // 添加登录表单提交事件
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const username = email.split('@')[0]; // 简单处理，实际应用中应该从服务器获取用户名
        
        // 模拟登录成功
        localStorage.setItem('gamePortalLoggedIn', 'true');
        localStorage.setItem('gamePortalUsername', username);
        
        // 关闭模态框并刷新页面
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();
        window.location.reload();
    });
    
    // 添加注册表单提交事件
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        
        // 模拟注册成功
        localStorage.setItem('gamePortalLoggedIn', 'true');
        localStorage.setItem('gamePortalUsername', username);
        
        // 关闭模态框并刷新页面
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        modal.hide();
        window.location.reload();
    });
}

/**
 * 增强搜索功能
 */
function enhanceSearch() {
    const searchForms = document.querySelectorAll('form.d-flex');
    if (searchForms.length === 0) return;
    
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="search"]');
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // 在实际应用中，这里应该跳转到搜索结果页面
                // 现在我们只是显示一个通知
                showNotification(`正在搜索: ${searchTerm}`, 'info');
                
                // 记录搜索历史
                saveSearchHistory(searchTerm);
            }
        });
    });
}

/**
 * 保存搜索历史
 */
function saveSearchHistory(term) {
    let searchHistory = JSON.parse(localStorage.getItem('gamePortalSearchHistory') || '[]');
    
    // 如果已存在相同的搜索词，先移除它
    searchHistory = searchHistory.filter(item => item !== term);
    
    // 添加到历史记录的开头
    searchHistory.unshift(term);
    
    // 限制历史记录数量
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }
    
    localStorage.setItem('gamePortalSearchHistory', JSON.stringify(searchHistory));
}

/**
 * 设置深色模式切换
 */
function setupDarkModeToggle() {
    // 检查导航栏是否存在
    const navbar = document.querySelector('.navbar-nav');
    if (!navbar) return;
    
    // 检查是否已经启用深色模式
    const isDarkMode = localStorage.getItem('gamePortalDarkMode') === 'true';
    
    // 创建深色模式切换按钮
    const darkModeItem = document.createElement('li');
    darkModeItem.className = 'nav-item';
    darkModeItem.innerHTML = `
        <a class="nav-link" href="#" id="darkModeToggle">
            <i class="bi ${isDarkMode ? 'bi-sun' : 'bi-moon'}"></i>
            <span class="d-lg-none ms-2">${isDarkMode ? '浅色模式' : '深色模式'}</span>
        </a>
    `;
    navbar.appendChild(darkModeItem);
    
    // 如果已经启用深色模式，应用深色模式样式
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // 添加切换事件
    document.getElementById('darkModeToggle').addEventListener('click', function(e) {
        e.preventDefault();
        
        const isDarkModeEnabled = document.body.classList.toggle('dark-mode');
        localStorage.setItem('gamePortalDarkMode', isDarkModeEnabled);
        
        // 更新图标
        const icon = this.querySelector('i');
        const text = this.querySelector('span');
        
        if (isDarkModeEnabled) {
            icon.classList.replace('bi-moon', 'bi-sun');
            if (text) text.textContent = '浅色模式';
        } else {
            icon.classList.replace('bi-sun', 'bi-moon');
            if (text) text.textContent = '深色模式';
        }
    });
}

/**
 * 增强导航响应式体验
 */
function enhanceNavigation() {
    // 添加滚动时导航栏样式变化
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // 添加当前页面高亮
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.endsWith(href)) {
            link.classList.add('active');
        }
    });
}

/**
 * 添加页面过渡动画
 */
function addPageTransitions() {
    // 为所有内容添加淡入效果
    const mainContent = document.querySelector('main') || document.querySelector('.container');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
    
    // 为所有链接添加页面过渡效果
    document.querySelectorAll('a').forEach(link => {
        // 排除外部链接和特殊链接
        if (link.hostname === window.location.hostname && 
            !link.hasAttribute('data-bs-toggle') && 
            !link.classList.contains('dropdown-toggle')) {
            
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // 排除锚点链接
                if (href.startsWith('#')) return;
                
                e.preventDefault();
                
                // 添加淡出效果
                document.body.classList.add('page-transition-out');
                
                // 延迟导航以显示过渡效果
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        }
    });
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info', duration = 3000) {
    // 检查是否已存在通知容器
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.bottom = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
    `;
    
    // 添加关闭按钮功能
    notification.querySelector('.btn-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // 添加到容器
    notificationContainer.appendChild(notification);
    
    // 添加显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    return notification;
}
