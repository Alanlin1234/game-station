// 认证中间件
const jwt = require('jsonwebtoken');

// JWT密钥（实际项目中应该使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证JWT令牌
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: '访问令牌缺失'
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: '无效的访问令牌'
            });
        }
        
        req.user = user;
        next();
    });
};

// 可选的认证中间件（令牌存在时验证，不存在时继续）
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    
    next();
};

// 生成JWT令牌
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username,
            email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// 验证管理员权限
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '需要登录'
        });
    }
    
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: '需要管理员权限'
        });
    }
    
    next();
};

// 验证用户身份（用户只能访问自己的资源）
const requireOwnership = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '需要登录'
        });
    }
    
    const resourceUserId = req.params.userId || req.body.userId;
    
    if (req.user.id !== resourceUserId && !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: '无权访问此资源'
        });
    }
    
    next();
};

// 限制请求频率的中间件
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requests.has(clientId)) {
            requests.set(clientId, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const clientData = requests.get(clientId);
        
        if (now > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = now + windowMs;
            return next();
        }
        
        if (clientData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: '请求过于频繁，请稍后再试'
            });
        }
        
        clientData.count++;
        next();
    };
};

// 验证请求体数据
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: '请求数据验证失败',
                details: error.details.map(detail => detail.message)
            });
        }
        
        next();
    };
};

// CORS中间件
const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    generateToken,
    requireAdmin,
    requireOwnership,
    rateLimit,
    validateRequest,
    corsMiddleware
};