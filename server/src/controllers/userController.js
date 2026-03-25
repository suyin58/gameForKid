const { wechatLogin, getUserInfo, updateUserInfo } = require('../services/wechatService');
const logger = require('../utils/logger');

/**
 * 用户登录控制器
 * POST /api/v1/user/login
 */
const login = async (req, res) => {
  try {
    const { code } = req.body;

    // 验证请求参数
    if (!code) {
      return res.status(400).json({
        code: 1001,
        message: '缺少必要参数: code',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 调用登录服务
    const result = await wechatLogin(code);

    logger.info(`✅ 用户登录成功: userId=${result.user.id}, isNewUser=${result.isNewUser}`);

    // 返回登录结果
    res.json({
      code: 0,
      message: result.isNewUser ? '登录成功，欢迎新用户！' : '登录成功',
      data: {
        token: result.token,
        user: result.user
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 登录失败:', error.message);

    // 根据错误类型返回不同的状态码
    const statusCode = error.message.includes('微信') ? 400 : 500;

    res.status(statusCode).json({
      code: statusCode === 400 ? 1002 : 5000,
      message: error.message || '登录失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 获取当前用户信息控制器
 * GET /api/v1/user/info
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 获取用户信息
    const user = await getUserInfo(userId);

    logger.debug(`✅ 获取用户信息成功: userId=${userId}`);

    res.json({
      code: 0,
      message: '获取用户信息成功',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取用户信息失败:', error.message);

    res.status(404).json({
      code: 1003,
      message: error.message || '用户不存在',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 更新用户信息控制器
 * PUT /api/v1/user/info
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nickname, avatar, bio } = req.body;

    // 验证参数
    if (nickname !== undefined && typeof nickname !== 'string') {
      return res.status(400).json({
        code: 1001,
        message: '昵称格式不正确',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (nickname !== undefined && (nickname.length < 1 || nickname.length > 20)) {
      return res.status(400).json({
        code: 1001,
        message: '昵称长度必须在1-20个字符之间',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (bio !== undefined && bio.length > 100) {
      return res.status(400).json({
        code: 1001,
        message: '个人简介不能超过100个字符',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 调用更新服务
    const updatedUser = await updateUserInfo(userId, { nickname, avatar, bio });

    logger.info(`✅ 用户信息更新成功: userId=${userId}`);

    res.json({
      code: 0,
      message: '更新成功',
      data: updatedUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 更新用户信息失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '更新失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 获取指定用户信息（公开接口）
 * GET /api/v1/user/:userId
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // 验证userId
    const targetUserId = parseInt(userId);
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        code: 1001,
        message: '用户ID格式不正确',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 获取用户信息
    const user = await getUserInfo(targetUserId);

    logger.debug(`✅ 获取用户信息成功: userId=${targetUserId}`);

    res.json({
      code: 0,
      message: '获取用户信息成功',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取用户信息失败:', error.message);

    res.status(404).json({
      code: 1003,
      message: error.message || '用户不存在',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  updateUser,
  getUserById
};
