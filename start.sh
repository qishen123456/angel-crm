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

echo "[1/6] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi
echo "✅ Docker 版本: $(docker --version)"
echo ""

echo "[2/6] 检查 Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi
echo "✅ Docker Compose 已安装"
echo ""

echo "[3/6] 停止现有容器..."
docker compose down 2>&1 || echo "⚠️  没有运行中的容器"
echo ""

echo "[4/6] 构建并启动服务..."
if docker compose up -d --build 2>&1; then
    echo "✅ 服务构建成功"
else
    echo "❌ 服务构建失败"
    echo ""
    echo "--- Docker 日志 ---"
    docker logs angel-crm-backend --tail 30 2>&1 || true
    docker logs angel-crm-frontend --tail 30 2>&1 || true
    exit 1
fi
echo ""

echo "[5/6] 等待服务启动..."
sleep 5
echo ""

echo "[6/6] 测试服务..."
echo "测试健康检查..."
HEALTH_RESULT=$(curl -s http://localhost:8080/api/health)
echo "结果: $HEALTH_RESULT"

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
    echo "--- 后端日志 ---"
    docker logs angel-crm-backend --tail 30 2>&1 || true
    exit 1
fi

echo ""
echo "=========================================="
echo "           启动完成"
echo "=========================================="
echo "前端页面: http://localhost:8080"
echo "后端 API: http://localhost:3001"
echo "默认登录: admin@angel.cn / demo2026"
echo "日志文件: $LOG_FILE"
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "=========================================="
