const axios = require('axios');

// Configuration
const CJ_API_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
const CJ_ACCESS_TOKEN = 'your-cj-access-token-here'; // À remplacer par votre token

/**
 * Script de diagnostic pour la recherche CJ Dropshipping
 * Ce script teste différents appels API pour identifier les problèmes
 */

async function testCJSearch() {
    console.log('🔍 === DIAGNOSTIC RECHERCHE CJ DROPSHIPPING ===');
    
    if (!CJ_ACCESS_TOKEN || CJ_ACCESS_TOKEN === 'your-cj-access-token-here') {
        console.error('❌ Token CJ non configuré dans le script !');
        console.log('📝 Modifiez la variable CJ_ACCESS_TOKEN dans ce fichier');
        return;
    }

    const headers = {
        'CJ-Access-Token': CJ_ACCESS_TOKEN,
        'Content-Type': 'application/json'
    };

    // Test 1: Recherche simple sans paramètres
    console.log('\n🧪 TEST 1: Recherche basique sans paramètres');
    try {
        const response1 = await axios.get(`${CJ_API_BASE}/product/list`, {
            headers,
            params: {
                pageNum: 1,
                pageSize: 5 // Seulement 5 produits pour le test
            }
        });
        
        console.log('✅ Succès !');
        console.log(`📊 Total produits: ${response1.data.data?.total || 0}`);
        console.log(`📦 Produits reçus: ${response1.data.data?.list?.length || 0}`);
        
        if (response1.data.data?.list?.length > 0) {
            const firstProduct = response1.data.data.list[0];
            console.log(`📄 Premier produit: ${firstProduct.productNameEn || firstProduct.productName}`);
        }
    } catch (error) {
        console.error('❌ Échec:', error.response?.data || error.message);
    }

    // Test 2: Recherche avec mot-clé
    console.log('\n🧪 TEST 2: Recherche avec mot-clé "phone"');
    try {
        const response2 = await axios.get(`${CJ_API_BASE}/product/list`, {
            headers,
            params: {
                pageNum: 1,
                pageSize: 5,
                productNameEn: 'phone',
                searchType: 0
            }
        });
        
        console.log('✅ Succès !');
        console.log(`📊 Total produits: ${response2.data.data?.total || 0}`);
        console.log(`📦 Produits reçus: ${response2.data.data?.list?.length || 0}`);
    } catch (error) {
        console.error('❌ Échec:', error.response?.data || error.message);
    }

    // Test 3: Recherche avec filtres de prix
    console.log('\n🧪 TEST 3: Recherche avec prix 1-50$');
    try {
        const response3 = await axios.get(`${CJ_API_BASE}/product/list`, {
            headers,
            params: {
                pageNum: 1,
                pageSize: 5,
                minPrice: 1,
                maxPrice: 50,
                searchType: 0
            }
        });
        
        console.log('✅ Succès !');
        console.log(`📊 Total produits: ${response3.data.data?.total || 0}`);
        console.log(`📦 Produits reçus: ${response3.data.data?.list?.length || 0}`);
    } catch (error) {
        console.error('❌ Échec:', error.response?.data || error.message);
    }

    // Test 4: Recherche avec type de produit
    console.log('\n🧪 TEST 4: Recherche produits ordinaires uniquement');
    try {
        const response4 = await axios.get(`${CJ_API_BASE}/product/list`, {
            headers,
            params: {
                pageNum: 1,
                pageSize: 5,
                productType: 'ORDINARY_PRODUCT',
                searchType: 0
            }
        });
        
        console.log('✅ Succès !');
        console.log(`📊 Total produits: ${response4.data.data?.total || 0}`);
        console.log(`📦 Produits reçus: ${response4.data.data?.list?.length || 0}`);
    } catch (error) {
        console.error('❌ Échec:', error.response?.data || error.message);
    }

    // Test 5: Test des limites API
    console.log('\n🧪 TEST 5: Test avec pageSize=200 (limite max)');
    try {
        const response5 = await axios.get(`${CJ_API_BASE}/product/list`, {
            headers,
            params: {
                pageNum: 1,
                pageSize: 200, // Maximum selon la doc
                searchType: 0
            }
        });
        
        console.log('✅ Succès !');
        console.log(`📊 Total produits: ${response5.data.data?.total || 0}`);
        console.log(`📦 Produits reçus: ${response5.data.data?.list?.length || 0}`);
    } catch (error) {
        console.error('❌ Échec:', error.response?.data || error.message);
    }

    console.log('\n🏁 === FIN DU DIAGNOSTIC ===');
    console.log('💡 Si tous les tests échouent, vérifiez votre token CJ');
    console.log('💡 Si certains tests réussissent, le problème vient des paramètres spécifiques');
}

// Exécuter le diagnostic
testCJSearch().catch(console.error);