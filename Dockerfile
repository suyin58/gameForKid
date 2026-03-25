# 多阶段构建 - 儿童AI游戏创作平台
# 基础镜像
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装Python和构建工具（某些npm包需要）
RUN apk add --no-cache python3 make g++

# ========================================
# 阶段1: 依赖安装
# ========================================
FROM base AS dependencies

# 复制package文件
COPY server/package*.json ./server/

# 安装生产依赖
WORKDIR /app/server
RUN npm ci --only=production

# ========================================
# 阶段2: 构建应用
# ========================================
FROM base AS build

# 复制所有源代码
COPY server ./server

# 设置生产环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 数据目录
VOLUME ["/app/data"]

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# ========================================
# 阶段3: 生产镜像
# ========================================
FROM alpine:3.19 AS production

# 安装Node.js和运行时依赖
RUN apk add --no-cache \
    nodejs=18.* \
    npm=9.* \
    sqlite \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# 设置时区
ENV TZ=Asia/Shanghai

WORKDIR /app

# 从依赖阶段复制node_modules
COPY --from=dependencies /app/server/node_modules ./server/node_modules

# 从构建阶段复制源代码
COPY --from=build /app/server ./server

# 创建数据目录
RUN mkdir -p /app/data && chmod 777 /app/data

# 设置生产环境
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_TYPE=sqlite

# 暴露端口
EXPOSE 3001

# 切换到非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# 工作目录
WORKDIR /app/server

# 启动命令
CMD ["node", "src/server.js"]
