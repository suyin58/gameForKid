const mongoose = require('mongoose')

// 游戏类型枚举
const GameType = {
  CASUAL: 'casual',           // 休闲
  SPORTS: 'sports',           // 运动
  EDUCATION: 'education',     // 教育
  CREATIVE: 'creative',       // 创意
  FIGHTING: 'fighting',       // 格斗
  WAR: 'war',                 // 战争
  ADVENTURE: 'adventure'      // 冒险
}

// 可见性枚举
const Visibility = {
  PRIVATE: 'private',         // 私有
  PUBLIC: 'public'            // 公开
}

const gameSchema = new mongoose.Schema({
  // 创建用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // 游戏名称
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    default: '未命名游戏'
  },

  // 用户描述
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },

  // 游戏代码（HTML）
  code: {
    type: String,
    required: true
  },

  // 游戏类型
  type: {
    type: String,
    enum: Object.values(GameType),
    default: GameType.CASUAL
  },

  // 缩略图URL
  thumbnail: {
    type: String,
    default: ''
  },

  // 可见性
  visibility: {
    type: String,
    enum: Object.values(Visibility),
    default: Visibility.PRIVATE
  },

  // 是否克隆的
  isCloned: {
    type: Boolean,
    default: false
  },

  // 克隆自哪个游戏ID
  clonedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    default: null
  },

  // 点赞数
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // 游玩次数
  playCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// 索引
gameSchema.index({ userId: 1, createdAt: -1 })          // 用户的游戏，按时间倒序
gameSchema.index({ visibility: 1, createdAt: -1 })      // 公开游戏，按时间倒序
gameSchema.index({ likeCount: -1 })                     // 按点赞数排序
gameSchema.index({ playCount: -1 })                    // 按游玩次数排序
gameSchema.index({ type: 1, visibility: 1 })           // 按类型和可见性查询

// 虚拟字段：创建者
gameSchema.virtual('creator', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

// 虚拟字段：克隆来源
gameSchema.virtual('sourceGame', {
  ref: 'Game',
  localField: 'clonedFrom',
  foreignField: '_id',
  justOne: true
})

// 实例方法：发布到广场
gameSchema.methods.publish = function() {
  this.visibility = Visibility.PUBLIC
  return this.save()
}

// 实例方法：取消发布
gameSchema.methods.unpublish = function() {
  this.visibility = Visibility.PRIVATE
  return this.save()
}

// 实例方法：增加点赞数
gameSchema.methods.incrementLikeCount = function() {
  this.likeCount += 1
  return this.save()
}

// 实例方法：减少点赞数
gameSchema.methods.decrementLikeCount = function() {
  if (this.likeCount > 0) {
    this.likeCount -= 1
  }
  return this.save()
}

// 实例方法：增加游玩次数
gameSchema.methods.incrementPlayCount = function() {
  this.playCount += 1
  return this.save()
}

// 静态方法：获取公开游戏列表
gameSchema.statics.findPublicGames = function(options = {}) {
  const { sort = { createdAt: -1 }, limit = 20, skip = 0, type } = options

  const query = { visibility: Visibility.PUBLIC }

  if (type) {
    query.type = type
  }

  return this.find(query)
    .populate('creator', 'nickname avatar')
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .lean()
}

// 静态方法：搜索公开游戏
gameSchema.statics.searchPublicGames = function(keyword, options = {}) {
  const { limit = 20, skip = 0 } = options

  return this.find({
    visibility: Visibility.PUBLIC,
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } }
    ]
  })
    .populate('creator', 'nickname avatar')
    .sort({ likeCount: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean()
}

module.exports = mongoose.model('Game', gameSchema)
