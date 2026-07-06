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

if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "   下载地址: https://www.docker.com/get-started"
    exit 1
fi

echo "✅ Docker 已安装"
echo "   版本: $(docker --version)"
echo ""

echo "正在检查是否有运行中的容器..."
if docker ps --filter "name=angel-crm" --format "{{.Names}}" | grep -q .; then
    echo "✅ 检测到运行中的容器"
    echo "   容器列表:"
    docker ps --filter "name=angel-crm" --format "   - {{.Names}} ({{.Status}})"
    
    mkdir -p "$BACKUP_DIR"
    
    echo ""
    echo "正在从容器导出当前数据..."
    curl -s http://localhost:8080/api/data/export -o "$BACKUP_DIR/$DATA_FILE"
    
    if [ -s "$BACKUP_DIR/$DATA_FILE" ]; then
        FILE_SIZE=$(du -h "$BACKUP_DIR/$DATA_FILE" | awk '{print $1}')
        echo "✅ 数据备份成功: $BACKUP_DIR/$DATA_FILE ($FILE_SIZE)"
        BACKUP_SUCCESS=1
    else
        echo "⚠️  数据备份失败，可能服务未正常运行"
        BACKUP_SUCCESS=0
    fi
    echo ""
    
    echo "正在停止现有容器..."
    docker compose down 2>&1 || true
    echo "✅ 容器已停止"
    echo ""
else
    echo "ℹ️  未检测到运行中的容器"
    BACKUP_SUCCESS=0
    echo ""
fi

echo "=========================================="
echo "           更新代码"
echo "=========================================="
echo "正在拉取最新代码..."
if git fetch origin main 2>&1 && git reset --hard origin/main 2>&1; then
    echo "✅ 代码更新成功"
    echo "   当前提交: $(git log --oneline -1)"
else
    echo "❌ 代码更新失败，请检查网络连接或代理设置"
    echo ""
    echo "正在重新启动现有容器..."
    docker compose up -d 2>&1
    if [ $BACKUP_SUCCESS -eq 1 ]; then
        sleep 5
        echo "正在恢复数据..."
        curl -s -X POST http://localhost:8080/api/data/import \
            -H "Content-Type: application/json" \
            -d "@$BACKUP_DIR/$DATA_FILE" 2>&1
        echo "✅ 数据恢复完成"
    fi
    echo ""
    echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "日志文件: $LOG_FILE"
    exit 1
fi
echo ""

echo "=========================================="
echo "           构建服务"
echo "=========================================="
echo "正在清理旧镜像..."
docker image prune -f --filter "reference=crm-*" 2>/dev/null || true
echo "✅ 旧镜像已清理"
echo ""

echo "正在构建并启动服务..."
if docker compose up -d --build 2>&1; then
    echo "✅ 服务构建成功"
else
    echo "❌ 服务构建失败"
    echo ""
    echo "=========================================="
    echo "           Docker 日志"
    echo "=========================================="
    docker logs angel-crm-backend --tail 30 2>&1 || true
    docker logs angel-crm-frontend --tail 30 2>&1 || true
    echo ""
    echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "日志文件: $LOG_FILE"
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
echo "           恢复数据"
echo "=========================================="
if [ $BACKUP_SUCCESS -eq 1 ] && [ -s "$BACKUP_DIR/$DATA_FILE" ]; then
    echo "正在恢复之前备份的数据..."
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
    echo "✅ 更新成功"
else
    echo "❌ 更新失败: $LOGIN_RESULT"
    echo ""
    echo "=========================================="
    echo "           后端日志"
    echo "=========================================="
    docker logs angel-crm-backend --tail 30 2>&1 || true
    echo ""
    echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "日志文件: $LOG_FILE"
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
echo "备份文件: $BACKUP_DIR/$DATA_FILE"
echo ""
echo "=========================================="
