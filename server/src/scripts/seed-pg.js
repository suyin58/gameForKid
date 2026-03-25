const { pool } = require('../config/database-pg')
const logger = require('../utils/logger')

/**
 * PostgreSQL 种子数据脚本
 */
const seedDatabase = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    logger.info('开始生成种子数据...')

    // 清空现有数据
    logger.info('清空现有数据...')
    await client.query('DELETE FROM likes')
    await client.query('DELETE FROM games')
    await client.query('DELETE FROM users')
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE games_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE likes_id_seq RESTART WITH 1')

    // 创建测试用户
    logger.info('创建测试用户...')
    const usersResult = await client.query(`
      INSERT INTO users (openid, nickname, avatar, bio, game_count, like_count)
      VALUES
        ('test_openid_1', '小明', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', '喜欢创作小游戏', 3, 15),
        ('test_openid_2', '小红', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', '游戏爱好者', 2, 8),
        ('test_openid_3', '小刚', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', '', 1, 5)
      RETURNING id, nickname
    `)

    const users = usersResult.rows
    logger.info(`✅ 创建了 ${users.length} 个用户`)

    // 示例游戏代码
    const sampleGameCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>跳跃小游戏</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial; background: #f0f0f0; }
    #game { width: 100%; max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    #player { width: 50px; height: 50px; background: #3498db; position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); transition: all 0.3s; border-radius: 50%; }
    .jump { bottom: 150px !important; }
    #score { font-size: 24px; text-align: center; margin-top: 200px; }
    button { display: block; margin: 20px auto; padding: 10px 30px; font-size: 18px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; }
    button:hover { background: #27ae60; }
  </style>
</head>
<body>
  <div id="game">
    <h2 style="text-align:center; color: #2c3e50;">🎮 跳跃小游戏</h2>
    <div id="player"></div>
    <div id="score">得分: 0</div>
    <button onclick="jump()">🦘 跳跃</button>
  </div>
  <script>
    let score = 0;
    function jump() {
      const player = document.getElementById('player');
      player.classList.add('jump');
      setTimeout(() => player.classList.remove('jump'), 300);
      score++;
      document.getElementById('score').textContent = '🎯 得分: ' + score;
    }
  </script>
</body>
</html>`

    // 创建测试游戏
    logger.info('创建测试游戏...')
    const gamesResult = await client.query(`
      INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
      VALUES
        ($1, '跳跃吃胡萝卜', '一只可爱的小兔子，要躲避障碍物吃到胡萝卜', $2, 'casual', 'public', 12, 45),
        ($3, '打地鼠', '地鼠会随机从洞里钻出来，点击它！', $2, 'casual', 'public', 8, 23),
        ($3, '猜数字', '电脑想一个1-100的数字让你猜', $2, 'education', 'private', 0, 3),
        ($4, '接水果', '篮子左右移动接住掉下来的水果', $2, 'casual', 'public', 15, 67),
        ($4, '记忆力测试', '记住卡片的位置并找到相同的', $2, 'education', 'public', 6, 18),
        ($5, '跑酷小游戏', '躲避障碍物，跑得越远越好', $2, 'sports', 'public', 20, 89)
      RETURNING id, title
    `, [users[0].id, sampleGameCode, users[0].id, users[1].id, users[2].id])

    const games = gamesResult.rows
    logger.info(`✅ 创建了 ${games.length} 个游戏`)

    // 创建点赞记录
    logger.info('创建点赞记录...')
    const likesResult = await client.query(`
      INSERT INTO likes (user_id, game_id)
      VALUES
        ($1, $2),
        ($3, $2),
        ($4, $5),
        ($6, $5),
        ($7, $8),
        ($1, $8)
      RETURNING id
    `, [users[1].id, games[0].id, users[2].id, games[0].id, users[3].id,
        users[2].id, games[3].id, users[0].id, games[5].id])

    const likes = likesResult.rows
    logger.info(`✅ 创建了 ${likes.length} 条点赞记录`)

    // 更新点赞数（因为insert时可能需要先有游戏）
    await client.query(`
      UPDATE games SET like_count = (
        SELECT COUNT(*) FROM likes WHERE likes.game_id = games.id
      )
    `)

    await client.query('COMMIT')

    logger.info('\n✅ 种子数据创建完成！')
    logger.info(`   👤 用户: ${users.length}`)
    logger.info(`   🎮 游戏: ${games.length}`)
    logger.info(`   ❤️ 点赞: ${likes.length}`)

    // 显示测试账号信息
    logger.info('\n📝 测试账号信息：')
    users.forEach((user, index) => {
      logger.info(`   用户${index + 1}: ${user.nickname} (ID: ${user.id})`)
    })

  } catch (error) {
    await client.query('ROLLBACK')
    logger.error('❌ 创建种子数据失败:', error)
    throw error
  } finally {
    client.release()
  }
}

// 运行脚本
seedDatabase()
  .then(() => {
    logger.info('种子数据脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    logger.error('种子数据脚本执行失败:', error)
    process.exit(1)
  })
