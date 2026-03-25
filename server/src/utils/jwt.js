const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * JWT配置
 */
const JWT_SECRET = process.env.JWT_SECRET || 'kidsgame-secret-key-development-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * 生成JWT Token
 * @param {Object} payload - Token载荷数据
 * @param {number} payload.userId - 用户ID
 * @param {string} payload.openid - 用户OpenID
 * @returns {string} JWT Token
 */
const generateToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        openid: payload.openid
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256'
      }
    );

    logger.info(`✅ 生成Token成功, 用户ID: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error('❌ 生成Token失败:', error);
    throw new Error('生成Token失败');
  }
};

/**
 * 验证JWT Token
 * @param {string} token - JWT Token
 * @returns {Object} 解码后的Token数据
 * @throws {Error} Token验证失败
 */
const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token不能为空');
    }

    // 移除 "Bearer " 前缀（如果存在）
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    const decoded = jwt.verify(actualToken, JWT_SECRET, {
      algorithms: ['HS256']
    });

    logger.debug(`✅ Token验证成功, 用户ID: ${decoded.userId}`);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('⚠️  Token已过期');
      throw new Error('Token已过期');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('⚠️  Token无效:', error.message);
      throw new Error('Token无效');
    } else {
      logger.error('❌ Token验证失败:', error);
      throw error;
    }
  }
};

/**
 * 从Token中解析用户ID
 * @param {string} token - JWT Token
 * @returns {number} 用户ID
 */
const getUserIdFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded.userId;
};

module.exports = {
  generateToken,
  verifyToken,
  getUserIdFromToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
