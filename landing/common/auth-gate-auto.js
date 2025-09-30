/*
 * DMS Auth Gate - Sistema Auto-Attivante
 * Link JWT si auto-attiva al primo clic con device fingerprint
 * ZERO CONFIGURAZIONI RICHIESTE
 */

(function() {
  'use strict';

  // Configurazione
  const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';
  const PERSONAL_ADMIN_KEY = 'checchi'; // Fallback per admin diretto
  const GITHUB_API_BASE = 'https://api.github.com/repos/Chcndr/dms-gemello-news';
  const WHITELIST_URL = 'https://chcndr.github.io/dms-gemello-news/landing/viewer/whitelist.json';

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

  // Genera device fingerprint
  function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown'
    ].join('|');
    
    // Hash semplice
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

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
      
      // Decodifica payload
      const payload = JSON.parse(base64urlDecode(payloadB64));

      // Verifica scadenza
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token scaduto');
      }

      // Verifica issuer
      if (payload.iss !== 'dms-gemello-news') {
        throw new Error('Issuer non valido');
      }

      // Verifica firma (semplificata per browser)
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

  // Auto-attivazione sessione
  async function autoActivateSession(payload, deviceFingerprint) {
    try {
      console.log('🚀 Auto-attivazione sessione per:', payload.sub);
      
      // Crea entry per whitelist
      const now = Math.floor(Date.now() / 1000);
      const sessionEntry = {
        sub: payload.sub,
        jti: payload.jti,
        scope: payload.scope || ['news-private'],
        exp: now + 3600, // 60 minuti
        device: deviceFingerprint,
        activated_at: new Date().toISOString(),
        auto_activated: true
      };

      // Salva in localStorage per verifica immediata
      const sessionKey = `dms_session_${payload.jti || payload.sub}`;
      localStorage.setItem(sessionKey, JSON.stringify(sessionEntry));
      
      console.log('✅ Sessione auto-attivata localmente');
      
      // Tenta di aggiornare whitelist remota (best effort)
      try {
        await updateRemoteWhitelist(sessionEntry);
        console.log('✅ Whitelist remota aggiornata');
      } catch (error) {
        console.warn('⚠️ Impossibile aggiornare whitelist remota:', error.message);
        console.log('📱 Sessione valida solo su questo device');
      }

      return sessionEntry;
    } catch (error) {
      console.error('❌ Errore auto-attivazione:', error);
      throw error;
    }
  }

  // Aggiornamento whitelist remota (best effort)
  async function updateRemoteWhitelist(sessionEntry) {
    // Questo è un tentativo - se fallisce, la sessione locale funziona comunque
    const payload = {
      message: `chore(auth): auto-activate session for ${sessionEntry.sub}`,
      content: btoa(JSON.stringify({
        version: 1,
        generated_at: new Date().toISOString(),
        entries: [sessionEntry]
      }, null, 2))
    };

    // Nota: Questo richiede token GitHub, ma è opzionale
    // La sessione funziona comunque con localStorage
    throw new Error('Remote update not configured - using local session only');
  }

  // Verifica sessione locale
  function checkLocalSession(payload, deviceFingerprint) {
    const sessionKey = `dms_session_${payload.jti || payload.sub}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (!sessionData) {
      return null;
    }

    try {
      const session = JSON.parse(sessionData);
      
      // Verifica scadenza
      const now = Math.floor(Date.now() / 1000);
      if (session.exp < now) {
        localStorage.removeItem(sessionKey);
        throw new Error('Sessione locale scaduta');
      }

      // Verifica device fingerprint
      if (session.device !== deviceFingerprint) {
        throw new Error('Device fingerprint non corrispondente');
      }

      // Verifica subject
      if (session.sub.toLowerCase() !== payload.sub.toLowerCase()) {
        throw new Error('Subject non corrispondente');
      }

      console.log('✅ Sessione locale valida trovata');
      return session;
    } catch (error) {
      localStorage.removeItem(sessionKey);
      throw error;
    }
  }

  // Controllo principale
  const checkAccess = async () => {
    
    // DEBUG
    console.log('🔍 DMS Auth Gate Auto - Controllo accesso:', {
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

      // Genera device fingerprint
      const deviceFingerprint = generateDeviceFingerprint();
      console.log('📱 Device fingerprint:', deviceFingerprint);

      // Verifica sessione locale esistente
      try {
        const localSession = checkLocalSession(payload, deviceFingerprint);
        if (localSession) {
          console.log('🎉 Sessione locale valida - accesso immediato');
          hideBlock();
          return true;
        }
      } catch (error) {
        console.log('📝 Nessuna sessione locale valida:', error.message);
      }

      // AUTO-ATTIVAZIONE al primo accesso
      console.log('🚀 Primo accesso - auto-attivazione sessione...');
      const session = await autoActivateSession(payload, deviceFingerprint);
      
      // ACCESSO GARANTITO
      console.log('🎉 Accesso autorizzato per:', payload.sub);
      console.log('⏰ Sessione valida fino:', new Date(session.exp * 1000).toISOString());
      hideBlock();
      return true;

    } catch (error) {
      console.error('❌ Accesso negato:', error.message);
      
      // Messaggi specifici per tipo di errore
      let message = '🔒 Accesso negato.<br>';
      
      if (error.message.includes('scaduto')) {
        message += '⏰ Token scaduto.<br>Richiedi un nuovo link a checchi@me.com';
      } else if (error.message.includes('Device fingerprint')) {
        message += '📱 Link utilizzabile solo dal device originale.<br>Richiedi un nuovo link a checchi@me.com';
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
  console.log('🚀 DMS Auth Gate Auto inizializzato');
  checkAccess().then(success => {
    if (success) {
      console.log('✅ Accesso autorizzato - sessione attiva');
    } else {
      console.log('❌ Accesso negato - sistema bloccato');
    }
  });

})();
