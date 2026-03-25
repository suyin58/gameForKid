const { db } = require('../config/database-sqlite');
const logger = require('../utils/logger');

/**
 * SQLite数据库初始化脚本
 * 创建users, games, likes表
 */
const initDatabase = async () => {
  try {
    logger.info('开始初始化SQLite数据库...');

    // 创建用户表
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        openid TEXT UNIQUE NOT NULL,
        unionid TEXT UNIQUE,
        nickname TEXT DEFAULT '小玩家',
        avatar TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        game_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建游戏表
    db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT DEFAULT '未命名游戏',
        description TEXT DEFAULT '',
        code TEXT NOT NULL,
        type TEXT DEFAULT 'casual',
        thumbnail TEXT DEFAULT '',
        visibility TEXT DEFAULT 'private',
        is_cloned INTEGER DEFAULT 0,
        cloned_from INTEGER,
        like_count INTEGER DEFAULT 0,
        play_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cloned_from) REFERENCES games(id) ON DELETE SET NULL,
        CHECK(like_count >= 0),
        CHECK(play_count >= 0)
      )
    `);

    // 创建点赞表
    db.exec(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        UNIQUE(user_id, game_id)
      )
    `);

    // 创建索引
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_games_visibility ON games(visibility, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_games_like_count ON games(like_count DESC);
      CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
      CREATE INDEX IF NOT EXISTS idx_likes_game_id ON likes(game_id);
    `);

    // 创建触发器：更新updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_users_updated_at
      AFTER UPDATE ON users
      FOR EACH ROW
      BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_games_updated_at
      AFTER UPDATE ON games
      FOR EACH ROW
      BEGIN
        UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_user_game_count_insert
      AFTER INSERT ON games
      FOR EACH ROW
      BEGIN
        UPDATE users SET game_count = game_count + 1 WHERE id = NEW.user_id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_user_game_count_delete
      AFTER DELETE ON games
      FOR EACH ROW
      BEGIN
        UPDATE users SET game_count = game_count - 1 WHERE id = OLD.user_id;
      END;
    `);

    logger.info('✅ SQLite数据库初始化完成！');
    logger.info('   已创建表: users, games, likes');
    logger.info('   已创建索引和触发器');
    logger.info('\n下一步: 运行 npm run db:seed 生成测试数据');

  } catch (error) {
    logger.error('❌ 数据库初始化失败:', error.message);
    throw error;
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('数据库初始化脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('数据库初始化失败:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
