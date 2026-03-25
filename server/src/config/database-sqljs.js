const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { env } = require('./env');
const logger = require('../utils/logger');

/**
 * sql.js数据库配置（纯JavaScript实现）
 */
const dbPath = path.join(__dirname, '../../data/kidsgame-sqljs.db');
const dbDir = path.dirname(dbPath);

// 确保数据目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

/**
 * 连接数据库
 */
const connectDB = async () => {
  try {
    // 初始化sql.js
    const SQL = await initSqlJs();

    // 加载或创建数据库
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      logger.info('✅ sql.js数据库加载成功');
    } else {
      db = new SQL.Database();
      logger.info('✅ sql.js新数据库创建成功');
    }

    logger.info(`   数据库文件: ${dbPath}`);

    return db;
  } catch (error) {
    logger.error('❌ sql.js连接失败:', error.message);
    throw error;
  }
};

/**
 * 保存数据库到文件
 */
const saveDB = () => {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    logger.error('保存数据库失败:', error.message);
  }
};

/**
 * 执行查询
 */
const query = (sql, params = []) => {
  const start = Date.now();
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();

    const duration = Date.now() - start;
    logger.debug('执行查询', { sql, duration, rows: results.length });

    return results;
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
    db.run(sql, params);

    // 获取最后插入的ID
    const result = db.exec("SELECT last_insert_rowid() as lastID");
    const lastID = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : null;

    saveDB(); // 自动保存

    const duration = Date.now() - start;
    logger.debug('执行运行', { sql, duration });

    return { changes: 1, lastID };
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
    const results = query(sql, params);
    return results.length > 0 ? results[0] : null;
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
    saveDB(); // 保存到文件
    db.close();
    logger.info('sql.js连接已关闭');
  } catch (error) {
    logger.error('关闭sql.js连接时出错:', error);
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
