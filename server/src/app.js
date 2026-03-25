const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { env } = require('./config/env')
const logger = require('./utils/logger')
const { initDatabase } = require('./models/database')
const { requestLogger } = require('./middlewares/logger.middleware')
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware')

const app = express()

// ========== 中间件配置 ==========

// 安全头
app.use(helmet())

// CORS配置
app.use(cors({
  origin: env.nodeEnv === 'production'
    ? ['https://your-domain.com'] // 生产环境配置实际域名
    : '*', // 开发环境允许所有来源
  credentials: true
}))

// JSON解析中间件
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求日志中间件（新版本）
app.use(requestLogger)

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv
  })
})

// ========== 路由配置 ==========

// 初始化数据库和配额中间件
let quotaMiddleware
let authMiddleware

async function initializeMiddleware() {
  try {
    const db = await initDatabase()
    console.log('[DEBUG] Database object type:', typeof db)
    console.log('[DEBUG] Database has get?', typeof db.get)
    console.log('[DEBUG] Database keys:', Object.keys(db))
    quotaMiddleware = require('./middlewares/quota.middleware')(db)
    authMiddleware = require('./middlewares/auth.middleware')(db)
    logger.info('中间件初始化完成')
  } catch (error) {
    logger.error('中间件初始化失败:', error)
  }
}

// 立即初始化
initializeMiddleware()

// 认证中间件包装器（确保中间件已初始化）
const withAuth = (req, res, next) => {
  if (!authMiddleware) {
    return res.status(500).json({
      code: 9999,
      message: '服务未初始化完成，请稍后重试',
      data: null
    })
  }
  return authMiddleware.auth(req, res, next)
}

const withQuotaService = (req, res, next) => {
  if (!quotaMiddleware) {
    return res.status(500).json({
      code: 9999,
      message: '配额服务未初始化完成，请稍后重试',
      data: null
    })
  }
  req.quotaService = quotaMiddleware.quotaService
  next()
}

// API路由
app.use('/api/v1/user', require('./routes/userRoutes'))
app.use('/api/v1/quota', withAuth, withQuotaService, require('./routes/quota.routes'))
app.use('/api/v1/ai', require('./routes/ai.routes'))
app.use('/api/v1/game', require('./routes/gameRoutes'))
app.use('/api/v1/like', require('./routes/likeRoutes'))

// 导出配额中间件供AI路由使用
app.locals.quotaMiddleware = () => quotaMiddleware
app.locals.authMiddleware = () => authMiddleware

// 404处理（新版本）
app.use(notFoundHandler)

// 错误处理中间件（新版本）
app.use(errorHandler)

module.exports = app
