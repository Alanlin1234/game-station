// 错误处理中间件
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // 默认错误状态码
    let statusCode = err.statusCode || 500;
    let message = err.message || '服务器内部错误';
    
    // 根据错误类型设置不同的响应
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = '数据验证失败';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = '未授权访问';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = '无效的数据格式';
    }
    
    // 开发环境下返回详细错误信息
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(isDevelopment && { stack: err.stack })
    });
};

// 404 错误处理
const notFound = (req, res, next) => {
    const error = new Error(`未找到路径 - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};