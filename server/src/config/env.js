require('dotenv').config()

const env = {
  // 服务器配置
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3001,

  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kidsgame'
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  },

  // 微信小程序配置
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || ''
  },

  // OpenAI配置
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || 'logs'
  }
}

// 验证必需的环境变量
const validateEnv = () => {
  const required = []

  if (env.nodeEnv === 'production') {
    if (!env.jwt.secret || env.jwt.secret === 'default-secret-key') {
      required.push('JWT_SECRET')
    }
    if (!env.wechat.appId) {
      required.push('WECHAT_APPID')
    }
    if (!env.wechat.secret) {
      required.push('WECHAT_SECRET')
    }
    if (!env.openai.apiKey) {
      required.push('OPENAI_API_KEY')
    }
  }

  if (required.length > 0) {
    throw new Error(`缺少必需的环境变量: ${required.join(', ')}`)
  }
}

module.exports = { env, validateEnv }
