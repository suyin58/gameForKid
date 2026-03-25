const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * JWT认证中间件
 * 验证请求头中的Token，并将用户信息添加到req对象
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取Token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证Token',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证Token
    const decoded = verifyToken(authHeader);

    // 将用户信息添加到请求对象
    req.user = {
      userId: decoded.userId,
      openid: decoded.openid
    };

    logger.debug(`✅ 用户认证成功: userId=${req.user.userId}`);
    next();
  } catch (error) {
    logger.warn('⚠️  认证失败:', error.message);

    return res.status(401).json({
      code: 401,
      message: error.message === 'Token已过期' ? 'Token已过期，请重新登录' : '认证失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 可选的JWT认证中间件
 * 如果提供了Token则验证，没有Token也继续执行
 * 用于某些可以未登录访问但登录后体验更好的接口
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const decoded = verifyToken(authHeader);
      req.user = {
        userId: decoded.userId,
        openid: decoded.openid
      };
      logger.debug(`✅ 可选认证成功: userId=${req.user.userId}`);
    }

    next();
  } catch (error) {
    // Token无效时不阻止请求，只是不设置req.user
    logger.debug('⚠️  可选认证失败，继续执行:', error.message);
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
