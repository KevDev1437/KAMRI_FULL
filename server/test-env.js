// server/test-env.js
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC ULTRA-DÉTAILLÉ .env');
console.log('===================================\n');

// 1. Vérifier l'emplacement actuel
console.log('1️⃣ EMPLACEMENT ACTUEL:');
console.log('   Dossier courant:', __dirname);
console.log('');

// 2. Vérifier si .env existe
const envPath = path.join(__dirname, '.env');
console.log('2️⃣ FICHIER .env:');
console.log('   Chemin recherché:', envPath);
console.log('   Existe:', fs.existsSync(envPath) ? '✅ OUI' : '❌ NON');
console.log('');

// 3. Lister tous les fichiers du dossier
console.log('3️⃣ FICHIERS DANS LE DOSSIER:');
const files = fs.readdirSync(__dirname);
files.forEach(file => {
  const isEnv = file === '.env';
  const isEnvWithoutDot = file === 'env';
  console.log(`   ${isEnv ? '🎯' : isEnvWithoutDot ? '⚠️' : '  '} ${file}`);
});
console.log('');

// 4. Lire le contenu de .env si il existe
if (fs.existsSync(envPath)) {
  console.log('4️⃣ CONTENU DE .env:');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('   Contenu brut:');
  console.log('   """');
  console.log(content);
  console.log('   """');
  console.log('');
  
  // Vérifier les variables spécifiques
  console.log('5️⃣ VARIABLES DÉTECTÉES:');
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.includes('CJ_') || line.includes('DATABASE') || line.includes('JWT')) {
      console.log('   📍', line.trim());
    }
  });
} else {
  console.log('❌ FICHIER .env INTROUVABLE!');
  console.log('');
  console.log('💡 SOLUTIONS:');
  console.log('   1. Vérifier que le fichier s\'appelle bien .env (avec le point)');
  console.log('   2. Vérifier qu\'il est dans: E:\\Projet Pro\\Kamri_dashboard\\KAMRI_FULL\\server\\.env');
  console.log('   3. Sous Windows, activer "Afficher les fichiers cachés"');
}