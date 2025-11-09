@echo off
echo.
echo ====================================
echo   Restarting Backend Server
echo ====================================
echo.

REM Kill any PHP process on port 8000
echo Stopping existing backend server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Waiting for port to be released...
timeout /t 2 /nobreak >nul

cd /d "c:\Users\ycel_\DamingRepoPunyeta\capstone_backend"

echo.
echo Clearing Laravel cache...
php artisan optimize:clear

echo.
echo ====================================
echo   Starting Backend Server
echo ====================================
echo   URL: http://127.0.0.1:8000
echo   Press Ctrl+C to stop
echo ====================================
echo.

php artisan serve
