/**
 * 准备前后端联调测试数据
 */
const db = require('./src/config/database-sqlite').db;
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'kidsgame-secret-key-development-only';

console.log('开始准备测试数据...\n');

// 生成测试用户 Token
const testUser1 = { userId: 1001, openid: 'test_user_1' };
const testUser2 = { userId: 1002, openid: 'test_user_2' };
const token1 = jwt.sign(testUser1, JWT_SECRET, { expiresIn: '30d' });
const token2 = jwt.sign(testUser2, JWT_SECRET, { expiresIn: '30d' });

console.log('测试Token已生成:');
console.log('User1 Token:', token1.substring(0, 50) + '...');
console.log('User2 Token:', token2.substring(0, 50) + '...\n');

// 创建测试用户
db.prepare('INSERT OR REPLACE INTO users (id, openid, nickname) VALUES (?, ?, ?)').run(1001, testUser1.openid, '测试用户1');
db.prepare('INSERT OR REPLACE INTO users (id, openid, nickname) VALUES (?, ?, ?)').run(1002, testUser2.openid, '测试用户2');

console.log('✅ 测试用户创建成功');

// 创建测试游戏（游戏列表数据）
const games = [
  {
    user_id: 1001,
    title: '打地鼠游戏',
    description: '点击地鼠得分，适合3-6岁儿童',
    code: '<html><body><h1>打地鼠</h1></body></html>',
    type: 'casual',
    visibility: 'public'
  },
  {
    user_id: 1001,
    title: '数学益智游戏',
    description: '加减法练习，寓教于乐',
    code: '<html><body><h1>数学游戏</h1></body></html>',
    type: 'education',
    visibility: 'public'
  },
  {
    user_id: 1002,
    title: '拼图挑战',
    description: '提高观察力和动手能力',
    code: '<html><body><h1>拼图游戏</h1></body></html>',
    type: 'puzzle',
    visibility: 'public'
  }
];

games.forEach((game, index) => {
  const result = db.prepare('INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count) VALUES (?, ?, ?, ?, ?, ?, 0, 0)').run(
    game.user_id,
    game.title,
    game.description,
    game.code,
    game.type,
    game.visibility
  );
  console.log(`✅ 游戏创建成功: ${game.title} (ID: ${result.lastID})`);
});

// 模拟点赞数据
db.prepare('INSERT INTO likes (user_id, game_id) VALUES (?, ?)').run(1002, 1);
db.prepare('UPDATE games SET like_count = 5 WHERE id = 1').run();
db.prepare('UPDATE games SET play_count = 10 WHERE id = 1').run();

console.log('✅ 点赞和播放数据已添加\n');

console.log('测试数据准备完成！');
console.log('\n========================================');
console.log('测试信息:');
console.log('========================================');
console.log('用户1 ID:', testUser1.userId);
console.log('用户1 Token:', token1);
console.log('');
console.log('用户2 ID:', testUser2.userId);
console.log('用户2 Token:', token2);
console.log('');
console.log('游戏总数:', games.length);
console.log('========================================\n');

// 保存 Token 到文件，方便复制使用
const fs = require('fs');
fs.writeFileSync('test-tokens.json', JSON.stringify({
  user1: {
    userId: testUser1.userId,
    openid: testUser1.openid,
    token: token1
  },
  user2: {
    userId: testUser2.userId,
    openid: testUser2.openid,
    token: token2
  }
}, null, 2));

console.log('✅ Token 已保存到 test-tokens.json');
