/**
 * 游戏搜索功能测试脚本
 *
 * 测试内容：
 * 1. 搜索游戏标题
 * 2. 搜索作者昵称
 * 3. 类型过滤 + 搜索
 * 4. 排序功能
 * 5. 分页功能
 * 6. 边界条件测试
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';
let passCount = 0;
let failCount = 0;

/**
 * 发送HTTP请求
 */
function request(method, path, data = null) {
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
 * 测试用例
 */
async function testSearchByTitle() {
  console.log('\n📝 测试1: 搜索游戏标题');
  try {
    const result = await request('GET', '/api/v1/game/search?keyword=游戏');
    if (result.status === 200 && result.data.code === 0) {
      console.log(`✅ 通过: 找到 ${result.data.data.games.length} 个游戏`);
      passCount++;
    } else {
      console.log(`❌ 失败: ${JSON.stringify(result.data)}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSearchByAuthor() {
  console.log('\n📝 测试2: 搜索作者昵称');
  try {
    const result = await request('GET', '/api/v1/game/search?keyword=用户A');
    if (result.status === 200 && result.data.code === 0) {
      console.log(`✅ 通过: 找到 ${result.data.data.games.length} 个游戏`);
      passCount++;
    } else {
      console.log(`❌ 失败: ${JSON.stringify(result.data)}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSearchWithType() {
  console.log('\n📝 测试3: 类型过滤 + 搜索');
  try {
    const result = await request('GET', '/api/v1/game/search?keyword=游戏&type=casual');
    if (result.status === 200 && result.data.code === 0) {
      console.log(`✅ 通过: 找到 ${result.data.data.games.length} 个休闲游戏`);
      passCount++;
    } else {
      console.log(`❌ 失败: ${JSON.stringify(result.data)}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSearchWithSort() {
  console.log('\n📝 测试4: 排序功能（按点赞数）');
  try {
    const result = await request('GET', '/api/v1/game/search?keyword=游戏&sortBy=like_count&order=DESC');
    if (result.status === 200 && result.data.code === 0) {
      const games = result.data.data.games;
      let isSorted = true;
      for (let i = 0; i < games.length - 1; i++) {
        if (games[i].like_count < games[i + 1].like_count) {
          isSorted = false;
          break;
        }
      }
      if (isSorted || games.length <= 1) {
        console.log(`✅ 通过: 游戏按点赞数降序排列`);
        passCount++;
      } else {
        console.log(`❌ 失败: 游戏未按点赞数正确排序`);
        failCount++;
      }
    } else {
      console.log(`❌ 失败: ${JSON.stringify(result.data)}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSearchPagination() {
  console.log('\n📝 测试5: 分页功能');
  try {
    const result1 = await request('GET', '/api/v1/game/search?keyword=游戏&limit=5&offset=0');
    const result2 = await request('GET', '/api/v1/game/search?keyword=游戏&limit=5&offset=5');

    if (result1.status === 200 && result2.status === 200 &&
        result1.data.code === 0 && result2.data.code === 0) {
      const games1 = result1.data.data.games;
      const games2 = result2.data.data.games;
      console.log(`✅ 通过: 第1页 ${games1.length} 个游戏, 第2页 ${games2.length} 个游戏`);
      passCount++;
    } else {
      console.log(`❌ 失败: ${JSON.stringify(result1.data)}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSearchEmptyKeyword() {
  console.log('\n📝 测试6: 空关键词（应返回错误）');
  try {
    const result = await request('GET', '/api/v1/game/search?keyword=');
    if (result.status === 400 && result.data.code === 1001) {
      console.log(`✅ 通过: 正确返回错误`);
      passCount++;
    } else {
      console.log(`❌ 失败: 应返回400错误`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSearchLongKeyword() {
  console.log('\n📝 测试7: 超长关键词（应返回错误）');
  try {
    const longKeyword = 'a'.repeat(51);
    const result = await request('GET', `/api/v1/game/search?keyword=${longKeyword}`);
    if (result.status === 400 && result.data.code === 1001) {
      console.log(`✅ 通过: 正确返回错误`);
      passCount++;
    } else {
      console.log(`❌ 失败: 应返回400错误`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSearchNoResults() {
  console.log('\n📝 测试8: 搜索不存在的游戏');
  try {
    const result = await request('GET', '/api/v1/game/search?keyword=xyzabc123notexist');
    if (result.status === 200 && result.data.code === 0 && result.data.data.total === 0) {
      console.log(`✅ 通过: 正确返回空结果`);
      passCount++;
    } else {
      console.log(`❌ 失败: ${JSON.stringify(result.data)}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🧪 游戏搜索功能测试开始');
  console.log('=' .repeat(50));

  await testSearchByTitle();
  await testSearchByAuthor();
  await testSearchWithType();
  await testSearchWithSort();
  await testSearchPagination();
  await testSearchEmptyKeyword();
  await testSearchLongKeyword();
  await testSearchNoResults();

  console.log('\n' + '=' .repeat(50));
  console.log(`\n📊 测试结果: ${passCount} 通过, ${failCount} 失败`);

  if (failCount === 0) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  存在失败的测试');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// 确保服务器正在运行
console.log('⏳ 等待服务器启动...');
setTimeout(() => {
  runAllTests().catch(error => {
    console.error('测试运行错误:', error);
    process.exit(1);
  });
}, 2000);
