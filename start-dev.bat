@echo off
echo ========================================
echo    🎯 KAMRI DEV ENVIRONMENT 🎯
echo ========================================
echo.

echo 🔧 Starting Backend + Database...
start "Backend" cmd /k "cd server && set DATABASE_URL=file:./dev.db && npm run start:dev"

echo.
echo 🎛️ Starting Admin Dashboard...
start "Admin Dashboard" cmd /k "cd apps/admin && npm run dev"

echo.
echo 🗄️ Starting Prisma Studio...
start "Prisma Studio" cmd /k "cd server && set DATABASE_URL=file:./dev.db && npx prisma studio"

echo.
echo ========================================
echo ✅ Development environment ready!
echo ========================================
echo.
echo 🎛️ Admin Dashboard:   http://localhost:3002
echo 🗄️ Prisma Studio:    http://localhost:5555
echo 🔧 Backend API:      http://localhost:3001
echo 📚 API Docs:         http://localhost:3001/api/docs
echo.
echo ========================================
echo 🎉 Ready for development!
echo ========================================
pause
