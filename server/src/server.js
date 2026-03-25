const app = require('./app')
const { env, validateEnv } = require('./config/env')
const logger = require('./utils/logger')
const aiService = require('./services/aiService')

// 根据DB_TYPE选择数据库配置
const dbType = process.env.DB_TYPE || 'sqljs'
let connectDB

if (dbType === 'postgresql') {
  connectDB = require('./config/database-pg').connectDB
} else if (dbType === 'mongodb') {
  connectDB = require('./config/database').connectDB
} else if (dbType === 'sqlite') {
  connectDB = require('./config/database-sqlite').connectDB
} else {
  // 默认使用sql.js
  connectDB = require('./config/database-sqljs').connectDB
}

// 验证环境变量
try {
  validateEnv()
  logger.info('环境变量验证通过')
  logger.info(`数据库类型: ${dbType}`)
} catch (error) {
  logger.error('环境变量验证失败:', error.message)
  process.exit(1)
}

// 启动服务器（异步）
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB()

    // 初始化AI服务
    logger.info('🤖 正在初始化AI服务...')
    const aiInitialized = aiService.initialize()
    if (aiInitialized) {
      logger.info('✅ AI服务已就绪')
    } else {
      logger.warn('⚠️  AI服务未配置，生成功能将不可用')
      logger.warn('   请设置环境变量 OPENAI_API_KEY 以启用AI功能')
    }

    // 启动HTTP服务器
    const server = app.listen(env.port, () => {
      logger.info(`🚀 服务器启动成功`)
      logger.info(`   环境: ${env.nodeEnv}`)
      logger.info(`   端口: ${env.port}`)
      logger.info(`   健康检查: http://localhost:${env.port}/health`)
    })

    // 优雅退出
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} 信号收到，正在关闭服务器...`)

      server.close(async () => {
        try {
          // 关闭数据库连接
          if (dbType === 'sqlite') {
            const { closeDB } = require('./config/database-sqlite')
            await closeDB()
          } else if (dbType === 'sqljs') {
            const { closeDB } = require('./config/database-sqljs')
            await closeDB()
          } else if (dbType === 'postgresql') {
            const { closeDB } = require('./config/database-pg')
            await closeDB()
          } else if (dbType === 'mongodb') {
            await require('mongoose').connection.close()
          }
          logger.info('数据库连接已关闭')
        } catch (error) {
          logger.error('关闭数据库连接时出错:', error)
        }

        logger.info('服务器已关闭')
        process.exit(0)
      })

      // 如果10秒后还没关闭，强制退出
      setTimeout(() => {
        logger.error('服务器关闭超时，强制退出')
        process.exit(1)
      }, 10000)
    }

    // 监听退出信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  } catch (error) {
    logger.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason)
})

// 启动服务器
startServer()
