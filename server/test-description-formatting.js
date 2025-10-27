// Test de formatage de description HTML
function testDescriptionFormatting() {
  console.log('🧪 Test du formatage de description amélioré...\n');
  
  // Fonction de nettoyage HTML améliorée (même que dans le code)
  const cleanDescription = (html) => {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n') // Remplacer <br> par des retours à la ligne
      .replace(/<\/p>/gi, '\n\n') // Remplacer </p> par double retour à la ligne
      .replace(/<p[^>]*>/gi, '\n') // Remplacer <p> par retour à la ligne
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '\n**$1**\n') // Remplacer <b> par markdown bold avec retours à la ligne
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '\n**$1**\n') // Remplacer <strong> par markdown bold avec retours à la ligne
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n**$1**\n') // Remplacer les titres par bold
      .replace(/<[^>]*>/g, '') // Supprimer toutes les autres balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par des espaces
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/&quot;/g, '"') // Remplacer &quot; par "
      .replace(/\n\s+/g, '\n') // Nettoyer les espaces en début de ligne
      .replace(/\n{3,}/g, '\n\n') // Limiter les retours à la ligne multiples
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul (après nettoyage des lignes)
      .replace(/\n /g, '\n') // Supprimer les espaces en début de ligne
      .trim();
  };
  
  // Test avec une description HTML typique de CJ
  const rawHtml = `<p><b>Product information:</b><br/>Size: S,M,L,XL,2XL,3XL,4XL,5XL<br/>Version: Loose<br/>Style type: Japanese and Korean casual<br/>Fabric name: Polyester<br/>Main fabric composition: Polyester (polyester fiber)<br/>Applicable Gender: Female</p><p><br/></p><p><b>Size:</b><br/><img src="https://cf.cjdropshipping.com/17141760/24042703345003230.jpg"/></p><p><br/></p><p><b>Note:</b></p><p>1. Asian sizes are 1 to 2 sizes smaller than European and American people. Choose the larger size if your size between two sizes. Please allow 2-3cm differences due to manual measurement.</p><p><b>Packing list:</b><br/>Top*1</p>`;
  
  console.log('📄 HTML Original:');
  console.log(rawHtml);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✨ HTML Nettoyé:');
  const cleaned = cleanDescription(rawHtml);
  console.log(cleaned);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('📊 Statistiques:');
  console.log(`- Longueur originale: ${rawHtml.length} caractères`);
  console.log(`- Longueur nettoyée: ${cleaned.length} caractères`);
  console.log(`- Balises HTML supprimées: ${(rawHtml.match(/<[^>]*>/g) || []).length}`);
  console.log(`- Lignes dans le résultat: ${cleaned.split('\n').length}`);
}

testDescriptionFormatting();