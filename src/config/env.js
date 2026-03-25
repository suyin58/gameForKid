/**
 * 环境配置
 */
const env = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:3001/api',
    wsURL: 'ws://localhost:3001',
    cdnURL: 'http://localhost:3001/static'
  },

  // 生产环境
  production: {
    baseURL: 'https://api.kidsgame.com',
    wsURL: 'wss://api.kidsgame.com',
    cdnURL: 'https://cdn.kidsgame.com'
  }
}

// 获取当前环境
const getCurrentEnv = () => {
  // #ifdef MP-WEIXIN
  return process.env.NODE_ENV === 'development' ? env.development : env.production
  // #endif

  // #ifdef H5
  return env.development
  // #endif

  return env.development
}

export default getCurrentEnv()
