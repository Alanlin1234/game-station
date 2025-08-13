/**
 * 用户账户系统
 * 提供注册、登录、个人资料管理等功能
 */

const UserAuth = {
  // 配置
  config: {
    storagePrefix: 'gamehub_',
    tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7天
    apiEndpoint: '/api/auth',
    useLocalStorage: true, // 本地存储模式（开发环境）
    useServerAuth: false   // 服务器认证模式（生产环境）
  },
  
  // 当前用户
  currentUser: null,
  
  // 初始化
  init(options = {}) {
    // 合并配置
    this.config = { ...this.config, ...options };
    
    // 检查是否已登录
    this.checkAuth();
    
    // 创建认证相关UI
    this.createAuthUI();
    
    console.log('UserAuth initialized');
  },
  
  // 检查认证状态
  checkAuth() {
    if (this.config.useLocalStorage) {
      // 从本地存储获取用户信息
      const token = localStorage.getItem(this.config.storagePrefix + 'token');
      const userData = localStorage.getItem(this.config.storagePrefix + 'user');
      
      if (token && userData) {
        try {
          // 解析用户数据
          const user = JSON.parse(userData);
          
          // 检查token是否过期
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expiry = tokenData.exp * 1000; // 转换为毫秒
          
          if (expiry > Date.now()) {
            // token有效，设置当前用户
            this.currentUser = user;
            this.updateUI();
            return true;
          } else {
            // token过期，清除
            this.logout();
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          this.logout();
        }
      }
    } else if (this.config.useServerAuth) {
      // 向服务器验证token
      // 实际实现可能类似：
      /*
      fetch(this.config.apiEndpoint + '/verify', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem(this.config.storagePrefix + 'token')
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.currentUser = data.user;
          this.updateUI();
          return true;
        } else {
          this.logout();
          return false;
        }
      })
      .catch(err => {
        console.error('Auth verification failed:', err);
        this.logout();
        return false;
      });
      */
    }
    
    return false;
  },
  
  // 创建认证相关UI
  createAuthUI() {
    // 获取导航栏
    const nav = document.querySelector('nav ul');
    if (!nav) return;
    
    // 创建认证菜单项
    const authItem = document.createElement('li');
    authItem.id = 'auth-menu-item';
    
    // 根据登录状态设置内容
    if (this.currentUser) {
      authItem.innerHTML = `
        <a href="#" id="user-menu-toggle">
          <i class="fas fa-user-circle"></i> ${this.currentUser.username}
        </a>
        <div class="user-dropdown" id="user-dropdown">
          <a href="profile.html"><i class="fas fa-id-card"></i> 个人资料</a>
          <a href="achievements.html"><i class="fas fa-trophy"></i> 我的成就</a>
          <a href="saved-games.html"><i class="fas fa-save"></i> 游戏存档</a>
          <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> 退出登录</a>
        </div>
      `;
    } else {
      authItem.innerHTML = `
        <a href="#" id="login-btn">
          <i class="fas fa-sign-in-alt"></i> 登录/注册
        </a>
      `;
    }
    
    // 添加到导航栏
    nav.appendChild(authItem);
    
    // 绑定事件
    this.bindAuthEvents();
  },
  
  // 绑定认证相关事件
  bindAuthEvents() {
    // 登录按钮点击事件
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
    }
    
    // 用户菜单切换事件
    const userMenuToggle = document.getElementById('user-menu-toggle');
    if (userMenuToggle) {
      userMenuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('show');
      });
      
      // 点击其他地方关闭下拉菜单
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#user-menu-toggle') && !e.target.closest('#user-dropdown')) {
          const dropdown = document.getElementById('user-dropdown');
          if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
          }
        }
      });
    }
    
    // 退出登录按钮点击事件
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  },
  
  // 显示登录表单
  showLoginForm() {
    // 创建登录表单容器
    const formContainer = document.createElement('div');
    formContainer.className = 'auth-form-container';
    
    formContainer.innerHTML = `
      <div class="auth-form">
        <div class="auth-tabs">
          <div class="auth-tab active" data-tab="login">登录</div>
          <div class="auth-tab" data-tab="register">注册</div>
        </div>
        
        <div class="auth-content">
          <!-- 登录表单 -->
          <div class="auth-tab-content active" id="login-form">
            <div class="form-group">
              <label for="login-username">用户名</label>
              <input type="text" id="login-username" placeholder="输入用户名">
            </div>
            <div class="form-group">
              <label for="login-password">密码</label>
              <input type="password" id="login-password" placeholder="输入密码">
            </div>
            <div class="form-check">
              <input type="checkbox" id="remember-me">
              <label for="remember-me">记住我</label>
            </div>
            <button class="auth-btn" id="login-submit">登录</button>
            <div class="auth-links">
              <a href="#" id="forgot-password">忘记密码？</a>
            </div>
          </div>
          
          <!-- 注册表单 -->
          <div class="auth-tab-content" id="register-form">
            <div class="form-group">
              <label for="register-username">用户名</label>
              <input type="text" id="register-username" placeholder="输入用户名">
            </div>
            <div class="form-group">
              <label for="register-email">电子邮箱</label>
              <input type="email" id="register-email" placeholder="输入电子邮箱">
            </div>
            <div class="form-group">
              <label for="register-password">密码</label>
              <input type="password" id="register-password" placeholder="输入密码">
            </div>
            <div class="form-group">
              <label for="register-confirm-password">确认密码</label>
              <input type="password" id="register-confirm-password" placeholder="再次输入密码">
            </div>
            <div class="form-check">
              <input type="checkbox" id="agree-terms">
              <label for="agree-terms">我已阅读并同意<a href="terms.html" target="_blank">服务条款</a>和<a href="privacy.html" target="_blank">隐私政策</a></label>
            </div>
            <button class="auth-btn" id="register-submit">注册</button>
          </div>
        </div>
        
        <button class="auth-close" id="auth-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(formContainer);
    
    // 绑定表单事件
    this.bindFormEvents(formContainer);
  },
  
  // 绑定表单事件
  bindFormEvents(formContainer) {
    // 切换标签
    const tabs = formContainer.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // 移除所有标签的活动状态
        tabs.forEach(t => t.classList.remove('active'));
        // 添加当前标签的活动状态
        this.classList.add('active');
        
        // 显示对应的表单
        const tabId = this.getAttribute('data-tab');
        const tabContents = formContainer.querySelectorAll('.auth-tab-content');
        tabContents.forEach(content => {
          content.classList.remove('active');
        });
        formContainer.querySelector(`#${tabId}-form`).classList.add('active');
      });
    });
    
    // 关闭按钮
    formContainer.querySelector('#auth-close').addEventListener('click', function() {
      formContainer.remove();
    });
    
    // 登录提交
    formContainer.querySelector('#login-submit').addEventListener('click', () => {
      const username = formContainer.querySelector('#login-username').value.trim();
      const password = formContainer.querySelector('#login-password').value;
      const rememberMe = formContainer.querySelector('#remember-me').checked;
      
      if (!username || !password) {
        alert('请输入用户名和密码');
        return;
      }
      
      this.login(username, password, rememberMe);
      formContainer.remove();
    });
    
    // 注册提交
    formContainer.querySelector('#register-submit').addEventListener('click', () => {
      const username = formContainer.querySelector('#register-username').value.trim();
      const email = formContainer.querySelector('#register-email').value.trim();
      const password = formContainer.querySelector('#register-password').value;
      const confirmPassword = formContainer.querySelector('#register-confirm-password').value;
      const agreeTerms = formContainer.querySelector('#agree-terms').checked;
      
      if (!username || !email || !password || !confirmPassword) {
        alert('请填写所有必填字段');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }
      
      if (!agreeTerms) {
        alert('请阅读并同意服务条款和隐私政策');
        return;
      }
      
      this.register(username, email, password);
      formContainer.remove();
    });
    
    // 忘记密码
    formContainer.querySelector('#forgot-password').addEventListener('click', (e) => {
      e.preventDefault();
      alert('密码重置功能即将上线');
    });
  },
  
  // 登录
  login(username, password, rememberMe = false) {
    if (this.config.useLocalStorage) {
      // 模拟登录（本地存储模式）
      // 获取用户数据
      const users = JSON.parse(localStorage.getItem(this.config.storagePrefix + 'users')) || [];
      
      // 查找用户
      const user = users.find(u => u.username === username && u.password === this.hashPassword(password));
      
      if (user) {
        // 创建token
        const token = this.generateToken(user, rememberMe);
        
        // 保存到本地存储
        localStorage.setItem(this.config.storagePrefix + 'token', token);
        localStorage.setItem(this.config.storagePrefix + 'user', JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || 'https://via.placeholder.com/150',
          createdAt: user.createdAt
        }));
        
        // 设置当前用户
        this.currentUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || 'https://via.placeholder.com/150',
          createdAt: user.createdAt
        };
        
        // 更新UI
        this.updateUI();
        
        // 显示成功消息
        this.showNotification('登录成功', '欢迎回来，' + user.username + '！');
        
        return true;
      } else {
        // 登录失败
        alert('用户名或密码错误');
        return false;
      }
    } else if (this.config.useServerAuth) {
      // 向服务器发送登录请求
      // 实际实现可能类似：
      /*
      fetch(this.config.apiEndpoint + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // 保存token和用户信息
          localStorage.setItem(this.config.storagePrefix + 'token', data.token);
          localStorage.setItem(this.config.storagePrefix + 'user', JSON.stringify(data.user));
          
          // 设置当前用户
          this.currentUser = data.user;
          
          // 更新UI
          this.updateUI();
          
          // 显示成功消息
          this.showNotification('登录成功', '欢迎回来，' + data.user.username + '！');
          
          return true;
        } else {
          // 登录失败
          alert(data.message || '用户名或密码错误');
          return false;
        }
      })
      .catch(err => {
        console.error('Login failed:', err);
        alert('登录失败，请稍后再试');
        return false;
      });
      */
    }
  },
  
  // 注册
  register(username, email, password) {
    if (this.config.useLocalStorage) {
      // 模拟注册（本地存储模式）
      // 获取用户数据
      const users = JSON.parse(localStorage.getItem(this.config.storagePrefix + 'users')) || [];
      
      // 检查用户名是否已存在
      if (users.some(u => u.username === username)) {
        alert('用户名已存在');
        return false;
      }
      
      // 检查邮箱是否已存在
      if (users.some(u => u.email === email)) {
        alert('邮箱已被注册');
        return false;
      }
      
      // 创建新用户
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: this.hashPassword(password),
        createdAt: new Date().toISOString(),
        avatar: null,
        achievements: [],
        gameProgress: {}
      };
      
      // 添加到用户列表
      users.push(newUser);
      
      // 保存到本地存储
      localStorage.setItem(this.config.storagePrefix + 'users', JSON.stringify(users));
      
      // 自动登录
      this.login(username, password);
      
      return true;
    } else if (this.config.useServerAuth) {
      // 向服务器发送注册请求
      // 实际实现可能类似：
      /*
      fetch(this.config.apiEndpoint + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // 自动登录
          this.login(username, password);
          return true;
        } else {
          // 注册失败
          alert(data.message || '注册失败');
          return false;
        }
      })
      .catch(err => {
        console.error('Registration failed:', err);
        alert('注册失败，请稍后再试');
        return false;
      });
      */
    }
  },
  
  // 退出登录
  logout() {
    // 清除本地存储
    localStorage.removeItem(this.config.storagePrefix + 'token');
    localStorage.removeItem(this.config.storagePrefix + 'user');
    
    // 清除当前用户
    this.currentUser = null;
    
    // 更新UI
    this.updateUI();
    
    // 显示消息
    this.showNotification('已退出登录', '期待您的再次光临！');
  },
  
  // 更新UI
  updateUI() {
    // 获取认证菜单项
    const authItem = document.getElementById('auth-menu-item');
    if (!authItem) {
      // 如果不存在，重新创建
      this.createAuthUI();
      return;
    }
    
    // 根据登录状态更新内容
    if (this.currentUser) {
      authItem.innerHTML = `
        <a href="#" id="user-menu-toggle">
          <i class="fas fa-user-circle"></i> ${this.currentUser.username}
        </a>
        <div class="user-dropdown" id="user-dropdown">
          <a href="profile.html"><i class="fas fa-id-card"></i> 个人资料</a>
          <a href="achievements.html"><i class="fas fa-trophy"></i> 我的成就</a>
          <a href="saved-games.html"><i class="fas fa-save"></i> 游戏存档</a>
          <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> 退出登录</a>
        </div>
      `;
    } else {
      authItem.innerHTML = `
        <a href="#" id="login-btn">
          <i class="fas fa-sign-in-alt"></i> 登录/注册
        </a>
      `;
    }
    
    // 重新绑定事件
    this.bindAuthEvents();
    
    // 更新游戏进度和成就显示
    if (this.currentUser) {
      this.updateGameProgress();
      this.updateAchievements();
    }
  },
  
  // 更新游戏进度
  updateGameProgress() {
    // 获取用户游戏进度
    this.getUserGameProgress().then(progress => {
      // 更新游戏卡片显示
      document.querySelectorAll('.game-card').forEach(card => {
        const gameKey = card.getAttribute('data-game');
        if (!gameKey) return;
        
        // 检查是否有进度
        if (progress[gameKey]) {
          // 添加进度标签
          if (!card.querySelector('.progress-tag')) {
            const progressTag = document.createElement('div');
            progressTag.className = 'game-tag progress-tag';
            progressTag.textContent = '已保存';
            progressTag.style.backgroundColor = '#4caf50';
            card.appendChild(progressTag);
          }
        }
      });
    });
  },
  
  // 更新成就显示
  updateAchievements() {
    // 获取用户成就
    this.getUserAchievements().then(achievements => {
      // 更新成就区域
      const achievementsGrid = document.getElementById('achievements-grid');
      if (!achievementsGrid) return;
      
      // 遍历所有成就项
      achievementsGrid.querySelectorAll('.achievement-item').forEach(item => {
        const achievementId = item.getAttribute('data-achievement');
        if (!achievementId) return;
        
        // 检查是否已解锁
        if (achievements.includes(achievementId)) {
          item.classList.remove('achievement-locked');
        } else {
          item.classList.add('achievement-locked');
        }
      });
    });
  },
  
  // 获取用户游戏进度
  getUserGameProgress() {
    return new Promise((resolve) => {
      if (!this.currentUser) {
        resolve({});
        return;
      }
      
      if (this.config.useLocalStorage) {
        // 从本地存储获取
        const users = JSON.parse(localStorage.getItem(this.config.storagePrefix + 'users')) || [];
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (user && user.gameProgress) {
          resolve(user.gameProgress);
        } else {
          resolve({});
        }
      } else if (this.config.useServerAuth) {
        // 从服务器获取
        // 实际实现可能类似：
        /*
        fetch(this.config.apiEndpoint + '/progress', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem(this.config.storagePrefix + 'token')
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            resolve(data.progress);
          } else {
            resolve({});
          }
        })
        .catch(err => {
          console.error('Failed to get game progress:', err);
          resolve({});
        });
        */
        
        // 模拟异步
        setTimeout(() => {
          resolve({});
        }, 100);
      }
    });
  },
  
  // 获取用户成就
  getUserAchievements() {
    return new Promise((resolve) => {
      if (!this.currentUser) {
        resolve([]);
        return;
      }
      
      if (this.config.useLocalStorage) {
        // 从本地存储获取
        const users = JSON.parse(localStorage.getItem(this.config.storagePrefix + 'users')) || [];
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (user && user.achievements) {
          resolve(user.achievements);
        } else {
          resolve([]);
        }
      } else if (this.config.useServerAuth) {
        // 从服务器获取
        // 实际实现可能类似：
        /*
        fetch(this.config.apiEndpoint + '/achievements', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem(this.config.storagePrefix + 'token')
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            resolve(data.achievements);
          } else {
            resolve([]);
          }
        })
        .catch(err => {
          console.error('Failed to get achievements:', err);
          resolve([]);
        });
        */
        
        // 模拟异步
        setTimeout(() => {
          resolve([]);
        }, 100);
      }
    });
  },
  
  // 保存游戏进度
  saveGameProgress(gameKey, progressData) {
    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        reject(new Error('用户未登录'));
        return;
      }
      
      if (this.config.useLocalStorage) {
        // 获取用户数据
        const users = JSON.parse(localStorage.getItem(this.config.storagePrefix + 'users')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
          reject(new Error('用户不存在'));
          return;
        }
        
        // 更新游戏进度
        if (!users[userIndex].gameProgress) {
          users[userIndex].gameProgress = {};
        }
        
        users[userIndex].gameProgress[gameKey] = {
          ...progressData,
          updatedAt: new Date().toISOString()
        };
        
        // 保存到本地存储
        localStorage.setItem(this.config.storagePrefix + 'users', JSON.stringify(users));
        
        // 更新UI
        this.updateGameProgress();
        
        // 显示成功消息
        this.showNotification('进度已保存', '游戏进度已成功保存！');
        
        resolve(true);
      } else if (this.config.useServerAuth) {
        // 向服务器发送请求
        // 实际实现可能类似：
        /*
        fetch(this.config.apiEndpoint + '/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem(this.config.storagePrefix + 'token')
          },
          body: JSON.stringify({
            gameKey,
            progressData
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // 更新UI
            this.updateGameProgress();
            
            // 显示成功消息
            this.showNotification('进度已保存', '游戏进度已成功保存！');
            
            resolve(true);
          } else {
            reject(new Error(data.message || '保存失败'));
          }
        })
        .catch(err => {
          console.error('Failed to save game progress:', err);
          reject(err);
        });
        */
        
        // 模拟异步
        setTimeout(() => {
          // 显示成功消息
          this.showNotification('进度已保存', '游戏进度已成功保存！');
          resolve(true);
        }, 300);
      }
    });
  },
  
  // 加载游戏进度
  loadGameProgress(gameKey) {
    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        reject(new Error('用户未登录'));
        return;
      }
      
      if (this.config.useLocalStorage) {
        // 获取用户数据
        const users = JSON.parse(localStorage.getItem(this.config.storagePrefix + 'users')) || [];
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (!user) {
          reject(new Error('用户不存在'));
          return;
        }
        
        // 获取游戏进度
        if (user.gameProgress && user.gameProgress[gameKey]) {
          resolve(user.gameProgress[gameKey]);
        } else {
          resolve(null);
        }
      } else if (this.config.useServerAuth) {
        // 向服务器发送请求
        // 实际实现可能类似：
        /*
        fetch(`${this.config.apiEndpoint}/progress/${gameKey}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem(this.config.storagePrefix + 'token')
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            resolve(data.progress);
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Failed to load game progress:', err);
          reject(err);
        });
        */
        
        // 模拟异步
        setTimeout(() => {
          resolve(null);
        }, 200);
      }
    });
  },
  
  // 解锁成就
  unlockAchievement(achievementId) {
    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        reject(new Error('用户未登录'));
        return;
      }
      
      if (this.config.useLocalStorage) {
        // 获取用户数据
        const users = JSON.parse(localStorage.getItem(this.config.storagePrefix + 'users')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
          reject(new Error('用户不存在'));
          return;
        }
        
        // 检查成就是否已解锁
        if (!users[userIndex].achievements) {
          users[userIndex].achievements = [];
        }
        
        if (users[userIndex].achievements.includes(achievementId)) {
          resolve(false); // 已解锁，无需操作
          return;
        }
        
        // 解锁成就
        users[userIndex].achievements.push(achievementId);
        
        // 保存到本地存储
        localStorage.setItem(this.config.storagePrefix + 'users', JSON.stringify(users));
        
        // 更新UI
        this.updateAchievements();
        
        // 获取成就信息
        const achievementsList = window.GameAchievements || [];
        const achievement = achievementsList.find(a => a.id === achievementId);
        
        // 显示成就解锁通知
        if (achievement) {
          this.showNotification(
            '成就解锁',
            `恭喜解锁成就：${achievement.title}`,
            'achievement'
          );
        }
        
        resolve(true);
      } else if (this.config.useServerAuth) {
        // 向服务器发送请求
        // 实际实现可能类似：
        /*
        fetch(`${this.config.apiEndpoint}/achievements/unlock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem(this.config.storagePrefix + 'token')
          },
          body: JSON.stringify({
            achievementId
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // 更新UI
            this.updateAchievements();
            
            // 显示成就解锁通知
            if (data.achievement) {
              this.showNotification(
                '成就解锁',
                `恭喜解锁成就：${data.achievement.title}`,
                'achievement'
              );
            }
            
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(err => {
          console.error('Failed to unlock achievement:', err);
          reject(err);
        });
        */
        
        // 模拟异步
        setTimeout(() => {
          // 显示成就解锁通知
          this.showNotification(
            '成就解锁',
            '恭喜解锁新成就！',
            'achievement'
          );
          resolve(true);
        }, 200);
      }
    });
  },
  
  // 显示通知
  showNotification(title, message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // 设置图标
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'achievement') icon = 'fa-trophy';
    
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // 关闭按钮
    notification.querySelector('.notification-close').addEventListener('click', function() {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // 自动关闭
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  },
  
  // 生成token
  generateToken(user, rememberMe = false) {
    // 创建header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    // 创建payload
    const payload = {
      sub: user.id,
      name: user.username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60) // 30天或1天
    };
    
    // 编码header和payload
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    // 创建签名（实际应用中应使用加密算法）
    const signature = btoa(`${encodedHeader}.${encodedPayload}`);
    
    // 返回token
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },
  
  // 密码哈希（实际应用中应使用更安全的算法）
  hashPassword(password) {
    // 简单的哈希实现，仅用于演示
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  UserAuth.init();
});

// 导出认证对象
window.UserAuth = UserAuth;
