/**
 * 数据库初始化模块
 * 用于初始化 SQLite/sql.js 数据库并创建必要的表
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// 数据库文件路径
const dbPath = path.join(__dirname, '../../data/kidsgame-sqljs.db');
const dbDir = path.dirname(dbPath);

// 确保数据目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 数据库连接单例
let dbInstance = null;

/**
 * 初始化数据库
 */
async function initDatabase() {
  if (dbInstance) {
    return database; // 返回包装器对象
  }

  try {
    // 初始化 sql.js
    const SQL = await initSqlJs();

    // 加载或创建数据库
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(buffer);
      logger.info('✅ SQLite数据库加载成功');
    } else {
      dbInstance = new SQL.Database();
      logger.info('✅ SQLite新数据库创建成功');
    }

    // 创建数据表
    await createTables(dbInstance);

    logger.info(`   数据库文件: ${dbPath}`);

    return database; // 返回包装器对象，而不是原始实例
  } catch (error) {
    logger.error('❌ SQLite初始化失败:', error.message);
    throw error;
  }
}

/**
 * 创建数据表
 */
async function createTables(db) {
  try {
    // 创建用户每日配额表
    db.run(`
      CREATE TABLE IF NOT EXISTS user_daily_quota (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        generate_count INTEGER DEFAULT 0,
        modify_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `);

    logger.info('✅ 数据表创建成功');
  } catch (error) {
    logger.error('❌ 创建数据表失败:', error.message);
    throw error;
  }
}

/**
 * 保存数据库到文件
 */
function saveDatabase() {
  if (!dbInstance) return;

  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    logger.error('保存数据库失败:', error.message);
  }
}

/**
 * 封装数据库操作方法
 */
const database = {
  /**
   * 执行查询（返回多行）
   */
  all: (sql, params = []) => {
    if (!dbInstance) throw new Error('数据库未初始化');

    const results = [];
    try {
      const stmt = dbInstance.prepare(sql);
      stmt.bind(params);

      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      stmt.free();

      return results;
    } catch (error) {
      logger.error('查询错误:', error.message);
      throw error;
    }
  },

  /**
   * 执行查询（返回单行）
   */
  get: (sql, params = []) => {
    if (!dbInstance) throw new Error('数据库未初始化');

    try {
      const results = database.all(sql, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      logger.error('获取单行错误:', error.message);
      throw error;
    }
  },

  /**
   * 执行运行（INSERT/UPDATE/DELETE）
   */
  run: (sql, params = []) => {
    if (!dbInstance) throw new Error('数据库未初始化');

    try {
      dbInstance.run(sql, params);
      saveDatabase(); // 自动保存到文件

      // 获取最后插入的ID
      const lastIdResult = dbInstance.exec("SELECT last_insert_rowid() as lastId");
      const lastId = lastIdResult[0] ? lastIdResult[0].values[0][0] : null;

      return { changes: 1, lastID: lastId };
    } catch (error) {
      logger.error('运行错误:', error.message);
      throw error;
    }
  },

  /**
   * 保存数据库
   */
  save: saveDatabase,

  /**
   * 关闭数据库
   */
  close: () => {
    if (dbInstance) {
      saveDatabase();
      dbInstance.close();
      dbInstance = null;
      logger.info('SQLite连接已关闭');
    }
  },

  /**
   * 获取原始数据库实例
   */
  getInstance: () => dbInstance
};

module.exports = {
  initDatabase,
  database
};
