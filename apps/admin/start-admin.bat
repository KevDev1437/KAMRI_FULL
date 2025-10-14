@echo off
echo Installation des dependances pour le dashboard admin...
cd /d "%~dp0"
npm install
echo.
echo Demarrage du dashboard admin...
npm run dev
pause
