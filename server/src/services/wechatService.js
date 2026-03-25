const axios = require('axios');
// 根据DB_TYPE动态选择数据库配置
const dbType = process.env.DB_TYPE || 'sqljs';
const dbConfig = require(`../config/database-${dbType}`);
const { connectDB, get, run } = dbConfig;
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * 微信小程序配置
 */
const WECHAT_APPID = process.env.WECHAT_APPID || '';
const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

/**
 * 微信登录API地址
 */
const WECHAT_JSCODE2SESSION_URL = 'https://api.weixin.qq.com/sns/jscode2session';

/**
 * 微信登录服务
 * @param {string} code - 微信小程序登录code
 * @returns {Promise<Object>} 登录结果 {token, user, isNewUser}
 */
const wechatLogin = async (code) => {
  try {
    // 验证环境变量
    if (!WECHAT_APPID || !WECHAT_SECRET) {
      logger.error('❌ 微信AppID或Secret未配置');
      throw new Error('微信配置未完成，请联系管理员');
    }

    // 1. 调用微信接口，用code换取openid和session_key
    logger.info('🔄 正在调用微信登录API...');
    const wechatResponse = await axios.get(WECHAT_JSCODE2SESSION_URL, {
      params: {
        appid: WECHAT_APPID,
        secret: WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      },
      timeout: 10000 // 10秒超时
    });

    const { openid, session_key, unionid, errcode, errmsg } = wechatResponse.data;

    // 检查微信API返回的错误
    if (errcode) {
      logger.error(`❌ 微信API返回错误: errcode=${errcode}, errmsg=${errmsg}`);
      throw new Error(`微信登录失败: ${errmsg || '无效的code'}`);
    }

    if (!openid) {
      logger.error('❌ 微信API未返回openid');
      throw new Error('微信登录失败: 未获取到openid');
    }

    logger.info(`✅ 微信登录成功, openid=${openid}`);

    // 2. 连接数据库
    const db = await connectDB();

    // 3. 查询用户是否已存在
    const existingUser = get(
      'SELECT * FROM users WHERE openid = ? LIMIT 1',
      [openid]
    );

    let user;
    let isNewUser = false;

    if (existingUser) {
      // 用户已存在，更新登录时间
      logger.info(`👤 用户已存在: userId=${existingUser.id}`);
      await run(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [existingUser.id]
      );
      user = existingUser;
    } else {
      // 新用户，创建用户记录
      logger.info('🆕 创建新用户...');

      // 随机头像（使用dicebear API）
      const avatarSeed = Math.random().toString(36).substring(7);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

      await run(
        `INSERT INTO users (openid, nickname, avatar, bio, game_count, like_count)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [openid, '小玩家', avatar, '', 0, 0]
      );

      // 获取新创建的用户
      user = get(
        'SELECT * FROM users WHERE openid = ? LIMIT 1',
        [openid]
      );

      isNewUser = true;
      logger.info(`✅ 新用户创建成功: userId=${user.id}`);
    }

    // 4. 生成JWT Token
    const token = generateToken({
      userId: user.id,
      openid: user.openid
    });

    // 5. 返回登录结果
    return {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        gameCount: user.game_count,
        likeCount: user.like_count,
        createdAt: user.created_at
      },
      isNewUser
    };
  } catch (error) {
    logger.error('❌ 微信登录失败:', error.message);

    // 网络错误或超时
    if (error.code === 'ECONNABORTED') {
      throw new Error('连接微信服务器超时，请重试');
    }

    // 重新抛出错误
    throw error;
  }
};

/**
 * 获取用户信息
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 用户信息
 */
const getUserInfo = async (userId) => {
  try {
    const user = get(
      'SELECT id, openid, nickname, avatar, bio, game_count, like_count, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      gameCount: user.game_count,
      likeCount: user.like_count,
      createdAt: user.created_at
    };
  } catch (error) {
    logger.error('❌ 获取用户信息失败:', error.message);
    throw error;
  }
};

/**
 * 更新用户信息
 * @param {number} userId - 用户ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise<Object>} 更新后的用户信息
 */
const updateUserInfo = async (userId, updateData) => {
  try {
    const { nickname, avatar, bio } = updateData;

    // 构建更新SQL
    const updateFields = [];
    const updateValues = [];

    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }

    if (updateFields.length === 0) {
      throw new Error('没有要更新的字段');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await run(sql, updateValues);

    return await getUserInfo(userId);
  } catch (error) {
    logger.error('❌ 更新用户信息失败:', error.message);
    throw error;
  }
};

module.exports = {
  wechatLogin,
  getUserInfo,
  updateUserInfo
};
