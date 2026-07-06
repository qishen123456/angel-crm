<#
.SYNOPSIS
    Angel CRM 一键更新脚本
.DESCRIPTION
    适用于 Windows PowerShell 的一键更新脚本
    功能: 从GitHub拉取最新代码并重建Docker容器，保留数据
#>

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     Angel CRM 一键更新脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

try {
    docker --version | Out-Null
    Write-Host "✅ Docker 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker 未安装，请先安装 Docker" -ForegroundColor Red
    Write-Host "   下载地址: https://www.docker.com/get-started" -ForegroundColor Yellow
    Read-Host "按任意键退出..."
    exit 1
}

Write-Host ""

Write-Host "正在拉取最新代码..." -ForegroundColor Yellow
git pull origin main
Write-Host ""

Write-Host "正在停止现有容器..." -ForegroundColor Yellow
docker compose down 2>$null | Out-Null
Write-Host ""

Write-Host "正在清理旧镜像..." -ForegroundColor Yellow
docker image prune -f --filter "reference=crm-*" 2>$null | Out-Null
Write-Host ""

Write-Host "正在构建并启动服务..." -ForegroundColor Yellow
docker compose up -d --build
Write-Host ""

Write-Host "正在等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "           服务状态" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "           测试连接" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$response = curl -s -X POST http://localhost:8080/api/auth/login `
    -H "Content-Type: application/json" `
    -d '{"email":"admin@angel.cn","password":"demo2026"}'

if ($response -match '"success":true') {
    Write-Host "✅ 更新成功" -ForegroundColor Green
} else {
    Write-Host "❌ 更新失败" -ForegroundColor Red
    Read-Host "按任意键退出..."
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "           访问地址" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "前端页面: http://localhost:8080" -ForegroundColor Green
Write-Host "后端 API: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "默认登录:" -ForegroundColor Yellow
Write-Host "  邮箱: admin@angel.cn" -ForegroundColor White
Write-Host "  密码: demo2026" -ForegroundColor White
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

Read-Host "按任意键退出..."
