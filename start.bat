@echo off
chcp 65001 >nul

:: Angel CRM 一键启动脚本
:: 适用系统: Windows CMD

echo ==========================================
echo      Angel CRM 一键启动脚本
echo ==========================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装，请先安装 Docker
    echo    下载地址: https://www.docker.com/get-started
    pause
    exit /b 1
)

echo ✅ Docker 已安装
echo.

echo 正在停止现有容器...
docker compose down 2>nul || true
echo.

echo 正在构建并启动服务...
docker compose up -d --build
echo.

echo 正在等待服务启动...
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo            服务状态
echo ==========================================
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo ==========================================
echo            测试连接
echo ==========================================

curl -s -X POST http://localhost:8080/api/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"admin@angel.cn\",\"password\":\"demo2026\"}" | findstr "success" >nul

if %errorlevel% equ 0 (
    echo ✅ 登录成功
) else (
    echo ❌ 登录失败，请检查服务是否正常启动
)

echo.
echo ==========================================
echo            访问地址
echo ==========================================
echo 前端页面: http://localhost:8080
echo 后端 API: http://localhost:3001
echo.
echo 默认登录:
echo   邮箱: admin@angel.cn
echo   密码: demo2026
echo.
echo ==========================================

pause
