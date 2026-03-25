const fs = require('fs')
const path = require('path')
const { pool } = require('../config/database-pg')
const logger = require('../utils/logger')

/**
 * 初始化PostgreSQL数据库
 * 读取并执行 init-pg.sql 脚本
 */
const initDatabase = async () => {
  const client = await pool.connect()

  try {
    logger.info('开始初始化数据库...')

    // 读取SQL脚本
    const sqlPath = path.join(__dirname, 'init-pg.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // 执行SQL脚本
    await client.query(sql)

    logger.info('✅ 数据库初始化完成！')
    logger.info('   已创建: users, games, likes 表')
    logger.info('   已创建: 索引和触发器')
    logger.info('\n下一步: 运行 npm run:seed 生成测试数据')

  } catch (error) {
    logger.error('❌ 数据库初始化失败:', error.message)
    logger.error('请确保：')
    logger.error('1. PostgreSQL服务已启动')
    logger.error('2. 数据库 "kidsgame" 已创建')
    logger.error('3. .env 中数据库配置正确')
    throw error
  } finally {
    client.release()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('数据库初始化脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('数据库初始化失败:', error)
      process.exit(1)
    })
}

module.exports = initDatabase
