#!/bin/bash

# ========================================
# 快速启动脚本 - 方案1单容器部署
# ========================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "  儿童AI游戏创作平台 - 快速部署"
echo "  方案1：单容器（应用 + SQLite）"
echo "========================================"
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[错误]${NC} Docker未安装！"
    echo ""
    echo "请先安装Docker："
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  Linux: curl -fsSL https://get.docker.com | sh"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  Mac: https://www.docker.com/products/docker-desktop/"
    fi
    echo ""
    exit 1
fi

echo -e "${GREEN}[检查]${NC} Docker已安装: $(docker --version)"

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo -e "${RED}[错误]${NC} Docker未运行！"
    echo ""
    echo "请启动Docker："
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  1. 打开 Docker Desktop"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  1. sudo systemctl start docker"
    fi
    echo "  2. 等待Docker启动完成"
    echo "  3. 运行此脚本"
    echo ""
    exit 1
fi

echo -e "${GREEN}[检查]${NC} Docker正在运行"
echo ""

# 创建必要的目录
mkdir -p data logs

# 构建镜像
echo "[步骤1] 构建Docker镜像..."
echo "这可能需要几分钟时间..."
docker compose -f docker-compose-simple.yml build
echo -e "${GREEN}[完成]${NC} 镜像构建成功"
echo ""

# 启动服务
echo "[步骤2] 启动服务..."
docker compose -f docker-compose-simple.yml up -d
echo -e "${GREEN}[完成]${NC} 服务启动成功"
echo ""

# 等待服务就绪
echo "[步骤3] 等待服务就绪..."
sleep 5

# 健康检查
echo "[步骤4] 健康检查..."
if curl -f http://localhost:3001/health &> /dev/null; then
    echo -e "${GREEN}[成功]${NC} 服务运行正常！"
    echo ""
    echo "========================================"
    echo "  部署成功！"
    echo "========================================"
    echo ""
    echo "服务地址："
    echo "  - API: http://localhost:3001"
    echo "  - 健康检查: http://localhost:3001/health"
    echo ""
    echo "常用命令："
    echo "  - 查看日志: docker-compose -f docker-compose-simple.yml logs -f"
    echo "  - 停止服务: docker-compose -f docker-compose-simple.yml down"
    echo "  - 重启服务: docker-compose -f docker-compose-simple.yml restart"
    echo "  - 查看状态: docker-compose -f docker-compose-simple.yml ps"
    echo ""
    echo "数据目录："
    echo "  - 数据库: ./data/kidsgame.db"
    echo "  - 日志: ./logs/"
    echo ""
    echo "查看日志（Ctrl+C退出）？"
    read -p "按Enter查看日志，或Ctrl+C退出..."

    docker-compose -f docker-compose-simple.yml logs -f
else
    echo -e "${YELLOW}[警告]${NC} 健康检查失败，但服务可能正在启动中"
    echo ""
    echo "请等待30秒后手动检查："
    echo "  curl http://localhost:3001/health"
    echo ""
    echo "或查看日志："
    echo "  docker-compose -f docker-compose-simple.yml logs"
    echo ""
fi
