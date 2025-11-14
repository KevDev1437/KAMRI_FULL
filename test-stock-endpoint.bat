@echo off
echo 🧪 Test de l'endpoint de stock
echo.
echo 📝 Remplacez PID_DU_PRODUIT par le PID réel du produit
echo.
set /p PID="Entrez le PID du produit (ex: 2410201006291602200): "
echo.
echo 🔄 Appel de l'API...
curl -X GET "http://localhost:3001/api/cj-dropshipping/products/%PID%/stock"
echo.
echo.
echo ✅ Test terminé
pause

