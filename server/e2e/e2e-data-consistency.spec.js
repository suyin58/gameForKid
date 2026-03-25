/**
 * 完整E2E测试 - 验证API与数据库一致性（简化版）
 *
 * 测试策略：
 * 1. 使用API创建/修改数据
 * 2. 直接查询数据库验证数据一致性
 * 3. 使用SQLite数据库确保多进程共享
 */

const { test, expect } = require('@playwright/test');
const { get, query, run, connectDB } = require('../src/config/database-sqlite');
const http = require('http');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:3001/api/v1';
const JWT_SECRET = 'kidsgame-secret-key-development-only';  // 与.env保持一致

/**
 * 辅助函数
 */
function apiRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    // Remove leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const fullUrl = `${API_BASE}/${cleanPath}`;
    const url = new URL(fullUrl);

    console.log(`[DEBUG] ${method} ${url.href}`);

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[DEBUG] Headers:`, JSON.stringify(options.headers, null, 2));

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`[DEBUG] Response status: ${res.statusCode}`);
        if (res.statusCode !== 200 && res.statusCode !== 201) {
          console.log(`[DEBUG] Response body:`, body.substring(0, 300));
        }
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
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

function generateToken(userId, openid) {
  return jwt.sign({ userId, openid }, JWT_SECRET, { expiresIn: '30d' });
}

// 辅助函数：通过API创建游戏
async function createGameViaAPI(userId, openid, gameData) {
  const token = generateToken(userId, openid);
  const response = await apiRequest('POST', '/game', gameData, token);
  if (response.status !== 201 || response.data.code !== 0) {
    throw new Error(`创建游戏失败: ${JSON.stringify(response.data)}`);
  }
  return response.data.data;
}

// 清理函数
async function cleanup() {
  const games = await query("SELECT id FROM games WHERE title LIKE '%E2E数据验证%'");
  for (const game of games) {
    await run(`DELETE FROM likes WHERE game_id = ${game.id}`);
  }
  await run("DELETE FROM games WHERE title LIKE '%E2E数据验证%'");
  await run(`DELETE FROM users WHERE id >= 90000 AND id < 99999`);
  console.log('✅ 测试数据已清理');
}

/**
 * 测试套件
 */
test.describe('E2E测试 - API与数据库一致性验证', () => {

  test.beforeAll(async () => {
    await connectDB();
    console.log('✅ 数据库已初始化');
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test('1. 创建游戏 - 验证数据库存储', async () => {
    // 1. 创建测试用户
    const userId = 99001;
    const openid = `e2e_test_${Date.now()}`;
    await run(`INSERT INTO users (id, openid, nickname) VALUES (${userId}, '${openid}', 'E2E测试用户')`);

    // 2. 通过API创建游戏
    const token = generateToken(userId, openid);
    const gameData = {
      title: `E2E数据验证_创建测试_${Date.now()}`,
      description: '测试描述',
      code: '<html><body>游戏</body></html>',
      type: 'casual',
      visibility: 'public'
    };

    const response = await apiRequest('POST', '/game', gameData, token);

    // 3. 验证API响应
    expect(response.status).toBe(201);
    expect(response.data.code).toBe(0);
    const apiGame = response.data.data;

    // 4. 从数据库查询验证
    const dbGame = await get(`SELECT * FROM games WHERE id = ${apiGame.id}`);

    // 5. 对比数据
    expect(dbGame).toBeDefined();
    expect(dbGame.id).toBe(apiGame.id);
    expect(dbGame.title).toBe(apiGame.title);
    expect(dbGame.description).toBe(apiGame.description);
    expect(dbGame.type).toBe(apiGame.type);
    expect(dbGame.user_id).toBe(userId);

    console.log('✅ 测试1通过：创建游戏，API与数据库一致');
  });

  test('2. 更新游戏 - 验证数据库更新', async () => {
    // 1. 准备数据
    const userId = 99002;
    const openid = `e2e_test_2_${Date.now()}`;
    await run(`INSERT INTO users (id, openid, nickname) VALUES (${userId}, '${openid}', 'E2E测试用户2')`);

    // 通过API创建游戏
    const game = await createGameViaAPI(userId, openid, {
      title: `E2E原标题_${Date.now()}`,
      description: '原描述',
      code: '<html></html>',
      type: 'puzzle',
      visibility: 'public'
    });

    // 2. 通过API更新
    const token = generateToken(userId, openid);
    const updateData = {
      title: `E2E新标题_${Date.now()}`,
      description: '新描述'
    };

    const response = await apiRequest('PUT', `/game/${game.id}`, updateData, token);

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);

    // 4. 从数据库验证
    const updatedGame = await get(`SELECT * FROM games WHERE id = ${game.id}`);
    expect(updatedGame.title).toBe(updateData.title);
    expect(updatedGame.description).toBe(updateData.description);

    console.log('✅ 测试2通过：更新游戏，数据库已同步');
  });

  test('3. 点赞功能 - 验证点赞状态和计数', async () => {
    // 1. 准备数据：创建两个用户，一个创建游戏，另一个点赞
    const creatorId = 99003;
    const creatorOpenid = `e2e_test_3_creator_${Date.now()}`;
    const likerId = 99031;
    const likerOpenid = `e2e_test_3_liker_${Date.now()}`;

    await run(`INSERT INTO users (id, openid, nickname) VALUES (${creatorId}, '${creatorOpenid}', 'E2E测试用户3_创建者')`);
    await run(`INSERT INTO users (id, openid, nickname) VALUES (${likerId}, '${likerOpenid}', 'E2E测试用户3_点赞者')`);

    const game = await createGameViaAPI(creatorId, creatorOpenid, {
      title: `E2E点赞测试_${Date.now()}`,
      description: '测试',
      code: '<html></html>',
      type: 'casual',
      visibility: 'public'
    });

    // 2. 通过API点赞（使用另一个用户）
    const token = generateToken(likerId, likerOpenid);
    const response = await apiRequest('POST', `/like/${game.id}`, null, token);

    // 3. 验证API响应
    expect(response.status).toBe(200);

    // 4. 从数据库验证点赞记录
    const likeRecord = await get(`SELECT * FROM likes WHERE user_id = ${likerId} AND game_id = ${game.id}`);
    expect(likeRecord).toBeDefined();

    // 5. 验证点赞数增加
    const game2 = await get(`SELECT like_count FROM games WHERE id = ${game.id}`);
    expect(game2.like_count).toBe(1);

    console.log('✅ 测试3通过：点赞功能，数据库状态正确');
  });

  test('4. 搜索功能 - 验证搜索结果准确性', async () => {
    // 1. 准备数据
    const userId = 99004;
    const openid = `e2e_test_4_${Date.now()}`;
    const timestamp = Date.now();
    await run(`INSERT INTO users (id, openid, nickname) VALUES (${userId}, '${openid}', 'E2E测试用户4')`);

    await createGameViaAPI(userId, openid, {
      title: `E2E搜索测试游戏A_${timestamp}`,
      description: '测试A',
      code: '<html></html>',
      type: 'casual',
      visibility: 'public'
    });

    await createGameViaAPI(userId, openid, {
      title: `E2E搜索测试游戏B_${timestamp}`,
      description: '测试B',
      code: '<html></html>',
      type: 'puzzle',
      visibility: 'public'
    });

    // 2. 通过API搜索
    const response = await apiRequest('GET', `/game/search?keyword=E2E搜索测试`);

    // 3. 验证API响应
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);
    const apiGames = response.data.data.games;

    // 4. 从数据库查询
    const dbGames = await query(`SELECT * FROM games WHERE title LIKE '%E2E搜索测试%'`);

    // 5. 验证结果数量
    expect(apiGames.length).toBeGreaterThanOrEqual(2);
    expect(dbGames.length).toBeGreaterThanOrEqual(2);

    // 6. 验证至少有一个匹配的
    const foundInAPI = apiGames.find(g => g.title.includes(`E2E搜索测试游戏A_${timestamp}`));
    const foundInDB = dbGames.find(g => g.title.includes(`E2E搜索测试游戏A_${timestamp}`));
    expect(foundInAPI).toBeDefined();
    expect(foundInDB).toBeDefined();

    console.log('✅ 测试4通过：搜索结果与数据库一致');
  });

  test('5. 播放次数 - 验证计数器正确', async () => {
    // 1. 准备数据
    const userId = 99005;
    const openid = `e2e_test_5_${Date.now()}`;
    await run(`INSERT INTO users (id, openid, nickname) VALUES (${userId}, '${openid}', 'E2E测试用户5')`);

    const game = await createGameViaAPI(userId, openid, {
      title: `E2E播放测试_${Date.now()}`,
      description: '测试',
      code: '<html></html>',
      type: 'casual',
      visibility: 'public'
    });

    // 2. 通过API增加播放次数
    const response1 = await apiRequest('POST', `/game/${game.id}/play`);
    const response2 = await apiRequest('POST', `/game/${game.id}/play`);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // 3. 从数据库验证播放次数
    const dbGame = await get(`SELECT play_count FROM games WHERE id = ${game.id}`);
    expect(dbGame.play_count).toBe(2);

    console.log('✅ 测试5通过：播放次数计数器正确');
  });

  test('6. 排序功能 - 验证排序逻辑', async () => {
    // 1. 准备不同点赞数的游戏
    const userId = 99006;
    const openid = `e2e_test_6_${Date.now()}`;
    await run(`INSERT INTO users (id, openid, nickname) VALUES (${userId}, '${openid}', 'E2E测试用户6')`);

    const game1 = await createGameViaAPI(userId, openid, {
      title: `E2E排序_100赞`,
      description: '测试',
      code: '<html></html>',
      type: 'casual',
      visibility: 'public'
    });

    const game2 = await createGameViaAPI(userId, openid, {
      title: `E2E排序_200赞`,
      description: '测试',
      code: '<html></html>',
      type: 'casual',
      visibility: 'public'
    });

    // 手动设置不同的点赞数
    await run(`UPDATE games SET like_count = 100 WHERE id = ${game1.id}`);
    await run(`UPDATE games SET like_count = 200 WHERE id = ${game2.id}`);

    // 2. 通过API获取排序后的列表
    const response = await apiRequest('GET', '/game/public?sortBy=like_count&order=DESC');

    // 3. 验证API响应
    expect(response.status).toBe(200);
    const games = response.data.data.games.filter(g => g.title.includes('E2E排序'));

    // 4. 验证顺序（应该是降序）
    for (let i = 0; i < games.length - 1; i++) {
      expect(games[i].like_count).toBeGreaterThanOrEqual(games[i + 1].like_count);
    }

    // 5. 从数据库验证排序
    const dbGames = await query(`SELECT * FROM games WHERE title LIKE '%E2E排序%' ORDER BY like_count DESC`);

    // 6. 验证API排序与数据库排序一致
    games.forEach((game, index) => {
      if (index < dbGames.length) {
        expect(game.like_count).toBe(dbGames[index].like_count);
      }
    });

    console.log('✅ 测试6通过：排序功能与数据库查询一致');
  });

  test('7. 删除游戏 - 验证级联删除', async () => {
    // 1. 准备数据
    const userId = 99007;
    const openid = `e2e_test_7_${Date.now()}`;
    await run(`INSERT INTO users (id, openid, nickname) VALUES (${userId}, '${openid}', 'E2E测试用户7')`);

    const game = await createGameViaAPI(userId, openid, {
      title: `E2E删除测试_${Date.now()}`,
      description: '测试',
      code: '<html></html>',
      type: 'casual',
      visibility: 'public'
    });

    // 添加点赞
    await run(`INSERT INTO likes (user_id, game_id) VALUES (${userId}, ${game.id})`);

    // 2. 通过API删除
    const token = generateToken(userId, openid);
    const response = await apiRequest('DELETE', `/game/${game.id}`, null, token);

    // 3. 验证API响应
    expect(response.status).toBe(200);

    // 4. 验证游戏已删除
    const dbGame = await get(`SELECT * FROM games WHERE id = ${game.id}`);
    expect(dbGame).toBeNull();

    // 5. 验证点赞记录已级联删除
    const like = await get(`SELECT * FROM likes WHERE game_id = ${game.id}`);
    expect(like).toBeNull();

    console.log('✅ 测试7通过：删除游戏，关联数据已清理');
  });
});

/**
 * 测试总结
 *
 * ✅ 7个E2E测试，全部验证API与数据库一致性
 * 1. 创建游戏 → 验证数据库存储
 * 2. 更新游戏 → 验证数据库更新
 * 3. 点赞功能 → 验证点赞状态和计数
 * 4. 搜索功能 → 验证搜索结果准确性
 * 5. 播放次数 → 验证计数器正确
 * 6. 排序功能 → 验证排序逻辑
 * 7. 删除游戏 → 验证级联删除
 *
 * 真正的端到端测试！
 */
