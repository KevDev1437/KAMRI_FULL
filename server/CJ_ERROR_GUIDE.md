# 🔧 Guide de Dépannage CJ Dropshipping

## 📊 Codes d'Erreur Principaux

### 🔴 **Erreurs d'Authentification**

| Code | Description | Solution |
|------|-------------|----------|
| **1600001** | Invalid API key or access token | ✅ **Auto-géré** - Refresh automatique |
| **1600003** | Invalid Refresh token | ✅ **Auto-géré** - Re-login automatique |
| **1600004** | Authorization failed | Vérifier email/API key |
| **1600005** | Email or password wrong | Vérifier credentials |

### 🚫 **Erreurs de Rate Limit**

| Code | Description | Solution |
|------|-------------|----------|
| **1600200** | Too much request | ✅ **Auto-géré** - Pauses intelligentes |
| **1600201** | Quota has been used up | ✅ **Auto-géré** - Délais adaptatifs |

### ⚠️ **Erreurs de Paramètres**

| Code | Description | Solution |
|------|-------------|----------|
| **1600300** | Param error | Vérifier les paramètres JSON |
| **1600301** | Read timed out | Retry après délai |

### 🛍️ **Erreurs de Produits**

| Code | Description | Solution |
|------|-------------|----------|
| **1602000** | Variant not found | Vérifier l'ID de variante |
| **1602001** | Product not found | Vérifier l'ID de produit |
| **1602002** | Product removed from shelves | Produit indisponible |

### 📦 **Erreurs de Commandes**

| Code | Description | Solution |
|------|-------------|----------|
| **1603000** | Order create fail | Vérifier les paramètres |
| **1603001** | Order confirm fail | Contacter CJ Agent |
| **1603100** | Order not found | Vérifier l'ID de commande |

## 🚀 **Optimisations Implémentées**

### **1. Gestion Intelligente des Rate Limits**
```typescript
// Délais adaptatifs selon le niveau utilisateur
Free: 1200ms (1 req/s)
Plus: 600ms (2 req/s)  
Prime: 300ms (4 req/s)
Advanced: 200ms (6 req/s)
```

### **2. Retry Automatique**
```typescript
// Retry après rate limit
Free: 15s
Plus: 10s
Prime: 8s
Advanced: 5s
```

### **3. Refresh Automatique des Tokens**
```typescript
// Refresh automatique en cas d'erreur 401/1600001/1600003
await this.refreshAccessToken();
```

## 🔍 **Dépannage par Cas d'Usage**

### **Problème: "Too Many Requests"**
```bash
# Solution: Vérifier les logs
tail -f server.log | grep "Rate limit"

# Vérifier le niveau utilisateur
curl -X GET http://localhost:3001/cj-dropshipping/config
```

### **Problème: "Invalid Token"**
```bash
# Solution: Forcer le refresh
curl -X POST http://localhost:3001/cj-dropshipping/auth/refresh

# Vérifier les credentials
echo $CJ_EMAIL
echo $CJ_API_KEY
```

### **Problème: "Param Error"**
```bash
# Solution: Vérifier la structure JSON
curl -X POST http://localhost:3001/cj-dropshipping/products/search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"phone","pageSize":10}'
```

## 📈 **Monitoring et Logs**

### **Logs Importants à Surveiller**
```bash
# Rate limits
grep "Rate limit" server.log

# Authentification
grep "Token" server.log

# Erreurs CJ
grep "CJAPIError" server.log
```

### **Métriques à Surveiller**
- Nombre de requêtes par minute
- Taux d'erreur 1600200
- Temps de réponse moyen
- Succès des refresh tokens

## 🛠️ **Outils de Debug**

### **Test des Rate Limits**
```bash
node test-cj-rate-limits.js
```

### **Test de Gestion d'Erreurs**
```bash
node test-cj-error-handling.js
```

### **Test des Webhooks**
```bash
node test-cj-webhook.js
```

## 🎯 **Bonnes Pratiques**

### **1. Respecter les Rate Limits**
- Utiliser les délais adaptatifs
- Éviter les requêtes en boucle
- Implémenter un système de queue

### **2. Gestion des Erreurs**
- Toujours vérifier les codes d'erreur
- Implémenter des retry intelligents
- Logger toutes les erreurs

### **3. Monitoring**
- Surveiller les logs en temps réel
- Alerter en cas d'erreurs répétées
- Tracer les performances

## 📞 **Support**

### **En cas de problème persistant:**
1. Vérifier les logs du serveur
2. Tester avec les scripts de debug
3. Contacter le support CJ si nécessaire
4. Vérifier la documentation officielle

### **Liens Utiles:**
- [Documentation CJ](https://developers.cjdropshipping.com)
- [Codes d'Erreur](https://developers.cjdropshipping.com/api2.0/v1/error-codes)
- [Rate Limits](https://developers.cjdropshipping.com/api2.0/v1/rate-limits)
