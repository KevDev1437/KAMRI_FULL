const axios = require('axios');

async function testCJPagination() {
  console.log('🔍 === TEST PAGINATION CJ DROPSHIPPING ===\n');

  try {
    // 1. Authentification
    console.log('🔐 Authentification...');
    const authResponse = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: 'kamridev2.0@gmail.com',
      apiKey: 'd86440263e26415f8dad82f0829f3a7d'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      timeout: 30000
    });

    const accessToken = authResponse.data.data?.accessToken;
    console.log('✅ Token obtenu:', accessToken ? 'OUI' : 'NON');

    if (!accessToken) {
      throw new Error('Token non reçu');
    }

    // 2. Test page 1
    console.log('\n📄 === TEST PAGE 1 ===');
    const page1Response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      params: {
        pageNum: 1,
        pageSize: 5,
        countryCode: 'US',
        sortBy: 'relevance'
      },
      timeout: 30000
    });

    console.log('📊 Page 1 - Total:', page1Response.data.data?.total);
    console.log('📊 Page 1 - Produits reçus:', page1Response.data.data?.list?.length);
    console.log('📊 Page 1 - Premier produit:', page1Response.data.data?.list?.[0]?.productNameEn);

    // 3. Test page 2
    console.log('\n📄 === TEST PAGE 2 ===');
    const page2Response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      params: {
        pageNum: 2,
        pageSize: 5,
        countryCode: 'US',
        sortBy: 'relevance'
      },
      timeout: 30000
    });

    console.log('📊 Page 2 - Total:', page2Response.data.data?.total);
    console.log('📊 Page 2 - Produits reçus:', page2Response.data.data?.list?.length);
    console.log('📊 Page 2 - Premier produit:', page2Response.data.data?.list?.[0]?.productNameEn);

    // 4. Comparaison
    console.log('\n🔍 === COMPARAISON ===');
    const page1First = page1Response.data.data?.list?.[0]?.productNameEn;
    const page2First = page2Response.data.data?.list?.[0]?.productNameEn;
    
    console.log('Page 1 premier produit:', page1First);
    console.log('Page 2 premier produit:', page2First);
    console.log('Produits identiques ?', page1First === page2First ? '❌ OUI (PROBLÈME!)' : '✅ NON (OK)');

    // 5. Test avec keyword
    console.log('\n🔍 === TEST AVEC KEYWORD ===');
    const keywordResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      params: {
        pageNum: 1,
        pageSize: 5,
        keyword: 'phone',
        countryCode: 'US',
        sortBy: 'relevance'
      },
      timeout: 30000
    });

    console.log('📊 Avec keyword "phone" - Total:', keywordResponse.data.data?.total);
    console.log('📊 Avec keyword "phone" - Produits reçus:', keywordResponse.data.data?.list?.length);
    console.log('📊 Avec keyword "phone" - Premier produit:', keywordResponse.data.data?.list?.[0]?.productNameEn);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

testCJPagination();
