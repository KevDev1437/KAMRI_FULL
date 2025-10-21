// ============================================================
// FICHIER: server/src/cj-dropshipping/test-auth.ts
// ============================================================
// Script de test pour vérifier l'authentification des endpoints CJ

import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testAuth() {
  console.log('🔐 TEST D\'AUTHENTIFICATION DES ENDPOINTS CJ');
  console.log('============================================\n');

  // Test 1: Sans token (doit échouer)
  console.log('1️⃣ Test sans token d\'authentification...');
  try {
    const response = await axios.get(`${API_URL}/api/cj-dropshipping/config`);
    console.log('❌ PROBLÈME: L\'endpoint accepte les requêtes sans token !');
    console.log('   Réponse:', response.status);
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ OK: L\'endpoint rejette correctement les requêtes sans token');
    } else {
      console.log('⚠️  Erreur inattendue:', error.message);
    }
  }

  // Test 2: Avec token invalide (doit échouer)
  console.log('\n2️⃣ Test avec token invalide...');
  try {
    const response = await axios.get(`${API_URL}/api/cj-dropshipping/config`, {
      headers: { Authorization: 'Bearer invalid_token' }
    });
    console.log('❌ PROBLÈME: L\'endpoint accepte les tokens invalides !');
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ OK: L\'endpoint rejette correctement les tokens invalides');
    } else {
      console.log('⚠️  Erreur inattendue:', error.message);
    }
  }

  // Test 3: Vérifier les guards sur le controller
  console.log('\n3️⃣ Vérification des guards sur le controller...');
  
  // Lire le fichier controller pour vérifier les guards
  const fs = require('fs');
  const path = require('path');
  
  try {
    const controllerPath = path.join(__dirname, 'cj-dropshipping.controller.ts');
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    if (controllerContent.includes('@UseGuards(JwtAuthGuard)')) {
      console.log('✅ OK: Le controller utilise JwtAuthGuard');
    } else {
      console.log('❌ PROBLÈME: Le controller n\'utilise pas JwtAuthGuard');
    }
    
    if (controllerContent.includes('@ApiBearerAuth()')) {
      console.log('✅ OK: Le controller utilise ApiBearerAuth');
    } else {
      console.log('❌ PROBLÈME: Le controller n\'utilise pas ApiBearerAuth');
    }
  } catch (error) {
    console.log('⚠️  Impossible de lire le controller:', error);
  }

  console.log('\n============================================');
  console.log('💡 SOLUTIONS POSSIBLES:');
  console.log('============================================\n');

  console.log('1️⃣ Vérifier que l\'utilisateur est connecté dans l\'admin:');
  console.log('   - Ouvrir les DevTools (F12)');
  console.log('   - Aller dans Application > Local Storage');
  console.log('   - Vérifier qu\'il y a un token valide\n');

  console.log('2️⃣ Si pas de token, se connecter à l\'admin:');
  console.log('   - Aller sur http://localhost:3002/admin/login');
  console.log('   - Se connecter avec admin@kamri.com / password\n');

  console.log('3️⃣ Vérifier que le backend fonctionne:');
  console.log('   - Aller sur http://localhost:3001/api/cj-dropshipping/config');
  console.log('   - Doit retourner 401 Unauthorized (normal)\n');

  console.log('4️⃣ Tester avec un token valide:');
  console.log('   - Se connecter à l\'admin');
  console.log('   - Copier le token depuis localStorage');
  console.log('   - Tester avec curl ou Postman\n');

  console.log('5️⃣ Vérifier les logs du serveur:');
  console.log('   - Regarder les logs du serveur NestJS');
  console.log('   - Vérifier les erreurs d\'authentification\n');
}

testAuth().catch(console.error);
