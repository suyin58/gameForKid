/**
 * 配额检查中间件 (Quota Middleware)
 *
 * 功能：
 * - 在AI生成和修改接口前检查配额
 * - 自动扣除配额
 * - 返回配额不足错误
 */

const QuotaService = require('../services/quota.service');

/**
 * 创建配额中间件工厂函数
 * @param {Object} db - 数据库实例
 * @returns {Object} 中间件对象
 */
function createQuotaMiddleware(db) {
  const quotaService = new QuotaService(db);

  /**
   * 检查生成配额中间件
   * 用于 AI 生成游戏接口
   */
  const checkGenerateQuota = async (req, res, next) => {
    try {
      // 从JWT token中获取用户信息（由auth中间件设置）
      const userId = req.user?.id;
      const quotaType = req.user?.quotaType || 'free';

      if (!userId) {
        return res.status(401).json({
          code: 2001,
          message: '未登录',
          data: null
        });
      }

      // 检查配额
      const hasQuota = await quotaService.checkGenerateQuota(userId, quotaType);

      if (!hasQuota) {
        const quotaInfo = await quotaService.getUserQuotaInfo(userId, quotaType);
        return res.status(429).json({
          code: 5004,
          message: `今日AI生成配额已用完（${quotaInfo.generate.used}/${quotaInfo.generate.limit}）`,
          data: {
            quotaInfo: quotaInfo,
            resetAt: quotaInfo.resetAt
          }
        });
      }

      // 配额充足，将quotaService附加到req对象，供后续使用
      req.quotaService = quotaService;
      req.quotaType = quotaType;
      next();

    } catch (error) {
      console.error('配额检查错误:', error);
      res.status(500).json({
        code: 9999,
        message: '配额检查失败',
        data: null
      });
    }
  };

  /**
   * 检查修改配额中间件
   * 用于 AI 修改游戏接口
   */
  const checkModifyQuota = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const quotaType = req.user?.quotaType || 'free';

      if (!userId) {
        return res.status(401).json({
          code: 2001,
          message: '未登录',
          data: null
        });
      }

      // 检查配额
      const hasQuota = await quotaService.checkModifyQuota(userId, quotaType);

      if (!hasQuota) {
        const quotaInfo = await quotaService.getUserQuotaInfo(userId, quotaType);
        return res.status(429).json({
          code: 5004,
          message: `今日AI修改配额已用完（${quotaInfo.modify.used}/${quotaInfo.modify.limit}）`,
          data: {
            quotaInfo: quotaInfo,
            resetAt: quotaInfo.resetAt
          }
        });
      }

      req.quotaService = quotaService;
      req.quotaType = quotaType;
      next();

    } catch (error) {
      console.error('配额检查错误:', error);
      res.status(500).json({
        code: 9999,
        message: '配额检查失败',
        data: null
      });
    }
  };

  /**
   * 扣除生成配额中间件
   * 在生成成功后调用
   */
  const deductGenerateQuota = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const quotaType = req.quotaType || 'free';

      if (userId && req.quotaService) {
        await req.quotaService.useGenerateQuota(userId, quotaType);
      }

      next();
    } catch (error) {
      console.error('配额扣除错误:', error);
      // 配额扣除失败不影响响应，只记录日志
      next();
    }
  };

  /**
   * 扣除修改配额中间件
   * 在修改成功后调用
   */
  const deductModifyQuota = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const quotaType = req.quotaType || 'free';

      if (userId && req.quotaService) {
        await req.quotaService.useModifyQuota(userId, quotaType);
      }

      next();
    } catch (error) {
      console.error('配额扣除错误:', error);
      next();
    }
  };

  return {
    checkGenerateQuota,
    checkModifyQuota,
    deductGenerateQuota,
    deductModifyQuota,
    quotaService // 导出服务供其他模块使用
  };
}

module.exports = createQuotaMiddleware;
