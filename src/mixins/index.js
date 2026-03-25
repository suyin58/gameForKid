/**
 * 页面混入 - Vue3 Composition API风格
 */

/**
 * 页面加载混入
 */
export function usePageLoad(callback) {
  onLoad((options) => {
    callback && callback(options)
  })
}

/**
 * 下拉刷新混入
 */
export function usePullDownRefresh(callback) {
  onPullDownRefresh(async () => {
    try {
      await callback()
    } finally {
      uni.stopPullDownRefresh()
    }
  })
}

/**
 * 上拉加载更多混入
 */
export function useReachBottom(callback) {
  onReachBottom(() => {
    callback && callback()
  })
}

/**
 * 分享混入
 */
export function useShare(options) {
  onShareAppMessage(() => {
    return {
      title: options?.title || '儿童游戏创作工坊',
      path: options?.path || '/pages/index/index',
      imageUrl: options?.imageUrl || ''
    }
  })
}
