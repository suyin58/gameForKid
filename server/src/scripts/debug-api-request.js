/**
 * Debug script to test API requests
 */

const http = require('http');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:3001/api/v1';
const JWT_SECRET = 'kidsgame-secret-key-development-only';

function apiRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
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

    console.log('Request URL:', `${method} ${url.href}`);
    console.log('Headers:', options.headers);
    if (data) console.log('Body:', data);

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
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

async function test() {
  const userId = 99001;
  const openid = `debug_test_${Date.now()}`;
  const token = jwt.sign({ userId, openid }, JWT_SECRET, { expiresIn: '30d' });

  console.log('Token:', token);
  console.log('');

  const gameData = {
    title: `Debug测试游戏_${Date.now()}`,
    description: '测试描述',
    code: '<html><body>游戏</body></html>',
    type: 'casual',
    visibility: 'public'
  };

  const response = await apiRequest('POST', '/game', gameData, token);
  console.log('');
  console.log('Response Status:', response.status);
  console.log('Response Data:', JSON.stringify(response.data, null, 2));
}

test().catch(console.error);
