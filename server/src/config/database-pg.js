const { Pool } = require('pg')
const { env } = require('./env')
const logger = require('../utils/logger')

/**
 * PostgreSQL连接配置
 */
const poolConfig = {
  host: env.pg.host || 'localhost',
  port: env.pg.port || 5432,
  database: env.pg.database || 'kidsgame',
  user: env.pg.user || 'postgres',
  password: env.pg.password,
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// 创建连接池
const pool = new Pool(poolConfig)

/**
 * 连接数据库
 */
const connectDB = async () => {
  try {
    // 测试连接
    const client = await pool.connect()
    logger.info(`✅ PostgreSQL连接成功`)
    logger.info(`   主机: ${poolConfig.host}:${poolConfig.port}`)
    logger.info(`   数据库: ${poolConfig.database}`)

    // 监听连接事件
    pool.on('error', (err) => {
      logger.error('PostgreSQL连接池错误:', err)
    })

    pool.on('connect', () => {
      logger.debug('PostgreSQL新连接已建立')
    })

    pool.on('remove', () => {
      logger.debug('PostgreSQL连接已移除')
    })

    client.release()

    return pool
  } catch (error) {
    logger.error('❌ PostgreSQL连接失败:', error.message)
    logger.error('   请检查：')
    logger.error('   1. PostgreSQL服务是否已启动')
    logger.error('   2. .env中的数据库配置是否正确')
    logger.error('   3. 数据库 "kidsgame" 是否已创建')
    throw error
  }
}

/**
 * 执行查询
 */
const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    logger.debug('执行查询', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    logger.error('查询错误:', error.message)
    throw error
  }
}

/**
 * 获取数据库客户端（用于事务）
 */
const getClient = async () => {
  const client = await pool.connect()
  return client
}

/**
 * 关闭数据库连接
 */
const closeDB = async () => {
  try {
    await pool.end()
    logger.info('PostgreSQL连接池已关闭')
  } catch (error) {
    logger.error('关闭PostgreSQL连接时出错:', error)
  }
}

/**
 * 优雅退出
 */
process.on('SIGINT', async () => {
  await closeDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeDB()
  process.exit(0)
})

module.exports = {
  pool,
  connectDB,
  query,
  getClient,
  closeDB
}
