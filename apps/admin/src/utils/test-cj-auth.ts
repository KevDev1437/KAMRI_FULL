// ============================================================
// FICHIER: apps/admin/src/utils/test-cj-auth.ts
// ============================================================
// Script de test pour vérifier l'authentification CJ depuis le frontend

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function testCJAuthentication() {
  console.log('🔐 TEST D\'AUTHENTIFICATION CJ DEPUIS LE FRONTEND');
  console.log('================================================\n');

  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ PROBLÈME: Aucun token trouvé dans localStorage');
    console.log('   Solutions:');
    console.log('   1. Aller sur http://localhost:3002/admin/login');
    console.log('   2. Se connecter avec admin@kamri.com / password');
    console.log('   3. Vérifier que le token est stocké dans localStorage\n');
    return false;
  }

  console.log('✅ Token trouvé:', token.substring(0, 20) + '...');

  // Test 1: Vérifier la validité du token avec un endpoint simple
  console.log('\n1️⃣ Test de validité du token...');
  try {
    const response = await axios.get(`${API_URL}/api/cj-dropshipping/config`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Token valide ! Configuration récupérée:', response.data);
    return true;
  } catch (error: any) {
    console.log('❌ Token invalide ou erreur:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Se déconnecter et se reconnecter à l\'admin');
      console.log('   2. Vérifier que le serveur backend fonctionne');
      console.log('   3. Vérifier que l\'utilisateur a les bonnes permissions\n');
    }
    return false;
  }
}

// Fonction pour tester la connexion CJ avec authentification
export async function testCJConnection() {
  console.log('\n2️⃣ Test de connexion CJ avec authentification...');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Pas de token, impossible de tester');
    return false;
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/cj-dropshipping/test-connection`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Connexion CJ testée avec succès:', response.data);
    return true;
  } catch (error: any) {
    console.log('❌ Erreur lors du test de connexion CJ:', error.response?.data || error.message);
    return false;
  }
}

// Fonction utilitaire pour déboguer l'authentification
export function debugAuth() {
  console.log('🔍 DÉBOGAGE DE L\'AUTHENTIFICATION');
  console.log('==================================\n');

  const token = localStorage.getItem('token');
  console.log('Token présent:', !!token);
  console.log('Token (début):', token ? token.substring(0, 20) + '...' : 'Aucun');
  
  // Vérifier d'autres éléments de localStorage
  const user = localStorage.getItem('user');
  console.log('User présent:', !!user);
  
  // Vérifier les cookies
  console.log('Cookies:', document.cookie);
  
  // Vérifier l'URL actuelle
  console.log('URL actuelle:', window.location.href);
  
  console.log('\n💡 ACTIONS RECOMMANDÉES:');
  console.log('   1. Vérifier que vous êtes sur http://localhost:3002/admin');
  console.log('   2. Vérifier que vous êtes connecté (pas de redirection vers /login)');
  console.log('   3. Ouvrir DevTools > Application > Local Storage');
  console.log('   4. Vérifier la présence du token et sa validité\n');
}
