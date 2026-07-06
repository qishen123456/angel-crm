#!/bin/bash

# Angel CRM 一键更新脚本
# 适用系统: Linux / macOS
# 功能: 从GitHub拉取最新代码并重建Docker容器，自动备份和恢复数据
# 日志文件: ./logs/update.log

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/update-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="/tmp/angel-crm-backup-$(date +%Y%m%d-%H%M%S)"
DATA_FILE="data-backup.json"

mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================="
echo "     Angel CRM 一键更新脚本"
echo "=========================================="
echo "启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "日志文件: $LOG_FILE"
echo "备份目录: $BACKUP_DIR"
echo ""

echo "[1/7] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi
echo "✅ Docker 版本: $(docker --version)"
echo ""

echo "[2/7] 备份数据..."
BACKUP_SUCCESS=0
if docker ps --filter "name=angel-crm" --format "{{.Names}}" | grep -q .; then
    echo "✅ 检测到运行中的容器"
    mkdir -p "$BACKUP_DIR"
    
    echo "正在导出数据..."
    curl -s http://localhost:8080/api/data/export -o "$BACKUP_DIR/$DATA_FILE"
    
    if [ -s "$BACKUP_DIR/$DATA_FILE" ]; then
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

echo "[3/7] 更新代码..."
echo "拉取最新代码..."
if git fetch origin main 2>&1 && git reset --hard origin/main 2>&1; then
    echo "✅ 代码更新成功"
    echo "当前提交: $(git log --oneline -1)"
else
    echo "❌ 代码更新失败"
    echo "正在恢复容器..."
    docker compose up -d 2>&1
    if [ $BACKUP_SUCCESS -eq 1 ]; then
        sleep 5
        echo "恢复数据..."
        curl -s -X POST http://localhost:8080/api/data/import \
            -H "Content-Type: application/json" \
            -d "@$BACKUP_DIR/$DATA_FILE" 2>&1
        echo "✅ 数据恢复完成"
    fi
    exit 1
fi
echo ""

echo "[4/7] 清理旧镜像..."
docker image prune -f --filter "reference=crm-*" 2>/dev/null || true
echo "✅ 清理完成"
echo ""

echo "[5/7] 构建服务..."
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

echo "[6/7] 恢复数据..."
sleep 5
if [ $BACKUP_SUCCESS -eq 1 ] && [ -s "$BACKUP_DIR/$DATA_FILE" ]; then
    echo "正在恢复备份数据..."
    IMPORT_RESULT=$(curl -s -X POST http://localhost:8080/api/data/import \
        -H "Content-Type: application/json" \
        -d "@$BACKUP_DIR/$DATA_FILE")
    echo "导入结果: $IMPORT_RESULT"
    
    if echo "$IMPORT_RESULT" | grep -q '"success":true'; then
        echo "✅ 数据恢复成功"
    else
        echo "⚠️  数据恢复失败，请手动导入: $BACKUP_DIR/$DATA_FILE"
    fi
else
    echo "ℹ️  无需恢复数据"
fi
echo ""

echo "[7/7] 测试服务..."
echo "健康检查..."
HEALTH_RESULT=$(curl -s http://localhost:8080/api/health)
echo "结果: $HEALTH_RESULT"

echo ""
echo "登录测试..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/login \
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
echo "=========================================="
echo "           更新完成"
echo "=========================================="
echo "前端页面: http://localhost:8080"
echo "后端 API: http://localhost:3001"
echo "默认登录: admin@angel.cn / demo2026"
echo "日志文件: $LOG_FILE"
echo "备份文件: $BACKUP_DIR/$DATA_FILE"
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "=========================================="
