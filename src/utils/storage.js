/**
 * 本地存储工具
 */
class Storage {
  /**
   * 设置数据
   */
  set(key, value) {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      return false
    }
  }

  /**
   * 获取数据
   */
  get(key, defaultValue = null) {
    try {
      const value = uni.getStorageSync(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (e) {
      console.error('Storage get error:', e)
      return defaultValue
    }
  }

  /**
   * 删除数据
   */
  remove(key) {
    try {
      uni.removeStorageSync(key)
      return true
    } catch (e) {
      console.error('Storage remove error:', e)
      return false
    }
  }

  /**
   * 清空所有数据
   */
  clear() {
    try {
      uni.clearStorageSync()
      return true
    } catch (e) {
      console.error('Storage clear error:', e)
      return false
    }
  }

  /**
   * 获取所有数据
   */
  getAll() {
    try {
      const res = uni.getStorageInfoSync()
      const data = {}
      res.keys.forEach(key => {
        data[key] = this.get(key)
      })
      return data
    } catch (e) {
      console.error('Storage getAll error:', e)
      return {}
    }
  }
}

export default new Storage()
