/*
 * DMS Auth Gate - Sistema JWT + Whitelist
 * Verifica token JWT firmati + presenza in whitelist temporanea
 */

(function() {
  'use strict';

  // Configurazione
  const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';
  const WHITELIST_URL = 'https://chcndr.github.io/dms-gemello-news/landing/viewer/whitelist.json';
  const PERSONAL_ADMIN_KEY = 'checchi'; // Fallback per admin diretto

  // Estrai parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get('t');
  const adminKey = urlParams.get('admin');

  // Funzioni utility
  const showBlock = (msg) => {
    const el = document.createElement('div');
    el.id = 'dmsLock';
    el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.92);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font:600 16px system-ui';
    el.innerHTML = `<div><div style="font-size:22px;margin-bottom:8px">🔒 Accesso Protetto</div>
    <div style="opacity:.9">${msg || 'Accesso negato. Contatta checchi@me.com per ottenere un link valido.'}</div></div>`;
    document.body.appendChild(el);
  };

  const hideBlock = () => {
    const x = document.getElementById('dmsLock'); 
    if(x) x.remove(); 
  };

  // Funzione per decodificare Base64URL
  function base64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return atob(str);
  }

  // Funzione per verificare firma JWT
  async function verifyJWT(token, secret) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT malformato');
      }

      const [headerB64, payloadB64, signatureB64] = parts;
      
      // Decodifica header e payload
      const header = JSON.parse(base64urlDecode(headerB64));
      const payload = JSON.parse(base64urlDecode(payloadB64));

      // Verifica algoritmo
      if (header.alg !== 'HS256') {
        throw new Error('Algoritmo non supportato: ' + header.alg);
      }

      // Verifica scadenza
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token scaduto');
      }

      // Verifica issuer
      if (payload.iss !== 'dms-gemello-news') {
        throw new Error('Issuer non valido');
      }

      // Verifica firma
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const data = `${headerB64}.${payloadB64}`;
      const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      
      const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
      
      if (!isValid) {
        throw new Error('Firma JWT non valida');
      }

      return payload;
    } catch (error) {
      console.error('❌ Errore verifica JWT:', error);
      throw error;
    }
  }

  // Funzione per verificare whitelist
  async function checkWhitelist(sub, jti) {
    try {
      const response = await fetch(`${WHITELIST_URL}?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const whitelist = await response.json();
      console.log('📋 Whitelist caricata:', whitelist);

      if (!whitelist.entries || !Array.isArray(whitelist.entries)) {
        throw new Error('Formato whitelist non valido');
      }

      // Cerca entry per sub o jti
      const entry = whitelist.entries.find(e => 
        (e.sub && e.sub.toLowerCase() === sub.toLowerCase()) ||
        (e.jti && e.jti === jti)
      );

      if (!entry) {
        throw new Error('Utente non presente in whitelist');
      }

      // Verifica scadenza entry
      const now = Math.floor(Date.now() / 1000);
      if (entry.exp && entry.exp < now) {
        throw new Error('Sessione whitelist scaduta');
      }

      console.log('✅ Entry whitelist valida:', entry);
      return entry;

    } catch (error) {
      console.error('❌ Errore verifica whitelist:', error);
      throw error;
    }
  }

  // Controllo principale
  const checkAccess = async () => {
    
    // DEBUG
    console.log('🔍 DMS Auth Gate - Controllo accesso:', {
      jwtToken: jwtToken ? `${jwtToken.substring(0, 20)}...` : null,
      adminKey: adminKey,
      url: window.location.href
    });

    // 1. CONTROLLO ADMIN KEY (fallback)
    if (adminKey) {
      if (adminKey === PERSONAL_ADMIN_KEY) {
        console.log('✅ Admin key valida - accesso garantito');
        hideBlock();
        return true;
      } else {
        console.log('❌ Admin key non valida:', adminKey);
        showBlock('🚫 Chiave admin non valida.<br>Usa il sistema JWT normale.');
        return false;
      }
    }

    // 2. CONTROLLO JWT TOKEN
    if (!jwtToken) {
      console.log('❌ Nessun token JWT fornito');
      showBlock('🔑 Token JWT richiesto.<br>Richiedi un link valido a checchi@me.com');
      return false;
    }

    try {
      // Verifica firma JWT
      console.log('🔐 Verifica firma JWT...');
      const payload = await verifyJWT(jwtToken, JWT_SECRET);
      console.log('✅ JWT valido:', payload);

      // Verifica whitelist
      console.log('📋 Verifica whitelist...');
      const whitelistEntry = await checkWhitelist(payload.sub, payload.jti);
      console.log('✅ Whitelist valida:', whitelistEntry);

      // Verifica scope (opzionale)
      if (payload.scope && whitelistEntry.scope) {
        const hasValidScope = payload.scope.some(s => whitelistEntry.scope.includes(s));
        if (!hasValidScope) {
          throw new Error('Scope non autorizzato');
        }
      }

      // ACCESSO GARANTITO
      console.log('🎉 Accesso autorizzato per:', payload.sub);
      hideBlock();
      return true;

    } catch (error) {
      console.error('❌ Accesso negato:', error.message);
      
      // Messaggi specifici per tipo di errore
      let message = '🔒 Accesso negato.<br>';
      
      if (error.message.includes('scaduto')) {
        message += '⏰ Token o sessione scaduti.<br>Richiedi un nuovo link a checchi@me.com';
      } else if (error.message.includes('whitelist')) {
        message += '📋 Sessione non attiva.<br>Assicurati che l\'amministratore abbia attivato la tua sessione su GitHub Actions.';
      } else if (error.message.includes('firma')) {
        message += '🔐 Token non valido o manomesso.<br>Richiedi un nuovo link a checchi@me.com';
      } else {
        message += `❌ ${error.message}<br>Contatta checchi@me.com per assistenza.`;
      }

      showBlock(message);
      return false;
    }
  };

  // AVVIO CONTROLLO
  console.log('🚀 DMS Auth Gate inizializzato');
  checkAccess().then(success => {
    if (success) {
      console.log('✅ Accesso autorizzato - nessun polling necessario');
    } else {
      console.log('❌ Accesso negato - sistema bloccato');
    }
  });

})();
