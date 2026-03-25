/**
 * 请求日志中间件
 *
 * 功能：
 * 1. 记录所有API请求
 * 2. 记录响应状态码和耗时
 * 3. 记录请求参数和IP
 * 4. 区分不同日志级别
 */

const logger = require('../utils/logger');

/**
 * 请求日志中间件
 *
 * 记录信息包括：
 * - 请求方法和路径
 * - 请求参数（query, body, params）
 * - 响应状态码
 * - 请求耗时
 * - 客户端IP
 * - User-Agent
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // 记录请求开始
  logger.info('📥 请求接收', {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    params: req.params,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // 根据状态码选择日志级别
    let logLevel = 'info';
    let logMessage = '✅ 请求完成';

    if (statusCode >= 400 && statusCode < 500) {
      logLevel = 'warn';
      logMessage = '⚠️ 客户端错误';
    } else if (statusCode >= 500) {
      logLevel = 'error';
      logMessage = '❌ 服务器错误';
    }

    // 记录响应信息
    logger.log(logLevel, logMessage, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // 慢请求警告（超过1秒）
    if (duration > 1000) {
      logger.warn('🐌 慢请求警告', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        ip: req.ip
      });
    }

    // 非常慢的请求告警（超过3秒）
    if (duration > 3000) {
      logger.error('🚨 非常慢的请求', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        ip: req.ip
      });
    }
  });

  next();
};

/**
 * 简化版请求日志（仅记录关键信息）
 */
const simpleRequestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl } = req;
    const statusCode = res.statusCode;

    // 格式: GET /api/v1/game/public 200 125ms
    console.log(`${method} ${originalUrl} ${statusCode} ${duration}ms`);
  });

  next();
};

/**
 * 过滤敏感参数的日志中间件
 *
 * 某些参数不应记录到日志中（如密码、token等）
 */
const sanitizeRequest = (req, res, next) => {
  const originalQuery = req.query;
  const originalBody = req.body;

  // 需要过滤的字段
  const sensitiveFields = ['password', 'passwd', 'secret', 'token', 'apikey', 'api_key'];

  // 过滤query参数
  if (originalQuery) {
    req.query = { ...originalQuery };
    sensitiveFields.forEach(field => {
      if (req.query[field]) {
        req.query[field] = '[FILTERED]';
      }
    });
  }

  // 过滤body参数
  if (originalBody) {
    req.body = { ...originalBody };
    sensitiveFields.forEach(field => {
      if (req.body[field]) {
        req.body[field] = '[FILTERED]';
      }
    });
  }

  // 恢复原始数据（用于后续处理）
  req._originalQuery = originalQuery;
  req._originalBody = originalBody;

  next();
};

module.exports = {
  requestLogger,
  simpleRequestLogger,
  sanitizeRequest
};
