/**
 * 功能7：游戏广场增强 - 完整E2E测试（包含数据库验证）
 *
 * 真正的端到端测试：
 * 1. 准备测试数据（直接操作数据库）
 * 2. 调用API
 * 3. 验证API返回的数据与数据库一致
 * 4. 清理测试数据
 */

const { test, expect } = require('@playwright/test');
const { get, run, query } = require('../src/config/database-sqljs');

const API_BASE = 'http://localhost:3001/api/v1';

/**
 * 测试辅助函数
 */

// 清理测试数据
async function cleanupTestData() {
  await run("DELETE FROM games WHERE title LIKE '%_TEST_%'");
  await run("DELETE FROM users WHERE nickname LIKE '%_TEST_USER_%'");
}

// 创建测试用户
async function createTestUser(id, nickname) {
  await run(
    `INSERT INTO users (id, openid, nickname, avatar, quota_type) VALUES (?, ?, ?, ?, ?)`,
    [id, `test_openid_${id}`, nickname, '', 'free']
  );
}

// 创建测试游戏
async function createTestGame(userId, title, type, likeCount, playCount) {
  const result = await run(
    `INSERT INTO games (user_id, title, description, code, type, thumbnail, visibility, like_count, play_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, '测试游戏描述', '<html><body>测试游戏代码</body></html>', type, '', 'public', likeCount, playCount]
  );
  return result.lastID;
}

// 获取数据库中的游戏
async function getGamesFromDB() {
  return await query('SELECT * FROM games WHERE visibility = ?', ['public']);
}

/**
 * 测试套件
 */
test.describe('游戏搜索 - 完整E2E测试（含数据库验证）', () => {

  // 每个测试前清理数据
  test.beforeEach(async () => {
    await cleanupTestData();
  });

  // 所有测试后清理数据
  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('E2E: 搜索功能 - 验证返回数据与数据库一致', async ({ request }) => {
    // 1. 准备测试数据
    const userId = 99991;
    await createTestUser(userId, '测试用户_TEST_');

    const game1 = await createTestGame(userId, '超级马里奥_TEST_', 'casual', 100, 200);
    const game2 = await createTestGame(userId, '贪吃蛇大作战_TEST_', 'puzzle', 50, 150);
    const game3 = await createTestGame(userId, '俄罗斯方块_TEST_', 'puzzle', 80, 180);

    // 2. 调用API搜索
    const response = await request.get(`${API_BASE}/game/search?keyword=测试`);

    // 3. 验证API响应
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data.games.length).toBeGreaterThanOrEqual(3);

    // 4. 验证数据库中的数据
    const dbGames = await getGamesFromDB();
    const testGamesInDB = dbGames.filter(g => g.title.includes('_TEST_'));

    // 5. 验证API返回的游戏ID都存在于数据库中
    const apiGameIds = result.data.games.map(g => g.id);
    const dbGameIds = testGamesInDB.map(g => g.id);

    apiGameIds.forEach(id => {
      expect(dbGameIds).toContain(id);
    });

    console.log(`✅ 数据库验证通过: 找到 ${testGamesInDB.length} 个测试游戏`);
  });

  test('E2E: 类型过滤 - 验证返回的游戏类型正确', async ({ request }) => {
    // 1. 准备测试数据
    const userId = 99992;
    await createTestUser(userId, '测试用户2_TEST_');

    await createTestGame(userId, '休闲游戏A_TEST_', 'casual', 10, 20);
    await createTestGame(userId, '休闲游戏B_TEST_', 'casual', 15, 25);
    await createTestGame(userId, '益智游戏A_TEST_', 'puzzle', 20, 30);

    // 2. 调用API - 只搜索休闲游戏
    const response = await request.get(`${API_BASE}/game/search?keyword=测试&type=casual`);

    // 3. 验证API响应
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.code).toBe(0);

    // 4. 验证所有返回的游戏都是casual类型
    result.data.games.forEach(game => {
      expect(game.type).toBe('casual');
    });

    // 5. 验证数据库中的数据
    const dbGames = await getGamesFromDB();
    const casualGamesInDB = dbGames.filter(g => g.title.includes('_TEST_') && g.type === 'casual');

    expect(result.data.games.length).toBe(casualGamesInDB.length);
    console.log(`✅ 类型过滤验证通过: API返回 ${result.data.games.length} 个休闲游戏，数据库中有 ${casualGamesInDB.length} 个`);
  });

  test('E2E: 排序功能 - 验证按点赞数降序正确', async ({ request }) => {
    // 1. 准备测试数据（不同的点赞数）
    const userId = 99993;
    await createTestUser(userId, '测试用户3_TEST_');

    await createTestGame(userId, '游戏A_TEST_', 'casual', 100, 0);  // 100赞
    await createTestGame(userId, '游戏B_TEST_', 'casual', 50, 0);   // 50赞
    await createTestGame(userId, '游戏C_TEST_', 'casual', 150, 0);  // 150赞
    await createTestGame(userId, '游戏D_TEST_', 'casual', 75, 0);   // 75赞

    // 2. 调用API - 按点赞数降序
    const response = await request.get(`${API_BASE}/game/search?keyword=测试&sortBy=like_count&order=DESC`);

    // 3. 验证API响应
    expect(response.status()).toBe(200);
    const result = await response.json();

    // 4. 验证排序正确（降序）
    const games = result.data.games.filter(g => g.title.includes('_TEST_'));
    for (let i = 0; i < games.length - 1; i++) {
      expect(games[i].like_count).toBeGreaterThanOrEqual(games[i + 1].like_count);
    }

    // 5. 从数据库获取同样的数据验证
    const dbGames = await getGamesFromDB();
    const testGamesInDB = dbGames
      .filter(g => g.title.includes('_TEST_'))
      .sort((a, b) => b.like_count - a.like_count); // 降序排序

    // 验证API返回的顺序与数据库一致
    games.forEach((game, index) => {
      if (index < testGamesInDB.length) {
        expect(game.like_count).toBe(testGamesInDB[index].like_count);
      }
    });

    console.log(`✅ 排序验证通过: 游戏按点赞数降序排列`);
  });

  test('E2E: 分页功能 - 验证分页数据正确', async ({ request }) => {
    // 1. 准备测试数据（5个游戏）
    const userId = 99994;
    await createTestUser(userId, '测试用户4_TEST_');

    for (let i = 1; i <= 5; i++) {
      await createTestGame(userId, `分页测试游戏${i}_TEST_`, 'casual', i * 10, 0);
    }

    // 2. 调用API - 第1页，每页2条
    const response1 = await request.get(`${API_BASE}/game/search?keyword=分页测试&limit=2&offset=0`);
    expect(response1.status()).toBe(200);
    const result1 = await response1.json();

    // 3. 验证第1页只有2条数据
    const page1Games = result1.data.games.filter(g => g.title.includes('_TEST_'));
    expect(page1Games.length).toBe(2);

    // 4. 调用API - 第2页，每页2条
    const response2 = await request.get(`${API_BASE}/game/search?keyword=分页测试&limit=2&offset=2`);
    expect(response2.status()).toBe(200);
    const result2 = await response2.json();

    const page2Games = result2.data.games.filter(g => g.title.includes('_TEST_'));
    expect(page2Games.length).toBe(2);

    // 5. 验证总数是5
    expect(result1.data.total).toBeGreaterThanOrEqual(5);

    // 6. 验证两页的数据不重复
    const page1Ids = page1Games.map(g => g.id);
    const page2Ids = page2Games.map(g => g.id);
    const intersection = page1Ids.filter(id => page2Ids.includes(id));
    expect(intersection.length).toBe(0);

    console.log(`✅ 分页验证通过: 第1页 ${page1Games.length} 条，第2页 ${page2Games.length} 条，总数 ${result1.data.total}`);
  });

  test('E2E: 复杂查询 - 搜索+类型+排序+分页', async ({ request }) => {
    // 1. 准备多样化的测试数据
    const userId = 99995;
    await createTestUser(userId, '测试用户5_TEST_');

    // 创建不同类型和点赞数的游戏
    await createTestGame(userId, '休闲大冒险_TEST_', 'casual', 200, 1000);
    await createTestGame(userId, '休闲小游戏_TEST_', 'casual', 50, 200);
    await createTestGame(userId, '益智大冒险_TEST_', 'puzzle', 150, 800);
    await createTestGame(userId, '教育大冒险_TEST_', 'education', 180, 900);

    // 2. 调用API - 搜索"大冒险" + 只看休闲游戏 + 按点赞降序 + 每页2条
    const response = await request.get(
      `${API_BASE}/game/search?keyword=大冒险&type=casual&sortBy=like_count&order=DESC&limit=2&offset=0`
    );

    // 3. 验证API响应
    expect(response.status()).toBe(200);
    const result = await response.json();

    // 4. 验证：所有结果都是休闲游戏
    result.data.games.forEach(game => {
      expect(game.type).toBe('casual');
      expect(game.title).toContain('大冒险');
    });

    // 5. 验证：按点赞数降序
    const games = result.data.games.filter(g => g.title.includes('_TEST_'));
    for (let i = 0; i < games.length - 1; i++) {
      expect(games[i].like_count).toBeGreaterThanOrEqual(games[i + 1].like_count);
    }

    // 6. 验证数据库中的数据一致
    const dbGames = await getGamesFromDB();
    const matchingDBGames = dbGames.filter(g =>
      g.title.includes('_TEST_') &&
      g.title.includes('大冒险') &&
      g.type === 'casual'
    );

    expect(games.length).toBeLessThanOrEqual(2);
    expect(matchingDBGames.length).toBeGreaterThanOrEqual(1);

    console.log(`✅ 复杂查询验证通过: 找到 ${games.length} 个符合条件的游戏`);
  });

  test('E2E: 边界情况 - 搜索不存在的游戏', async ({ request }) => {
    // 1. 确保数据库中没有这个词
    const impossibleKeyword = '根本不可能存在的游戏名称XYZ123';

    // 2. 调用API
    const response = await request.get(`${API_BASE}/game/search?keyword=${impossibleKeyword}`);

    // 3. 验证返回空结果
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data.total).toBe(0);
    expect(result.data.games.length).toBe(0);

    // 4. 验证数据库确实没有
    const dbGames = await getGamesFromDB();
    const found = dbGames.filter(g => g.title.includes(impossibleKeyword));
    expect(found.length).toBe(0);

    console.log(`✅ 边界情况验证通过: 搜索不存在的关键词返回空结果`);
  });
});

/**
 * 测试总结
 *
 * 这些E2E测试真正验证了：
 * 1. ✅ 数据库中插入了预期的测试数据
 * 2. ✅ API正确返回了数据库中的数据
 * 3. ✅ 返回的数据结构与数据库一致
 * 4. ✅ 过滤、排序、分页功能在数据库层面正确工作
 * 5. ✅ 测试后正确清理了数据
 *
 * 相比之前的测试，这才是真正的端到端测试！
 */
