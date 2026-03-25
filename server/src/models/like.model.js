const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema({
  // 用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // 游戏ID
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
    index: true
  }
}, {
  timestamps: true
})

// 唯一索引：一个用户对同一个游戏只能点赞一次
likeSchema.index({ userId: 1, gameId: 1 }, { unique: true })

// 静态方法：检查用户是否已点赞游戏
likeSchema.statics.hasLiked = function(userId, gameId) {
  return this.findOne({ userId, gameId })
    .then(like => !!like)
}

// 静态方法：切换点赞状态
likeSchema.statics.toggleLike = async function(userId, gameId) {
  const existing = await this.findOne({ userId, gameId })

  if (existing) {
    // 已点赞，取消点赞
    await existing.deleteOne()
    await mongoose.model('Game').updateOne(
      { _id: gameId },
      { $inc: { likeCount: -1 } }
    )
    return { liked: false }
  } else {
    // 未点赞，添加点赞
    await this.create({ userId, gameId })
    await mongoose.model('Game').updateOne(
      { _id: gameId },
      { $inc: { likeCount: 1 } }
    )
    return { liked: true }
  }
}

module.exports = mongoose.model('Like', likeSchema)
