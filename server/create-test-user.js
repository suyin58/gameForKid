const db = require('./src/config/database-sqlite').db;
db.prepare('INSERT OR REPLACE INTO users (id, openid, nickname) VALUES (999, ?, ?)').run('test_openid', '测试用户');
console.log('User created successfully');
