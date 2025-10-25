const axios = require('axios');

// 🔑 Configuration CJ Dropshipping
const CJ_CONFIG = {
  email: 'projectskevin834@gmail.com',
  apiKey: '158334f3282c4e3f9b077193903daeca',
  baseUrl: 'https://developers.cjdropshipping.com/api2.0/v1'
};

// 🔐 Fonction d'authentification
async function authenticateCJ() {
  console.log('🔑 === AUTHENTIFICATION CJ ===');
  console.log(`📧 Email: ${CJ_CONFIG.email}`);
  console.log(`🔑 API Key: ${CJ_CONFIG.apiKey.substring(0, 8)}...`);
  
  try {
    const response = await fetch(`${CJ_CONFIG.baseUrl}/authentication/getAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: CJ_CONFIG.email,
        apiKey: CJ_CONFIG.apiKey
      })
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      console.log('✅ Authentification réussie');
      console.log(`🎫 Token: ${data.data.accessToken.substring(0, 20)}...`);
      return data.data.accessToken;
    } else {
      throw new Error(`Erreur auth: ${data.message}`);
    }
  } catch (error) {
    console.error('❌ Erreur authentification:', error.message);
    throw error;
  }
}

// 📦 Fonction pour récupérer les favoris
async function getFavorites(token, pageNumber = 1, pageSize = 10) {
  console.log(`\n📦 === RÉCUPÉRATION PAGE ${pageNumber} ===`);
  console.log(`📄 Page: ${pageNumber}, Taille: ${pageSize}`);
  
  try {
    const response = await axios.get(`${CJ_CONFIG.baseUrl}/product/myProduct/query`, {
      headers: {
        'CJ-Access-Token': token
      },
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize
      }
    });
    
    if (response.data.code === 200) {
      const data = response.data.data;
      console.log(`✅ Page ${pageNumber} récupérée`);
      console.log(`📊 Total: ${data.totalRecords}, Pages: ${data.totalPages}`);
      console.log(`📦 Produits: ${data.content.length}`);
      
      // 🔍 Analyser les produits
      if (data.content.length > 0) {
        console.log(`\n🔍 === ANALYSE DES PRODUITS PAGE ${pageNumber} ===`);
        data.content.forEach((product, index) => {
          console.log(`${index + 1}. PID: ${product.productId}`);
          console.log(`   SKU: ${product.sku}`);
          console.log(`   Nom: ${product.nameEn}`);
          console.log(`   Prix: ${product.sellPrice}`);
          console.log(`   Image: ${product.bigImage ? '✅' : '❌'}`);
          console.log('');
        });
      }
      
      return data;
    } else {
      throw new Error(`Erreur API: ${response.data.message}`);
    }
  } catch (error) {
    console.error(`❌ Erreur page ${pageNumber}:`, error.message);
    throw error;
  }
}

// 🔍 Fonction pour récupérer les détails d'un produit
async function getProductDetails(token, pid) {
  console.log(`\n🔍 === DÉTAILS PRODUIT ${pid} ===`);
  
  try {
    const url = `${CJ_CONFIG.baseUrl}/product/query?pid=${pid}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': token
      }
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      const product = result.data;
      console.log(`✅ Détails récupérés pour ${pid}`);
      
      // === INFORMATIONS PRINCIPALES (comme CJ) ===
      console.log(`\n📦 === INFORMATIONS PRINCIPALES ===`);
      console.log(`📝 Nom: ${product.productNameEn || product.productName || 'N/A'}`);
      console.log(`📦 SKU: ${product.productSku || 'N/A'}`);
      console.log(`💰 Prix: ${product.sellPrice || 'N/A'}`);
      console.log(`📊 Lists: ${product.listedNum || 'N/A'}`);
      console.log(`🏷️ Catégorie: ${product.categoryName || 'N/A'}`);
      
      // === INFORMATIONS TECHNIQUES ===
      console.log(`\n🔧 === INFORMATIONS TECHNIQUES ===`);
      console.log(`📏 Poids: ${product.productWeight || 'N/A'}g`);
      console.log(`📦 Poids emballage: ${product.packingWeight || 'N/A'}g`);
      
      // Dimensions avec vérification
      const length = product.lengthList?.[0] || product.variants?.[0]?.variantLength || 'N/A';
      const width = product.widthList?.[0] || product.variants?.[0]?.variantWidth || 'N/A';
      const height = product.heightList?.[0] || product.variants?.[0]?.variantHeight || 'N/A';
      console.log(`📐 Dimensions: ${length}x${width}x${height}mm`);
      
      console.log(`🏪 Statut: ${product.status || 'N/A'}`);
      console.log(`🏷️ Type: ${product.productType || 'N/A'}`);
      console.log(`🏭 Fournisseur: ${product.supplierName || 'N/A'}`);
      
      // === VARIANTES (comme CJ) ===
      console.log(`\n🎨 === VARIANTES DISPONIBLES ===`);
      console.log(`📊 Total variantes: ${product.variants?.length || 0}`);
      console.log(`🎨 Couleurs: ${extractColorsFromVariants(product.variants)}`);
      console.log(`📏 Tailles: ${extractSizesFromVariants(product.variants)}`);
      
      // === PRIX ET MARGES ===
      console.log(`\n💰 === PRIX ET MARGES ===`);
      console.log(`💰 Prix de base: ${product.sellPrice || 'N/A'}`);
      console.log(`🎯 Prix suggéré: ${product.suggestSellPrice || 'N/A'}`);
      
      // === INFORMATIONS SUPPLÉMENTAIRES ===
      console.log(`\n📋 === INFORMATIONS SUPPLÉMENTAIRES ===`);
      console.log(`📋 Description: ${cleanDescription(product.description)}`);
      console.log(`🖼️ Images: ${product.productImage ? '✅' : '❌'}`);
      console.log(`⭐ Avis: ${product.reviews?.length || 0}`);
      console.log(`📅 Date création: ${product.createrTime || 'N/A'}`);
      
      // Variantes détaillées (mais limitées à 10 pour éviter l'écriture en boucle)
      if (product.variants && product.variants.length > 0) {
        console.log(`\n🔍 === VARIANTES DÉTAILLÉES ===`);
        console.log(`📊 Total variantes: ${product.variants.length}`);
        
        // Afficher seulement les 10 premières variantes pour éviter l'écriture en boucle
        const variantsToShow = product.variants.slice(0, 10);
        
        variantsToShow.forEach((variant, index) => {
          console.log(`  ${index + 1}. ${variant.variantNameEn || variant.variantName}`);
          console.log(`     SKU: ${variant.variantSku}`);
          console.log(`     Prix: ${variant.variantSellPrice}`);
          console.log(`     Dimensions: ${variant.variantLength}x${variant.variantWidth}x${variant.variantHeight}mm`);
          console.log(`     Poids: ${variant.variantWeight}g`);
          console.log(`     Propriétés: ${variant.variantKey}`);
          console.log(`     Prix suggéré: ${variant.variantSugSellPrice}`);
          console.log('');
        });
        
        // Si il y a plus de 10 variantes, afficher un résumé
        if (product.variants.length > 10) {
          console.log(`... et ${product.variants.length - 10} autres variantes`);
          
          // Utiliser les nouvelles fonctions d'extraction
          console.log(`🎨 Couleurs disponibles: ${extractColorsFromVariants(product.variants)}`);
          console.log(`📏 Tailles disponibles: ${extractSizesFromVariants(product.variants)}`);
        }
      }
      
      return product;
    } else {
      // Gestion spécifique des erreurs
      if (result.code === 1600100) {
        console.log(`❌ Erreur paramètre ${pid}: ${result.message}`);
        console.log(`🔍 Code: ${result.code} - Param error`);
        console.log(`📋 RequestId: ${result.requestId}`);
      } else if (result.code === 1600101) {
        console.log(`❌ Interface non trouvée ${pid}: ${result.message}`);
        console.log(`🔍 Code: ${result.code} - Interface not found`);
        console.log(`📋 RequestId: ${result.requestId}`);
      } else {
        console.log(`❌ Erreur détails ${pid}: ${result.message}`);
        console.log(`🔍 Code: ${result.code}`);
        console.log(`📋 RequestId: ${result.requestId}`);
      }
      return null;
    }
  } catch (error) {
    console.error(`❌ Erreur détails ${pid}:`, error.message);
    return null;
  }
}

// 🧹 Fonction pour nettoyer le HTML de la description
function cleanDescription(htmlDescription) {
  if (!htmlDescription) return 'N/A';
  
  // Supprimer les balises HTML
  let cleaned = htmlDescription
    .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
    .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par des espaces
    .replace(/&amp;/g, '&') // Remplacer &amp; par &
    .replace(/&lt;/g, '<') // Remplacer &lt; par <
    .replace(/&gt;/g, '>') // Remplacer &gt; par >
    .replace(/&quot;/g, '"') // Remplacer &quot; par "
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .trim(); // Supprimer les espaces en début/fin
  
  // Limiter à 200 caractères pour l'affichage
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200) + '...';
  }
  
  return cleaned;
}

// 📏 Fonction pour extraire les tailles de la description
function extractSizesFromDescription(htmlDescription) {
  if (!htmlDescription) return 'N/A';
  
  // Chercher "Size Information" dans la description
  const sizeMatch = htmlDescription.match(/Size Information:.*?Size:\s*([^<]+)/i);
  if (sizeMatch) {
    const sizes = sizeMatch[1]
      .split(',')
      .map(size => size.trim())
      .filter(size => size.length > 0);
    return sizes.join(', ');
  }
  
  return 'N/A';
}

// 🎨 Fonction pour extraire les couleurs des variantes
function extractColorsFromVariants(variants) {
  if (!variants || variants.length === 0) return 'N/A';
  
  const colors = [...new Set(variants.map(v => {
    const name = v.variantNameEn || v.variantName || '';
    // Extraire la couleur (première partie avant le tiret)
    const color = name.split('-')[0]?.trim();
    return color;
  }).filter(Boolean))];
  
  return colors.join(', ');
}

// 📏 Fonction pour extraire les tailles des variantes
function extractSizesFromVariants(variants) {
  if (!variants || variants.length === 0) return 'N/A';
  
  const sizes = [...new Set(variants.map(v => {
    const name = v.variantNameEn || v.variantName || '';
    // Extraire la taille (deuxième partie après le tiret)
    const size = name.split('-')[1]?.trim();
    return size;
  }).filter(Boolean))];
  
  return sizes.join(', ');
}

// 🚀 Fonction principale
async function main() {
  console.log('🚀 === SCRIPT DE TEST CJ FAVORITES ===');
  console.log('📅 Date:', new Date().toISOString());
  
  try {
    // 1. Authentification
    const token = await authenticateCJ();
    
    // 2. Récupérer page 1
    const page1 = await getFavorites(token, 1, 10);
    
    // 3. Vérifier s'il faut récupérer la page 2
    let page2 = null;
    if (page1.content.length === 10) {
      // Page 1 complète (10 favoris) → Vérifier s'il y a une page 2
      if (page1.totalPages > 1) {
        page2 = await getFavorites(token, 2, 10);
      } else {
        console.log('\n📄 Page 2 non nécessaire (page 1 complète mais 1 page totale)');
      }
    } else {
      console.log(`\n📄 Page 2 non nécessaire (page 1 incomplète: ${page1.content.length}/10 favoris)`);
    }
    
    // 4. Combiner les résultats
    const allProducts = page2 ? [...page1.content, ...page2.content] : page1.content;
    
    // 5. Dédoublonner et trier par PID
    console.log('\n🔍 === DÉDOUBLONNAGE ET TRI ===');
    console.log(`📦 Total brut: ${allProducts.length} produits`);
    
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.productId === product.productId)
    );
    
    console.log(`📦 Après dédoublonnage: ${uniqueProducts.length} produits`);
    
    // 6. Limiter au nombre total de l'API
    const finalProducts = uniqueProducts.slice(0, page1.totalRecords);
    console.log(`📦 Final (limité à ${page1.totalRecords}): ${finalProducts.length} produits`);
    
    // 7. Afficher tous les produits finaux
    console.log('\n📋 === TOUS LES PRODUITS FINAUX ===');
    finalProducts.forEach((product, index) => {
      console.log(`${index + 1}. PID: ${product.productId}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Nom: ${product.nameEn}`);
      console.log(`   Prix: ${product.sellPrice}`);
      console.log(`   Image: ${product.bigImage ? '✅' : '❌'}`);
      console.log('');
    });
    
    // 8. Récupérer les détails complets de chaque produit
    console.log('\n🔍 === RÉCUPÉRATION DES DÉTAILS COMPLETS ===');
    const detailedProducts = [];
    
    for (let i = 0; i < finalProducts.length; i++) {
      const product = finalProducts[i];
      console.log(`\n📦 Récupération détails ${i + 1}/${finalProducts.length}: ${product.nameEn}`);
      
      const details = await getProductDetails(token, product.productId);
      if (details) {
        detailedProducts.push({
          ...product,
          details: details
        });
      }
      
      // Attendre entre les requêtes pour éviter le rate limiting
      if (i < finalProducts.length - 1) {
        console.log('⏳ Attente 2 secondes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n✅ Détails récupérés pour ${detailedProducts.length}/${finalProducts.length} produits`);
    
    // 8. Résumé final
    console.log('\n📊 === RÉSUMÉ FINAL ===');
    console.log(`📦 Page 1: ${page1.content.length} produits`);
    if (page2) {
      console.log(`📦 Page 2: ${page2.content.length} produits`);
    } else {
      console.log(`📦 Page 2: Non récupérée (pas nécessaire)`);
    }
    console.log(`📦 Total brut: ${allProducts.length} produits`);
    console.log(`📦 Total après dédoublonnage: ${uniqueProducts.length} produits`);
    console.log(`📦 Total final: ${finalProducts.length} produits`);
    console.log(`📊 Total API: ${page1.totalRecords} favoris`);
    console.log(`📊 Pages API: ${page1.totalPages} pages`);
    
  } catch (error) {
    console.error('💥 Erreur script:', error.message);
    process.exit(1);
  }
}

// 🎯 Exécution
main();