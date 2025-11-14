@echo off
echo 🧪 Test rapide de l'endpoint stock
echo.
echo 📡 Test avec le PID du produit que vous avez testé: 1578267399776907264
echo.
timeout /t 3 >nul
curl -X GET "http://localhost:3001/api/cj-dropshipping/products/1578267399776907264/stock"
echo.
echo.
echo ✅ Si vous voyez "success":true, l'endpoint fonctionne !
echo ❌ Si vous voyez "404 Not Found", le backend n'a pas encore redémarré
echo.
pause

