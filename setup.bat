@echo off
chcp 65001 >nul
color 0A
echo ================================================
echo    SCRIPT EDITOR - CÀI ĐẶT TỰ ĐỘNG
echo ================================================
echo.

REM Kiểm tra Node.js đã cài chưa
echo [1/5] Kiểm tra Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chưa được cài đặt!
    echo 📥 Vui lòng tải và cài Node.js từ: https://nodejs.org
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js đã được cài đặt
    node --version
)
echo.

REM Kiểm tra npm
echo [2/5] Kiểm tra npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm không khả dụng!
    pause
    exit /b 1
) else (
    echo ✅ npm đã sẵn sàng
    npm --version
)
echo.

REM Cài đặt dependencies
echo [3/5] Cài đặt dependencies...
echo Đang tải các package cần thiết (có thể mất vài phút)...
call npm install
if errorlevel 1 (
    echo ❌ Lỗi khi cài đặt dependencies!
    pause
    exit /b 1
)
echo ✅ Đã cài đặt xong dependencies
echo.

REM Kiểm tra file cần thiết
echo [4/5] Kiểm tra file...
if not exist "main.js" (
    echo ❌ Thiếu file main.js!
    pause
    exit /b 1
)
if not exist "index.html" (
    echo ❌ Thiếu file index.html!
    pause
    exit /b 1
)
if not exist "app.js" (
    echo ❌ Thiếu file app.js!
    pause
    exit /b 1
)
echo ✅ Tất cả file đều đầy đủ
echo.

echo [5/5] Hoàn tất!
echo.
echo ================================================
echo    CÀI ĐẶT THÀNH CÔNG! 🎉
echo ================================================
echo.
echo Bạn có thể:
echo   • Chạy ứng dụng:     npm start
echo   • Build file .exe:   npm run build-win
echo   • Build portable:    npm run pack
echo.
echo Nhấn phím bất kỳ để chạy ứng dụng ngay...
pause >nul

REM Chạy ứng dụng
echo.
echo 🚀 Đang khởi động ứng dụng...
call npm start
