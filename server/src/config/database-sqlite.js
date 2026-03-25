const Database = require('better-sqlite3');
const path = require('path');
const { env } = require('./env');
const logger = require('../utils/logger');

/**
 * SQLite数据库配置
 */
const dbPath = path.join(__dirname, '../../data/kidsgame.db');

// 创建数据库连接
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

/**
 * 连接数据库
 */
const connectDB = async () => {
  try {
    logger.info(`✅ SQLite连接成功`);
    logger.info(`   数据库文件: ${dbPath}`);

    return db;
  } catch (error) {
    logger.error('❌ SQLite连接失败:', error.message);
    throw error;
  }
};

/**
 * 执行查询
 */
const query = (sql, params = []) => {
  const start = Date.now();
  try {
    const stmt = db.prepare(sql);
    const result = stmt.all(...params);
    const duration = Date.now() - start;
    logger.debug('执行查询', { sql, duration, rows: result.length });
    return result;
  } catch (error) {
    logger.error('查询错误:', error.message);
    throw error;
  }
};

/**
 * 执行运行（INSERT/UPDATE/DELETE）
 */
const run = (sql, params = []) => {
  const start = Date.now();
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    const duration = Date.now() - start;
    logger.debug('执行运行', { sql, duration, changes: result.changes });

    // 统一返回格式，兼容sql.js
    return {
      changes: result.changes,
      lastID: result.lastInsertRowid
    };
  } catch (error) {
    logger.error('运行错误:', error.message);
    throw error;
  }
};

/**
 * 获取单行
 */
const get = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    // 统一返回格式：没有结果时返回null（而不是undefined）
    return result === undefined ? null : result;
  } catch (error) {
    logger.error('获取单行错误:', error.message);
    throw error;
  }
};

/**
 * 关闭数据库连接
 */
const closeDB = async () => {
  try {
    db.close();
    logger.info('SQLite连接已关闭');
  } catch (error) {
    logger.error('关闭SQLite连接时出错:', error);
  }
};

/**
 * 优雅退出
 */
process.on('SIGINT', () => {
  closeDB();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDB();
  process.exit(0);
});

module.exports = {
  db,
  connectDB,
  query,
  run,
  get,
  closeDB
};
