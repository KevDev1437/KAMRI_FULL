@echo off
echo ========================================
echo   KAMRI ADMIN DASHBOARD - INSTALLATION
echo ========================================
echo.

echo Copie du package.json simplifie...
copy package-simple.json package.json

echo.
echo Installation des dependances...
npm install

echo.
echo ========================================
echo   DEMARRAGE DU DASHBOARD ADMIN
echo ========================================
echo.
echo Le dashboard sera accessible sur: http://localhost:3002
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

npm run dev

pause
