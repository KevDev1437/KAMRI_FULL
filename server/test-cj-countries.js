const axios = require('axios');

// Test des pays CJ
const BASE_URL = 'http://localhost:3001';

async function testCountries() {
  console.log('🌍 Test des Pays CJ Dropshipping');
  console.log('=================================');
  
  // Test 1: Tous les pays
  console.log('\n📦 Test 1: Tous les pays');
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries`);
    console.log(`✅ ${response.data.total} pays trouvés`);
    console.log(`📊 Premiers pays:`, response.data.countries.slice(0, 5).map(c => `${c.twoLetterCode}: ${c.englishName}`));
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 2: Recherche par code
  console.log('\n🔍 Test 2: Recherche par code');
  const testCodes = ['US', 'DE', 'FR', 'GB', 'CA', 'AU', 'JP', 'KR', 'CN', 'IN'];
  
  for (const code of testCodes) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries/code/${code}`);
      if (response.data.success) {
        console.log(`✅ ${code}: ${response.data.country.englishName} (${response.data.country.region})`);
      } else {
        console.log(`❌ ${code}: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${code}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 3: Pays par région
  console.log('\n🗺️ Test 3: Pays par région');
  const regions = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];
  
  for (const region of regions) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries/region/${region}`);
      console.log(`✅ ${region}: ${response.data.total} pays`);
    } catch (error) {
      console.log(`❌ ${region}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 4: Pays par continent
  console.log('\n🌎 Test 4: Pays par continent');
  const continents = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];
  
  for (const continent of continents) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries/continent/${continent}`);
      console.log(`✅ ${continent}: ${response.data.total} pays`);
    } catch (error) {
      console.log(`❌ ${continent}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 5: Recherche de pays
  console.log('\n🔍 Test 5: Recherche de pays');
  const searchTerms = ['United', 'China', 'Germany', 'France', 'Japan', 'Korea'];
  
  for (const term of searchTerms) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries/search?q=${term}`);
      console.log(`✅ "${term}": ${response.data.total} résultats`);
      if (response.data.countries.length > 0) {
        console.log(`   📍 Premiers résultats:`, response.data.countries.slice(0, 3).map(c => `${c.twoLetterCode}: ${c.englishName}`));
      }
    } catch (error) {
      console.log(`❌ "${term}": ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 6: Pays supportés par CJ
  console.log('\n✅ Test 6: Pays supportés par CJ');
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries/supported`);
    console.log(`✅ ${response.data.total} pays supportés par CJ`);
    console.log(`📊 Premiers pays supportés:`, response.data.countries.slice(0, 10).map(c => `${c.twoLetterCode}: ${c.englishName}`));
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 7: Statistiques par continent
  console.log('\n📊 Test 7: Statistiques par continent');
  try {
    const allCountriesResponse = await axios.get(`${BASE_URL}/cj-dropshipping/countries`);
    const allCountries = allCountriesResponse.data.countries;
    
    const continentStats = {};
    allCountries.forEach(country => {
      const continent = country.continent || 'Unknown';
      continentStats[continent] = (continentStats[continent] || 0) + 1;
    });
    
    console.log('📈 Répartition par continent:');
    Object.entries(continentStats).forEach(([continent, count]) => {
      console.log(`   ${continent}: ${count} pays`);
    });
  } catch (error) {
    console.log(`❌ Erreur statistiques: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 8: Recherche de codes spécifiques
  console.log('\n🔍 Test 8: Codes spécifiques');
  const specificCodes = ['US', 'DE', 'FR', 'GB', 'CA', 'AU', 'JP', 'KR', 'CN', 'IN', 'BR', 'MX', 'RU', 'ZA', 'NG'];
  
  for (const code of specificCodes) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries/code/${code}`);
      if (response.data.success) {
        const country = response.data.country;
        console.log(`✅ ${code}: ${country.englishName} (${country.region}, ${country.continent})`);
      }
    } catch (error) {
      console.log(`❌ ${code}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n🎯 Tests terminés !');
  console.log('Vérifiez les logs du serveur pour voir le traitement des pays.');
}

// Test de synchronisation
async function testSync() {
  console.log('\n🔄 Test de synchronisation');
  console.log('==========================');
  
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/countries/sync`);
    console.log(`✅ ${response.data.message}`);
  } catch (error) {
    console.log(`❌ Erreur synchronisation: ${error.response?.data?.message || error.message}`);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  await testCountries();
  await testSync();
}

runAllTests().catch(console.error);
