import request from '@/utils/request'

/**
 * 用户相关API
 */
export const userApi = {
  /**
   * 微信登录
   * @param {Object} data - { code: string }
   */
  login(data) {
    return request.post('/v1/user/login', data)
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return request.get('/v1/user/info')
  },

  /**
   * 更新用户信息
   * @param {Object} data - { nickname?: string, avatar?: string, bio?: string }
   */
  updateUserInfo(data) {
    return request.put('/v1/user/info', data)
  },

  /**
   * 获取指定用户信息
   * @param {string} userId - 用户ID
   */
  getUserById(userId) {
    return request.get(`/v1/user/${userId}`)
  },

  /**
   * 上传头像
   * @param {string} filePath - 本地文件路径
   */
  uploadAvatar(filePath) {
    return request.upload('/v1/user/avatar', filePath, { name: 'avatar' })
  }
}
