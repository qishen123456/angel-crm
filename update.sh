#!/bin/bash

# Angel CRM 一键更新脚本
# 适用系统: Linux / macOS
# 功能: 从GitHub拉取最新代码并重建Docker容器，自动备份和恢复数据
# 日志文件: ./logs/update.log

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/update-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="/tmp/angel-crm-backup-$(date +%Y%m%d-%H%M%S)"
DATA_BACKUP_DIR="$BACKUP_DIR/data"

mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================="
echo "     Angel CRM 一键更新脚本"
echo "=========================================="
echo "启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "日志文件: $LOG_FILE"
echo "备份目录: $BACKUP_DIR"
echo ""

echo "[1/10] 配置 Docker 镜像加速..."
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

echo "[2/10] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi
echo "✅ Docker 版本: $(docker --version)"
echo ""

echo "[3/10] 预检查 GitHub 连接..."
echo "先拉取远程代码索引，确认网络可用后再停止容器..."
if git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=30 fetch origin main 2>&1; then
    echo "✅ GitHub 连接正常，远程代码索引已更新"
else
    echo "❌ 无法连接 GitHub，已取消更新"
    echo "服务未被停止，请稍后重试或检查服务器网络 / DNS / 代理 / 防火墙。"
    exit 1
fi
echo ""

echo "[4/10] 备份数据..."
BACKUP_SUCCESS=0
if docker ps --filter "name=angel-crm" --format "{{.Names}}" | grep -q .; then
    echo "✅ 检测到运行中的容器"
    mkdir -p "$BACKUP_DIR"
    
    echo "正在备份后端数据目录..."
    docker cp angel-crm-backend:/app/data "$DATA_BACKUP_DIR" 2>&1
    
    if [ -d "$DATA_BACKUP_DIR" ]; then
        echo "✅ 数据备份成功"
        BACKUP_SUCCESS=1
    else
        echo "⚠️  数据备份失败"
    fi
    
    echo "停止容器..."
    docker compose down 2>&1 || true
else
    echo "ℹ️  未检测到运行中的容器"
fi
echo ""

echo "[5/10] 更新代码..."
echo "切换到远程最新代码..."
if git reset --hard origin/main 2>&1; then
    echo "✅ 代码更新成功"
    echo "当前提交: $(git log --oneline -1)"
else
    echo "❌ 代码更新失败"
    echo "正在恢复容器..."
    docker compose up -d 2>&1
    if [ $BACKUP_SUCCESS -eq 1 ]; then
        sleep 5
        echo "恢复数据目录..."
        docker cp "$DATA_BACKUP_DIR/." angel-crm-backend:/app/data 2>&1
        echo "✅ 数据恢复完成"
    fi
    exit 1
fi
echo ""

echo "[6/10] 清理缓存..."
docker builder prune -f 2>/dev/null || true
docker image prune -f --filter "reference=crm-*" 2>/dev/null || true
echo "✅ 缓存清理完成"
echo ""

echo "[7/10] 构建服务..."
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

echo "[8/10] 恢复数据..."
sleep 5
if [ $BACKUP_SUCCESS -eq 1 ] && [ -d "$DATA_BACKUP_DIR" ]; then
    echo "正在恢复备份数据..."
    docker cp "$DATA_BACKUP_DIR/." angel-crm-backend:/app/data 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据恢复成功"
    else
        echo "⚠️  数据恢复失败，请手动恢复目录: $DATA_BACKUP_DIR"
    fi
else
    echo "ℹ️  无需恢复数据"
fi
echo ""

echo "[9/10] 测试服务..."
echo "健康检查..."
HEALTH_RESULT=$(curl -s http://localhost:8888/api/health)
echo "结果: $HEALTH_RESULT"

echo ""
echo "登录测试..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:8888/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@angel.cn","password":"demo2026"}')

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "✅ 更新成功"
else
    echo "❌ 更新失败: $LOGIN_RESULT"
    echo ""
    echo "--- 后端日志 ---"
    docker logs angel-crm-backend --tail 30 2>&1 || true
    exit 1
fi

echo ""
echo "[10/10] 完成"
echo ""
echo "=========================================="
echo "           更新完成"
echo "=========================================="
echo "前端页面: http://localhost:8888"
echo "后端 API: http://localhost:3001"
echo "默认登录: admin@angel.cn / demo2026"
echo "日志文件: $LOG_FILE"
echo "备份目录: $DATA_BACKUP_DIR"
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "=========================================="
