const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  // 微信openid
  openid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // 微信unionid（可选）
  unionid: {
    type: String,
    sparse: true
  },

  // 昵称
  nickname: {
    type: String,
    default: '小玩家'
  },

  // 头像URL
  avatar: {
    type: String,
    default: ''
  },

  // 个人简介
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },

  // 创作游戏数
  gameCount: {
    type: Number,
    default: 0
  },

  // 获赞总数
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// 索引
userSchema.index({ createdAt: -1 })
userSchema.index({ gameCount: -1 })

// 虚拟字段：游戏列表
userSchema.virtual('games', {
  ref: 'Game',
  localField: '_id',
  foreignField: 'userId'
})

// 实例方法：增加游戏数
userSchema.methods.incrementGameCount = function() {
  this.gameCount += 1
  return this.save()
}

// 实例方法：减少游戏数
userSchema.methods.decrementGameCount = function() {
  if (this.gameCount > 0) {
    this.gameCount -= 1
  }
  return this.save()
}

// 静态方法：通过openid查找用户
userSchema.statics.findByOpenid = function(openid) {
  return this.findOne({ openid })
}

module.exports = mongoose.model('User', userSchema)
