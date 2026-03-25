/**
 * 开发环境测试登录工具
 * 用于前后端联调测试，跳过微信登录流程
 */

import { useUserStore } from '@/store/modules/user'

// 开发环境测试Token（后端生成的有效Token）
const DEV_TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk5OSwib3BlbmlkIjoiZGV2X3Rlc3RfdXNlciIsImlhdCI6MTc3NDM5NjQwNjMsImV4cCI6MTc3Njk4NjQwNn0.VGFzaWx1c2VyMTk5OV9vcGVuaWRkZXZfdGVzdF91c2Vy'

// 开发环境测试用户信息
const DEV_TEST_USER = {
  id: 999,
  openid: 'dev_test_user',
  nickname: '测试用户',
  avatar: 'https://picsum.photos/100',
  quotaType: 'free'
}

/**
 * 开发环境登录
 * 仅在开发环境可用，用于前后端联调测试
 */
export function devLogin() {
  // #ifdef H5
  if (process.env.NODE_ENV === 'development') {
    const userStore = useUserStore()

    // 设置测试Token和用户信息
    userStore.setToken(DEV_TEST_TOKEN)
    userStore.setUserInfo(DEV_TEST_USER)

    console.log('[DevLogin] 开发环境登录成功')
    console.log('[DevLogin] Token:', DEV_TEST_TOKEN.substring(0, 50) + '...')
    console.log('[DevLogin] User:', DEV_TEST_USER)

    return true
  }

  console.warn('[DevLogin] 开发登录仅在开发环境可用')
  return false
  // #endif

  // #ifdef MP-WEIXIN
  console.warn('[DevLogin] 微信小程序环境不支持开发登录')
  return false
  // #endif
}

/**
 * 生成新的测试Token（需要在后端执行）
 */
export function generateTestToken(userId = 999, openid = 'dev_test_user') {
  const jwt = require('jsonwebtoken')
  const JWT_SECRET = 'kidsgame-secret-key-development-only'

  return jwt.sign({ userId, openid }, JWT_SECRET, { expiresIn: '30d' })
}

/**
 * 检查是否为开发环境
 */
export function isDevEnv() {
  return process.env.NODE_ENV === 'development'
}
