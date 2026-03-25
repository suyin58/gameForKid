/**
 * 配额查询路由 (Quota Routes)
 *
 * 功能：
 * - 获取用户当前配额使用情况
 */

const express = require('express');
const router = express.Router();

/**
 * 获取用户配额信息
 * GET /api/v1/quota
 */
router.get('/', async (req, res) => {
  try {
    // 需要认证，由auth中间件设置req.user
    const userId = req.user?.id;
    const quotaType = req.user?.quotaType || 'free';
    const quotaService = req.quotaService;

    if (!userId) {
      return res.status(401).json({
        code: 2001,
        message: '未登录',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (!quotaService) {
      return res.status(500).json({
        code: 9999,
        message: '配额服务未初始化',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    // 获取配额信息
    const quotaInfo = await quotaService.getUserQuotaInfo(userId, quotaType);

    res.json({
      code: 0,
      message: '获取成功',
      data: quotaInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取配额信息错误:', error);
    res.status(500).json({
      code: 9999,
      message: '获取配额信息失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
