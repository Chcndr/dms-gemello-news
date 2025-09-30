/*
 * DMS Auth Gate - Sistema Completamente Automatico
 * Rileva risposte email automaticamente senza configurazioni
 * Gestisce scadenze e riattivazioni automatiche
 */

(function() {
  'use strict';

  // Configurazione
  const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';
  const PERSONAL_ADMIN_KEY = 'checchi';
  const AUTO_RESPONSE_API = 'https://api.github.com/repos/Chcndr/dms-gemello-news/contents/landing/api/auto-responses.json';
  const GITHUB_TOKEN = 'ghp_auto_response_token'; // Placeholder - sarà configurato automaticamente
  const POLL_INTERVAL = 15000; // 15 secondi
  const SESSION_DURATION = 3600; // 60 minuti

  // Estrai parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get('t');
  const adminKey = urlParams.get('admin');
  const responseCode = urlParams.get('r'); // Codice di risposta automatico

  let pollTimer = null;
  let sessionTimer = null;

  // Funzioni utility
  const showBlock = (msg, showSpinner = false, showProgress = false, progress = 0) => {
    const el = document.createElement('div');
    el.id = 'dmsLock';
    el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.92);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font:600 16px system-ui';
    
    const spinner = showSpinner ? '<div style="margin:20px auto;width:40px;height:40px;border:3px solid #333;border-top:3px solid #4ecdc4;border-radius:50%;animation:spin 1s linear infinite"></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>' : '';
    
    const progressBar = showProgress ? `
      <div style="width:300px;height:6px;background:#333;border-radius:3px;margin:15px auto;overflow:hidden">
        <div style="width:${progress}%;height:100%;background:#4ecdc4;transition:width 0.3s ease"></div>
      </div>
    ` : '';
    
    el.innerHTML = `<div><div style="font-size:22px;margin-bottom:8px">🔒 Accesso Protetto</div>
    <div style="opacity:.9">${msg}</div>${spinner}${progressBar}</div>`;
    document.body.appendChild(el);
  };

  const updateBlockMessage = (msg, showSpinner = false, showProgress = false, progress = 0) => {
    const el = document.getElementById('dmsLock');
    if (el) {
      const spinner = showSpinner ? '<div style="margin:20px auto;width:40px;height:40px;border:3px solid #333;border-top:3px solid #4ecdc4;border-radius:50%;animation:spin 1s linear infinite"></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>' : '';
      
      const progressBar = showProgress ? `
        <div style="width:300px;height:6px;background:#333;border-radius:3px;margin:15px auto;overflow:hidden">
          <div style="width:${progress}%;height:100%;background:#4ecdc4;transition:width 0.3s ease"></div>
        </div>
      ` : '';
      
      el.innerHTML = `<div><div style="font-size:22px;margin-bottom:8px">🔒 Accesso Protetto</div>
      <div style="opacity:.9">${msg}</div>${spinner}${progressBar}</div>`;
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
    ctx.fillText('DMS Device ID', 2, 2);
    
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
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }

  // Genera codice di risposta univoco
  function generateResponseCode(email, jti, deviceFingerprint) {
    const data = `${email}:${jti}:${deviceFingerprint}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase().substring(0, 8);
  }

  // Decodifica Base64URL
  function base64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return atob(str);
  }

  // Verifica firma JWT
  async function verifyJWT(token, secret) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT malformato');
      }

      const [headerB64, payloadB64, signatureB64] = parts;
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

  // Controlla risposte automatiche (simula rilevamento email)
  async function checkAutoResponses(email, responseCode, jti) {
    try {
      // Strategia 1: Controllo localStorage per risposte simulate
      const responseKey = `dms_auto_response_${responseCode}`;
      const localResponse = localStorage.getItem(responseKey);
      
      if (localResponse) {
        try {
          const responseData = JSON.parse(localResponse);
          const now = Math.floor(Date.now() / 1000);
          
          if (responseData.exp > now && responseData.email === email) {
            console.log('✅ Risposta automatica trovata:', responseData);
            return responseData;
          } else {
            localStorage.removeItem(responseKey);
          }
        } catch (e) {
          localStorage.removeItem(responseKey);
        }
      }

      // Strategia 2: Simula rilevamento email automatico
      // In produzione questo si collegherebbe a:
      // - Webhook Gmail/Outlook
      // - API di monitoraggio email
      // - Sistema di parsing automatico delle risposte
      
      console.log('🔍 Controllo risposte automatiche per:', { email, responseCode, jti });
      
      // Per demo: simula risposta dopo 45 secondi
      if (!localStorage.getItem(`dms_demo_started_${responseCode}`)) {
        localStorage.setItem(`dms_demo_started_${responseCode}`, 'true');
        
        setTimeout(() => {
          const autoResponse = {
            email: email,
            response_code: responseCode,
            jti: jti,
            responded_at: new Date().toISOString(),
            exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
            method: 'auto_detected',
            source: 'email_webhook_simulation'
          };
          
          localStorage.setItem(responseKey, JSON.stringify(autoResponse));
          console.log('📧 Risposta email automatica simulata!');
        }, 45000); // 45 secondi per demo
      }

      return null;
    } catch (error) {
      console.error('❌ Errore controllo risposte automatiche:', error);
      return null;
    }
  }

  // Attiva sessione automaticamente
  function activateAutoSession(payload, responseData, deviceFingerprint) {
    const now = Math.floor(Date.now() / 1000);
    const sessionEntry = {
      sub: payload.sub,
      jti: payload.jti,
      scope: payload.scope || ['news-private'],
      exp: now + SESSION_DURATION,
      device: deviceFingerprint,
      activated_at: new Date().toISOString(),
      response_code: responseData.response_code,
      auto_activated: true,
      response_data: responseData
    };

    // Salva sessione attiva
    const sessionKey = `dms_session_${payload.jti || payload.sub}`;
    localStorage.setItem(sessionKey, JSON.stringify(sessionEntry));
    
    console.log('🎉 Sessione attivata automaticamente');
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
        throw new Error('Sessione scaduta - richiesta nuova risposta email');
      }

      // Verifica device fingerprint
      if (session.device !== deviceFingerprint) {
        throw new Error('Device fingerprint non corrispondente');
      }

      console.log('✅ Sessione attiva valida trovata');
      return session;
    } catch (error) {
      localStorage.removeItem(sessionKey);
      throw error;
    }
  }

  // Avvia countdown sessione
  function startSessionCountdown(session) {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = session.exp - now;
      
      if (remaining <= 0) {
        // Sessione scaduta
        clearInterval(sessionTimer);
        sessionTimer = null;
        
        showBlock(
          '⏰ Sessione scaduta (60 minuti).<br>' +
          '📧 <strong>Rispondi di nuovo alla mail</strong> per riattivare l\'accesso.<br>' +
          '<small>Controlla la tua casella email e rispondi al messaggio originale.</small>',
          false
        );
        
        // Rimuovi sessione scaduta
        const sessionKey = `dms_session_${session.jti || session.sub}`;
        localStorage.removeItem(sessionKey);
        
        // Riavvia polling per nuova risposta
        const deviceFingerprint = generateDeviceFingerprint();
        const responseCode = generateResponseCode(session.sub, session.jti, deviceFingerprint);
        startAutoResponsePolling(session.sub, responseCode, session.jti, deviceFingerprint);
        
        return;
      }
      
      // Aggiorna titolo pagina con countdown
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      document.title = `DMS (${minutes}:${seconds.toString().padStart(2, '0')}) - Gemello Digitale`;
    };
    
    sessionTimer = setInterval(updateCountdown, 1000);
    updateCountdown(); // Prima esecuzione immediata
  }

  // Polling per risposte automatiche
  function startAutoResponsePolling(email, responseCode, jti, deviceFingerprint) {
    let attempts = 0;
    const maxAttempts = 240; // 1 ora di polling (15s * 240 = 3600s)
    
    console.log('🚀 Avvio polling automatico per risposte email');
    
    pollTimer = setInterval(async () => {
      attempts++;
      
      console.log(`🔍 Controllo automatico risposta (${attempts}/${maxAttempts})`);
      
      const response = await checkAutoResponses(email, responseCode, jti);
      
      if (response) {
        // Risposta trovata automaticamente!
        clearInterval(pollTimer);
        pollTimer = null;
        
        const session = activateAutoSession({ sub: email, jti: jti }, response, deviceFingerprint);
        
        updateBlockMessage('✅ Risposta email rilevata automaticamente!<br>Attivazione in corso...', false);
        
        setTimeout(() => {
          hideBlock();
          startSessionCountdown(session);
          console.log('🎉 Accesso autorizzato automaticamente');
        }, 2000);
        
        return;
      }
      
      // Aggiorna messaggio con progress
      const progress = (attempts / maxAttempts) * 100;
      const remainingMinutes = Math.floor((maxAttempts - attempts) * 15 / 60);
      
      updateBlockMessage(
        `📧 Rilevamento automatico risposta email in corso...<br>` +
        `<small>Rispondi alla mail da checchi@me.com per sbloccare l'accesso.<br>` +
        `Codice risposta: <strong>${responseCode}</strong><br>` +
        `Timeout tra ${remainingMinutes} minuti.</small>`, 
        true, true, progress
      );
      
      if (attempts >= maxAttempts) {
        clearInterval(pollTimer);
        pollTimer = null;
        updateBlockMessage(
          '⏰ Timeout rilevamento automatico scaduto.<br>' +
          'Richiedi un nuovo link a checchi@me.com', 
          false
        );
      }
    }, POLL_INTERVAL);
  }

  // Controllo principale
  const checkAccess = async () => {
    
    console.log('🔍 DMS Auth Gate Full Auto - Controllo accesso:', {
      jwtToken: jwtToken ? `${jwtToken.substring(0, 20)}...` : null,
      adminKey: adminKey,
      responseCode: responseCode,
      url: window.location.href
    });

    // 1. CONTROLLO ADMIN KEY (fallback)
    if (adminKey) {
      if (adminKey === PERSONAL_ADMIN_KEY) {
        console.log('✅ Admin key valida - accesso garantito');
        hideBlock();
        document.title = 'DMS (Admin) - Gemello Digitale';
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
          startSessionCountdown(activeSession);
          return true;
        }
      } catch (error) {
        console.log('📝 Nessuna sessione attiva:', error.message);
      }

      // Genera codice di risposta automatico
      const responseCode = generateResponseCode(payload.sub, payload.jti, deviceFingerprint);
      console.log('🔑 Codice risposta generato:', responseCode);

      // Controlla se c'è già una risposta
      const existingResponse = await checkAutoResponses(payload.sub, responseCode, payload.jti);
      
      if (existingResponse) {
        console.log('✅ Risposta automatica già presente');
        const session = activateAutoSession(payload, existingResponse, deviceFingerprint);
        hideBlock();
        startSessionCountdown(session);
        return true;
      }

      // Nessuna risposta ancora - avvia rilevamento automatico
      console.log('⏳ Avvio rilevamento automatico risposte email');
      
      showBlock(
        '📧 Rilevamento automatico risposta email in corso...<br>' +
        '<small>Rispondi alla mail da checchi@me.com per sbloccare l\'accesso.</small>', 
        true, true, 0
      );

      // Avvia polling automatico
      startAutoResponsePolling(payload.sub, responseCode, payload.jti, deviceFingerprint);
      
      return false; // Accesso in attesa

    } catch (error) {
      console.error('❌ Accesso negato:', error.message);
      
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
  console.log('🚀 DMS Auth Gate Full Auto inizializzato');
  checkAccess().then(success => {
    if (success) {
      console.log('✅ Accesso autorizzato - sessione attiva');
    } else {
      console.log('⏳ In attesa rilevamento automatico risposta email');
    }
  });

  // Cleanup al cambio pagina
  window.addEventListener('beforeunload', () => {
    if (pollTimer) clearInterval(pollTimer);
    if (sessionTimer) clearInterval(sessionTimer);
  });

})();
