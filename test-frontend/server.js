const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const STATIC_DIR = path.join(__dirname, 'test-frontend');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // 处理根路径
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './test-frontend/square.html';
  } else {
    filePath = './test-frontend' + req.url;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - 页面未找到</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('服务器错误: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`前端测试服务器已启动！`);
  console.log(`访问地址: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
