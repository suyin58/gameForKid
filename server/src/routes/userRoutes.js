const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { login, getCurrentUser, updateUser, getUserById } = require('../controllers/userController');

/**
 * 用户路由
 * 前缀: /api/v1/user
 */

/**
 * @route   POST /api/v1/user/login
 * @desc    用户登录（微信code换取token）
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/v1/user/info
 * @desc    获取当前登录用户信息
 * @access  Private (需要Token)
 */
router.get('/info', authMiddleware, getCurrentUser);

/**
 * @route   PUT /api/v1/user/info
 * @desc    更新当前用户信息
 * @access  Private (需要Token)
 */
router.put('/info', authMiddleware, updateUser);

/**
 * @route   GET /api/v1/user/:userId
 * @desc    获取指定用户信息（公开接口）
 * @access  Public
 */
router.get('/:userId', getUserById);

module.exports = router;
