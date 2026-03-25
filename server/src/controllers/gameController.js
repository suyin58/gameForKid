const {
  createGame,
  getGameById,
  getGamesByUser,
  getPublicGames,
  searchGames,
  updateGame,
  deleteGame,
  incrementPlayCount,
  cloneGame
} = require('../services/gameService');
const logger = require('../utils/logger');

/**
 * 创建游戏控制器
 * POST /api/v1/game
 */
const createGameController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, code, type, thumbnail, visibility } = req.body;

    // 验证必填字段
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({
        code: 1001,
        message: '游戏代码不能为空',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证代码长度（防止过大）
    if (code.length > 500000) { // 500KB限制
      return res.status(400).json({
        code: 1001,
        message: '游戏代码过大，请控制在500KB以内',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证标题长度
    if (title !== undefined && (title.length < 1 || title.length > 50)) {
      return res.status(400).json({
        code: 1001,
        message: '标题长度必须在1-50个字符之间',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证描述长度
    if (description !== undefined && description.length > 500) {
      return res.status(400).json({
        code: 1001,
        message: '描述不能超过500个字符',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 创建游戏
    const game = await createGame(userId, { title, description, code, type, thumbnail, visibility });

    logger.info(`✅ 创建游戏成功: gameId=${game.id}, userId=${userId}`);

    res.status(201).json({
      code: 0,
      message: '创建游戏成功',
      data: game,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 创建游戏失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '创建游戏失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 获取游戏详情控制器
 * GET /api/v1/game/:gameId
 */
const getGameController = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user ? req.user.userId : null;

    // 验证gameId
    const targetGameId = parseInt(gameId);
    if (isNaN(targetGameId)) {
      return res.status(400).json({
        code: 1001,
        message: '游戏ID格式不正确',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 获取游戏详情
    const game = await getGameById(targetGameId, userId);

    // 检查可见性
    if (game.visibility === 'private' && game.user_id !== userId) {
      return res.status(403).json({
        code: 2003,
        message: '无权限访问该游戏',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    logger.debug(`✅ 获取游戏详情成功: gameId=${targetGameId}`);

    res.json({
      code: 0,
      message: '获取游戏详情成功',
      data: game,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取游戏详情失败:', error.message);

    const statusCode = error.message === '游戏不存在' ? 404 : 500;

    res.status(statusCode).json({
      code: statusCode === 404 ? 1004 : 5000,
      message: error.message || '获取游戏详情失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 获取当前用户的游戏列表
 * GET /api/v1/game/my
 */
const getMyGamesController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { visibility, type, limit = 20, offset = 0 } = req.query;

    // 验证limit和offset
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    const games = await getGamesByUser(userId, {
      visibility,
      limit: parsedLimit,
      offset: parsedOffset
    });

    logger.debug(`✅ 获取用户游戏列表成功: userId=${userId}, count=${games.length}`);

    res.json({
      code: 0,
      message: '获取游戏列表成功',
      data: {
        games,
        total: games.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取用户游戏列表失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '获取游戏列表失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 获取公开游戏广场列表
 * GET /api/v1/game/public
 */
const getPublicGamesController = async (req, res) => {
  try {
    const { type, sortBy = 'created_at', order = 'DESC', limit = 20, offset = 0 } = req.query;

    // 验证limit和offset
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    const result = await getPublicGames({
      type,
      sortBy,
      order,
      limit: parsedLimit,
      offset: parsedOffset
    });

    logger.debug(`✅ 获取公开游戏列表成功: count=${result.games.length}, total=${result.total}`);

    res.json({
      code: 0,
      message: '获取游戏列表成功',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取公开游戏列表失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '获取游戏列表失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 搜索游戏控制器
 * GET /api/v1/game/search
 */
const searchGamesController = async (req, res) => {
  try {
    const { keyword, type, sortBy = 'created_at', order = 'DESC', limit = 20, offset = 0 } = req.query;

    // 验证关键词
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({
        code: 1001,
        message: '搜索关键词不能为空',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证关键词长度
    if (keyword.length > 50) {
      return res.status(400).json({
        code: 1001,
        message: '搜索关键词过长，请控制在50个字符以内',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证limit和offset
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    const result = await searchGames({
      keyword,
      type,
      sortBy,
      order,
      limit: parsedLimit,
      offset: parsedOffset
    });

    logger.debug(`✅ 搜索游戏成功: keyword="${keyword}", count=${result.games.length}, total=${result.total}`);

    res.json({
      code: 0,
      message: '搜索游戏成功',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 搜索游戏失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '搜索游戏失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 更新游戏控制器
 * PUT /api/v1/game/:gameId
 */
const updateGameController = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;
    const { title, description, code, type, thumbnail, visibility } = req.body;

    // 验证gameId
    const targetGameId = parseInt(gameId);
    if (isNaN(targetGameId)) {
      return res.status(400).json({
        code: 1001,
        message: '游戏ID格式不正确',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 验证字段
    if (title !== undefined && (title.length < 1 || title.length > 50)) {
      return res.status(400).json({
        code: 1001,
        message: '标题长度必须在1-50个字符之间',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (description !== undefined && description.length > 500) {
      return res.status(400).json({
        code: 1001,
        message: '描述不能超过500个字符',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (code !== undefined && code.length > 500000) {
      return res.status(400).json({
        code: 1001,
        message: '游戏代码过大，请控制在500KB以内',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 更新游戏
    const updatedGame = await updateGame(targetGameId, userId, {
      title,
      description,
      code,
      type,
      thumbnail,
      visibility
    });

    logger.info(`✅ 更新游戏成功: gameId=${targetGameId}, userId=${userId}`);

    res.json({
      code: 0,
      message: '更新游戏成功',
      data: updatedGame,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 更新游戏失败:', error.message);

    const statusCode = error.message.includes('不存在') ? 404 :
                       error.message.includes('权限') ? 403 : 500;

    res.status(statusCode).json({
      code: statusCode === 404 ? 1004 : statusCode === 403 ? 2003 : 5000,
      message: error.message || '更新游戏失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 删除游戏控制器
 * DELETE /api/v1/game/:gameId
 */
const deleteGameController = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;

    // 验证gameId
    const targetGameId = parseInt(gameId);
    if (isNaN(targetGameId)) {
      return res.status(400).json({
        code: 1001,
        message: '游戏ID格式不正确',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 删除游戏
    await deleteGame(targetGameId, userId);

    logger.info(`✅ 删除游戏成功: gameId=${targetGameId}, userId=${userId}`);

    res.json({
      code: 0,
      message: '删除游戏成功',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 删除游戏失败:', error.message);

    const statusCode = error.message.includes('不存在') ? 404 :
                       error.message.includes('权限') ? 403 : 500;

    res.status(statusCode).json({
      code: statusCode === 404 ? 1004 : statusCode === 403 ? 2003 : 5000,
      message: error.message || '删除游戏失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 增加游戏播放次数控制器
 * POST /api/v1/game/:gameId/play
 */
const playGameController = async (req, res) => {
  try {
    const { gameId } = req.params;

    // 验证gameId
    const targetGameId = parseInt(gameId);
    if (isNaN(targetGameId)) {
      return res.status(400).json({
        code: 1001,
        message: '游戏ID格式不正确',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 增加播放次数
    await incrementPlayCount(targetGameId);

    logger.debug(`✅ 增加游戏播放次数: gameId=${targetGameId}`);

    res.json({
      code: 0,
      message: '操作成功',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 增加播放次数失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '操作失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 克隆游戏控制器
 * POST /api/v1/game/:gameId/clone
 */
const cloneGameController = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;

    // 验证gameId
    const targetGameId = parseInt(gameId);
    if (isNaN(targetGameId)) {
      return res.status(400).json({
        code: 1001,
        message: '游戏ID格式不正确',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 克隆游戏
    const newGame = await cloneGame(targetGameId, userId);

    logger.info(`✅ 克隆游戏成功: originalGameId=${targetGameId}, newGameId=${newGame.id}, userId=${userId}`);

    res.status(201).json({
      code: 0,
      message: '克隆游戏成功',
      data: newGame,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 克隆游戏失败:', error.message);

    const statusCode = error.message.includes('不存在') ? 404 : 500;

    res.status(statusCode).json({
      code: statusCode === 404 ? 1004 : 5000,
      message: error.message || '克隆游戏失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  createGameController,
  getGameController,
  getMyGamesController,
  getPublicGamesController,
  searchGamesController,
  updateGameController,
  deleteGameController,
  playGameController,
  cloneGameController
};
