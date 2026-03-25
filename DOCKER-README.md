# Docker 部署文件说明

本目录包含完整的Docker部署方案，可一键部署儿童AI游戏创作平台。

## 📁 文件列表

| 文件 | 说明 |
|------|------|
| `Dockerfile` | Docker镜像构建文件（多阶段构建） |
| `docker-compose.yml` | Docker Compose编排配置 |
| `.dockerignore` | Docker构建忽略文件列表 |
| `deploy.sh` | Linux/Mac自动化部署脚本 |
| `deploy.bat` | Windows自动化部署脚本 |
| `ecosystem.config.js` | PM2进程管理配置（非Docker部署用） |
| `nginx/nginx.conf` | Nginx反向代理配置 |
| `DOCKER-DEPLOY-GUIDE.md` | 详细部署文档 |

---

## 🚀 快速开始

### Windows用户

```cmd
# 1. 构建镜像
deploy.bat build

# 2. 启动服务
deploy.bat start

# 3. 查看日志
deploy.bat logs

# 4. 健康检查
deploy.bat health
```

### Linux/Mac用户

```bash
# 1. 添加执行权限
chmod +x deploy.sh

# 2. 构建镜像
./deploy.sh build

# 3. 启动服务
./deploy.sh start

# 4. 查看日志
./deploy.sh logs

# 5. 健康检查
./deploy.sh health
```

---

## 🎯 两种部署方案

### 方案1：单容器部署（默认）

**特点：**
- ✅ 应用 + SQLite数据库在单个容器中
- ✅ 简单快速，适合开发测试
- ✅ 数据持久化到本地目录
- ✅ 镜像大小：约100MB

**启动方式：**
```bash
docker-compose up -d backend
```

### 方案2：多容器部署（生产推荐）

**特点：**
- ✅ 应用容器 + Nginx反向代理
- ✅ 可选MongoDB数据库
- ✅ 可选Redis缓存
- ✅ 更高可用性
- ✅ 支持水平扩展

**启动方式：**
```bash
# 启动所有服务
docker-compose up -d

# 或者只启动特定服务
docker-compose up -d backend nginx
```

---

## 📊 服务架构

```
┌─────────────────────────────────────────┐
│           Nginx (443/80)                │
│  反向代理 + SSL终止 + 静态文件          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│       Backend App (3001)                │
│  Node.js + Express + SQLite            │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         SQLite Database                 │
│         /app/data/kidsgame.db          │
└────────────────────────────────────────┘
```

---

## 💾 数据持久化

所有重要数据都通过Docker卷映射到宿主机：

```yaml
volumes:
  - ./data:/app/data          # SQLite数据库
  - ./logs:/app/server/logs   # 应用日志
  - ./nginx/ssl:/etc/nginx/ssl # SSL证书
```

**备份：**
```bash
# 备份数据库
cp data/kidsgame.db backup/kidsgame.db.$(date +%Y%m%d)

# 备份日志
cp -r logs backup/logs.$(date +%Y%m%d)
```

---

## 🔧 自定义配置

### 1. 修改端口

编辑 `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8080:3001"  # 宿主机端口:容器端口
```

### 2. 修改环境变量

编辑 `server/.env`:

```env
NODE_ENV=production
PORT=3001
DB_TYPE=sqlite
JWT_SECRET=your-secret-key
```

### 3. 配置SSL证书

1. 获取证书文件 `cert.pem` 和 `key.pem`
2. 放置到 `nginx/ssl/` 目录
3. 取消 `docker-compose.yml` 中nginx服务的注释
4. 修改 `nginx/nginx.conf` 中的域名

---

## 📈 资源使用

**默认配置：**
- CPU: 1核
- 内存: 512MB
- 存储: 根据数据库大小而定

**查看资源使用：**
```bash
docker stats
```

**调整资源限制：**
编辑 `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'        # 增加到2核
      memory: 1G       # 增加到1GB
```

---

## 🔄 更新部署

### 方式1：使用部署脚本

```bash
./deploy.sh update  # Linux/Mac
deploy.bat update   # Windows
```

### 方式2：手动更新

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d

# 4. 清理旧镜像
docker image prune -f
```

---

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 检查容器状态
docker-compose ps

# 检查容器内部
docker-compose exec backend sh
```

### 数据库问题

```bash
# 检查数据库文件
ls -lh data/kidsgame.db

# 进入容器检查
docker-compose exec backend ls -lh /app/data

# 修复数据库权限
chmod 666 data/kidsgame.db
```

### 网络问题

```bash
# 检查网络
docker network ls

# 检查容器网络
docker network inspect gameforkid_kidsgame-network

# 重启网络
docker-compose down
docker-compose up -d
```

---

## 📚 更多文档

详细的部署指南请查看：
- **[DOCKER-DEPLOY-GUIDE.md](./DOCKER-DEPLOY-GUIDE.md)** - 完整部署文档
- **[nginx/nginx.conf](./nginx/nginx.conf)** - Nginx配置说明
- **[ecosystem.config.js](./ecosystem.config.js)** - PM2配置说明

---

## 🆘 获取帮助

如果遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 健康检查：`./deploy.sh health`
3. 查看文档：`cat DOCKER-DEPLOY-GUIDE.md`

---

**快速开始只需3步：**

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 验证服务
curl http://localhost:3001/health
```

🎉 **就这么简单！**
