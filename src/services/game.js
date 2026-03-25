import request from '@/utils/request'

/**
 * 游戏相关API
 */
export const gameApi = {
  /**
   * 获取我的游戏列表
   * @param {Object} params - { page: number, pageSize: number }
   */
  getMyGames(params = {}) {
    return request.get('/v1/game/my', params)
  },

  /**
   * 获取广场游戏列表
   * @param {Object} params - { page: number, pageSize: number, sort: string, type: string }
   */
  getPublicGames(params = {}) {
    return request.get('/v1/game/public', params)
  },

  /**
   * 搜索游戏
   * @param {Object} params - { keyword: string, type: string, sortBy: string, order: string }
   */
  searchGames(params = {}) {
    return request.get('/v1/game/search', params)
  },

  /**
   * 获取游戏详情
   * @param {string} gameId - 游戏ID
   */
  getGameDetail(gameId) {
    return request.get(`/v1/game/${gameId}`)
  },

  /**
   * 创建游戏
   * @param {Object} data - { description: string, code: string, title: string, type: string }
   */
  createGame(data) {
    return request.post('/v1/game', data)
  },

  /**
   * 更新游戏
   * @param {string} gameId - 游戏ID
   * @param {Object} data - 更新数据
   */
  updateGame(gameId, data) {
    return request.put(`/v1/game/${gameId}`, data)
  },

  /**
   * 删除游戏
   * @param {string} gameId - 游戏ID
   */
  deleteGame(gameId) {
    return request.delete(`/v1/game/${gameId}`)
  },

  /**
   * 克隆游戏
   * @param {string} gameId - 游戏ID
   */
  cloneGame(gameId) {
    return request.post(`/v1/game/${gameId}/clone`)
  },

  /**
   * 点赞游戏
   * @param {string} gameId - 游戏ID
   */
  likeGame(gameId) {
    return request.post(`/v1/like/${gameId}`)
  },

  /**
   * 取消点赞游戏
   * @param {string} gameId - 游戏ID
   */
  unlikeGame(gameId) {
    return request.delete(`/v1/like/${gameId}`)
  },

  /**
   * 检查点赞状态
   * @param {string} gameId - 游戏ID
   */
  checkLikeStatus(gameId) {
    return request.get(`/v1/like/${gameId}/status`)
  },

  /**
   * 记录游戏游玩
   * @param {string} gameId - 游戏ID
   */
  recordPlay(gameId) {
    return request.post(`/v1/game/${gameId}/play`)
  }
}
