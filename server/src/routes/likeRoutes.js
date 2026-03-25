const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const {
  likeGameController,
  unlikeGameController,
  checkLikeStatusController,
  getGameLikersController,
  getUserLikedGamesController
} = require('../controllers/likeController');

/**
 * 点赞路由
 * 前缀: /api/v1/like
 */

/**
 * @route   POST /api/v1/like/:gameId
 * @desc    点赞游戏
 * @access  Private (需要Token)
 */
router.post('/:gameId', authMiddleware, likeGameController);

/**
 * @route   DELETE /api/v1/like/:gameId
 * @desc    取消点赞游戏
 * @access  Private (需要Token)
 */
router.delete('/:gameId', authMiddleware, unlikeGameController);

/**
 * @route   GET /api/v1/like/:gameId/status
 * @desc    检查点赞状态
 * @access  Public (但登录后可查看真实状态)
 */
router.get('/:gameId/status', optionalAuthMiddleware, checkLikeStatusController);

/**
 * @route   GET /api/v1/like/:gameId/users
 * @desc    获取游戏点赞用户列表
 * @access  Public
 */
router.get('/:gameId/users', getGameLikersController);

/**
 * @route   GET /api/v1/like/my
 * @desc    获取当前用户点赞的游戏列表
 * @access  Private (需要Token)
 */
router.get('/my', authMiddleware, getUserLikedGamesController);

module.exports = router;
