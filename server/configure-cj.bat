@echo off
echo Configuration de l'API CJ Dropshipping...

set CJ_API_KEY=5f6cc92235ba45b1845f6d89135482ac
set CJ_API_BASE=https://developers.cjdropshipping.com/api2.0/v1

echo.
echo Variables d'environnement configurées:
echo CJ_API_KEY=%CJ_API_KEY%
echo CJ_API_BASE=%CJ_API_BASE%
echo.

echo Redémarrage du serveur avec les nouvelles variables...
npm run start:dev
