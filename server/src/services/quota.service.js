/**
 * 配额管理服务 (Quota Service)
 *
 * 功能：
 * - 检查用户配额是否充足
 * - 增加配额使用次数
 * - 获取配额剩余情况
 * - 重置过期配额
 */

const QuotaModel = require('../models/quota.model');

// 配额配置
const QUOTA_CONFIG = {
  free: {
    name: '免费用户',
    generateLimit: 10,  // 每天10次生成
    modifyLimit: 20     // 每天20次修改
  },
  vip: {
    name: 'VIP用户',
    generateLimit: 50,  // 每天50次生成
    modifyLimit: 100    // 每天100次修改
  }
};

class QuotaService {
  constructor(db) {
    this.quotaModel = new QuotaModel(db);
  }

  /**
   * 初始化配额表
   */
  async init() {
    await this.quotaModel.init();
  }

  /**
   * 获取用户配额配置
   * @param {string} quotaType - 用户类型 ('free' | 'vip')
   * @returns {Object} 配额配置
   */
  getQuotaConfig(quotaType = 'free') {
    return QUOTA_CONFIG[quotaType] || QUOTA_CONFIG.free;
  }

  /**
   * 检查用户是否有足够的生成配额
   * @param {number} userId - 用户ID
   * @param {string} quotaType - 用户类型
   * @returns {Promise<boolean>} 是否有配额
   */
  async checkGenerateQuota(userId, quotaType = 'free') {
    const today = new Date().toISOString().split('T')[0];
    const quota = await this.quotaModel.getUserQuota(userId, today);
    const config = this.getQuotaConfig(quotaType);

    return quota.generate_count < config.generateLimit;
  }

  /**
   * 检查用户是否有足够的修改配额
   * @param {number} userId - 用户ID
   * @param {string} quotaType - 用户类型
   * @returns {Promise<boolean>} 是否有配额
   */
  async checkModifyQuota(userId, quotaType = 'free') {
    const today = new Date().toISOString().split('T')[0];
    const quota = await this.quotaModel.getUserQuota(userId, today);
    const config = this.getQuotaConfig(quotaType);

    return quota.modify_count < config.modifyLimit;
  }

  /**
   * 使用生成配额
   * @param {number} userId - 用户ID
   * @param {string} quotaType - 用户类型
   * @returns {Promise<Object>} 使用后的配额信息
   * @throws {Error} 配额不足时抛出错误
   */
  async useGenerateQuota(userId, quotaType = 'free') {
    const hasQuota = await this.checkGenerateQuota(userId, quotaType);

    if (!hasQuota) {
      const config = this.getQuotaConfig(quotaType);
      const today = new Date().toISOString().split('T')[0];
      const quota = await this.quotaModel.getUserQuota(userId, today);

      throw new Error(JSON.stringify({
        code: 5004,
        message: `今日AI生成配额已用完（${quota.generate_count}/${config.generateLimit}）`,
        type: 'QUOTA_EXCEEDED',
        quotaType: 'generate',
        used: quota.generate_count,
        limit: config.generateLimit
      }));
    }

    const today = new Date().toISOString().split('T')[0];
    const newCount = await this.quotaModel.incrementGenerate(userId, today);
    const config = this.getQuotaConfig(quotaType);

    return {
      type: 'generate',
      used: newCount,
      remaining: config.generateLimit - newCount,
      limit: config.generateLimit,
      resetAt: this.getNextResetTime()
    };
  }

  /**
   * 使用修改配额
   * @param {number} userId - 用户ID
   * @param {string} quotaType - 用户类型
   * @returns {Promise<Object>} 使用后的配额信息
   * @throws {Error} 配额不足时抛出错误
   */
  async useModifyQuota(userId, quotaType = 'free') {
    const hasQuota = await this.checkModifyQuota(userId, quotaType);

    if (!hasQuota) {
      const config = this.getQuotaConfig(quotaType);
      const today = new Date().toISOString().split('T')[0];
      const quota = await this.quotaModel.getUserQuota(userId, today);

      throw new Error(JSON.stringify({
        code: 5004,
        message: `今日AI修改配额已用完（${quota.modify_count}/${config.modifyLimit}）`,
        type: 'QUOTA_EXCEEDED',
        quotaType: 'modify',
        used: quota.modify_count,
        limit: config.modifyLimit
      }));
    }

    const today = new Date().toISOString().split('T')[0];
    const newCount = await this.quotaModel.incrementModify(userId, today);
    const config = this.getQuotaConfig(quotaType);

    return {
      type: 'modify',
      used: newCount,
      remaining: config.modifyLimit - newCount,
      limit: config.modifyLimit,
      resetAt: this.getNextResetTime()
    };
  }

  /**
   * 获取用户配额使用情况
   * @param {number} userId - 用户ID
   * @param {string} quotaType - 用户类型
   * @returns {Promise<Object>} 配额信息
   */
  async getUserQuotaInfo(userId, quotaType = 'free') {
    const today = new Date().toISOString().split('T')[0];
    const quota = await this.quotaModel.getUserQuota(userId, today);
    const config = this.getQuotaConfig(quotaType);

    return {
      generate: {
        used: quota.generate_count,
        remaining: Math.max(0, config.generateLimit - quota.generate_count),
        limit: config.generateLimit
      },
      modify: {
        used: quota.modify_count,
        remaining: Math.max(0, config.modifyLimit - quota.modify_count),
        limit: config.modifyLimit
      },
      resetAt: this.getNextResetTime(),
      quotaType: quotaType
    };
  }

  /**
   * 获取下次重置时间
   * @returns {string} ISO 8601格式的时间戳
   */
  getNextResetTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * 清理过期配额记录
   * @param {number} days - 保留天数
   * @returns {Promise<number>} 删除的记录数
   */
  async cleanup(days = 30) {
    return await this.quotaModel.cleanupOldData(days);
  }
}

module.exports = QuotaService;
