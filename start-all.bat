@echo off
echo 🚀 Démarrage de KAMRI - Tous les services

echo 🔧 1. Démarrage du serveur backend...
start cmd /k "cd server && npm run start:dev"

timeout /t 3 /nobreak > NUL
echo ⏳ Attente de 3 secondes..

echo 📱 2. Démarrage de l'app mobile...
start cmd /k "cd apps/mobile && npm run dev"

timeout /t 3 /nobreak > NUL
echo ⏳ Attente de 3 secondes...

echo 🌐 3. Démarrage de l'app web...
start cmd /k "cd apps/web && npm run dev"

timeout /t 3 /nobreak > NUL
echo ⏳ Attente de 3 secondes...

echo 🎛️ 4. Démarrage de l'admin...
start cmd /k "cd apps/admin && npm run dev"

echo ✅ Tous les services sont démarrés !

echo 📋 URLs :
echo - Web: http://localhost:3000
echo - Admin: http://localhost:3002
echo - Mobile: Expo Go (scanner le QR code)
echo - Backend: http://localhost:3001
echo - API Docs: http://localhost:3001/api/docs

pause
