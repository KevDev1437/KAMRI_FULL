@echo off
echo Configuration de l'API CJ Dropshipping...

set CJ_API_KEY=d3c83f6d8fc14eb4aaa6ff8db1fb8c4e
set CJ_API_BASE=https://developers.cjdropshipping.com/api2.0/v1

echo.
echo Variables d'environnement configurées:
echo CJ_API_KEY=%CJ_API_KEY%
echo CJ_API_BASE=%CJ_API_BASE%
echo.

echo Démarrage du serveur avec les variables CJ...
npm run start:dev
