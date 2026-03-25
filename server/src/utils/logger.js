const winston = require('winston')
const { env } = require('../config/env')
const path = require('path')

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

// 定义控制台输出格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`
    }
    return msg
  })
)

// 创建日志 transports
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: consoleFormat,
    level: env.log.level
  }),

  // 错误日志文件
  new winston.transports.File({
    filename: path.join(env.log.filePath, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // 所有日志文件
  new winston.transports.File({
    filename: path.join(env.log.filePath, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
]

// 创建 logger 实例
const logger = winston.createLogger({
  level: env.log.level,
  format: logFormat,
  transports,
  exitOnError: false
})

// 开发环境额外配置
if (env.nodeEnv === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }))
}

module.exports = logger
