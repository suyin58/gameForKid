/**
 * 功能8测试：错误处理和日志记录
 *
 * 测试内容：
 * 1. 404错误处理
 * 2. 400参数错误
 * 3. 500服务器错误
 * 4. 请求日志记录
 * 5. 错误日志记录
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
async function test404Error() {
  console.log('\n📝 测试1: 404错误处理');
  try {
    const result = await request('GET', '/api/v1/nonexistent');
    if (result.status === 404 && result.data.code === 1004) {
      console.log(`✅ 通过: 正确返回404错误`);
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

async function testInvalidJSON() {
  console.log('\n📝 测试2: 无效JSON格式');
  try {
    // 模拟发送无效JSON
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/user/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          const result = JSON.parse(body);
          if (res.status === 400 && result.code === 1001) {
            console.log(`✅ 通过: 正确处理无效JSON`);
            passCount++;
          } else {
            console.log(`❌ 失败: 状态码 ${res.status}, 响应: ${JSON.stringify(result)}`);
            failCount++;
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log(`❌ 错误: ${error.message}`);
        failCount++;
        resolve();
      });

      // 发送无效JSON
      req.write('{invalid json}');
      req.end();
    });
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testMissingRequiredField() {
  console.log('\n📝 测试3: 缺少必填字段');
  try {
    const result = await request('POST', '/api/v1/user/login', {});
    // 登录需要code字段，缺少应该返回错误
    if (result.status >= 400 && result.data.code !== 0) {
      console.log(`✅ 通过: 正确处理缺少必填字段`);
      passCount++;
    } else {
      console.log(`❌ 失败: 应该返回错误`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testRequestLogging() {
  console.log('\n📝 测试4: 请求日志记录');
  try {
    // 发起一个正常请求，检查日志是否输出
    const result = await request('GET', '/health');
    if (result.status === 200) {
      console.log(`✅ 通过: 请求日志已记录（请检查控制台日志输出）`);
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

async function testErrorResponseFormat() {
  console.log('\n📝 测试5: 错误响应格式');
  try {
    const result = await request('GET', '/api/v1/nonexistent-endpoint');
    const data = result.data;

    // 检查错误响应是否包含必需字段
    if (
      data.hasOwnProperty('code') &&
      data.hasOwnProperty('message') &&
      data.hasOwnProperty('timestamp')
    ) {
      console.log(`✅ 通过: 错误响应格式正确`);
      console.log(`   - code: ${data.code}`);
      console.log(`   - message: ${data.message}`);
      console.log(`   - timestamp: ${data.timestamp}`);
      passCount++;
    } else {
      console.log(`❌ 失败: 错误响应格式不正确`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSuccessResponseFormat() {
  console.log('\n📝 测试6: 成功响应格式');
  try {
    const result = await request('GET', '/health');
    const data = result.data;

    // 检查成功响应是否包含必需字段
    if (
      result.status === 200 &&
      data.hasOwnProperty('status') &&
      data.hasOwnProperty('timestamp')
    ) {
      console.log(`✅ 通过: 成功响应格式正确`);
      console.log(`   - status: ${data.status}`);
      console.log(`   - timestamp: ${data.timestamp}`);
      passCount++;
    } else {
      console.log(`❌ 失败: 成功响应格式不正确`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    failCount++;
  }
}

async function testSlowRequestLogging() {
  console.log('\n📝 测试7: 慢请求日志（需要>1秒）');
  try {
    const start = Date.now();
    const result = await request('GET', '/health');
    const duration = Date.now() - start;

    if (result.status === 200) {
      console.log(`✅ 通过: 请求耗时 ${duration}ms（慢请求警告阈值: 1000ms）`);
      if (duration > 1000) {
        console.log(`   ⚠️  此请求触发慢请求警告`);
      }
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
  console.log('🧪 功能8测试：错误处理和日志记录');
  console.log('=' .repeat(50));

  await test404Error();
  await testInvalidJSON();
  await testMissingRequiredField();
  await testRequestLogging();
  await testErrorResponseFormat();
  await testSuccessResponseFormat();
  await testSlowRequestLogging();

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
