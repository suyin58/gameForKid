#!/bin/bash

# ========================================
# 儿童AI游戏创作平台 - Docker部署脚本
# ========================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# ========================================
# 前置检查
# ========================================
check_prerequisites() {
    info "检查前置条件..."

    # 检查Docker
    if ! command -v docker &> /dev/null; then
        error "Docker未安装，请先安装Docker"
    fi
    info "✓ Docker已安装: $(docker --version)"

    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose未安装，请先安装Docker Compose"
    fi
    info "✓ Docker Compose已安装: $(docker-compose --version)"

    # 检查.env文件
    if [ ! -f "server/.env" ]; then
        warn "未找到.env文件，将使用默认配置"
    fi
}

# ========================================
# 构建镜像
# ========================================
build_image() {
    info "开始构建Docker镜像..."
    docker-compose build --no-cache
    info "✓ 镜像构建完成"
}

# ========================================
# 启动服务
# ========================================
start_services() {
    info "启动服务..."
    docker-compose up -d
    info "✓ 服务启动完成"

    # 显示服务状态
    info "服务状态："
    docker-compose ps
}

# ========================================
# 停止服务
# ========================================
stop_services() {
    info "停止服务..."
    docker-compose down
    info "✓ 服务已停止"
}

# ========================================
# 查看日志
# ========================================
view_logs() {
    info "查看服务日志（Ctrl+C退出）..."
    docker-compose logs -f
}

# ========================================
# 重启服务
# ========================================
restart_services() {
    info "重启服务..."
    docker-compose restart
    info "✓ 服务已重启"
}

# ========================================
# 更新服务
# ========================================
update_services() {
    info "更新服务..."
    git pull
    build_image
    docker-compose up -d
    info "✓ 服务已更新"
}

# ========================================
# 备份数据
# ========================================
backup_data() {
    info "备份数据..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # 备份数据库
    if [ -d "data" ]; then
        cp -r data "$BACKUP_DIR/"
        info "✓ 数据库已备份到: $BACKUP_DIR"
    fi

    # 备份日志
    if [ -d "logs" ]; then
        cp -r logs "$BACKUP_DIR/"
        info "✓ 日志已备份到: $BACKUP_DIR"
    fi
}

# ========================================
# 健康检查
# ========================================
health_check() {
    info "执行健康检查..."

    # 检查后端服务
    if curl -f http://localhost:3001/health &> /dev/null; then
        info "✓ 后端服务正常"
    else
        error "✗ 后端服务异常"
    fi

    # 检查Nginx（如果启用）
    if docker-compose ps | grep -q nginx; then
        if curl -f http://localhost/health &> /dev/null; then
            info "✓ Nginx服务正常"
        else
            error "✗ Nginx服务异常"
        fi
    fi
}

# ========================================
# 清理系统
# ========================================
cleanup() {
    info "清理未使用的资源..."
    docker system prune -f
    info "✓ 清理完成"
}

# ========================================
# 显示帮助
# ========================================
show_help() {
    cat << EOF
儿童AI游戏创作平台 - Docker部署脚本

用法: ./deploy.sh [命令]

命令:
  build       构建Docker镜像
  start       启动服务
  stop        停止服务
  restart     重启服务
  logs        查看日志
  update      更新服务（拉取代码并重新构建）
  backup      备份数据
  health      健康检查
  cleanup     清理未使用的Docker资源
  help        显示此帮助信息

示例:
  ./deploy.sh build    # 构建镜像
  ./deploy.sh start    # 启动服务
  ./deploy.sh logs     # 查看日志

EOF
}

# ========================================
# 主函数
# ========================================
main() {
    case "${1:-help}" in
        build)
            check_prerequisites
            build_image
            ;;
        start)
            check_prerequisites
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            view_logs
            ;;
        update)
            check_prerequisites
            update_services
            ;;
        backup)
            backup_data
            ;;
        health)
            health_check
            ;;
        cleanup)
            cleanup
            ;;
        help|*)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@"
