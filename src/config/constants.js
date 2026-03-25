/**
 * 游戏类型枚举
 */
export const GameType = {
  CASUAL: 'casual',      // 休闲
  SPORTS: 'sports',      // 运动
  EDUCATION: 'education',// 教育
  CREATIVE: 'creative',  // 创意
  FIGHTING: 'fighting',  // 格斗
  ADVENTURE: 'adventure',// 冒险
  PUZZLE: 'puzzle'       // 益智
}

/**
 * 游戏类型标签映射
 */
export const GameTypeLabels = {
  [GameType.CASUAL]: '休闲',
  [GameType.SPORTS]: '运动',
  [GameType.EDUCATION]: '教育',
  [GameType.CREATIVE]: '创意',
  [GameType.FIGHTING]: '对战',
  [GameType.ADVENTURE]: '冒险',
  [GameType.PUZZLE]: '益智'
}

/**
 * 游戏可见性
 */
export const Visibility = {
  PRIVATE: 'private',  // 私有
  PUBLIC: 'public'     // 公开
}

/**
 * 广场排序类型
 */
export const SquareSortType = {
  RECOMMEND: 'recommend',  // 推荐
  LATEST: 'latest',        // 最新
  HOT: 'hot'              // 最热
}

/**
 * API响应码
 */
export const ResponseCode = {
  SUCCESS: 0,
  ERROR: -1,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

/**
 * 存储键名
 */
export const StorageKey = {
  TOKEN: 'token',
  USER_INFO: 'user_info',
  GAME_DRAFT: 'game_draft'
}

/**
 * 默认配置
 */
export const Config = {
  // 游戏列表每页数量
  PAGE_SIZE: 20,

  // 语音识别最大时长（毫秒）
  VOICE_MAX_DURATION: 60000,

  // 游戏生成超时时间（毫秒）
  GAME_GENERATE_TIMEOUT: 30000,

  // 图片上传最大大小（字节）
  MAX_IMAGE_SIZE: 5 * 1024 * 1024 // 5MB
}
