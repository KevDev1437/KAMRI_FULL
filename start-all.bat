@echo off
echo ========================================
echo    🚀 KAMRI FULL PLATFORM LAUNCHER 🚀
echo ========================================
echo.

echo 📦 Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run start:dev"

echo.
echo 🌐 Starting Web Frontend...
start "Web Frontend" cmd /k "cd apps/web && npm run dev"

echo.
echo 📱 Starting Mobile App...
start "Mobile App" cmd /k "cd apps/mobile && npm run start"

echo.
echo 🎛️ Starting Admin Dashboard...
start "Admin Dashboard" cmd /k "cd apps/admin && npm run dev"

echo.
echo 🗄️ Starting Prisma Studio...
start "Prisma Studio" cmd /k "cd server && npm run db:studio"

echo.
echo ========================================
echo ✅ All services are starting...
echo ========================================
echo.
echo 🌐 Web Frontend:     http://localhost:3000
echo 📱 Mobile App:       http://localhost:8081
echo 🎛️ Admin Dashboard:   http://localhost:3002
echo 🗄️ Prisma Studio:    http://localhost:5555
echo 🔧 Backend API:      http://localhost:3001
echo 📚 API Docs:         http://localhost:3001/api/docs
echo.
echo ========================================
echo 🎉 KAMRI Platform is ready!
echo ========================================
pause
