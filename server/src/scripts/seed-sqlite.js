const { db } = require('../config/database-sqlite');
const logger = require('../utils/logger');

/**
 * SQLite种子数据脚本
 */
const seedDatabase = async () => {
  try {
    logger.info('开始生成种子数据...');

    // 开启事务
    db.exec('BEGIN TRANSACTION');

    // 清空现有数据
    logger.info('清空现有数据...');
    db.exec('DELETE FROM likes');
    db.exec('DELETE FROM games');
    db.exec('DELETE FROM users');

    // 插入测试用户
    logger.info('创建测试用户...');
    const insertUser = db.prepare(`
      INSERT INTO users (openid, nickname, avatar, bio, game_count, like_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const users = [
      { openid: 'test_openid_1', nickname: '小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', bio: '喜欢创作小游戏', gameCount: 3, likeCount: 15 },
      { openid: 'test_openid_2', nickname: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', bio: '游戏爱好者', gameCount: 2, likeCount: 8 },
      { openid: 'test_openid_3', nickname: '小刚', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', bio: '', gameCount: 1, likeCount: 5 }
    ];

    users.forEach(user => {
      insertUser.run(user.openid, user.nickname, user.avatar, user.bio, user.gameCount, user.likeCount);
    });

    logger.info(`✅ 创建了 ${users.length} 个用户`);

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
</html>`;

    // 插入测试游戏
    logger.info('创建测试游戏...');
    const insertGame = db.prepare(`
      INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const games = [
      { userId: 1, title: '跳跃吃胡萝卜', description: '一只可爱的小兔子，要躲避障碍物吃到胡萝卜', type: 'casual', visibility: 'public', likeCount: 12, playCount: 45 },
      { userId: 1, title: '打地鼠', description: '地鼠会随机从洞里钻出来，点击它！', type: 'casual', visibility: 'public', likeCount: 8, playCount: 23 },
      { userId: 1, title: '猜数字', description: '电脑想一个1-100的数字让你猜', type: 'education', visibility: 'private', likeCount: 0, playCount: 3 },
      { userId: 2, title: '接水果', description: '篮子左右移动接住掉下来的水果', type: 'casual', visibility: 'public', likeCount: 15, playCount: 67 },
      { userId: 2, title: '记忆力测试', description: '记住卡片的位置并找到相同的', type: 'education', visibility: 'public', likeCount: 6, playCount: 18 },
      { userId: 3, title: '跑酷小游戏', description: '躲避障碍物，跑得越远越好', type: 'sports', visibility: 'public', likeCount: 20, playCount: 89 }
    ];

    games.forEach(game => {
      insertGame.run(game.userId, game.title, game.description, sampleGameCode, game.type, game.visibility, game.likeCount, game.playCount);
    });

    logger.info(`✅ 创建了 ${games.length} 个游戏`);

    // 插入点赞记录
    logger.info('创建点赞记录...');
    const insertLike = db.prepare(`
      INSERT INTO likes (user_id, game_id)
      VALUES (?, ?)
    `);

    const likes = [
      { userId: 2, gameId: 1 },
      { userId: 3, gameId: 1 },
      { userId: 1, gameId: 4 },
      { userId: 3, gameId: 4 },
      { userId: 1, gameId: 6 },
      { userId: 2, gameId: 6 }
    ];

    likes.forEach(like => {
      try {
        insertLike.run(like.userId, like.gameId);
      } catch (error) {
        // 忽略重复错误
        if (!error.message.includes('UNIQUE')) {
          throw error;
        }
      }
    });

    logger.info(`✅ 创建了 ${likes.length} 条点赞记录`);

    // 提交事务
    db.exec('COMMIT');

    logger.info('\n✅ 种子数据创建完成！');
    logger.info(`   👤 用户: ${users.length}`);
    logger.info(`   🎮 游戏: ${games.length}`);
    logger.info(`   ❤️ 点赞: ${likes.length}`);

    // 显示测试账号信息
    logger.info('\n📝 测试账号信息：');
    users.forEach((user, index) => {
      logger.info(`   用户${index + 1}: ${user.nickname} (ID: ${index + 1})`);
    });

  } catch (error) {
    db.exec('ROLLBACK');
    logger.error('❌ 创建种子数据失败:', error);
    throw error;
  }
};

// 运行脚本
seedDatabase()
  .then(() => {
    logger.info('种子数据脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('种子数据脚本执行失败:', error);
    process.exit(1);
  });
