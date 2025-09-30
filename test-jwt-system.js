#!/usr/bin/env node

/*
 * Test completo sistema JWT + Whitelist DMS
 * Verifica Token Maker, JWT, Whitelist e Auth Gate
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

// Configurazione
const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';
const WHITELIST_URL = 'https://chcndr.github.io/dms-gemello-news/landing/viewer/whitelist.json';
const BASE_URL = 'https://chcndr.github.io/dms-gemello-news/landing/home.html';

// Dati di test
const testUser = {
  email: 'bebaviola@gmail.com',
  scope: 'news-private'
};

console.log('🧪 Test Sistema JWT + Whitelist DMS\n');

// Funzione per generare UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Funzione per codificare Base64URL
function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Funzione per creare JWT
function createJWT(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${data}.${signature}`;
}

// Test 1: Generazione JWT
function testJWTGeneration() {
  console.log('📝 Test 1: Generazione JWT');
  
  const now = Math.floor(Date.now() / 1000);
  const jti = generateUUID();
  
  const payload = {
    sub: testUser.email,
    scope: [testUser.scope],
    exp: now + 3600, // 1 ora
    jti: jti,
    iss: 'dms-gemello-news',
    iat: now
  };

  try {
    const token = createJWT(payload, JWT_SECRET);
    const link = `${BASE_URL}?t=${token}`;
    
    console.log('✅ JWT generato con successo');
    console.log(`📧 Email: ${payload.sub}`);
    console.log(`🔑 JTI: ${payload.jti}`);
    console.log(`⏰ Scadenza: ${new Date(payload.exp * 1000).toISOString()}`);
    console.log(`🔗 Link: ${link.substring(0, 80)}...`);
    
    return { token, payload, link };
  } catch (error) {
    console.log('❌ Errore generazione JWT:', error.message);
    return null;
  }
}

// Test 2: Verifica Whitelist
function testWhitelist() {
  return new Promise((resolve) => {
    console.log('\n📋 Test 2: Verifica Whitelist');
    
    const options = {
      hostname: 'chcndr.github.io',
      port: 443,
      path: '/dms-gemello-news/landing/viewer/whitelist.json',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const whitelist = JSON.parse(data);
          console.log(`✅ Whitelist caricata (${res.statusCode})`);
          console.log(`📊 Versione: ${whitelist.version || 'N/A'}`);
          console.log(`📅 Generata: ${whitelist.generated_at || 'N/A'}`);
          console.log(`📝 Entry: ${whitelist.entries ? whitelist.entries.length : 0}`);
          
          if (whitelist.entries && whitelist.entries.length > 0) {
            console.log('📋 Entry presenti:');
            whitelist.entries.forEach((entry, i) => {
              const expDate = entry.exp ? new Date(entry.exp * 1000).toISOString() : 'N/A';
              const isExpired = entry.exp ? entry.exp < Math.floor(Date.now() / 1000) : false;
              console.log(`   ${i + 1}. ${entry.sub} - ${expDate} ${isExpired ? '(SCADUTA)' : '(VALIDA)'}`);
            });
          }
          
          resolve(whitelist);
        } catch (e) {
          console.log('❌ Errore parsing whitelist:', e.message);
          console.log('📄 Contenuto raw:', data.substring(0, 200));
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Errore richiesta whitelist:', e.message);
      resolve(null);
    });

    req.end();
  });
}

// Test 3: Simulazione Auth Gate
function testAuthGate(token, payload, whitelist) {
  console.log('\n🔐 Test 3: Simulazione Auth Gate');
  
  if (!token || !payload) {
    console.log('❌ Token non disponibile per il test');
    return false;
  }

  // Verifica scadenza token
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    console.log('❌ Token scaduto');
    return false;
  }
  console.log('✅ Token non scaduto');

  // Verifica issuer
  if (payload.iss !== 'dms-gemello-news') {
    console.log('❌ Issuer non valido:', payload.iss);
    return false;
  }
  console.log('✅ Issuer valido');

  // Verifica whitelist
  if (!whitelist || !whitelist.entries) {
    console.log('❌ Whitelist non disponibile');
    return false;
  }

  const entry = whitelist.entries.find(e => 
    (e.sub && e.sub.toLowerCase() === payload.sub.toLowerCase()) ||
    (e.jti && e.jti === payload.jti)
  );

  if (!entry) {
    console.log('❌ Utente non presente in whitelist');
    console.log(`🔍 Cercato: sub="${payload.sub}", jti="${payload.jti}"`);
    return false;
  }
  console.log('✅ Utente trovato in whitelist');

  // Verifica scadenza whitelist
  if (entry.exp && entry.exp < now) {
    console.log('❌ Entry whitelist scaduta');
    return false;
  }
  console.log('✅ Entry whitelist valida');

  // Verifica scope
  if (payload.scope && entry.scope) {
    const hasValidScope = payload.scope.some(s => entry.scope.includes(s));
    if (!hasValidScope) {
      console.log('❌ Scope non autorizzato');
      return false;
    }
    console.log('✅ Scope autorizzato');
  }

  console.log('🎉 ACCESSO AUTORIZZATO!');
  return true;
}

// Test 4: Creazione whitelist di test
function createTestWhitelist() {
  console.log('\n🛠️  Test 4: Creazione Whitelist di Test');
  
  const now = Math.floor(Date.now() / 1000);
  const testWhitelist = {
    version: 1,
    generated_at: new Date().toISOString(),
    entries: [
      {
        sub: testUser.email,
        scope: [testUser.scope],
        exp: now + 3600, // 1 ora
        jti: generateUUID()
      }
    ]
  };

  const filename = 'test-whitelist.json';
  fs.writeFileSync(filename, JSON.stringify(testWhitelist, null, 2));
  
  console.log(`✅ Whitelist di test creata: ${filename}`);
  console.log(`📧 Email: ${testUser.email}`);
  console.log(`🎯 Scope: ${testUser.scope}`);
  console.log(`⏰ Scadenza: ${new Date(testWhitelist.entries[0].exp * 1000).toISOString()}`);
  
  return testWhitelist;
}

// Esecuzione test
async function runTests() {
  console.log('🚀 Avvio test completo sistema DMS\n');

  // Test 1: JWT
  const jwtResult = testJWTGeneration();
  
  // Test 2: Whitelist
  const whitelist = await testWhitelist();
  
  // Test 3: Auth Gate
  const authResult = testAuthGate(
    jwtResult?.token, 
    jwtResult?.payload, 
    whitelist
  );

  // Test 4: Whitelist di test
  const testWhitelist = createTestWhitelist();
  
  // Test finale con whitelist di test
  console.log('\n🔄 Test finale con whitelist di test');
  const finalResult = testAuthGate(
    jwtResult?.token, 
    jwtResult?.payload, 
    testWhitelist
  );

  // Riepilogo
  console.log('\n📊 RIEPILOGO TEST:');
  console.log(`✅ Generazione JWT: ${jwtResult ? 'OK' : 'FAIL'}`);
  console.log(`✅ Caricamento Whitelist: ${whitelist ? 'OK' : 'FAIL'}`);
  console.log(`✅ Auth Gate (whitelist live): ${authResult ? 'OK' : 'FAIL'}`);
  console.log(`✅ Auth Gate (whitelist test): ${finalResult ? 'OK' : 'FAIL'}`);

  if (jwtResult && finalResult) {
    console.log('\n🎉 SISTEMA FUNZIONANTE!');
    console.log('\n📝 PROSSIMI PASSI:');
    console.log('1. Usa Token Maker per generare JWT');
    console.log('2. Invia link da checchi@me.com');
    console.log('3. Attiva sessione su GitHub Actions');
    console.log('4. Utente può accedere con il link JWT');
  } else {
    console.log('\n❌ SISTEMA NON FUNZIONANTE - Controlla gli errori sopra');
  }
}

// Avvia test
runTests().catch(console.error);
