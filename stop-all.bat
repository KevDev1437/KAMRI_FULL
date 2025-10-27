@echo off
echo ========================================
echo    🛑 ARRÊT DE TOUS LES SERVEURS KAMRI 🛑
echo ========================================
echo.

echo 🔍 Recherche des processus Node.js en cours...
echo.

echo 📦 Arrêt du Backend Server (port 3001)...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Backend Server*" 2>nul
netstat -ano | findstr :3001 | for /f "tokens=5" %%a in ('more') do taskkill /f /pid %%a 2>nul

echo.
echo 🌐 Arrêt du Web Frontend (port 3000)...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Web Frontend*" 2>nul
netstat -ano | findstr :3000 | for /f "tokens=5" %%a in ('more') do taskkill /f /pid %%a 2>nul

echo.
echo 📱 Arrêt du Mobile App (port 8081)...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Mobile App*" 2>nul
netstat -ano | findstr :8081 | for /f "tokens=5" %%a in ('more') do taskkill /f /pid %%a 2>nul

echo.
echo 🎛️ Arrêt de l'Admin Dashboard (port 3002)...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Admin Dashboard*" 2>nul
netstat -ano | findstr :3002 | for /f "tokens=5" %%a in ('more') do taskkill /f /pid %%a 2>nul

echo.
echo 🗄️ Arrêt de Prisma Studio (port 5555)...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Prisma Studio*" 2>nul
netstat -ano | findstr :5555 | for /f "tokens=5" %%a in ('more') do taskkill /f /pid %%a 2>nul

echo.
echo 🧹 Nettoyage des processus Node.js restants...
taskkill /f /im node.exe 2>nul

echo.
echo 🔍 Vérification des ports utilisés...
echo.
echo Ports encore actifs:
netstat -ano | findstr ":3000\|:3001\|:3002\|:5555\|:8081"

echo.
echo ========================================
echo ✅ Tous les serveurs ont été arrêtés !
echo ========================================
echo.
echo 🎯 Si des processus persistent, vous pouvez:
echo    - Fermer manuellement les fenêtres de commande
echo    - Redémarrer votre ordinateur
echo    - Utiliser le Gestionnaire des tâches
echo.
pause



