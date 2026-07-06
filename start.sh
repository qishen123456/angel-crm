#!/bin/bash

# Angel CRM 一键启动脚本
# 适用系统: Linux / macOS

set -e

echo "=========================================="
echo "     Angel CRM 一键启动脚本"
echo "=========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "   下载地址: https://www.docker.com/get-started"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker 已安装"
echo ""

# 停止现有容器
echo "正在停止现有容器..."
docker compose down 2>/dev/null || true
echo ""

# 构建并启动
echo "正在构建并启动服务..."
docker compose up -d --build
echo ""

# 等待服务启动
echo "正在等待服务启动..."
sleep 5

# 检查状态
echo ""
echo "=========================================="
echo "           服务状态"
echo "=========================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 测试登录
echo ""
echo "=========================================="
echo "           测试连接"
echo "=========================================="

LOGIN_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@angel.cn","password":"demo2026"}')

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "✅ 登录成功"
else
    echo "❌ 登录失败: $LOGIN_RESULT"
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
