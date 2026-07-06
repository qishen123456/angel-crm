#!/bin/bash

# Angel CRM 一键更新脚本
# 适用系统: Linux / macOS
# 功能: 从GitHub拉取最新代码并重建Docker容器，自动备份和恢复数据

set -e

BACKUP_DIR="/tmp/angel-crm-backup-$(date +%Y%m%d-%H%M%S)"
DATA_FILE="data-backup.json"

echo "=========================================="
echo "     Angel CRM 一键更新脚本"
echo "=========================================="
echo ""

if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "   下载地址: https://www.docker.com/get-started"
    exit 1
fi

echo "✅ Docker 已安装"
echo ""

echo "正在检查是否有运行中的容器..."
if docker ps --filter "name=angel-crm" --format "{{.Names}}" | grep -q .; then
    echo "✅ 检测到运行中的容器，正在备份数据..."
    
    mkdir -p "$BACKUP_DIR"
    
    echo "正在从容器导出当前数据..."
    curl -s http://localhost:8080/api/data/export -o "$BACKUP_DIR/$DATA_FILE"
    
    if [ -s "$BACKUP_DIR/$DATA_FILE" ]; then
        echo "✅ 数据备份成功: $BACKUP_DIR/$DATA_FILE"
        echo ""
    else
        echo "⚠️  数据备份失败，可能服务未正常运行"
        echo ""
    fi
    
    echo "正在停止现有容器..."
    docker compose down 2>/dev/null || true
    echo ""
else
    echo "ℹ️  未检测到运行中的容器"
    echo ""
fi

echo "正在拉取最新代码..."
git fetch origin main
git reset --hard origin/main
echo ""

echo "正在清理旧镜像..."
docker image prune -f --filter "reference=crm-*" 2>/dev/null || true
echo ""

echo "正在构建并启动服务..."
docker compose up -d --build
echo ""

echo "正在等待服务启动..."
sleep 5

echo ""
echo "=========================================="
echo "           服务状态"
echo "=========================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

if [ -s "$BACKUP_DIR/$DATA_FILE" ]; then
    echo "正在恢复之前备份的数据..."
    curl -s -X POST http://localhost:8080/api/data/import \
        -H "Content-Type: application/json" \
        -d @"$BACKUP_DIR/$DATA_FILE"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 数据恢复成功"
        echo ""
    else
        echo ""
        echo "⚠️  数据恢复失败，请手动导入: $BACKUP_DIR/$DATA_FILE"
        echo ""
    fi
fi

echo "=========================================="
echo "           测试连接"
echo "=========================================="

LOGIN_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@angel.cn","password":"demo2026"}')

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "✅ 更新成功"
else
    echo "❌ 更新失败: $LOGIN_RESULT"
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
echo "=========================================="
