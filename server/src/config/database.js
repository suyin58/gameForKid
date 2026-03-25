const mongoose = require('mongoose')
const { env } = require('./env')
const logger = require('../utils/logger')

/**
 * 连接MongoDB数据库
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongodb.uri, {
      // Mongoose 6+ 默认配置，不需要这些选项了
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })

    logger.info(`✅ MongoDB连接成功: ${conn.connection.host}`)
    logger.info(`   数据库名称: ${conn.connection.name}`)

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB连接错误:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB连接断开')
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB重新连接')
    })

    // 优雅关闭
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      logger.info('MongoDB连接已关闭')
      process.exit(0)
    })

    return conn
  } catch (error) {
    logger.error('❌ MongoDB连接失败:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
