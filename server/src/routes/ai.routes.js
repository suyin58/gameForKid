const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * 获取配额中间件和认证中间件
 * 从app.locals获取，确保异步初始化完成
 */
function getMiddleware(req, res, next) {
  const quotaMiddleware = req.app.locals.quotaMiddleware?.();
  const authMiddleware = req.app.locals.authMiddleware?.();

  if (!quotaMiddleware || !authMiddleware) {
    return res.status(500).json({
      code: 9999,
      message: '服务未初始化完成，请稍后重试',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  req.quotaMiddleware = quotaMiddleware;
  req.authMiddleware = authMiddleware;
  next();
}

/**
 * 辅助函数：睡眠
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 辅助函数：发送SSE消息
 */
function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * AI生成游戏
 * POST /api/v1/ai/generate
 *
 * 请求体：
 * {
 *   "description": "我想做一个跳跳游戏",
 *   "type": "casual"  // 可选：casual/education/puzzle/sports/adventure
 * }
 *
 * 流程：
 * 1. 验证用户身份
 * 2. 检查生成配额
 * 3. 调用AI服务流式生成游戏
 * 4. 生成成功后扣除配额
 * 5. 使用SSE实时推送进度
 */
router.post('/generate',
  getMiddleware,
  // 1. 认证中间件
  (req, res, next) => req.authMiddleware.auth(req, res, next),
  // 2. 检查生成配额
  (req, res, next) => req.quotaMiddleware.checkGenerateQuota(req, res, next),
  // 3. AI生成控制器
  async (req, res) => {
    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const { description, type = 'casual' } = req.body;

      // 验证描述
      if (!description || description.trim().length === 0) {
        sendSSE(res, {
          type: 'error',
          code: 1001,
          message: '游戏描述不能为空'
        });
        return res.end();
      }

      if (description.length > 500) {
        sendSSE(res, {
          type: 'error',
          code: 1001,
          message: '游戏描述不能超过500个字符'
        });
        return res.end();
      }

      // 检查AI服务是否可用
      if (!aiService.isAvailable()) {
        sendSSE(res, {
          type: 'error',
          code: 5003,
          message: 'AI服务暂时不可用，请稍后重试'
        });
        return res.end();
      }

      logger.info(`🎮 用户 ${req.user.userId} 请求生成游戏: ${description}`);

      // 调用AI服务流式生成
      const result = await aiService.generateGameStream(
        description,
        type,
        (chunk) => {
          // 实时推送进度和内容
          sendSSE(res, chunk);
        }
      );

      // 生成成功，发送完整数据
      sendSSE(res, {
        type: 'complete',
        data: {
          title: result.title,
          description: result.description,
          code: result.code,
          type: result.type,
        }
      });

      res.end();

      // 扣除配额（在响应成功后）
      try {
        await req.quotaMiddleware.deductGenerateQuota(req, res, () => {});
        logger.info(`✅ 已扣除用户 ${req.user.userId} 的生成配额`);
      } catch (quotaError) {
        logger.error('❌ 扣除配额失败:', quotaError.message);
        // 配额扣除失败不影响生成结果，可以记录到日志中后续处理
      }

    } catch (error) {
      logger.error('❌ AI生成失败:', error);

      sendSSE(res, {
        type: 'error',
        code: 5001,
        message: error.message || 'AI生成失败，请重试'
      });

      res.end();
    }
  }
);

/**
 * AI修改游戏
 * POST /api/v1/ai/modify
 *
 * 请求体：
 * {
 *   "gameId": 1,
 *   "modifyDescription": "把游戏难度调高一点"
 * }
 *
 * 流程：
 * 1. 验证用户身份
 * 2. 检查修改配额
 * 3. 获取游戏代码
 * 4. 调用AI服务流式修改游戏
 * 5. 修改成功后扣除配额
 * 6. 使用SSE实时推送进度
 */
router.post('/modify',
  getMiddleware,
  // 1. 认证中间件
  (req, res, next) => req.authMiddleware.auth(req, res, next),
  // 2. 检查修改配额
  (req, res, next) => req.quotaMiddleware.checkModifyQuota(req, res, next),
  // 3. AI修改控制器
  async (req, res) => {
    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const { gameId, modifyDescription } = req.body;
      const userId = req.user.userId;

      // 验证参数
      if (!gameId) {
        sendSSE(res, {
          type: 'error',
          code: 1001,
          message: '游戏ID不能为空'
        });
        return res.end();
      }

      if (!modifyDescription || modifyDescription.trim().length === 0) {
        sendSSE(res, {
          type: 'error',
          code: 1001,
          message: '修改描述不能为空'
        });
        return res.end();
      }

      if (modifyDescription.length > 500) {
        sendSSE(res, {
          type: 'error',
          code: 1001,
          message: '修改描述不能超过500个字符'
        });
        return res.end();
      }

      // 检查AI服务是否可用
      if (!aiService.isAvailable()) {
        sendSSE(res, {
          type: 'error',
          code: 5003,
          message: 'AI服务暂时不可用，请稍后重试'
        });
        return res.end();
      }

      // TODO: 获取游戏代码（需要调用gameService）
      // 这里先用模拟代码
      const currentCode = '<!-- 游戏代码 -->';

      logger.info(`🔧 用户 ${userId} 请求修改游戏 ${gameId}: ${modifyDescription}`);

      // 调用AI服务流式修改
      const result = await aiService.modifyGameStream(
        currentCode,
        modifyDescription,
        (chunk) => {
          sendSSE(res, chunk);
        }
      );

      // 修改成功，发送完整数据
      sendSSE(res, {
        type: 'complete',
        data: {
          gameId,
          version: 'v2.0',
          code: result.code,
          changelog: modifyDescription,
        }
      });

      res.end();

      // 扣除配额（在响应成功后）
      try {
        await req.quotaMiddleware.deductModifyQuota(req, res, () => {});
        logger.info(`✅ 已扣除用户 ${userId} 的修改配额`);
      } catch (quotaError) {
        logger.error('❌ 扣除配额失败:', quotaError.message);
      }

    } catch (error) {
      logger.error('❌ AI修改失败:', error);

      sendSSE(res, {
        type: 'error',
        code: 5002,
        message: error.message || 'AI修改失败，请重试'
      });

      res.end();
    }
  }
);

module.exports = router;
