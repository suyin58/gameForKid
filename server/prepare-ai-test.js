/**
 * 准备AI测试数据
 */

const { run } = require('./src/config/database-sqlite');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'kidsgame-secret-key-development-only';

async function prepareTestData() {
  console.log('准备AI测试数据...\n');

  // 创建测试用户
  const testUserId = 9001;
  const testOpenid = 'ai_integration_test_user';

  try {
    // 删除已存在的测试用户
    await run(`DELETE FROM users WHERE id = ${testUserId}`);

    // 创建新用户（不包含quota_type字段）
    await run(
      `INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)`,
      [testUserId, testOpenid, 'AI测试用户', 'https://picsum.photos/100']
    );

    console.log('✅ 测试用户创建成功');
    console.log(`   用户ID: ${testUserId}`);
    console.log(`   OpenID: ${testOpenid}`);

    // 生成Token（使用user_id而不是userId，匹配认证中间件期望）
    const token = jwt.sign(
      { user_id: testUserId, openid: testOpenid },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('\n✅ Token生成成功');
    console.log(`\nToken: ${token}`);

    // 保存到文件
    const fs = require('fs');
    fs.writeFileSync('ai-test-token.json', JSON.stringify({
      userId: testUserId,
      openid: testOpenid,
      token: token
    }, null, 2));

    console.log('\n✅ 测试数据已保存到 ai-test-token.json');

  } catch (error) {
    console.error('❌ 准备测试数据失败:', error.message);
    process.exit(1);
  }
}

prepareTestData();
