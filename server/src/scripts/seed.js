const mongoose = require('mongoose')
const { User, Game, Like } = require('../models')
const { env } = require('../config/env')
const logger = require('../utils/logger')

/**
 * 生成种子数据
 */
const seedDatabase = async () => {
  try {
    // 连接数据库
    await mongoose.connect(env.mongodb.uri)
    logger.info('已连接到数据库')

    // 清空现有数据（可选）
    logger.info('清空现有数据...')
    await User.deleteMany({})
    await Game.deleteMany({})
    await Like.deleteMany({})

    // 创建测试用户
    logger.info('创建测试用户...')
    const users = await User.create([
      {
        openid: 'test_openid_1',
        nickname: '小明',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        bio: '喜欢创作小游戏',
        gameCount: 3,
        likeCount: 15
      },
      {
        openid: 'test_openid_2',
        nickname: '小红',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        bio: '游戏爱好者',
        gameCount: 2,
        likeCount: 8
      },
      {
        openid: 'test_openid_3',
        nickname: '小刚',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        bio: '',
        gameCount: 1,
        likeCount: 5
      }
    ])

    logger.info(`✅ 创建了 ${users.length} 个用户`)

    // 创建测试游戏
    logger.info('创建测试游戏...')
    const sampleGameCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>跳跃小游戏</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial; }
    #game { width: 100%; max-width: 400px; margin: 0 auto; }
    #player { width: 50px; height: 50px; background: #3498db; position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); transition: all 0.3s; }
    .jump { bottom: 150px !important; }
    #score { font-size: 24px; text-align: center; margin-top: 200px; }
    button { display: block; margin: 20px auto; padding: 10px 30px; font-size: 18px; }
  </style>
</head>
<body>
  <div id="game">
    <h2 style="text-align:center">跳跃小游戏</h2>
    <div id="player"></div>
    <div id="score">得分: 0</div>
    <button onclick="jump()">跳跃</button>
  </div>
  <script>
    let score = 0;
    function jump() {
      const player = document.getElementById('player');
      player.classList.add('jump');
      setTimeout(() => player.classList.remove('jump'), 300);
      score++;
      document.getElementById('score').textContent = '得分: ' + score;
    }
  </script>
</body>
</html>`

    const games = await Game.create([
      {
        userId: users[0]._id,
        title: '跳跃吃胡萝卜',
        description: '一只可爱的小兔子，要躲避障碍物吃到胡萝卜',
        code: sampleGameCode,
        type: 'casual',
        visibility: 'public',
        likeCount: 12,
        playCount: 45
      },
      {
        userId: users[0]._id,
        title: '打地鼠',
        description: '地鼠会随机从洞里钻出来，点击它！',
        code: sampleGameCode,
        type: 'casual',
        visibility: 'public',
        likeCount: 8,
        playCount: 23
      },
      {
        userId: users[0]._id,
        title: '猜数字',
        description: '电脑想一个1-100的数字让你猜',
        code: sampleGameCode,
        type: 'education',
        visibility: 'private',
        likeCount: 0,
        playCount: 3
      },
      {
        userId: users[1]._id,
        title: '接水果',
        description: '篮子左右移动接住掉下来的水果',
        code: sampleGameCode,
        type: 'casual',
        visibility: 'public',
        likeCount: 15,
        playCount: 67
      },
      {
        userId: users[1]._id,
        title: '记忆力测试',
        description: '记住卡片的位置并找到相同的',
        code: sampleGameCode,
        type: 'education',
        visibility: 'public',
        likeCount: 6,
        playCount: 18
      },
      {
        userId: users[2]._id,
        title: '跑酷小游戏',
        description: '躲避障碍物，跑得越远越好',
        code: sampleGameCode,
        type: 'sports',
        visibility: 'public',
        likeCount: 20,
        playCount: 89
      }
    ])

    logger.info(`✅ 创建了 ${games.length} 个游戏`)

    // 创建点赞记录
    logger.info('创建点赞记录...')
    const likes = await Like.create([
      { userId: users[1]._id, gameId: games[0]._id },
      { userId: users[2]._id, gameId: games[0]._id },
      { userId: users[0]._id, gameId: games[3]._id },
      { userId: users[2]._id, gameId: games[3]._id },
      { userId: users[0]._id, gameId: games[5]._id },
      { userId: users[1]._id, gameId: games[5]._id }
    ])

    logger.info(`✅ 创建了 ${likes.length} 条点赞记录`)

    logger.info('\n✅ 种子数据创建完成！')
    logger.info(`   - 用户: ${users.length}`)
    logger.info(`   - 游戏: ${games.length}`)
    logger.info(`   - 点赞: ${likes.length}`)

  } catch (error) {
    logger.error('创建种子数据失败:', error)
  } finally {
    await mongoose.connection.close()
    logger.info('数据库连接已关闭')
    process.exit(0)
  }
}

// 运行脚本
seedDatabase()
