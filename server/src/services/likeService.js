// 根据DB_TYPE动态选择数据库配置
const dbType = process.env.DB_TYPE || 'sqljs';
const dbConfig = require(`../config/database-${dbType}`);
const { get, run, query } = dbConfig;
const logger = require('../utils/logger');

/**
 * 点赞服务层
 */

/**
 * 点赞游戏
 * @param {number} userId - 用户ID
 * @param {number} gameId - 游戏ID
 * @returns {Promise<Object>} 点赞结果
 */
const likeGame = async (userId, gameId) => {
  try {
    // 检查游戏是否存在
    const game = await get(
      'SELECT id, user_id, like_count FROM games WHERE id = ?',
      [gameId]
    );

    if (!game) {
      throw new Error('游戏不存在');
    }

    // 不能给自己的游戏点赞
    if (game.user_id === userId) {
      throw new Error('不能给自己的游戏点赞');
    }

    // 检查是否已经点赞
    const existingLike = await get(
      'SELECT id FROM likes WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (existingLike) {
      throw new Error('已经点赞过了');
    }

    // 创建点赞记录
    await run(
      'INSERT INTO likes (user_id, game_id) VALUES (?, ?)',
      [userId, gameId]
    );

    // 更新游戏点赞数（通过触发器自动更新，但这里手动更新以确保一致性）
    await run(
      'UPDATE games SET like_count = like_count + 1 WHERE id = ?',
      [gameId]
    );

    // 获取更新后的游戏信息
    const updatedGame = await get(
      'SELECT like_count FROM games WHERE id = ?',
      [gameId]
    );

    logger.info(`✅ 用户点赞成功: userId=${userId}, gameId=${gameId}`);

    return {
      liked: true,
      likeCount: updatedGame.like_count
    };
  } catch (error) {
    logger.error('❌ 点赞失败:', error.message);
    throw error;
  }
};

/**
 * 取消点赞游戏
 * @param {number} userId - 用户ID
 * @param {number} gameId - 游戏ID
 * @returns {Promise<Object>} 取消点赞结果
 */
const unlikeGame = async (userId, gameId) => {
  try {
    // 检查游戏是否存在
    const game = await get(
      'SELECT id FROM games WHERE id = ?',
      [gameId]
    );

    if (!game) {
      throw new Error('游戏不存在');
    }

    // 检查是否已经点赞
    const existingLike = await get(
      'SELECT id FROM likes WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (!existingLike) {
      throw new Error('尚未点赞');
    }

    // 删除点赞记录
    await run(
      'DELETE FROM likes WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    // 更新游戏点赞数
    await run(
      'UPDATE games SET like_count = like_count - 1 WHERE id = ?',
      [gameId]
    );

    // 获取更新后的游戏信息
    const updatedGame = await get(
      'SELECT like_count FROM games WHERE id = ?',
      [gameId]
    );

    logger.info(`✅ 用户取消点赞成功: userId=${userId}, gameId=${gameId}`);

    return {
      liked: false,
      likeCount: updatedGame.like_count
    };
  } catch (error) {
    logger.error('❌ 取消点赞失败:', error.message);
    throw error;
  }
};

/**
 * 检查用户是否点赞了游戏
 * @param {number} userId - 用户ID
 * @param {number} gameId - 游戏ID
 * @returns {Promise<boolean>} 是否已点赞
 */
const checkLikeStatus = async (userId, gameId) => {
  try {
    const like = await get(
      'SELECT id FROM likes WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    return !!like;
  } catch (error) {
    logger.error('❌ 检查点赞状态失败:', error.message);
    return false;
  }
};

/**
 * 批量检查用户对多个游戏的点赞状态
 * @param {number} userId - 用户ID
 * @param {Array<number>} gameIds - 游戏ID数组
 * @returns {Promise<Object>} 游戏ID到点赞状态的映射
 */
const checkMultipleLikeStatus = async (userId, gameIds) => {
  try {
    if (!userId || gameIds.length === 0) {
      return {};
    }

    const placeholders = gameIds.map(() => '?').join(',');
    const likes = await query(
      `SELECT game_id FROM likes WHERE user_id = ? AND game_id IN (${placeholders})`,
      [userId, ...gameIds]
    );

    const likeMap = {};
    gameIds.forEach(id => {
      likeMap[id] = false;
    });

    likes.forEach(like => {
      likeMap[like.game_id] = true;
    });

    return likeMap;
  } catch (error) {
    logger.error('❌ 批量检查点赞状态失败:', error.message);
    return {};
  }
};

/**
 * 获取游戏的点赞用户列表
 * @param {number} gameId - 游戏ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 点赞用户列表
 */
const getGameLikers = async (gameId, options = {}) => {
  try {
    const { limit = 20, offset = 0 } = options;

    // 检查游戏是否存在
    const game = await get(
      'SELECT id FROM games WHERE id = ?',
      [gameId]
    );

    if (!game) {
      throw new Error('游戏不存在');
    }

    // 获取点赞用户
    const likers = await query(
      `SELECT u.id, u.nickname, u.avatar, l.created_at
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.game_id = ?
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [gameId, limit, offset]
    );

    // 获取总数
    const countResult = await get(
      'SELECT COUNT(*) as total FROM likes WHERE game_id = ?',
      [gameId]
    );

    return {
      likers,
      total: countResult.total
    };
  } catch (error) {
    logger.error('❌ 获取点赞用户列表失败:', error.message);
    throw error;
  }
};

/**
 * 获取用户点赞的游戏列表
 * @param {number} userId - 用户ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 点赞游戏列表
 */
const getUserLikedGames = async (userId, options = {}) => {
  try {
    const { limit = 20, offset = 0 } = options;

    const games = await query(
      `SELECT g.id, g.user_id, g.title, g.description, g.type, g.thumbnail,
              g.visibility, g.like_count, g.play_count, g.created_at,
              u.nickname as author_nickname, u.avatar as author_avatar,
              l.created_at as liked_at
       FROM likes l
       JOIN games g ON l.game_id = g.id
       JOIN users u ON g.user_id = u.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // 获取总数
    const countResult = await get(
      'SELECT COUNT(*) as total FROM likes WHERE user_id = ?',
      [userId]
    );

    logger.debug(`📋 获取用户点赞游戏: userId=${userId}, count=${games.length}`);

    return {
      games,
      total: countResult.total
    };
  } catch (error) {
    logger.error('❌ 获取用户点赞游戏失败:', error.message);
    throw error;
  }
};

module.exports = {
  likeGame,
  unlikeGame,
  checkLikeStatus,
  checkMultipleLikeStatus,
  getGameLikers,
  getUserLikedGames
};
