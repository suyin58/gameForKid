/**
 * 用户每日配额表 (User Daily Quota)
 *
 * 功能：记录用户每天的AI生成和修改配额使用情况
 */

/**
 * Quota Model 类
 */
class QuotaModel {
  constructor(db) {
    this.db = db;
  }

  /**
   * 初始化表结构
   */
  async init() {
    try {
      this.db.run(`
        CREATE TRIGGER IF NOT EXISTS update_quota_timestamp
        AFTER UPDATE ON user_daily_quota
        FOR EACH ROW
        BEGIN
          UPDATE user_daily_quota SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
      `);
    } catch (error) {
      // 触发器可能已存在，忽略错误
    }
  }

  /**
   * 获取或创建用户今日配额记录
   * @param {number} userId - 用户ID
   * @param {string} date - 日期（YYYY-MM-DD）
   * @returns {Promise<Object>} 配额记录
   */
  async getOrCreateUserQuota(userId, date) {
    try {
      // 先尝试获取今日记录
      const row = this.db.get(
        'SELECT * FROM user_daily_quota WHERE user_id = ? AND date = ?',
        [userId, date]
      );

      // 如果记录存在，直接返回
      if (row) {
        return row;
      }

      // 如果不存在，创建新记录
      const result = this.db.run(
        'INSERT INTO user_daily_quota (user_id, date, generate_count, modify_count) VALUES (?, ?, 0, 0)',
        [userId, date]
      );

      // 返回新创建的记录
      return {
        id: result.lastID,
        user_id: userId,
        date: date,
        generate_count: 0,
        modify_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`获取或创建配额记录失败: ${error.message}`);
    }
  }

  /**
   * 增加生成次数
   * @param {number} userId - 用户ID
   * @param {string} date - 日期
   * @returns {Promise<number>} 更新后的生成次数
   */
  async incrementGenerate(userId, date) {
    try {
      // 使用 UPSERT 语法（SQLite 3.24+）
      this.db.run(
        'INSERT INTO user_daily_quota (user_id, date, generate_count, modify_count) VALUES (?, ?, 1, 0) ' +
        'ON CONFLICT(user_id, date) DO UPDATE SET ' +
        'generate_count = generate_count + 1, ' +
        'updated_at = CURRENT_TIMESTAMP',
        [userId, date]
      );

      // 查询更新后的次数
      const row = this.db.get(
        'SELECT generate_count FROM user_daily_quota WHERE user_id = ? AND date = ?',
        [userId, date]
      );

      return row ? row.generate_count : 1;
    } catch (error) {
      throw new Error(`增加生成次数失败: ${error.message}`);
    }
  }

  /**
   * 增加修改次数
   * @param {number} userId - 用户ID
   * @param {string} date - 日期
   * @returns {Promise<number>} 更新后的修改次数
   */
  async incrementModify(userId, date) {
    try {
      this.db.run(
        'INSERT INTO user_daily_quota (user_id, date, generate_count, modify_count) VALUES (?, ?, 0, 1) ' +
        'ON CONFLICT(user_id, date) DO UPDATE SET ' +
        'modify_count = modify_count + 1, ' +
        'updated_at = CURRENT_TIMESTAMP',
        [userId, date]
      );

      // 查询更新后的次数
      const row = this.db.get(
        'SELECT modify_count FROM user_daily_quota WHERE user_id = ? AND date = ?',
        [userId, date]
      );

      return row ? row.modify_count : 1;
    } catch (error) {
      throw new Error(`增加修改次数失败: ${error.message}`);
    }
  }

  /**
   * 获取用户今日配额使用情况
   * @param {number} userId - 用户ID
   * @param {string} date - 日期
   * @returns {Promise<Object>} 配额使用情况
   */
  async getUserQuota(userId, date) {
    try {
      const row = this.db.get(
        'SELECT * FROM user_daily_quota WHERE user_id = ? AND date = ?',
        [userId, date]
      );

      // 如果没有记录，返回初始值
      return row || {
        user_id: userId,
        date: date,
        generate_count: 0,
        modify_count: 0
      };
    } catch (error) {
      throw new Error(`获取配额记录失败: ${error.message}`);
    }
  }

  /**
   * 清理过期数据（保留最近30天）
   * @param {number} days - 保留天数
   * @returns {Promise<number>} 删除的记录数
   */
  async cleanupOldData(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const dateStr = cutoffDate.toISOString().split('T')[0];

      const result = this.db.run(
        'DELETE FROM user_daily_quota WHERE date < ?',
        [dateStr]
      );

      return result.changes || 0;
    } catch (error) {
      throw new Error(`清理过期数据失败: ${error.message}`);
    }
  }
}

module.exports = QuotaModel;
