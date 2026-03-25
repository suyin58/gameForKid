import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 全局加载状态
  const loading = ref(false)
  const loadingText = ref('加载中...')

  // 网络状态
  const networkStatus = ref('unknown')

  /**
   * 显示加载
   */
  const showLoading = (text = '加载中...') => {
    loading.value = true
    loadingText.value = text
    uni.showLoading({
      title: text,
      mask: true
    })
  }

  /**
   * 隐藏加载
   */
  const hideLoading = () => {
    loading.value = false
    uni.hideLoading()
  }

  /**
   * 检查网络状态
   */
  const checkNetworkStatus = () => {
    uni.getNetworkType({
      success: (res) => {
        networkStatus.value = res.networkType
      }
    })
  }

  /**
   * 显示提示
   */
  const showToast = (title, icon = 'none', duration = 2000) => {
    uni.showToast({
      title,
      icon,
      duration
    })
  }

  /**
   * 显示模态对话框
   */
  const showModal = (options) => {
    return new Promise((resolve) => {
      uni.showModal({
        title: options.title || '提示',
        content: options.content || '',
        showCancel: options.showCancel !== false,
        cancelText: options.cancelText || '取消',
        confirmText: options.confirmText || '确定',
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }

  return {
    loading,
    loadingText,
    networkStatus,
    showLoading,
    hideLoading,
    checkNetworkStatus,
    showToast,
    showModal
  }
})
