# 🔍 Debug Erreur "100202:Invalid products"

## ✅ Ce qui fonctionne

1. **Variants valides en base** : Les `ProductVariant` ont des `cjVariantId` valides
2. **VID valides dans CJ** : Les `vid` existent et sont valides dans l'API CJ (confirmé par `validate-cj-vids.ts`)
3. **Transformation fonctionnelle** : La transformation de la commande KAMRI en format CJ fonctionne

## ❌ Problème actuel

L'API CJ retourne l'erreur `100202:Invalid products` lors de la création de commande, malgré que les `vid` soient valides.

## 🔧 Solutions à tester

### 1. Vérifier le payload exact envoyé à CJ

**Endpoint de test créé** : `GET /api/orders/:id/test-cj-transform`

**Utilisation** :
```bash
# Via curl ou Postman
GET http://localhost:3001/api/orders/cmhtzlsqj0001jecs6kbesid2/test-cj-transform
Authorization: Bearer <votre-token>
```

Cet endpoint affichera :
- Le payload complet qui sera envoyé à CJ
- Les types de données (`vid` en string, `quantity` en number)
- Tous les champs de la commande

### 2. Vérifier les logs backend

Les logs détaillés ont été ajoutés dans :
- `server/src/cj-dropshipping/services/cj-order.service.ts` (ligne 63-73)
- `server/src/cj-dropshipping/cj-api-client.ts` (ligne 1203-1213)

**Pour voir les logs** :
1. Redémarrer le serveur NestJS
2. Créer une nouvelle commande
3. Observer les logs dans le terminal du serveur (pas dans la console du navigateur)

Les logs afficheront :
```
═══════════════════════════════════════════════════════
🚀 PAYLOAD FINAL ENVOYÉ À CJ createOrderV3:
═══════════════════════════════════════════════════════
{ ... payload complet ... }
```

### 3. Causes possibles de l'erreur "Invalid products"

Selon la documentation CJ, cette erreur peut être causée par :

#### a) Problème de format des `vid`
- ✅ **Vérifié** : Les `vid` sont valides dans CJ
- ✅ **Corrigé** : Conversion explicite en string dans le code

#### b) Problème de disponibilité des produits
- Les produits peuvent ne pas être disponibles pour le pays de livraison
- Les produits peuvent être en rupture de stock
- Les produits peuvent nécessiter une logistique spécifique

#### c) Problème avec `shippingProvince`
- Le champ `shippingProvince` est **requis** par CJ
- Si vide ou invalide, CJ peut rejeter la commande

#### d) Problème avec `logisticName`
- La logistique sélectionnée peut ne pas être disponible pour le pays
- Le nom de la logistique doit correspondre exactement à ceux acceptés par CJ

#### e) Problème avec `storeLineItemId`
- Si présent, doit être unique et valide
- Peut causer des problèmes si mal formaté

### 4. Scripts de diagnostic disponibles

#### Diagnostic de la commande
```bash
npx ts-node server/diagnose-cj-order.ts <orderId>
```
Affiche : produits, variants, validité des données

#### Validation des VID dans CJ
```bash
npx ts-node server/validate-cj-vids.ts <orderId>
```
Vérifie que les `vid` existent vraiment dans l'API CJ

### 5. Vérifications à faire

1. **Vérifier `shippingProvince`** :
   - Doit être présent et non vide
   - Doit correspondre à un état/province valide pour le pays

2. **Vérifier `logisticName`** :
   - Doit être une logistique valide pour le pays de livraison
   - Exemples : "USPS", "Canada Post", "Royal Mail", "Colissimo", "DHL", etc.

3. **Vérifier la disponibilité des produits** :
   - Les produits doivent être disponibles pour le pays de livraison
   - Les produits ne doivent pas être en rupture de stock

4. **Vérifier le format de la requête** :
   - `vid` doit être une string (même si c'est un nombre)
   - `quantity` doit être un number (pas une string)
   - `storeLineItemId` doit être une string ou undefined (pas null)

## 📝 Prochaines étapes

1. **Appeler l'endpoint de test** pour voir le payload exact
2. **Vérifier les logs backend** après redémarrage du serveur
3. **Comparer le payload** avec la documentation CJ
4. **Tester avec un produit différent** pour isoler le problème
5. **Vérifier la disponibilité** des produits pour le pays de livraison

## 🔗 Documentation CJ

- API Documentation : https://developers.cjdropshipping.com/en/api/api2/api/shopping.html#_1-2-create-order-v3-post
- Error Codes : https://developers.cjdropshipping.com/en/api/api2/standard/ps-code.html

## 💡 Solution temporaire

Si le problème persiste, vous pouvez :
1. Contacter le support CJ avec le `requestId` de l'erreur
2. Tester avec un produit différent
3. Vérifier que tous les produits de la commande sont disponibles pour le pays de livraison

