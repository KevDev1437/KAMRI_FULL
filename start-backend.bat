@echo off
echo ========================================
echo    🔧 KAMRI BACKEND LAUNCHER 🔧
echo ========================================
echo.

echo 📦 Setting up database...
cd server
set DATABASE_URL=file:./dev.db

echo 🗄️ Pushing database schema...
npx prisma db push

echo 🌱 Seeding database...
npm run db:seed

echo.
echo 🚀 Starting Backend Server...
npm run start:dev

pause
