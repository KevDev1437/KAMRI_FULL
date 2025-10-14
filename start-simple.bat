@echo off
echo ========================================
echo    ⚡ KAMRI QUICK START ⚡
echo ========================================
echo.

echo 🔧 Backend + Admin Dashboard...
start "Backend" cmd /k "cd server && set DATABASE_URL=file:./dev.db && npm run start:dev"
start "Admin" cmd /k "cd apps/admin && npm run dev"

echo.
echo ========================================
echo ✅ Quick start ready!
echo ========================================
echo.
echo 🎛️ Admin Dashboard: http://localhost:3002
echo 🔧 Backend API:    http://localhost:3001
echo.
echo Login: admin@kamri.com / password123
echo ========================================
pause
