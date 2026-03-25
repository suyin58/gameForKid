import env from '@/config/env'
import { useUserStore } from '@/store/modules/user'
import { ResponseCode } from '@/config/constants'

/**
 * 网络请求封装
 */
class Request {
  constructor() {
    this.baseURL = env.baseURL
    this.timeout = 30000
    this.header = {
      'Content-Type': 'application/json'
    }
  }

  /**
   * 获取Token
   */
  getToken() {
    const userStore = useUserStore()
    return userStore.token
  }

  /**
   * 请求拦截器
   */
  interceptRequest(options) {
    // 添加Token
    const token = this.getToken()
    if (token) {
      options.header = {
        ...options.header,
        Authorization: `Bearer ${token}`
      }
    }

    // 添加时间戳防止缓存
    if (options.method === 'GET') {
      options.data = {
        ...options.data,
        _t: Date.now()
      }
    }

    console.log(`[Request] ${options.method} ${options.url}`, options.data)

    return options
  }

  /**
   * 响应拦截器
   */
  interceptResponse(response, requestUrl) {
    const { statusCode, data } = response

    console.log(`[Response] ${requestUrl}`, data)

    // HTTP状态码检查
    if (statusCode !== 200) {
      this.handleError(`请求失败: ${statusCode}`)
      return { code: statusCode, data: null, message: '请求失败' }
    }

    // 业务状态码检查
    if (data.code === ResponseCode.UNAUTHORIZED) {
      // Token过期，清除登录状态
      const userStore = useUserStore()
      userStore.logout()

      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/index/index'
      })

      return { code: data.code, data: null, message: '登录已过期' }
    }

    return data
  }

  /**
   * 错误处理
   */
  handleError(message) {
    uni.showToast({
      title: message || '请求失败',
      icon: 'none',
      duration: 2000
    })
  }

  /**
   * 通用请求方法
   */
  request(options) {
    return new Promise((resolve, reject) => {
      // 请求拦截
      options = this.interceptRequest(options)

      // 完整URL
      if (!options.url.startsWith('http')) {
        options.url = this.baseURL + options.url
      }

      // 发起请求
      uni.request({
        url: options.url,
        method: options.method || 'GET',
        data: options.data,
        header: options.header,
        timeout: options.timeout || this.timeout,
        success: (res) => {
          const response = this.interceptResponse(res, options.url)
          if (response.code === ResponseCode.SUCCESS || response.code === 0) {
            resolve(response)
          } else {
            reject(response)
          }
        },
        fail: (err) => {
          console.error('[Request Error]', err)
          this.handleError('网络请求失败')
          reject({
            code: -1,
            data: null,
            message: '网络请求失败'
          })
        }
      })
    })
  }

  /**
   * GET请求
   */
  get(url, data = {}) {
    return this.request({
      url,
      method: 'GET',
      data
    })
  }

  /**
   * POST请求
   */
  post(url, data = {}) {
    return this.request({
      url,
      method: 'POST',
      data
    })
  }

  /**
   * PUT请求
   */
  put(url, data = {}) {
    return this.request({
      url,
      method: 'PUT',
      data
    })
  }

  /**
   * DELETE请求
   */
  delete(url, data = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data
    })
  }

  /**
   * 上传文件
   */
  upload(url, filePath, options = {}) {
    return new Promise((resolve, reject) => {
      const token = this.getToken()

      uni.uploadFile({
        url: this.baseURL + url,
        filePath,
        name: options.name || 'file',
        formData: options.formData || {},
        header: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data)
          } else {
            reject(data)
          }
        },
        fail: (err) => {
          console.error('[Upload Error]', err)
          this.handleError('上传失败')
          reject(err)
        }
      })
    })
  }
}

// 导出单例
export default new Request()
