# Docker 部署指南

## 📦 方案概述

本项目提供两种Docker部署方案：

### 方案一：单容器部署（推荐用于开发测试）
- ✅ 简单易用
- ✅ 包含应用+SQLite数据库
- ✅ 数据持久化
- ✅ 适合快速启动

### 方案二：多容器部署（推荐用于生产环境）
- ✅ 应用容器
- ✅ Nginx反向代理
- ✅ 可选MongoDB数据库
- ✅ 可选Redis缓存
- ✅ 高可用性

---

## 🚀 快速开始

### 前置要求

1. **安装Docker**
   - Windows/Mac: 下载 [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux:
     ```bash
     curl -fsSL https://get.docker.com | sh
     sudo usermod -aG docker $USER
     ```

2. **安装Docker Compose**
   - Docker Desktop自带
   - Linux:
     ```bash
     sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
     sudo chmod +x /usr/local/bin/docker-compose
     ```

### 一键启动

**Windows:**
```bash
# 1. 构建镜像
deploy.bat build

# 2. 启动服务
deploy.bat start

# 3. 查看日志
deploy.bat logs
```

**Linux/Mac:**
```bash
# 1. 给脚本执行权限
chmod +x deploy.sh

# 2. 构建镜像
./deploy.sh build

# 3. 启动服务
./deploy.sh start

# 4. 查看日志
./deploy.sh logs
```

**或者使用Docker Compose命令:**
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 📁 目录结构

```
gameForKid/
├── Dockerfile              # Docker镜像构建文件
├── docker-compose.yml      # Docker Compose编排文件
├── .dockerignore          # Docker构建忽略文件
├── deploy.sh              # Linux/Mac部署脚本
├── deploy.bat             # Windows部署脚本
├── nginx/                 # Nginx配置目录
│   ├── nginx.conf        # Nginx主配置
│   └── ssl/              # SSL证书目录
├── data/                  # 数据持久化目录
│   └── kidsgame.db       # SQLite数据库文件
├── logs/                  # 日志目录
└── server/               # 后端应用代码
    └── src/
```

---

## 🔧 配置说明

### 环境变量配置

创建 `server/.env` 文件：

```env
# 应用配置
NODE_ENV=production
PORT=3001

# 数据库配置
DB_TYPE=sqlite

# JWT密钥（生产环境请修改）
JWT_SECRET=kidsgame-production-secret-change-me

# AI服务配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_MODEL=glm-4-plus
```

### Nginx配置

1. **修改域名**
   ```nginx
   server_name yourdomain.com;  # 改为你的域名
   ```

2. **配置SSL证书**
   ```bash
   # 方式1: 使用Let's Encrypt免费证书
   certbot certonly --standalone -d yourdomain.com

   # 方式2: 使用自签名证书（仅用于测试）
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/key.pem \
     -out nginx/ssl/cert.pem
   ```

3. **启用Nginx**
   取消 `docker-compose.yml` 中nginx服务的注释

---

## 📊 服务说明

### 后端服务 (backend)

| 配置项 | 值 |
|-------|-----|
| 镜像 | node:18-alpine |
| 端口 | 3001 |
| 内存限制 | 512MB |
| CPU限制 | 1核 |
| 健康检查 | /health 端点 |

### Nginx服务 (nginx)

| 配置项 | 值 |
|-------|-----|
| 镜像 | nginx:alpine |
| 端口 | 80, 443 |
| 功能 | 反向代理、SSL终止、静态文件 |

---

## 💾 数据持久化

### SQLite数据库

数据库文件存储在 `data/` 目录：

```bash
# 查看数据库文件
ls -lh data/kidsgame.db

# 备份数据库
cp data/kidsgame.db data/kidsgame.db.backup

# 恢复数据库
cp data/kidsgame.db.backup data/kidsgame.db
```

### 日志文件

日志存储在 `logs/` 目录：

```bash
# 查看应用日志
tail -f logs/server.log

# 查看Nginx日志
tail -f nginx/logs/access.log
```

---

## 🔄 常用操作

### 查看服务状态

```bash
docker-compose ps
```

### 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f nginx
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入后端容器（使用node用户）
docker-compose exec -u node backend sh

# 在容器中执行命令
docker-compose exec backend node -e "console.log('test')"
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 停止并删除服务

```bash
# 停止服务
docker-compose down

# 停止服务并删除卷
docker-compose down -v
```

### 更新服务

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

---

## 🔍 健康检查

### 检查后端服务

```bash
curl http://localhost:3001/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2026-03-25T00:00:00.000Z",
  "environment": "production"
}
```

### 检查Nginx服务

```bash
curl http://localhost/health
```

### Docker健康检查

```bash
docker inspect --format='{{.State.Health.Status}}' kidsgame-backend
```

---

## 🛠️ 故障排查

### 问题1: 容器无法启动

**检查日志：**
```bash
docker-compose logs backend
```

**常见原因：**
- 端口被占用 → 修改 docker-compose.yml 中的端口映射
- 环境变量未配置 → 检查 .env 文件
- 权限问题 → 检查 data/ 目录权限

### 问题2: 数据库连接失败

**检查数据库文件：**
```bash
ls -la data/kidsgame.db
```

**检查环境变量：**
```bash
docker-compose exec backend env | grep DB_TYPE
```

### 问题3: 健康检查失败

**手动检查：**
```bash
docker-compose exec backend wget -O- http://localhost:3001/health
```

### 问题4: 内存不足

**查看资源使用：**
```bash
docker stats
```

**调整内存限制：**
修改 docker-compose.yml 中的 `deploy.resources.limits.memory`

---

## 🚀 生产环境部署

### 使用阿里云容器服务

1. **推送镜像到阿里云容器镜像服务**
   ```bash
   # 登录阿里云镜像仓库
   docker login --username=your_username registry.cn-hangzhou.aliyuncs.com

   # 标记镜像
   docker tag kidsgame-backend:latest registry.cn-hangzhou.aliyuncs.com/your_namespace/kidsgame:latest

   # 推送镜像
   docker push registry.cn-hangzhou.aliyuncs.com/your_namespace/kidsgame:latest
   ```

2. **在阿里云Kubernetes集群中部署**
   ```bash
   kubectl apply -f k8s-deployment.yaml
   ```

### 使用腾讯云轻量应用服务器

1. **安装Docker**
2. **上传代码**
3. **运行部署脚本**
   ```bash
   ./deploy.sh build
   ./deploy.sh start
   ```

### 自动化部署

**使用GitHub Actions：**

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /root/kidsgame
            git pull
            ./deploy.sh update
```

---

## 📈 性能优化

### 1. 使用多阶段构建

Dockerfile已采用多阶段构建，最终镜像仅约100MB。

### 2. 启用Nginx缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用Docker卷缓存

```yaml
volumes:
  - node_modules:/app/server/node_modules
```

### 4. 限制资源使用

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

---

## 🔐 安全建议

1. **修改默认密码和密钥**
   - JWT_SECRET
   - 数据库密码
   - API密钥

2. **使用 secrets 管理敏感信息**
   ```yaml
   environment:
     - JWT_SECRET=${JWT_SECRET}
   ```

3. **启用SSL/TLS**
   - 使用Let's Encrypt免费证书
   - 配置强密码协议

4. **限制容器权限**
   - 使用非root用户运行
   - 限制网络访问

5. **定期更新镜像**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 📞 相关文档

- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [Nginx文档](https://nginx.org/en/docs/)
- [阿里云容器镜像服务](https://cr.console.aliyun.com/)

---

**最后更新**: 2026-03-25
**维护者**: Claude Code (AI Assistant)
