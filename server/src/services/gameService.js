// 根据DB_TYPE动态选择数据库配置
const dbType = process.env.DB_TYPE || 'sqljs';
const dbConfig = require(`../config/database-${dbType}`);
const { get, query, run } = dbConfig;
const logger = require('../utils/logger');

/**
 * 游戏服务层
 */

/**
 * 创建游戏
 * @param {number} userId - 用户ID
 * @param {Object} gameData - 游戏数据
 * @returns {Promise<Object>} 创建的游戏
 */
const createGame = async (userId, gameData) => {
  try {
    const { title, description, code, type, thumbnail, visibility } = gameData;

    // 验证必填字段
    if (!code || code.trim() === '') {
      throw new Error('游戏代码不能为空');
    }

    // 验证可见性值
    const validVisibility = ['public', 'private', 'unlisted'];
    const gameVisibility = validVisibility.includes(visibility) ? visibility : 'private';

    // 验证游戏类型
    const validTypes = ['casual', 'education', 'sports', 'adventure', 'puzzle'];
    const gameType = validTypes.includes(type) ? type : 'casual';

    // 插入游戏
    const result = await run(
      `INSERT INTO games (user_id, title, description, code, type, thumbnail, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [userId, title || '未命名游戏', description || '', code, gameType, thumbnail || '', gameVisibility]
    );

    // 获取新创建的游戏
    const newGame = await get(
      'SELECT id, user_id, title, description, code, type, thumbnail, visibility, like_count, play_count, created_at FROM games WHERE id = ?',
      [result.lastID]
    );

    logger.info(`✅ 创建游戏成功: gameId=${newGame.id}, userId=${userId}`);
    return newGame;
  } catch (error) {
    logger.error('❌ 创建游戏失败:', error.message);
    throw error;
  }
};

/**
 * 获取游戏详情
 * @param {number} gameId - 游戏ID
 * @param {number} userId - 当前用户ID（可选，用于检查是否已点赞）
 * @returns {Promise<Object>} 游戏详情
 */
const getGameById = async (gameId, userId = null) => {
  try {
    const game = await get(
      `SELECT id, user_id, title, description, code, type, thumbnail, visibility,
              is_cloned, cloned_from, like_count, play_count, created_at, updated_at
       FROM games WHERE id = ?`,
      [gameId]
    );

    if (!game) {
      throw new Error('游戏不存在');
    }

    // 检查当前用户是否已点赞
    let isLiked = false;
    if (userId) {
      const like = await get(
        'SELECT id FROM likes WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );
      isLiked = !!like;
    }

    // 获取作者信息
    const author = await get(
      'SELECT id, nickname, avatar FROM users WHERE id = ?',
      [game.user_id]
    );

    return {
      ...game,
      isLiked,
      author: author || { id: game.user_id, nickname: '未知用户', avatar: '' }
    };
  } catch (error) {
    logger.error('❌ 获取游戏详情失败:', error.message);
    throw error;
  }
};

/**
 * 获取用户的游戏列表
 * @param {number} userId - 用户ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Array>} 游戏列表
 */
const getGamesByUser = async (userId, options = {}) => {
  try {
    const { visibility = 'all', limit = 20, offset = 0 } = options;

    let sql = 'SELECT id, user_id, title, description, type, thumbnail, visibility, like_count, play_count, created_at FROM games WHERE user_id = ?';
    const params = [userId];

    // 可见性过滤
    if (visibility !== 'all') {
      sql += ' AND visibility = ?';
      params.push(visibility);
    }

    // 排序和分页
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const games = await query(sql, params);

    logger.debug(`📋 获取用户游戏列表: userId=${userId}, count=${games.length}`);
    return games;
  } catch (error) {
    logger.error('❌ 获取用户游戏列表失败:', error.message);
    throw error;
  }
};

/**
 * 获取公开游戏广场列表
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 游戏列表和总数
 */
const getPublicGames = async (options = {}) => {
  try {
    const {
      type,
      sortBy = 'created_at',
      order = 'DESC',
      limit = 20,
      offset = 0
    } = options;

    let sql = 'SELECT id, user_id, title, description, type, thumbnail, visibility, like_count, play_count, created_at FROM games WHERE visibility = ?';
    const params = ['public'];

    // 类型过滤
    if (type && type !== 'all') {
      sql += ' AND type = ?';
      params.push(type);
    }

    // 排序
    const validSortFields = ['created_at', 'like_count', 'play_count', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const games = await query(sql, params);

    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM games WHERE visibility = ?';
    const countParams = ['public'];

    if (type && type !== 'all') {
      countSql += ' AND type = ?';
      countParams.push(type);
    }

    const countResult = await get(countSql, countParams);
    const total = countResult.total;

    logger.debug(`📋 获取公开游戏列表: count=${games.length}, total=${total}`);
    return { games, total };
  } catch (error) {
    logger.error('❌ 获取公开游戏列表失败:', error.message);
    throw error;
  }
};

/**
 * 搜索游戏（按标题或作者昵称）
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 游戏列表和总数
 */
const searchGames = async (options = {}) => {
  try {
    const {
      keyword,
      type,
      sortBy = 'created_at',
      order = 'DESC',
      limit = 20,
      offset = 0
    } = options;

    // 验证关键词
    if (!keyword || keyword.trim().length === 0) {
      throw new Error('搜索关键词不能为空');
    }

    if (keyword.length > 50) {
      throw new Error('搜索关键词过长，请控制在50个字符以内');
    }

    const searchPattern = `%${keyword.trim()}%`;

    // 搜索公开游戏，匹配标题或作者昵称
    let sql = `SELECT g.id, g.user_id, g.title, g.description, g.type, g.thumbnail, g.visibility,
                      g.like_count, g.play_count, g.created_at
               FROM games g
               LEFT JOIN users u ON g.user_id = u.id
               WHERE g.visibility = ?
               AND (g.title LIKE ? OR u.nickname LIKE ?)`;
    const params = ['public', searchPattern, searchPattern];

    // 类型过滤
    if (type && type !== 'all') {
      sql += ' AND g.type = ?';
      params.push(type);
    }

    // 排序
    const validSortFields = ['created_at', 'like_count', 'play_count', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY g.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const games = await query(sql, params);

    // 获取总数
    let countSql = `SELECT COUNT(*) as total
                    FROM games g
                    LEFT JOIN users u ON g.user_id = u.id
                    WHERE g.visibility = ?
                    AND (g.title LIKE ? OR u.nickname LIKE ?)`;
    const countParams = ['public', searchPattern, searchPattern];

    if (type && type !== 'all') {
      countSql += ' AND g.type = ?';
      countParams.push(type);
    }

    const countResult = await get(countSql, countParams);
    const total = countResult.total;

    logger.debug(`🔍 搜索游戏: keyword="${keyword}", count=${games.length}, total=${total}`);
    return { games, total };
  } catch (error) {
    logger.error('❌ 搜索游戏失败:', error.message);
    throw error;
  }
};

/**
 * 更新游戏
 * @param {number} gameId - 游戏ID
 * @param {number} userId - 当前用户ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise<Object>} 更新后的游戏
 */
const updateGame = async (gameId, userId, updateData) => {
  try {
    // 检查游戏是否存在且属于当前用户
    const game = await get(
      'SELECT id, user_id FROM games WHERE id = ?',
      [gameId]
    );

    if (!game) {
      throw new Error('游戏不存在');
    }

    if (game.user_id !== userId) {
      throw new Error('无权限修改此游戏');
    }

    const { title, description, code, type, thumbnail, visibility } = updateData;

    // 构建更新SQL
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (code !== undefined) {
      updateFields.push('code = ?');
      updateValues.push(code);
    }
    if (type !== undefined) {
      const validTypes = ['casual', 'education', 'sports', 'adventure', 'puzzle'];
      if (validTypes.includes(type)) {
        updateFields.push('type = ?');
        updateValues.push(type);
      }
    }
    if (thumbnail !== undefined) {
      updateFields.push('thumbnail = ?');
      updateValues.push(thumbnail);
    }
    if (visibility !== undefined) {
      const validVisibility = ['public', 'private', 'unlisted'];
      if (validVisibility.includes(visibility)) {
        updateFields.push('visibility = ?');
        updateValues.push(visibility);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('没有要更新的字段');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(gameId, userId);

    const sql = `UPDATE games SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
    await run(sql, updateValues);

    logger.info(`✅ 更新游戏成功: gameId=${gameId}, userId=${userId}`);

    return await getGameById(gameId, userId);
  } catch (error) {
    logger.error('❌ 更新游戏失败:', error.message);
    throw error;
  }
};

/**
 * 删除游戏
 * @param {number} gameId - 游戏ID
 * @param {number} userId - 当前用户ID
 * @returns {Promise<boolean>} 是否成功
 */
const deleteGame = async (gameId, userId) => {
  try {
    // 检查游戏是否存在且属于当前用户
    const game = await get(
      'SELECT id, user_id FROM games WHERE id = ?',
      [gameId]
    );

    if (!game) {
      throw new Error('游戏不存在');
    }

    if (game.user_id !== userId) {
      throw new Error('无权限删除此游戏');
    }

    // 删除游戏（级联删除点赞记录）
    await run(
      'DELETE FROM games WHERE id = ? AND user_id = ?',
      [gameId, userId]
    );

    logger.info(`✅ 删除游戏成功: gameId=${gameId}, userId=${userId}`);
    return true;
  } catch (error) {
    logger.error('❌ 删除游戏失败:', error.message);
    throw error;
  }
};

/**
 * 增加游戏播放次数
 * @param {number} gameId - 游戏ID
 * @returns {Promise<boolean>} 是否成功
 */
const incrementPlayCount = async (gameId) => {
  try {
    await run(
      'UPDATE games SET play_count = play_count + 1 WHERE id = ?',
      [gameId]
    );
    return true;
  } catch (error) {
    logger.error('❌ 增加播放次数失败:', error.message);
    throw error;
  }
};

/**
 * 克隆游戏
 * @param {number} gameId - 原游戏ID
 * @param {number} userId - 当前用户ID
 * @returns {Promise<Object>} 新游戏
 */
const cloneGame = async (gameId, userId) => {
  try {
    // 获取原游戏
    const originalGame = await get(
      'SELECT * FROM games WHERE id = ?',
      [gameId]
    );

    if (!originalGame) {
      throw new Error('游戏不存在');
    }

    // 检查是否是自己的游戏
    if (originalGame.user_id === userId) {
      throw new Error('不能克隆自己的游戏');
    }

    // 创建克隆游戏
    const result = await run(
      `INSERT INTO games (user_id, title, description, code, type, thumbnail, visibility, is_cloned, cloned_from, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, 'private', 1, ?, 0, 0)`,
      [
        userId,
        `${originalGame.title} (副本)`,
        originalGame.description,
        originalGame.code,
        originalGame.type,
        originalGame.thumbnail,
        gameId
      ]
    );

    logger.info(`✅ 克隆游戏成功: originalGameId=${gameId}, newGameId=${result.lastID}, userId=${userId}`);

    return await getGameById(result.lastID, userId);
  } catch (error) {
    logger.error('❌ 克隆游戏失败:', error.message);
    throw error;
  }
};

module.exports = {
  createGame,
  getGameById,
  getGamesByUser,
  getPublicGames,
  searchGames,
  updateGame,
  deleteGame,
  incrementPlayCount,
  cloneGame
};
