@echo off
echo 🚀 Démarrage de KAMRI - Monorepo E-commerce
echo.

echo 📦 Installation des dépendances...
call npm install

echo.
echo 🌐 Démarrage de l'application web...
start "KAMRI Web" cmd /k "cd apps/web && npm install && npm run dev"

echo.
echo 📱 Démarrage de l'application mobile...
start "KAMRI Mobile" cmd /k "cd apps/mobile && npm install && npm run dev"

echo.
echo 🔧 Démarrage du serveur backend...
start "KAMRI Server" cmd /k "cd server && npm install && npm run start:dev"

echo.
echo ✅ Tous les services sont en cours de démarrage...
echo.
echo 📋 URLs de développement :
echo - Web: http://localhost:3000
echo - Mobile Web: http://localhost:8081  
echo - Backend: http://localhost:3001
echo - API Docs: http://localhost:3001/api/docs
echo.
pause
