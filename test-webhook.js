#!/usr/bin/env node

/*
 * Test script per webhook email DMS
 * Simula una risposta email e testa l'attivazione automatica
 */

const https = require('https');

// Configurazione test
const WEBHOOK_URL = 'https://chcndr.github.io/dms-gemello-news/landing/api/email-webhook.js';
const WEBHOOK_SECRET = 'dms-webhook-secret-2025';

// Dati di test
const testData = {
  from: 'bebaviola@gmail.com',
  to: 'checchi@me.com',
  subject: 'Re: Accesso DMS - Conferma',
  body: 'Confermo la mia partecipazione. Token: test-token-12345',
  timestamp: new Date().toISOString(),
  messageId: 'test-msg-' + Date.now()
};

// Funzione per inviare richiesta POST
function sendWebhookTest() {
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'chcndr.github.io',
    port: 443,
    path: '/dms-gemello-news/landing/api/email-webhook.js',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'x-webhook-secret': WEBHOOK_SECRET,
      'User-Agent': 'DMS-Webhook-Test/1.0'
    }
  };

  console.log('🧪 Invio test webhook...');
  console.log('📧 Dati simulati:', JSON.stringify(testData, null, 2));
  console.log('🔗 URL:', WEBHOOK_URL);
  
  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('📥 Risposta webhook:');
      try {
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('✅ Test webhook SUCCESSO!');
          console.log(`📧 Email: ${parsed.email}`);
          console.log(`🔑 Token: ${parsed.token}`);
          console.log(`⏰ Durata: ${parsed.duration}`);
        } else {
          console.log('❌ Test webhook FALLITO!');
          console.log('Errore:', parsed.error);
        }
      } catch (e) {
        console.log('📄 Risposta raw:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Errore richiesta:', e.message);
  });

  // Invia i dati
  req.write(postData);
  req.end();
}

// Funzione per verificare whitelist dopo il test
function checkWhitelist() {
  setTimeout(() => {
    console.log('\n🔍 Controllo whitelist.json...');
    
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
          console.log('📋 Whitelist attuale:', JSON.stringify(whitelist, null, 2));
          
          const testSession = whitelist.sessions.find(s => 
            s.email === 'bebaviola@gmail.com' && s.token === 'test-token-12345'
          );
          
          if (testSession) {
            console.log('✅ Sessione test trovata nella whitelist!');
            console.log(`⏰ Scade: ${testSession.expires}`);
          } else {
            console.log('❌ Sessione test NON trovata nella whitelist');
          }
        } catch (e) {
          console.log('❌ Errore parsing whitelist:', e.message);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Errore controllo whitelist:', e.message);
    });

    req.end();
  }, 5000); // Aspetta 5 secondi per il processing
}

// Esegui test
console.log('🚀 Avvio test webhook DMS...\n');
sendWebhookTest();
checkWhitelist();

console.log('\n📝 NOTA: Se il test fallisce, controlla:');
console.log('1. GitHub Token configurato correttamente');
console.log('2. Webhook endpoint deployato');
console.log('3. Permessi GitHub Actions abilitati');
console.log('4. Sintassi JSON corretta\n');
