/**
 * 错误处理中间件
 *
 * 功能：
 * 1. 捕获所有错误
 * 2. 统一错误响应格式
 * 3. 记录错误日志
 * 4. 不暴露敏感信息到客户端
 */

const logger = require('../utils/logger');

/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, code = 5000, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found 处理
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`路由不存在: ${req.originalUrl}`, 1004, 404);
  next(error);
};

/**
 * 全局错误处理中间件
 *
 * 错误代码规范：
 * - 1000-1999: 客户端错误（参数错误、权限错误等）
 * - 2000-2999: 资源错误（未找到、冲突等）
 * - 3000-3999: 业务逻辑错误
 * - 4000-4999: 第三方服务错误
 * - 5000-5999: 服务器内部错误
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error('错误捕获:', {
    message: err.message,
    code: err.code,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // 默认错误响应
  let statusCode = error.statusCode || 500;
  let code = error.code || 5000;
  let message = error.message || '服务器内部错误';

  // Mongoose validation error (如果使用MongoDB)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 1001;
    message = '参数验证失败';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    code = 2001;
    message = '数据已存在';
  }

  // Mongoose cast error (无效的ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 1001;
    message = '无效的ID格式';
  }

  // JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 1001;
    message = '请求数据格式错误';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 2001;
    message = 'Token无效';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 2002;
    message = 'Token已过期';
  }

  // 数据库错误（sql.js）
  if (err.message && err.message.includes('SQLITE_CONSTRAINT')) {
    statusCode = 400;
    code = 2001;
    message = '数据约束冲突';
  }

  // 开发环境返回错误堆栈
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    code,
    message,
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack, error: err })
  });
};

/**
 * 异步错误包装器
 * 用于捕获async/await函数中的错误
 *
 * @param {Function} fn - 异步函数
 * @returns {Function} - Express中间件
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
  catchAsync
};
