# 🚀 快速开始 - 单容器Docker部署

## 📦 方案1：单容器部署（应用 + SQLite）

这是一个**最简单**的部署方案，适合：
- ✅ 开发测试
- ✅ 个人项目
- ✅ 小型部署
- ✅ 快速启动

### 特点
- 🎯 **极简**：只需一条命令即可启动
- 💾 **内置数据库**：SQLite数据库集成在容器内
- 📁 **数据持久化**：数据库和日志存储在本地
- 🔒 **自包含**：无需额外安装数据库服务
- ⚡ **快速**：镜像仅约100MB，启动迅速

---

## 🛠️ 前置要求

### 必须安装Docker

**Windows:**
1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 运行安装程序
3. 重启计算机
4. 启动 Docker Desktop

**Mac:**
1. 下载 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. 拖拽到 Applications 文件夹
3. 启动 Docker Desktop

**Linux:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🎬 三步快速部署

### Windows用户

双击运行 `quick-deploy.bat`，或在命令提示符中执行：

```cmd
quick-deploy.bat
```

### Linux/Mac用户

```bash
# 1. 添加执行权限
chmod +x quick-deploy.sh

# 2. 运行脚本
./quick-deploy.sh
```

就这么简单！🎉

---

## 📋 手动部署步骤

如果你想了解每一步在做什么：

### 1️⃣ 创建必要目录

```bash
mkdir -p data logs
```

### 2️⃣ 构建Docker镜像

```bash
docker compose -f docker-compose-simple.yml build
```

这会：
- 下载Node.js基础镜像（Alpine Linux）
- 安装项目依赖
- 复制应用代码
- 优化镜像大小

**预计时间：** 3-5分钟（首次运行）

### 3️⃣ 启动服务

```bash
docker compose -f docker-compose-simple.yml up -d
```

这会：
- 启动后端容器
- 暴露3001端口
- 挂载数据目录

**预计时间：** 5-10秒

### 4️⃣ 验证服务

```bash
curl http://localhost:3001/health
```

预期返回：
```json
{
  "status": "ok",
  "timestamp": "2026-03-25T...",
  "environment": "production"
}
```

---

## 🎯 服务说明

### 服务配置

| 配置项 | 值 |
|-------|-----|
| 服务名 | backend |
| 容器名 | kidsgame-backend |
| 端口映射 | 3001:3001（宿主机:容器） |
| 数据库 | SQLite（内置） |
| 内存限制 | 512MB |
| CPU限制 | 1核 |

### 端口说明

- **3001** - 后端API服务
  - 健康检查：`http://localhost:3001/health`
  - API端点：`http://localhost:3001/api/v1/...`

---

## 💾 数据持久化

### 数据目录结构

```
gameForKid/
├── data/              # 数据持久化目录
│   └── kidsgame.db   # SQLite数据库文件
└── logs/              # 日志目录
    ├── error.log      # 错误日志
    └── combined.log   # 综合日志
```

### 数据库位置

- **容器内**: `/app/data/kidsgame.db`
- **宿主机**: `./data/kidsgame.db`

### 备份数据

```bash
# 备份数据库
cp data/kidsgame.db backup/kidsgame.db.$(date +%Y%m%d)

# 备份日志
cp -r logs backup/logs.$(date +%Y%m%d)
```

---

## 🔄 常用操作

### 查看服务状态

```bash
docker compose -f docker-compose-simple.yml ps
```

### 查看日志

```bash
# 实时日志
docker compose -f docker-compose-simple.yml logs -f

# 查看最近100行
docker compose -f docker-compose-simple.yml logs --tail=100
```

### 重启服务

```bash
docker compose -f docker-compose-simple.yml restart
```

### 停止服务

```bash
docker compose -f docker-compose-simple.yml down
```

### 停止并删除数据（谨慎！）

```bash
docker compose -f docker-compose-simple.yml down -v
```

### 进入容器

```bash
# 进入容器shell
docker compose -f docker-compose-simple.yml exec backend sh

# 查看数据库文件
docker compose -f docker-compose-simple.yml exec backend ls -lh /app/data

# 查看环境变量
docker compose -f docker-compose-simple.yml exec backend env
```

---

## 🔧 配置说明

### 环境变量

编辑 `docker-compose-simple.yml` 中的环境变量：

```yaml
environment:
  # 应用配置
  - NODE_ENV=production
  - PORT=3001
  - DB_TYPE=sqlite

  # JWT密钥（生产环境务必修改！）
  - JWT_SECRET=kidsgame-production-secret-change-me

  # AI服务（可选）
  - OPENAI_API_KEY=your-key-here
  - OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
  - OPENAI_MODEL=glm-4-plus
```

### 修改端口

如果想使用其他端口：

```yaml
ports:
  - "8080:3001"  # 宿主机8080端口映射到容器3001端口
```

然后访问：`http://localhost:8080/health`

---

## 🐛 故障排查

### 问题1: 端口被占用

**错误信息:**
```
Error: bind: address already in use
```

**解决方案:**
```bash
# 检查端口占用
netstat -ano | findstr :3001

# 或使用其他端口
# 修改 docker-compose-simple.yml 中的端口映射
```

### 问题2: 健康检查失败

**检查步骤:**
```bash
# 1. 查看容器状态
docker compose -f docker-compose-simple.yml ps

# 2. 查看日志
docker compose -f docker-compose-simple.yml logs backend

# 3. 手动检查
docker compose -f docker-compose-simple.yml exec backend \
  wget -O- http://localhost:3001/health
```

### 问题3: 数据库文件权限

**错误信息:**
```
Error: SQLITE_CANTOPEN: unable to open database file
```

**解决方案:**
```bash
# 修改权限
chmod 666 data/kidsgame.db

# 或重建容器
docker compose -f docker-compose-simple.yml down
docker compose -f docker-compose-simple.yml up -d
```

### 问题4: 内存不足

**错误信息:**
```
Error: JavaScript heap out of memory
```

**解决方案:**
```yaml
# 在 docker-compose-simple.yml 中增加内存限制
deploy:
  resources:
    limits:
      memory: 1G  # 从512M增加到1G
```

---

## 📊 性能优化

### 1. 使用多阶段构建

已启用！Dockerfile采用多阶段构建，最终镜像仅约100MB。

### 2. 限制资源使用

已配置资源限制：
- CPU: 1核
- 内存: 512MB

### 3. 启用健康检查

自动监控服务状态，异常时自动重启。

### 4. 日志管理

日志持久化到本地，可定期清理：

```bash
# 清理7天前的日志
find logs/ -name "*.log" -mtime +7 -delete
```

---

## 🔐 安全建议

1. **修改默认密钥**
   - JWT_SECRET
   - API密钥

2. **使用环境变量文件**
   ```bash
   # 创建 .env 文件
   echo "JWT_SECRET=your-secret-key" > server/.env
   ```

3. **限制容器权限**
   - 已使用非root用户运行
   - 已限制资源使用

4. **定期更新**
   ```bash
   # 更新基础镜像
   docker compose -f docker-compose-simple.yml pull
   docker compose -f docker-compose-simple.yml up -d
   ```

---

## 📈 生产环境部署

### 推荐升级方案

当项目需要升级时，可以考虑：

1. **使用方案2**（多容器部署）
   - 添加Nginx反向代理
   - 添加MongoDB数据库
   - 添加Redis缓存

2. **使用云服务**
   - 阿里云容器服务
   - 腾讯云轻量应用服务器

3. **使用Kubernetes**
   - 支持水平扩展
   - 自动负载均衡
   - 自动故障转移

详见：
- `DOCKER-DEPLOY-GUIDE.md` - 完整部署指南
- `docker-compose.yml` - 多容器部署配置

---

## 📞 获取帮助

遇到问题？

1. 查看日志：`docker-compose -f docker-compose-simple.yml logs -f`
2. 检查状态：`docker-compose -f docker-compose-simple.yml ps`
3. 查看文档：
   - `INSTALL-DOCKER.md` - Docker安装指南
   - `DOCKER-DEPLOY-GUIDE.md` - 完整部署指南

---

**快速部署，只需三步：**

```bash
# 1. 安装Docker
# 访问 https://www.docker.com/products/docker-desktop/

# 2. 运行部署脚本
./quick-deploy.sh      # Linux/Mac
quick-deploy.bat       # Windows

# 3. 验证服务
curl http://localhost:3001/health
```

🎉 **就这么简单！**
