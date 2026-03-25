# 儿童AI游戏创作平台 - 后端服务

基于 Node.js + Express + MongoDB 的后端API服务。

## 技术栈

- **运行环境**: Node.js 18+
- **Web框架**: Express 4.x
- **数据库**: MongoDB 6.x
- **认证**: JWT
- **日志**: Winston
- **AI服务**: OpenAI/Claude

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并填写配置：

```bash
cp .env.example .env
```

### 3. 启动MongoDB

确保MongoDB正在运行：

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. 启动服务器

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3001` 启动

### 5. 健康检查

```bash
curl http://localhost:3001/health
```

## 项目结构

```
server/
├── src/
│   ├── routes/          # 路由层
│   ├── controllers/     # 控制器层
│   ├── services/        # 服务层（业务逻辑）
│   ├── models/          # 数据模型
│   ├── middlewares/     # 中间件
│   ├── utils/           # 工具函数
│   ├── config/          # 配置文件
│   ├── app.js           # Express应用配置
│   └── server.js        # 服务器入口
├── logs/                # 日志文件
├── tests/               # 测试文件
├── .env                 # 环境变量（不提交）
├── .env.example         # 环境变量模板
├── package.json
└── README.md
```

## API接口

### 健康检查
- `GET /health` - 服务健康状态

### 用户相关
- `POST /api/user/login` - 微信登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息

### 游戏相关
- `GET /api/games` - 获取我的游戏列表
- `POST /api/games` - 创建游戏
- `GET /api/games/:id` - 获取游戏详情
- `PUT /api/games/:id` - 更新游戏
- `DELETE /api/games/:id` - 删除游戏
- `POST /api/games/:id/publish` - 发布到广场
- `GET /api/games/public` - 获取广场游戏列表
- `POST /api/games/:id/clone` - 克隆游戏

### AI相关
- `POST /api/ai/generate` - AI生成游戏
- `POST /api/ai/regenerate` - 重新生成游戏

### 互动相关
- `POST /api/like` - 点赞/取消点赞
- `POST /api/games/:id/play` - 记录游玩次数

## 开发脚本

```bash
npm run dev      # 开发模式（nodemon热重载）
npm start        # 生产模式
npm test         # 运行测试
npm run test:watch # 测试监视模式
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|-------|------|-------|
| NODE_ENV | 运行环境 | development |
| PORT | 服务器端口 | 3001 |
| MONGODB_URI | MongoDB连接字符串 | mongodb://localhost:27017/kidsgame |
| JWT_SECRET | JWT密钥 | - |
| WECHAT_APPID | 微信小程序AppID | - |
| WECHAT_SECRET | 微信小程序Secret | - |
| OPENAI_API_KEY | OpenAI API密钥 | - |

## 日志

日志文件位于 `logs/` 目录：

- `error.log` - 错误日志
- `combined.log` - 所有日志

## 开发状态

- [x] 基础框架搭建
- [ ] 数据库连接与模型
- [ ] 用户系统（微信登录 + JWT）
- [ ] 游戏基础CRUD
- [ ] 游戏互动功能
- [ ] AI游戏生成服务
- [ ] 游戏发布与广场
- [ ] 安全与性能优化

## License

MIT
