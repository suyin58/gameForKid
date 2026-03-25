const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const {
  createGameController,
  getGameController,
  getMyGamesController,
  getPublicGamesController,
  searchGamesController,
  updateGameController,
  deleteGameController,
  playGameController,
  cloneGameController
} = require('../controllers/gameController');

/**
 * 游戏路由
 * 前缀: /api/v1/game
 */

/**
 * @route   POST /api/v1/game
 * @desc    创建游戏
 * @access  Private (需要Token)
 */
router.post('/', authMiddleware, createGameController);

/**
 * @route   GET /api/v1/game/public
 * @desc    获取公开游戏广场列表
 * @access  Public
 */
router.get('/public', getPublicGamesController);

/**
 * @route   GET /api/v1/game/search
 * @desc    搜索游戏（按标题或作者昵称）
 * @access  Public
 */
router.get('/search', searchGamesController);

/**
 * @route   GET /api/v1/game/my
 * @desc    获取当前用户的游戏列表
 * @access  Private (需要Token)
 */
router.get('/my', authMiddleware, getMyGamesController);

/**
 * @route   GET /api/v1/game/:gameId
 * @desc    获取游戏详情
 * @access  Public (但登录后可查看更多信息，如是否已点赞)
 */
router.get('/:gameId', optionalAuthMiddleware, getGameController);

/**
 * @route   PUT /api/v1/game/:gameId
 * @desc    更新游戏
 * @access  Private (需要Token，只能更新自己的游戏)
 */
router.put('/:gameId', authMiddleware, updateGameController);

/**
 * @route   DELETE /api/v1/game/:gameId
 * @desc    删除游戏
 * @access  Private (需要Token，只能删除自己的游戏)
 */
router.delete('/:gameId', authMiddleware, deleteGameController);

/**
 * @route   POST /api/v1/game/:gameId/play
 * @desc    增加游戏播放次数
 * @access  Public
 */
router.post('/:gameId/play', playGameController);

/**
 * @route   POST /api/v1/game/:gameId/clone
 * @desc    克隆游戏
 * @access  Private (需要Token)
 */
router.post('/:gameId/clone', authMiddleware, cloneGameController);

module.exports = router;
