const {
  likeGame,
  unlikeGame,
  checkLikeStatus,
  getGameLikers,
  getUserLikedGames
} = require('../services/likeService');
const logger = require('../utils/logger');

/**
 * 点赞游戏控制器
 * POST /api/v1/like/:gameId
 */
const likeGameController = async (req, res) => {
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

    // 点赞游戏
    const result = await likeGame(userId, targetGameId);

    logger.info(`✅ 点赞成功: userId=${userId}, gameId=${targetGameId}`);

    res.json({
      code: 0,
      message: '点赞成功',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 点赞失败:', error.message);

    const statusCode = error.message.includes('不存在') ? 404 :
                       error.message.includes('不能点赞') ? 400 :
                       error.message.includes('已经点赞') ? 400 : 500;

    res.status(statusCode).json({
      code: statusCode === 404 ? 1004 : statusCode === 400 ? 1005 : 5000,
      message: error.message || '点赞失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 取消点赞游戏控制器
 * DELETE /api/v1/like/:gameId
 */
const unlikeGameController = async (req, res) => {
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

    // 取消点赞
    const result = await unlikeGame(userId, targetGameId);

    logger.info(`✅ 取消点赞成功: userId=${userId}, gameId=${targetGameId}`);

    res.json({
      code: 0,
      message: '取消点赞成功',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 取消点赞失败:', error.message);

    const statusCode = error.message.includes('不存在') ? 404 :
                       error.message.includes('尚未点赞') ? 400 : 500;

    res.status(statusCode).json({
      code: statusCode === 404 ? 1004 : statusCode === 400 ? 1006 : 5000,
      message: error.message || '取消点赞失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 检查点赞状态控制器
 * GET /api/v1/like/:gameId/status
 */
const checkLikeStatusController = async (req, res) => {
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

    // 未登录用户返回未点赞
    if (!userId) {
      return res.json({
        code: 0,
        message: '获取点赞状态成功',
        data: {
          liked: false
        },
        timestamp: new Date().toISOString()
      });
    }

    // 检查点赞状态
    const liked = await checkLikeStatus(userId, targetGameId);

    res.json({
      code: 0,
      message: '获取点赞状态成功',
      data: {
        liked
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取点赞状态失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '获取点赞状态失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 获取游戏点赞用户列表控制器
 * GET /api/v1/like/:gameId/users
 */
const getGameLikersController = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

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

    // 验证limit和offset
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    // 获取点赞用户列表
    const result = await getGameLikers(targetGameId, {
      limit: parsedLimit,
      offset: parsedOffset
    });

    logger.debug(`✅ 获取游戏点赞用户列表: gameId=${targetGameId}, count=${result.likers.length}`);

    res.json({
      code: 0,
      message: '获取点赞用户列表成功',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取点赞用户列表失败:', error.message);

    const statusCode = error.message.includes('不存在') ? 404 : 500;

    res.status(statusCode).json({
      code: statusCode === 404 ? 1004 : 5000,
      message: error.message || '获取点赞用户列表失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 获取用户点赞的游戏列表控制器
 * GET /api/v1/like/my
 */
const getUserLikedGamesController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    // 验证limit和offset
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    // 获取用户点赞的游戏列表
    const result = await getUserLikedGames(userId, {
      limit: parsedLimit,
      offset: parsedOffset
    });

    logger.debug(`✅ 获取用户点赞游戏列表: userId=${userId}, count=${result.games.length}`);

    res.json({
      code: 0,
      message: '获取点赞游戏列表成功',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ 获取用户点赞游戏列表失败:', error.message);

    res.status(500).json({
      code: 5000,
      message: error.message || '获取点赞游戏列表失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  likeGameController,
  unlikeGameController,
  checkLikeStatusController,
  getGameLikersController,
  getUserLikedGamesController
};
