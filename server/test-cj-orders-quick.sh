#!/bin/bash

# Script rapide pour tester l'intégration CJ Orders
# Usage: ./test-cj-orders-quick.sh [ORDER_ID]

BASE_URL="http://localhost:3001"
TOKEN="${JWT_TOKEN:-YOUR_JWT_TOKEN_HERE}"

echo "═══════════════════════════════════════════════════════"
echo "   🧪 TESTS RAPIDES CJ ORDERS"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ -z "$1" ]; then
  echo "Usage: $0 [ORDER_ID]"
  echo ""
  echo "Exemples:"
  echo "  $0 clx1234567890  # Tester avec un ORDER_ID"
  echo ""
  echo "Ou sans paramètre pour voir les commandes récentes:"
  echo "  $0"
  exit 1
fi

ORDER_ID=$1

echo "📦 Commande: $ORDER_ID"
echo ""

# Test 1: Vérifier si la commande a des produits CJ
echo "1️⃣ Vérification produits CJ..."
curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID/has-cj-products" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 2: Vérifier le statut CJ
echo "2️⃣ Statut CJ..."
curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID/cj-status" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 3: Créer commande CJ (si pas déjà créée)
echo "3️⃣ Création commande CJ..."
curl -s -X POST "$BASE_URL/api/orders/$ORDER_ID/create-cj" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ Tests terminés !"

