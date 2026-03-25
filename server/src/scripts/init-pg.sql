-- 儿童AI游戏创作平台 - PostgreSQL 数据库初始化脚本

-- =============================================
-- 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    openid VARCHAR(255) UNIQUE NOT NULL,
    unionid VARCHAR(255) UNIQUE,
    nickname VARCHAR(100) DEFAULT '小玩家',
    avatar TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    game_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_game_count ON users(game_count DESC);

-- =============================================
-- 游戏类型枚举
-- =============================================
CREATE TYPE IF NOT EXISTS game_type AS ENUM (
    'casual',      -- 休闲
    'sports',      -- 运动
    'education',   -- 教育
    'creative',    -- 创意
    'fighting',    -- 格斗
    'war',         -- 战争
    'adventure'    -- 冒险
);

-- =============================================
-- 可见性枚举
-- =============================================
CREATE TYPE IF NOT EXISTS visibility_type AS ENUM (
    'private',
    'public'
);

-- =============================================
-- 游戏表
-- =============================================
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT '未命名游戏',
    description TEXT DEFAULT '',
    code TEXT NOT NULL,
    type game_type DEFAULT 'casual',
    thumbnail TEXT DEFAULT '',
    visibility visibility_type DEFAULT 'private',
    is_cloned BOOLEAN DEFAULT false,
    cloned_from INTEGER REFERENCES games(id) ON DELETE SET NULL,
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    play_count INTEGER DEFAULT 0 CHECK (play_count >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 游戏表索引
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_visibility ON games(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_like_count ON games(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_games_play_count ON games(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_games_type_visibility ON games(type, visibility);

-- =============================================
-- 点赞表
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- 点赞表索引
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_game_id ON likes(game_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_game ON likes(user_id, game_id);

-- =============================================
-- 触发器：自动更新 updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 触发器：自动更新用户的游戏数
-- =============================================
CREATE OR REPLACE FUNCTION update_user_game_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET game_count = game_count + 1 WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET game_count = game_count - 1 WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_count AFTER INSERT OR DELETE ON games
    FOR EACH ROW EXECUTE FUNCTION update_user_game_count();

-- =============================================
-- 初始化完成
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '数据库表创建完成！';
    RAISE NOTICE '已创建表: users, games, likes';
    RAISE NOTICE '已创建索引和触发器';
END $$;
