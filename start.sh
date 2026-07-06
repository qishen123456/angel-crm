#!/bin/bash

# Angel CRM 一键部署脚本
# 适用系统: Linux / macOS
# 功能: 自动配置Docker镜像加速 + npm镜像 + 启动服务
# 日志文件: ./logs/start.log

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/start-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================="
echo "     Angel CRM 一键部署脚本"
echo "=========================================="
echo "启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "日志文件: $LOG_FILE"
echo ""

echo "[1/8] 配置 Docker 镜像加速..."
DOCKER_CONFIG="/etc/docker/daemon.json"
MIRROR_CONFIG='{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}'

if [ -f "$DOCKER_CONFIG" ]; then
    if grep -q "registry-mirrors" "$DOCKER_CONFIG"; then
        echo "✅ Docker 镜像加速已配置"
    else
        echo "⚠️  配置 Docker 镜像加速..."
        echo "$MIRROR_CONFIG" > "$DOCKER_CONFIG"
        systemctl restart docker 2>/dev/null || true
        echo "✅ Docker 镜像加速配置完成"
    fi
else
    echo "⚠️  创建 Docker 镜像加速配置..."
    mkdir -p /etc/docker
    echo "$MIRROR_CONFIG" > "$DOCKER_CONFIG"
    systemctl restart docker 2>/dev/null || true
    echo "✅ Docker 镜像加速配置完成"
fi
echo ""

echo "[2/8] 配置 npm 镜像..."
if command -v npm &> /dev/null; then
    CURRENT_REGISTRY=$(npm config get registry)
    if echo "$CURRENT_REGISTRY" | grep -q "npmmirror"; then
        echo "✅ npm 镜像已配置"
    else
        npm config set registry https://registry.npmmirror.com
        echo "✅ npm 镜像配置完成"
    fi
else
    echo "ℹ️  npm 未安装（将在容器内配置）"
fi
echo ""

echo "[3/8] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi
echo "✅ Docker 版本: $(docker --version)"
echo ""

echo "[4/8] 检查 Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi
echo "✅ Docker Compose 已安装"
echo ""

echo "[5/8] 停止现有容器..."
docker compose down 2>&1 || echo "⚠️  没有运行中的容器"
echo ""

echo "[6/8] 清理缓存..."
docker builder prune -f 2>/dev/null || true
docker image prune -f --filter "reference=crm-*" 2>/dev/null || true
echo "✅ 缓存清理完成"
echo ""

echo "[7/8] 构建并启动服务..."
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

echo "[8/8] 测试服务..."
sleep 5

echo "健康检查..."
HEALTH_RESULT=$(curl -s http://localhost:8080/api/health)
echo "结果: $HEALTH_RESULT"

echo ""
echo "登录测试..."
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
echo "           部署完成"
echo "=========================================="
echo "前端页面: http://localhost:8080"
echo "后端 API: http://localhost:3001"
echo "默认登录: admin@angel.cn / demo2026"
echo "日志文件: $LOG_FILE"
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "=========================================="
