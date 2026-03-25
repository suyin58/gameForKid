import request from '@/utils/request'

/**
 * AI生成相关API
 */
export const aiApi = {
  /**
   * 生成游戏代码
   * @param {Object} data - { description: string, basedOn?: string }
   */
  generateGame(data) {
    return request.post('/v1/ai/generate', data)
  },

  /**
   * 修改游戏
   * @param {Object} data - { gameId: string, description: string }
   */
  modifyGame(data) {
    return request.post('/v1/ai/modify', data)
  }
}
