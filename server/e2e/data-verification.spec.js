/**
 * 完整E2E测试 - 验证API返回数据与数据库一致性
 *
 * 测试内容：
 * 1. 调用API创建数据
 * 2. 从数据库查询验证数据
 * 3. 对比API返回与数据库数据
 * 4. 验证数据完整性
 */

const { test, expect } = require('@playwright/test');
const { query, run, get, connectDB } = require('../src/config/database-sqljs');
const http = require('http');

const API_BASE = 'http://localhost:3001/api/v1';

/**
 * 辅助函数 - 发送HTTP请求
 */
function apiRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * 辅助函数 - 生成测试Token
 */
function generateTestToken(userId, openid) {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = 'kidsgame-secret-key-development-only';
  return jwt.sign(
    { user_id: userId, openid },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * 测试套件
 */
test.describe('完整E2E测试 - 数据库验证', () => {

  // 初始化数据库
  test.beforeAll(async () => {
    await connectDB();
    console.log('✅ 数据库已初始化');
  });

  // 清理测试数据
  test.afterAll(async () => {
    await run("DELETE FROM likes WHERE game_id IN (SELECT id FROM games WHERE title LIKE '%_E2E_%')");
    await run("DELETE FROM games WHERE title LIKE '%_E2E_%'");
    await run("DELETE FROM users WHERE nickname LIKE '%_E2E_TEST_%'");
    console.log('✅ 测试数据已清理');
  });

  test('E2E: 创建游戏并验证数据库', async () => {
    // 1. 准备测试用户（使用时间戳避免ID冲突）
    const timestamp = Date.now();
    const testUserId = 90000 + (timestamp % 1000);
    const testOpenid = `test_e2e_${timestamp}`;

    // 先创建用户（直接插入数据库）
    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (${testUserId}, '${testOpenid}', 'E2E测试用户', '')`
    );

    // 2. 调用API创建游戏
    const gameData = {
      title: `E2E测试游戏_${timestamp}`,
      description: '这是一个E2E测试游戏',
      code: '<html><body>测试游戏</body></html>',
      type: 'casual',
      visibility: 'public'
    };

    const token = generateTestToken(testUserId, testOpenid);
    const response = await apiRequest('POST', '/game', gameData, token);

    // 3. 验证API响应
    expect(response.status).toBe(201);
    expect(response.data.code).toBe(0);
    expect(response.data.data).toHaveProperty('id');
    expect(response.data.data.title).toBe(gameData.title);

    const gameId = response.data.data.id;

    // 4. 从数据库查询验证
    const dbGame = await get(`SELECT * FROM games WHERE id = ${gameId}`);
    expect(dbGame).toBeDefined();
    expect(dbGame.id).toBe(gameId);
    expect(dbGame.title).toBe(gameData.title);
    expect(dbGame.description).toBe(gameData.description);
    expect(dbGame.type).toBe(gameData.type);
    expect(dbGame.visibility).toBe(gameData.visibility);
    expect(dbGame.user_id).toBe(testUserId);

    console.log('✅ 创建游戏测试通过：API返回与数据库一致');
  });

  test('E2E: 点赞并验证数据库状态', async () => {
    // 1. 准备测试数据
    const testUserId = 99902;
    const testOpenid = 'test_e2e_openid_002';

    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, testOpenid, 'E2E测试用户2', '']
    );

    // 创建游戏
    const gameResult = await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E测试游戏_002', '测试', '<html></html>', 'casual', 'public', 0, 0]
    );
    const gameId = gameResult.lastID;

    // 2. 调用点赞API
    const token = generateTestToken(testUserId, testOpenid);
    const response = await apiRequest('POST', `/like/${gameId}`, null, token);

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);

    // 4. 从数据库验证点赞记录
    const likeRecord = await get(
      'SELECT * FROM likes WHERE user_id = ? AND game_id = ?',
      [testUserId, gameId]
    );
    expect(likeRecord).toBeDefined();
    expect(likeRecord.user_id).toBe(testUserId);
    expect(likeRecord.game_id).toBe(gameId);

    // 5. 验证游戏的点赞数已更新
    const game = await get('SELECT like_count FROM games WHERE id = ?', [gameId]);
    expect(game.like_count).toBe(1);

    console.log('✅ 点赞测试通过：数据库状态正确');
  });

  test('E2E: 搜索并验证结果与数据库一致', async () => {
    // 1. 准备测试数据
    const testUserId = 99903;
    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, 'test_e2e_openid_003', 'E2E测试用户3', '']
    );

    // 创建多个游戏
    await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E_搜索测试_游戏A', '测试A', '<html></html>', 'casual', 'public', 10, 100]
    );
    await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E_搜索测试_游戏B', '测试B', '<html></html>', 'puzzle', 'public', 20, 200]
    );

    // 2. 调用搜索API
    const response = await apiRequest('GET', '/game/search?keyword=E2E_搜索测试');

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);
    const apiGames = response.data.data.games;
    expect(apiGames.length).toBeGreaterThanOrEqual(2);

    // 4. 从数据库查询验证
    const dbGames = await query(
      "SELECT * FROM games WHERE title LIKE '%E2E_搜索测试%' AND visibility = 'public'"
    );

    // 5. 验证数量一致
    expect(apiGames.length).toBe(dbGames.length);

    // 6. 验证每个游戏的数据一致
    apiGames.forEach(apiGame => {
      const dbGame = dbGames.find(g => g.id === apiGame.id);
      expect(dbGame).toBeDefined();
      expect(apiGame.title).toBe(dbGame.title);
      expect(apiGame.type).toBe(dbGame.type);
      expect(apiGame.like_count).toBe(dbGame.like_count);
      expect(apiGame.play_count).toBe(dbGame.play_count);
    });

    console.log('✅ 搜索测试通过：API返回与数据库完全一致');
  });

  test('E2E: 更新游戏并验证数据库', async () => {
    // 1. 准备测试数据
    const testUserId = 99904;
    const testOpenid = 'test_e2e_openid_004';

    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, testOpenid, 'E2E测试用户4', '']
    );

    const gameResult = await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E原标题', '原描述', '<html></html>', 'casual', 'public', 0, 0]
    );
    const gameId = gameResult.lastID;

    // 2. 调用更新API
    const token = generateTestToken(testUserId, testOpenid);
    const updateData = {
      title: 'E2E更新后标题',
      description: '更新后的描述'
    };
    const response = await apiRequest('PUT', `/game/${gameId}`, updateData, token);

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);
    expect(response.data.data.title).toBe(updateData.title);

    // 4. 从数据库验证
    const dbGame = await get('SELECT * FROM games WHERE id = ?', [gameId]);
    expect(dbGame.title).toBe(updateData.title);
    expect(dbGame.description).toBe(updateData.description);

    // 5. 验证updated_at字段已更新
    expect(dbGame.updated_at).not.toBeNull();

    console.log('✅ 更新测试通过：数据库数据已正确更新');
  });

  test('E2E: 增加播放次数并验证', async () => {
    // 1. 准备测试数据
    const testUserId = 99905;
    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, 'test_e2e_openid_005', 'E2E测试用户5', '']
    );

    const gameResult = await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E播放测试', '测试', '<html></html>', 'casual', 'public', 0, 5]
    );
    const gameId = gameResult.lastID;

    // 2. 调用播放次数API
    const response = await apiRequest('POST', `/game/${gameId}/play`);

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);

    // 4. 从数据库验证播放次数增加
    const game = await get('SELECT play_count FROM games WHERE id = ?', [gameId]);
    expect(game.play_count).toBe(6); // 原来是5，现在是6

    console.log('✅ 播放次数测试通过：计数器正确增加');
  });

  test('E2E: 公开游戏列表排序验证', async () => {
    // 1. 准备测试数据（不同点赞数的游戏）
    const testUserId = 99906;
    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, 'test_e2e_openid_006', 'E2E测试用户6', '']
    );

    await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E_排序A', '测试', '<html></html>', 'casual', 'public', 100, 0]
    );
    await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E_排序B', '测试', '<html></html>', 'casual', 'public', 50, 0]
    );
    await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E_排序C', '测试', '<html></html>', 'casual', 'public', 150, 0]
    );

    // 2. 调用公开游戏列表API（按点赞数降序）
    const response = await apiRequest('GET', '/game/public?sortBy=like_count&order=DESC');

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);
    const apiGames = response.data.data.games;

    // 4. 筛选出我们的测试游戏
    const testGames = apiGames.filter(g => g.title.includes('E2E_排序'));

    // 5. 验证排序正确（降序）
    for (let i = 0; i < testGames.length - 1; i++) {
      expect(testGames[i].like_count).toBeGreaterThanOrEqual(testGames[i + 1].like_count);
    }

    // 6. 从数据库查询验证排序
    const dbGames = await query(
      `SELECT * FROM games WHERE title LIKE '%E2E_排序%' ORDER BY like_count DESC`
    );

    // 7. 验证顺序一致
    testGames.forEach((game, index) => {
      expect(game.like_count).toBe(dbGames[index].like_count);
    });

    console.log('✅ 排序测试通过：API排序与数据库查询一致');
  });

  test('E2E: 分页功能验证', async () => {
    // 1. 准备测试数据（5个游戏）
    const testUserId = 99907;
    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, 'test_e2e_openid_007', 'E2E测试用户7', '']
    );

    for (let i = 1; i <= 5; i++) {
      await run(
        `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [testUserId, `E2E_分页测试_游戏${i}`, '测试', '<html></html>', 'casual', 'public', i * 10, 0]
      );
    }

    // 2. 测试第1页（每页2条）
    const page1 = await apiRequest('GET', '/game/search?keyword=E2E_分页测试&limit=2&offset=0');
    expect(page1.status).toBe(200);
    const page1Games = page1.data.data.games.filter(g => g.title.includes('E2E_分页测试'));
    expect(page1Games.length).toBe(2);

    // 3. 测试第2页
    const page2 = await apiRequest('GET', '/game/search?keyword=E2E_分页测试&limit=2&offset=2');
    expect(page2.status).toBe(200);
    const page2Games = page2.data.data.games.filter(g => g.title.includes('E2E_分页测试'));
    expect(page2Games.length).toBe(2);

    // 4. 验证两页数据不重复
    const page1Ids = page1Games.map(g => g.id);
    const page2Ids = page2Games.map(g => g.id);
    const intersection = page1Ids.filter(id => page2Ids.includes(id));
    expect(intersection.length).toBe(0);

    // 5. 验证总数
    expect(page1.data.data.total).toBeGreaterThanOrEqual(5);

    // 6. 从数据库验证总共5个游戏
    const dbGames = await query("SELECT * FROM games WHERE title LIKE '%E2E_分页测试%'");
    expect(dbGames.length).toBe(5);

    console.log('✅ 分页测试通过：分页逻辑正确，数据不重复');
  });

  test('E2E: 删除游戏并验证级联删除', async () => {
    // 1. 准备测试数据
    const testUserId = 99908;
    const testOpenid = 'test_e2e_openid_008';

    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, testOpenid, 'E2E测试用户8', '']
    );

    const gameResult = await run(
      `INSERT INTO games (user_id, title, description, code, type, visibility, like_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'E2E删除测试', '测试', '<html></html>', 'casual', 'public', 0, 0]
    );
    const gameId = gameResult.lastID;

    // 添加点赞记录
    await run(
      `INSERT INTO likes (user_id, game_id) VALUES (?, ?)`,
      [testUserId, gameId]
    );

    // 2. 调用删除API
    const token = generateTestToken(testUserId, testOpenid);
    const response = await apiRequest('DELETE', `/game/${gameId}`, null, token);

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);

    // 4. 验证游戏已删除
    const game = await get('SELECT * FROM games WHERE id = ?', [gameId]);
    expect(game).toBeNull();

    // 5. 验证点赞记录已级联删除
    const like = await get('SELECT * FROM likes WHERE game_id = ?', [gameId]);
    expect(like).toBeNull();

    console.log('✅ 删除测试通过：游戏和关联数据已正确删除');
  });
});

/**
 * 测试总结
 *
 * 这些E2E测试真正验证了：
 * 1. ✅ API操作后数据库状态正确
 * 2. ✅ API返回的数据与数据库一致
 * 3. ✅ 业务逻辑（排序、分页、级联删除）在数据库层面正确
 * 4. ✅ 数据完整性得到保证
 *
 * 这是真正的端到端测试！
 */
