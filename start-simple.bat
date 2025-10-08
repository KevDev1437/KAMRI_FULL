@echo off
echo 🚀 Démarrage simple de KAMRI
echo.

echo 🔧 1. Démarrage du serveur backend...
start "Backend" cmd /k "cd server && npm run start:dev"

echo.
echo ⏳ Attente de 5 secondes...
timeout /t 5 /nobreak > nul

echo.
echo 📱 2. Démarrage de l'app mobile...
start "Mobile" cmd /k "cd apps/mobile && npm run dev"

echo.
echo ⏳ Attente de 5 secondes...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 3. Démarrage de l'app web...
start "Web" cmd /k "cd apps/web && npm run dev"

echo.
echo ✅ Tous les services sont démarrés !
echo.
echo 📋 URLs :
echo - Web: http://localhost:3000
echo - Mobile: Expo Go (scanner le QR code)
echo - Backend: http://localhost:3001
echo - API Docs: http://localhost:3001/api/docs
echo.
pause
