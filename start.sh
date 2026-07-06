#!/bin/bash

# Angel CRM 一键启动脚本
# 适用系统: Linux / macOS
# 日志文件: ./logs/start.log

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/start-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================="
echo "     Angel CRM 一键启动脚本"
echo "=========================================="
echo "启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "日志文件: $LOG_FILE"
echo ""

if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "   下载地址: https://www.docker.com/get-started"
    exit 1
fi

echo "✅ Docker 已安装"
echo "   版本: $(docker --version)"
echo ""

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker Compose 已安装"
echo ""

echo "正在检查端口占用..."
FRONTEND_PORT=8080
BACKEND_PORT=3001

FRONTEND_OCCUPIED=$(lsof -i :$FRONTEND_PORT | grep LISTEN | awk '{print $2}')
BACKEND_OCCUPIED=$(lsof -i :$BACKEND_PORT | grep LISTEN | awk '{print $2}')

if [ -n "$FRONTEND_OCCUPIED" ]; then
    echo "⚠️  端口 $FRONTEND_PORT 被占用 (PID: $FRONTEND_OCCUPIED)，正在释放..."
    kill -9 "$FRONTEND_OCCUPIED" 2>/dev/null || true
    sleep 2
    echo "✅ 端口 $FRONTEND_PORT 已释放"
fi

if [ -n "$BACKEND_OCCUPIED" ]; then
    echo "⚠️  端口 $BACKEND_PORT 被占用 (PID: $BACKEND_OCCUPIED)，正在释放..."
    kill -9 "$BACKEND_OCCUPIED" 2>/dev/null || true
    sleep 2
    echo "✅ 端口 $BACKEND_PORT 已释放"
fi

echo ""
echo "正在停止现有容器..."
docker compose down 2>&1 || echo "⚠️  没有运行中的容器"
echo ""

echo "正在构建并启动服务..."
if docker compose up -d --build 2>&1; then
    echo "✅ 服务启动成功"
else
    echo "❌ 服务启动失败"
    echo ""
    echo "=========================================="
    echo "           Docker 日志"
    echo "=========================================="
    docker logs angel-crm-backend --tail 30 2>&1 || true
    docker logs angel-crm-frontend --tail 30 2>&1 || true
    exit 1
fi
echo ""

echo "正在等待服务启动..."
sleep 5

echo ""
echo "=========================================="
echo "           服务状态"
echo "=========================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=========================================="
echo "           测试连接"
echo "=========================================="

echo "测试健康检查..."
HEALTH_RESULT=$(curl -s http://localhost:8080/api/health)
echo "健康检查结果: $HEALTH_RESULT"

echo ""
echo "测试登录..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@angel.cn","password":"demo2026"}')

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "✅ 登录成功"
else
    echo "❌ 登录失败: $LOGIN_RESULT"
    echo ""
    echo "=========================================="
    echo "           后端日志"
    echo "=========================================="
    docker logs angel-crm-backend --tail 30 2>&1 || true
    exit 1
fi

echo ""
echo "=========================================="
echo "           访问地址"
echo "=========================================="
echo "前端页面: http://localhost:8080"
echo "后端 API: http://localhost:3001"
echo ""
echo "默认登录:"
echo "  邮箱: admin@angel.cn"
echo "  密码: demo2026"
echo ""
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "日志文件: $LOG_FILE"
echo ""
echo "=========================================="
