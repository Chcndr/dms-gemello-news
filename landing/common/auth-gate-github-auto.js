/*
 * DMS Auth Gate - Sistema Completamente Automatico con GitHub Issues
 * Utilizza GitHub Issues per rilevare risposte email automaticamente
 * Zero configurazioni - Completamente automatico
 */

(function() {
  'use strict';

  // Configurazione
  const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';
  const PERSONAL_ADMIN_KEY = 'checchi';
  const GITHUB_OWNER = 'Chcndr';
  const GITHUB_REPO = 'dms-access-tracker'; // Repository privato per tracking
  const GITHUB_TOKEN = 'ghp_PLACEHOLDER'; // Configurato dinamicamente
  const POLL_INTERVAL = 10000; // 10 secondi
  const SESSION_DURATION = 3600; // 60 minuti

  // Estrai parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get('t');
  const adminKey = urlParams.get('admin');

  let pollTimer = null;
  let sessionTimer = null;

  // Funzioni utility per UI
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

  // Controlla GitHub Issue per risposte
  async function checkGitHubIssueResponse(issueNumber) {
    try {
      // Prima controlla se l'issue esiste e ottieni i dettagli
      const issueUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}`;
      
      console.log('🔍 Controllo GitHub Issue:', issueUrl);
      
      const issueResponse = await fetch(issueUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DMS-Auth-System'
        }
      });

      if (!issueResponse.ok) {
        if (issueResponse.status === 404) {
          console.log('❌ Issue non trovato:', issueNumber);
          return null;
        }
        throw new Error(`Errore GitHub API: ${issueResponse.status}`);
      }

      const issueData = await issueResponse.json();
      
      // Controlla se ci sono commenti
      if (issueData.comments > 0) {
        console.log('✅ Trovati commenti nell\'issue:', issueData.comments);
        
        // Ottieni i commenti
        const commentsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`;
        const commentsResponse = await fetch(commentsUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DMS-Auth-System'
          }
        });

        if (commentsResponse.ok) {
          const comments = await commentsResponse.json();
          
          if (comments.length > 0) {
            // Trova il primo commento dell'utente (non del sistema)
            const userComment = comments.find(comment => 
              comment.user.login !== GITHUB_OWNER && 
              !comment.body.includes('[DMS-AUTO]')
            );
            
            if (userComment) {
              console.log('📧 Risposta utente trovata:', userComment);
              return {
                responded_at: userComment.created_at,
                response_body: userComment.body,
                user: userComment.user.login,
                comment_id: userComment.id,
                issue_number: issueNumber,
                method: 'github_issue_comment'
              };
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Errore controllo GitHub Issue:', error);
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
      issue_number: responseData.issue_number,
      auto_activated: true,
      response_data: responseData
    };

    // Salva sessione attiva
    const sessionKey = `dms_session_${payload.jti || payload.sub}`;
    localStorage.setItem(sessionKey, JSON.stringify(sessionEntry));
    
    console.log('🎉 Sessione attivata automaticamente via GitHub Issue');
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
          '📧 <strong>Rispondi di nuovo alla notifica GitHub</strong> per riattivare l\'accesso.<br>' +
          '<small>Controlla la tua email per nuove notifiche GitHub.</small>',
          false
        );
        
        // Rimuovi sessione scaduta
        const sessionKey = `dms_session_${session.jti || session.sub}`;
        localStorage.removeItem(sessionKey);
        
        // Riavvia polling per nuova risposta
        if (session.issue_number) {
          startGitHubPolling(session.issue_number);
        }
        
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

  // Polling per risposte GitHub
  function startGitHubPolling(issueNumber) {
    let attempts = 0;
    const maxAttempts = 360; // 1 ora di polling (10s * 360 = 3600s)
    
    console.log('🚀 Avvio polling GitHub Issue:', issueNumber);
    
    pollTimer = setInterval(async () => {
      attempts++;
      
      console.log(`🔍 Controllo GitHub Issue ${issueNumber} (${attempts}/${maxAttempts})`);
      
      const response = await checkGitHubIssueResponse(issueNumber);
      
      if (response) {
        // Risposta trovata automaticamente!
        clearInterval(pollTimer);
        pollTimer = null;
        
        // Ricostruisci payload dal localStorage o URL
        const jwtPayload = JSON.parse(localStorage.getItem('dms_current_jwt_payload') || '{}');
        const deviceFingerprint = generateDeviceFingerprint();
        
        const session = activateAutoSession(jwtPayload, response, deviceFingerprint);
        
        updateBlockMessage('✅ Risposta GitHub rilevata automaticamente!<br>Attivazione in corso...', false);
        
        setTimeout(() => {
          hideBlock();
          startSessionCountdown(session);
          console.log('🎉 Accesso autorizzato automaticamente via GitHub');
        }, 2000);
        
        return;
      }
      
      // Aggiorna messaggio con progress
      const progress = (attempts / maxAttempts) * 100;
      const remainingMinutes = Math.floor((maxAttempts - attempts) * 10 / 60);
      
      updateBlockMessage(
        `📧 Rilevamento automatico risposta GitHub in corso...<br>` +
        `<small>Rispondi alla notifica GitHub per sbloccare l'accesso.<br>` +
        `Issue #${issueNumber} - Timeout tra ${remainingMinutes} minuti.</small>`, 
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

  // Estrai numero issue dal JWT
  function extractIssueNumber(payload) {
    // Il numero dell'issue sarà codificato nel JTI o in un campo dedicato
    if (payload.github_issue) {
      return payload.github_issue;
    }
    
    // Fallback: usa JTI come base per il numero issue
    if (payload.jti) {
      // Converte JTI in numero issue (hash semplice)
      let hash = 0;
      for (let i = 0; i < payload.jti.length; i++) {
        const char = payload.jti.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % 10000 + 1000; // Numero tra 1000-10999
    }
    
    return null;
  }

  // Controllo principale
  const checkAccess = async () => {
    
    console.log('🔍 DMS Auth Gate GitHub Auto - Controllo accesso:', {
      jwtToken: jwtToken ? `${jwtToken.substring(0, 20)}...` : null,
      adminKey: adminKey,
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

      // Salva payload per uso futuro
      localStorage.setItem('dms_current_jwt_payload', JSON.stringify(payload));

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

      // Estrai numero issue dal JWT
      const issueNumber = extractIssueNumber(payload);
      
      if (!issueNumber) {
        throw new Error('Numero issue non trovato nel token');
      }

      console.log('🎫 Issue GitHub associato:', issueNumber);

      // Controlla se c'è già una risposta nell'issue
      const existingResponse = await checkGitHubIssueResponse(issueNumber);
      
      if (existingResponse) {
        console.log('✅ Risposta GitHub già presente');
        const session = activateAutoSession(payload, existingResponse, deviceFingerprint);
        hideBlock();
        startSessionCountdown(session);
        return true;
      }

      // Nessuna risposta ancora - avvia rilevamento automatico
      console.log('⏳ Avvio rilevamento automatico risposte GitHub');
      
      showBlock(
        '📧 Rilevamento automatico risposta GitHub in corso...<br>' +
        '<small>Rispondi alla notifica GitHub per sbloccare l\'accesso.</small>', 
        true, true, 0
      );

      // Avvia polling automatico
      startGitHubPolling(issueNumber);
      
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
      } else if (error.message.includes('issue')) {
        message += '🎫 Issue GitHub non configurato correttamente.<br>Contatta checchi@me.com per assistenza.';
      } else {
        message += `❌ ${error.message}<br>Contatta checchi@me.com per assistenza.`;
      }

      showBlock(message);
      return false;
    }
  };

  // AVVIO CONTROLLO
  console.log('🚀 DMS Auth Gate GitHub Auto inizializzato');
  checkAccess().then(success => {
    if (success) {
      console.log('✅ Accesso autorizzato - sessione attiva');
    } else {
      console.log('⏳ In attesa rilevamento automatico risposta GitHub');
    }
  });

  // Cleanup al cambio pagina
  window.addEventListener('beforeunload', () => {
    if (pollTimer) clearInterval(pollTimer);
    if (sessionTimer) clearInterval(sessionTimer);
  });

})();
