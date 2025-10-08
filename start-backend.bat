@echo off
echo 🔧 Démarrage du serveur backend KAMRI...
cd server
echo 📦 Installation des dépendances...
call npm install
echo.
echo 🗄️ Configuration de la base de données...
call npm run db:generate
call npm run db:push
call npm run db:seed
echo.
echo 🚀 Démarrage du serveur...
call npm run start:dev
pause
