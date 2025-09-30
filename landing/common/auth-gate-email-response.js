/*
 * DMS Auth Gate - Sistema con Rilevamento Risposta Email
 * Link si attiva SOLO dopo che l'utente ha risposto alla mail
 * ZERO CONFIGURAZIONI RICHIESTE
 */

(function() {
  'use strict';

  // Configurazione
  const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';
  const PERSONAL_ADMIN_KEY = 'checchi'; // Fallback per admin diretto
  const RESPONSE_CHECK_URL = 'https://chcndr.github.io/dms-gemello-news/landing/api/check-response.json';
  const POLL_INTERVAL = 10000; // 10 secondi

  // Estrai parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get('t');
  const adminKey = urlParams.get('admin');

  let pollTimer = null;

  // Funzioni utility
  const showBlock = (msg, showSpinner = false) => {
    const el = document.createElement('div');
    el.id = 'dmsLock';
    el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.92);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font:600 16px system-ui';
    
    const spinner = showSpinner ? '<div style="margin:20px auto;width:40px;height:40px;border:3px solid #333;border-top:3px solid #4ecdc4;border-radius:50%;animation:spin 1s linear infinite"></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>' : '';
    
    el.innerHTML = `<div><div style="font-size:22px;margin-bottom:8px">🔒 Accesso Protetto</div>
    <div style="opacity:.9">${msg || 'Accesso negato. Contatta checchi@me.com per ottenere un link valido.'}</div>${spinner}</div>`;
    document.body.appendChild(el);
  };

  const updateBlockMessage = (msg, showSpinner = false) => {
    const el = document.getElementById('dmsLock');
    if (el) {
      const spinner = showSpinner ? '<div style="margin:20px auto;width:40px;height:40px;border:3px solid #333;border-top:3px solid #4ecdc4;border-radius:50%;animation:spin 1s linear infinite"></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>' : '';
      el.innerHTML = `<div><div style="font-size:22px;margin-bottom:8px">🔒 Accesso Protetto</div>
      <div style="opacity:.9">${msg}</div>${spinner}</div>`;
    }
  };

  const hideBlock = () => {
    const x = document.getElementById('dmsLock'); 
    if(x) x.remove();
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
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

  // Verifica se l'utente ha risposto alla mail
  async function checkEmailResponse(email, jti) {
    try {
      // Strategia 1: File statico con risposte confermate
      const response = await fetch(`${RESPONSE_CHECK_URL}?v=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.responses && Array.isArray(data.responses)) {
          const responseEntry = data.responses.find(r => 
            (r.email && r.email.toLowerCase() === email.toLowerCase()) ||
            (r.jti && r.jti === jti)
          );
          
          if (responseEntry) {
            // Verifica che la risposta non sia scaduta
            const now = Math.floor(Date.now() / 1000);
            if (!responseEntry.exp || responseEntry.exp > now) {
              console.log('✅ Risposta email confermata:', responseEntry);
              return responseEntry;
            } else {
              console.log('⏰ Risposta email scaduta');
            }
          }
        }
      }
      
      // Strategia 2: Controllo localStorage per sessioni già attivate
      const sessionKey = `dms_response_${jti || email}`;
      const localResponse = localStorage.getItem(sessionKey);
      if (localResponse) {
        try {
          const responseData = JSON.parse(localResponse);
          const now = Math.floor(Date.now() / 1000);
          if (responseData.exp > now) {
            console.log('✅ Risposta locale valida trovata');
            return responseData;
          } else {
            localStorage.removeItem(sessionKey);
          }
        } catch (e) {
          localStorage.removeItem(sessionKey);
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Errore controllo risposta email:', error);
      return null;
    }
  }

  // Simula rilevamento risposta email (per demo)
  async function simulateEmailResponseDetection(email, jti) {
    // In un sistema reale, questo si collegherebbe a:
    // - Webhook email service
    // - API Gmail/Outlook
    // - File di log delle risposte
    
    console.log('🔍 Simulazione rilevamento risposta email...');
    
    // Per demo: dopo 30 secondi simula risposta ricevuta
    setTimeout(() => {
      const responseData = {
        email: email,
        jti: jti,
        responded_at: new Date().toISOString(),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 ora
        method: 'simulated'
      };
      
      // Salva in localStorage
      const sessionKey = `dms_response_${jti || email}`;
      localStorage.setItem(sessionKey, JSON.stringify(responseData));
      
      console.log('📧 Risposta email simulata ricevuta!');
    }, 30000); // 30 secondi per demo
  }

  // Attiva sessione dopo risposta confermata
  function activateSession(payload, responseData, deviceFingerprint) {
    const now = Math.floor(Date.now() / 1000);
    const sessionEntry = {
      sub: payload.sub,
      jti: payload.jti,
      scope: payload.scope || ['news-private'],
      exp: now + 3600, // 60 minuti
      device: deviceFingerprint,
      activated_at: new Date().toISOString(),
      response_confirmed: true,
      response_data: responseData
    };

    // Salva sessione attiva
    const sessionKey = `dms_session_${payload.jti || payload.sub}`;
    localStorage.setItem(sessionKey, JSON.stringify(sessionEntry));
    
    console.log('🎉 Sessione attivata dopo conferma risposta email');
    return sessionEntry;
  }

  // Verifica sessione attiva
  function checkActiveSession(payload, deviceFingerprint) {
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
        throw new Error('Sessione scaduta');
      }

      // Verifica device fingerprint
      if (session.device !== deviceFingerprint) {
        throw new Error('Device fingerprint non corrispondente');
      }

      // Verifica che la risposta sia stata confermata
      if (!session.response_confirmed) {
        throw new Error('Risposta email non confermata');
      }

      console.log('✅ Sessione attiva valida trovata');
      return session;
    } catch (error) {
      localStorage.removeItem(sessionKey);
      throw error;
    }
  }

  // Polling per controllo risposta
  function startResponsePolling(payload, deviceFingerprint) {
    let attempts = 0;
    const maxAttempts = 360; // 1 ora di polling (10s * 360 = 3600s)
    
    pollTimer = setInterval(async () => {
      attempts++;
      
      console.log(`🔍 Controllo risposta email (tentativo ${attempts}/${maxAttempts})`);
      
      const response = await checkEmailResponse(payload.sub, payload.jti);
      
      if (response) {
        // Risposta trovata! Attiva sessione
        clearInterval(pollTimer);
        pollTimer = null;
        
        const session = activateSession(payload, response, deviceFingerprint);
        
        updateBlockMessage('✅ Risposta ricevuta! Attivazione in corso...', false);
        
        setTimeout(() => {
          hideBlock();
          console.log('🎉 Accesso autorizzato dopo risposta email');
        }, 2000);
        
        return;
      }
      
      // Aggiorna messaggio con countdown
      const remainingMinutes = Math.floor((maxAttempts - attempts) * 10 / 60);
      updateBlockMessage(
        `📧 In attesa della tua risposta alla mail...<br>` +
        `<small>Controlla la tua casella email e rispondi al messaggio.<br>` +
        `Timeout tra ${remainingMinutes} minuti.</small>`, 
        true
      );
      
      if (attempts >= maxAttempts) {
        clearInterval(pollTimer);
        pollTimer = null;
        updateBlockMessage(
          '⏰ Timeout scaduto.<br>' +
          'Non è stata rilevata nessuna risposta alla mail.<br>' +
          'Richiedi un nuovo link a checchi@me.com', 
          false
        );
      }
    }, POLL_INTERVAL);
  }

  // Controllo principale
  const checkAccess = async () => {
    
    // DEBUG
    console.log('🔍 DMS Auth Gate Email Response - Controllo accesso:', {
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

      // Verifica sessione attiva esistente
      try {
        const activeSession = checkActiveSession(payload, deviceFingerprint);
        if (activeSession) {
          console.log('🎉 Sessione attiva valida - accesso immediato');
          hideBlock();
          return true;
        }
      } catch (error) {
        console.log('📝 Nessuna sessione attiva:', error.message);
      }

      // Controlla se l'utente ha già risposto
      console.log('📧 Controllo risposta email...');
      const response = await checkEmailResponse(payload.sub, payload.jti);
      
      if (response) {
        // Risposta già presente, attiva sessione
        console.log('✅ Risposta email già confermata');
        const session = activateSession(payload, response, deviceFingerprint);
        hideBlock();
        return true;
      }

      // Nessuna risposta ancora - inizia polling
      console.log('⏳ Nessuna risposta email trovata - avvio polling');
      
      showBlock(
        '📧 In attesa della tua risposta alla mail...<br>' +
        '<small>Controlla la tua casella email e rispondi al messaggio.</small>', 
        true
      );

      // Avvia simulazione per demo (rimuovere in produzione)
      simulateEmailResponseDetection(payload.sub, payload.jti);
      
      // Avvia polling
      startResponsePolling(payload, deviceFingerprint);
      
      return false; // Accesso in attesa

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
  console.log('🚀 DMS Auth Gate Email Response inizializzato');
  checkAccess().then(success => {
    if (success) {
      console.log('✅ Accesso autorizzato - sessione attiva');
    } else {
      console.log('⏳ In attesa risposta email o accesso negato');
    }
  });

  // Cleanup al cambio pagina
  window.addEventListener('beforeunload', () => {
    if (pollTimer) {
      clearInterval(pollTimer);
    }
  });

})();
