/**
 * 认证中间件 (Auth Middleware)
 *
 * 功能：
 * - 验证JWT Token
 * - 提取用户信息到请求对象
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { env } = require('../config/env');

// JWT密钥（从环境变量读取）
const JWT_SECRET = env.jwt.secret;

function createAuthMiddleware(db) {
  /**
   * 验证JWT Token
   */
  const auth = (req, res, next) => {
    try {
      // 获取Token
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          code: 401,
          message: '未提供认证Token',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      const token = authHeader.substring(7); // 移除 "Bearer " 前缀

      // 验证Token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            code: 401,
            message: 'Token已过期，请重新登录',
            data: null,
            timestamp: new Date().toISOString()
          });
        }
        return res.status(401).json({
          code: 401,
          message: 'Token无效',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      // 将用户信息添加到请求对象
      req.user = {
        id: decoded.user_id || decoded.id,
        openid: decoded.openid,
        quotaType: decoded.quotaType || 'free' // 默认为免费用户
      };

      next();
    } catch (error) {
      logger.error('认证中间件错误:', error);
      return res.status(500).json({
        code: 500,
        message: '认证服务错误',
        data: null,
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * 可选认证（不强制要求Token）
   */
  const optionalAuth = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 没有Token，继续处理请求
        req.user = null;
        return next();
      }

      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
          id: decoded.user_id || decoded.id,
          openid: decoded.openid,
          quotaType: decoded.quotaType || 'free'
        };
      } catch (jwtError) {
        // Token无效，但不阻止请求
        req.user = null;
      }

      next();
    } catch (error) {
      logger.error('可选认证中间件错误:', error);
      req.user = null;
      next();
    }
  };

  return {
    auth,
    optionalAuth
  };
}

module.exports = createAuthMiddleware;
