/**
 * 社交分享功能
 * 允许用户将游戏分享到各种社交媒体平台
 */

const SocialShare = (function() {
    // 配置
    const config = {
        platforms: {
            facebook: {
                name: 'Facebook',
                url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}&quote={{text}}',
                icon: 'bi-facebook'
            },
            twitter: {
                name: 'Twitter',
                url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}',
                icon: 'bi-twitter'
            },
            weibo: {
                name: '微博',
                url: 'http://service.weibo.com/share/share.php?url={{url}}&title={{text}}',
                icon: 'bi-sina-weibo'
            },
            wechat: {
                name: '微信',
                url: '#',
                icon: 'bi-wechat',
                qrcode: true
            },
            qq: {
                name: 'QQ',
                url: 'http://connect.qq.com/widget/shareqq/index.html?url={{url}}&title={{title}}&desc={{text}}',
                icon: 'bi-tencent-qq'
            }
        },
        defaultTitle: '游戏乐园 - 免费在线小游戏集合',
        defaultText: '我在游戏乐园玩了一个超好玩的游戏，快来试试吧！',
        defaultImage: 'https://www.youxileyuan.com/images/logo.png',
        defaultUrl: window.location.href
    };

    // 私有方法
    function generateShareUrl(platform, options) {
        const platformConfig = config.platforms[platform];
        if (!platformConfig) return null;

        const url = encodeURIComponent(options.url || config.defaultUrl);
        const text = encodeURIComponent(options.text || config.defaultText);
        const title = encodeURIComponent(options.title || config.defaultTitle);
        const image = encodeURIComponent(options.image || config.defaultImage);

        let shareUrl = platformConfig.url
            .replace('{{url}}', url)
            .replace('{{text}}', text)
            .replace('{{title}}', title)
            .replace('{{image}}', image);

        return shareUrl;
    }

    function showQRCode(url) {
        // 检查是否已经加载了QRCode库
        if (typeof QRCode === 'undefined') {
            // 动态加载QRCode库
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
            script.onload = function() {
                createQRCodeModal(url);
            };
            document.head.appendChild(script);
        } else {
            createQRCodeModal(url);
        }
    }

    function createQRCodeModal(url) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'qrcodeModal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'qrcodeModalLabel');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="qrcodeModalLabel">微信扫码分享</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div id="qrcodeContainer"></div>
                        <p class="mt-3">打开微信，扫描二维码分享</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 创建二维码
        const qrcodeContainer = document.getElementById('qrcodeContainer');
        new QRCode(qrcodeContainer, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // 显示模态框
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // 模态框关闭后移除
        modal.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    }

    // 创建分享按钮
    function createShareButtons(selector, options = {}) {
        const container = document.querySelector(selector);
        if (!container) return;

        container.innerHTML = '';
        
        Object.keys(config.platforms).forEach(platform => {
            const platformConfig = config.platforms[platform];
            
            const button = document.createElement('button');
            button.className = 'btn btn-sm me-2 mb-2';
            button.classList.add(getPlatformButtonClass(platform));
            button.innerHTML = `<i class="bi ${platformConfig.icon}"></i> ${platformConfig.name}`;
            
            button.addEventListener('click', function() {
                shareToPlaftorm(platform, options);
            });
            
            container.appendChild(button);
        });
    }

    function getPlatformButtonClass(platform) {
        switch(platform) {
            case 'facebook': return 'btn-primary';
            case 'twitter': return 'btn-info';
            case 'weibo': return 'btn-danger';
            case 'wechat': return 'btn-success';
            case 'qq': return 'btn-primary';
            default: return 'btn-secondary';
        }
    }

    // 公共方法
    function shareToPlaftorm(platform, options = {}) {
        const platformConfig = config.platforms[platform];
        if (!platformConfig) return;

        // 记录分享事件
        trackShareEvent(platform, options);

        // 微信分享需要显示二维码
        if (platformConfig.qrcode) {
            showQRCode(options.url || config.defaultUrl);
            return;
        }

        // 其他平台通过URL分享
        const shareUrl = generateShareUrl(platform, options);
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    function trackShareEvent(platform, options) {
        // 如果存在分析工具，记录分享事件
        if (window.gameAnalytics) {
            window.gameAnalytics.trackEvent('share', {
                platform: platform,
                game: options.game || 'unknown',
                url: options.url || config.defaultUrl
            });
        }
        
        // 记录到本地存储
        const shareStats = JSON.parse(localStorage.getItem('shareStats') || '{}');
        if (!shareStats[platform]) {
            shareStats[platform] = 0;
        }
        shareStats[platform]++;
        localStorage.setItem('shareStats', JSON.stringify(shareStats));
    }

    // 初始化
    function init() {
        // 全局分享函数
        window.shareGame = function(platform, options = {}) {
            // 合并当前页面信息
            const pageOptions = {
                url: window.location.href,
                title: document.title,
                text: document.querySelector('meta[name="description"]')?.content || config.defaultText,
                image: document.querySelector('meta[property="og:image"]')?.content || config.defaultImage
            };
            
            shareToPlaftorm(platform, Object.assign({}, pageOptions, options));
        };
        
        // 自动为带有data-share属性的元素添加分享功能
        document.addEventListener('click', function(e) {
            const shareButton = e.target.closest('[data-share]');
            if (shareButton) {
                const platform = shareButton.getAttribute('data-share');
                const game = shareButton.getAttribute('data-game');
                const score = shareButton.getAttribute('data-score');
                
                let shareText = config.defaultText;
                if (game && score) {
                    shareText = `我在游戏乐园的${game}游戏中获得了${score}分！快来挑战我吧！`;
                }
                
                shareToPlaftorm(platform, {
                    text: shareText,
                    game: game
                });
            }
        });
    }

    // 公开API
    return {
        init: init,
        share: shareToPlaftorm,
        createButtons: createShareButtons,
        getStats: function() {
            return JSON.parse(localStorage.getItem('shareStats') || '{}');
        }
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    SocialShare.init();
});