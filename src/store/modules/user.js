import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/services/user'
import { StorageKey } from '@/config/constants'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref(null)
  const token = ref('')
  const isLoggedIn = computed(() => !!userInfo.value)

  /**
   * 设置用户信息
   */
  const setUserInfo = (info) => {
    userInfo.value = info
    uni.setStorageSync(StorageKey.USER_INFO, info)
  }

  /**
   * 设置Token
   */
  const setToken = (newToken) => {
    token.value = newToken
    uni.setStorageSync(StorageKey.TOKEN, newToken)
  }

  /**
   * 检查登录状态
   */
  const checkLogin = async () => {
    try {
      // 从本地存储读取
      const localToken = uni.getStorageSync(StorageKey.TOKEN)
      const localUserInfo = uni.getStorageSync(StorageKey.USER_INFO)

      if (localToken && localUserInfo) {
        token.value = localToken
        userInfo.value = localUserInfo
        return true
      }

      // 尝试微信登录
      return await wechatLogin()
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }

  /**
   * 微信登录
   */
  const wechatLogin = async () => {
    try {
      // #ifdef MP-WEIXIN
      const { code } = await uni.login({
        provider: 'weixin'
      })

      const res = await userApi.login({ code })

      if (res.code === 0) {
        setToken(res.data.token)
        setUserInfo(res.data.userInfo)
        return true
      }
      // #endif

      // #ifdef H5
      // H5环境模拟登录
      const mockUserInfo = {
        id: 'h5_user_' + Date.now(),
        nickname: 'H5用户',
        avatar: 'https://picsum.photos/100'
      }
      setToken('h5_mock_token')
      setUserInfo(mockUserInfo)
      return true
      // #endif

      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  /**
   * 退出登录
   */
  const logout = () => {
    userInfo.value = null
    token.value = ''
    uni.removeStorageSync(StorageKey.TOKEN)
    uni.removeStorageSync(StorageKey.USER_INFO)
  }

  /**
   * 更新用户信息
   */
  const updateUserInfo = async (data) => {
    try {
      const res = await userApi.updateUserInfo(data)
      if (res.code === 0) {
        setUserInfo(res.data)
        return true
      }
      return false
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return false
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    setUserInfo,
    setToken,
    checkLogin,
    wechatLogin,
    logout,
    updateUserInfo
  }
})
