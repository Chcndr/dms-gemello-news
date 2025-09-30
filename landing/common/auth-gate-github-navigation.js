/*
 * DMS Auth Gate - Sistema GitHub con Navigazione Libera
 * Permette navigazione libera tra le pagine una volta autenticato
 * Mantiene il countdown globale su tutte le pagine
 */

(function() {
  'use strict';

  // Configurazione
  const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';
  const PERSONAL_ADMIN_KEY = 'checchi';
  const GITHUB_API_BASE = 'https://api.github.com';
  const POLL_INTERVAL = 15000; // 15 secondi
  const SESSION_DURATION = 3600; // 60 minuti
  const MAX_POLL_ATTEMPTS = 240; // 1 ora di polling

  // Estrai parametri URL
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get('t');
  const adminKey = urlParams.get('admin');

  let pollTimer = null;
  let sessionTimer = null;
  let pollAttempts = 0;

  // Funzioni utility UI
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

  // Verifica sessione attiva GLOBALE (funziona su tutte le pagine)
  function checkGlobalActiveSession() {
    // Cerca tutte le sessioni attive nel localStorage
    const allKeys = Object.keys(localStorage);
    const sessionKeys = allKeys.filter(key => key.startsWith('dms_session_'));
    
    for (const sessionKey of sessionKeys) {
      try {
        const sessionData = localStorage.getItem(sessionKey);
        if (!sessionData) continue;
        
        const session = JSON.parse(sessionData);
        
        // Verifica scadenza
        const now = Math.floor(Date.now() / 1000);
        if (session.exp < now) {
          localStorage.removeItem(sessionKey);
          continue;
        }

        // Verifica device fingerprint
        const deviceFingerprint = generateDeviceFingerprint();
        if (session.device !== deviceFingerprint) {
          continue;
        }

        console.log('✅ Sessione globale attiva trovata:', session);
        return session;
      } catch (error) {
        localStorage.removeItem(sessionKey);
        continue;
      }
    }
    
    return null;
  }

  // Chiamata GitHub API per controllare commenti Issue
  async function checkGitHubIssueComments(repo, issueNumber, responseCode, githubToken) {
    try {
      console.log(`🔍 Controllo GitHub Issue #${issueNumber} su ${repo}`);
      
      const url = `${GITHUB_API_BASE}/repos/${repo}/issues/${issueNumber}/comments`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DMS-Auth-System/1.0'
      };

      // Aggiungi token se disponibile
      if (githubToken && githubToken !== 'ghp_auto_response_token') {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ Issue non trovato o repository privato');
          return null;
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const comments = await response.json();
      console.log(`📝 Trovati ${comments.length} commenti`);

      // Cerca commento con codice risposta
      for (const comment of comments) {
        const commentBody = comment.body.toLowerCase();
        const searchCode = responseCode.toLowerCase();
        
        // Verifica se il commento contiene il codice risposta
        if (commentBody.includes(searchCode) || 
            commentBody.includes('ok') || 
            commentBody.includes('si') || 
            commentBody.includes('sì') ||
            commentBody.includes('confermo') ||
            commentBody.length < 10) { // Risposta breve considerata valida
          
          console.log('✅ Risposta valida trovata!');
          console.log('👤 Utente:', comment.user.login);
          console.log('💬 Commento:', comment.body);
          console.log('⏰ Data:', comment.created_at);
          
          return {
            comment_id: comment.id,
            user: comment.user.login,
            body: comment.body,
            created_at: comment.created_at,
            response_code: responseCode,
            detected_at: new Date().toISOString()
          };
        }
      }

      console.log('❌ Nessuna risposta valida trovata');
      return null;

    } catch (error) {
      console.error('❌ Errore controllo GitHub:', error);
      
      // Fallback: controlla localStorage per test
      const responseKey = `dms_github_response_${responseCode}`;
      const localResponse = localStorage.getItem(responseKey);
      
      if (localResponse) {
        try {
          const responseData = JSON.parse(localResponse);
          console.log('✅ Risposta trovata in localStorage (fallback)');
          return responseData;
        } catch (e) {
          localStorage.removeItem(responseKey);
        }
      }
      
      return null;
    }
  }

  // Attiva sessione automaticamente
  function activateGitHubSession(payload, responseData, deviceFingerprint) {
    const now = Math.floor(Date.now() / 1000);
    const sessionEntry = {
      sub: payload.sub,
      jti: payload.jti,
      scope: payload.scope || ['news-private'],
      exp: now + SESSION_DURATION,
      device: deviceFingerprint,
      activated_at: new Date().toISOString(),
      response_code: responseData.response_code,
      github_auto: true,
      github_response: responseData,
      github_repo: payload.github_repo,
      github_issue: payload.github_issue
    };

    // Salva sessione attiva
    const sessionKey = `dms_session_${payload.jti || payload.sub}`;
    localStorage.setItem(sessionKey, JSON.stringify(sessionEntry));
    
    console.log('🎉 Sessione GitHub attivata automaticamente');
    return sessionEntry;
  }

  // Avvia countdown sessione GLOBALE
  function startGlobalSessionCountdown(session) {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = session.exp - now;
      
      if (remaining <= 0) {
        // Sessione scaduta
        clearInterval(sessionTimer);
        sessionTimer = null;
        
        showBlock(
          '⏰ Sessione scaduta (60 minuti).<br>' +
          '📧 <strong>Commenta di nuovo l\'Issue GitHub</strong> per riattivare l\'accesso.<br>' +
          '<small>Vai su GitHub e aggiungi un commento all\'Issue.</small>',
          false
        );
        
        // Rimuovi sessione scaduta
        const sessionKey = `dms_session_${session.jti || session.sub}`;
        localStorage.removeItem(sessionKey);
        
        return;
      }
      
      // Aggiorna titolo pagina con countdown GLOBALE
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const originalTitle = document.title.replace(/ \(\d+:\d+\).*$/, '');
      document.title = `${originalTitle} (${minutes}:${seconds.toString().padStart(2, '0')})`;
    };
    
    sessionTimer = setInterval(updateCountdown, 1000);
    updateCountdown(); // Prima esecuzione immediata
  }

  // Polling GitHub per risposte automatiche
  function startGitHubPolling(email, responseCode, jti, deviceFingerprint, githubRepo, githubIssue, githubToken) {
    pollAttempts = 0;
    
    console.log('🚀 Avvio polling GitHub per rilevamento automatico');
    console.log('📋 Repository:', githubRepo);
    console.log('🔢 Issue:', githubIssue);
    console.log('🔑 Codice risposta:', responseCode);
    
    pollTimer = setInterval(async () => {
      pollAttempts++;
      
      console.log(`🔍 Controllo GitHub automatico (${pollAttempts}/${MAX_POLL_ATTEMPTS})`);
      
      const response = await checkGitHubIssueComments(githubRepo, githubIssue, responseCode, githubToken);
      
      if (response) {
        // Risposta trovata automaticamente!
        clearInterval(pollTimer);
        pollTimer = null;
        
        const session = activateGitHubSession({ sub: email, jti: jti, github_repo: githubRepo, github_issue: githubIssue }, response, deviceFingerprint);
        
        updateBlockMessage('✅ Risposta GitHub rilevata automaticamente!<br>Attivazione in corso...', false);
        
        setTimeout(() => {
          hideBlock();
          startGlobalSessionCountdown(session);
          console.log('🎉 Accesso autorizzato automaticamente via GitHub');
        }, 2000);
        
        return;
      }
      
      // Aggiorna messaggio con progress
      const progress = (pollAttempts / MAX_POLL_ATTEMPTS) * 100;
      const remainingMinutes = Math.floor((MAX_POLL_ATTEMPTS - pollAttempts) * POLL_INTERVAL / 60000);
      
      updateBlockMessage(
        `🔍 Rilevamento automatico risposta GitHub in corso...<br>` +
        `<small>Commenta l'Issue GitHub #${githubIssue} per sbloccare l'accesso.<br>` +
        `Repository: <strong>${githubRepo}</strong><br>` +
        `Timeout tra ${remainingMinutes} minuti.</small>`, 
        true, true, progress
      );
      
      if (pollAttempts >= MAX_POLL_ATTEMPTS) {
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

  // Controllo principale con NAVIGAZIONE LIBERA
  const checkAccess = async () => {
    
    console.log('🔍 DMS Auth Gate Navigation - Controllo accesso:', {
      jwtToken: jwtToken ? `${jwtToken.substring(0, 20)}...` : null,
      adminKey: adminKey,
      url: window.location.href
    });

    // 1. CONTROLLO ADMIN KEY (fallback)
    if (adminKey) {
      if (adminKey === PERSONAL_ADMIN_KEY) {
        console.log('✅ Admin key valida - accesso garantito');
        hideBlock();
        document.title = document.title.replace(/ \(\d+:\d+\).*$/, '') + ' (Admin)';
        return true;
      } else {
        console.log('❌ Admin key non valida:', adminKey);
        showBlock('🚫 Chiave admin non valida.<br>Usa il sistema JWT normale.');
        return false;
      }
    }

    // 2. CONTROLLO SESSIONE GLOBALE ATTIVA (priorità massima)
    const globalSession = checkGlobalActiveSession();
    if (globalSession) {
      console.log('🎉 Sessione globale attiva - navigazione libera');
      hideBlock();
      startGlobalSessionCountdown(globalSession);
      return true;
    }

    // 3. CONTROLLO JWT TOKEN (solo se non c'è sessione attiva)
    if (!jwtToken) {
      console.log('❌ Nessun token JWT fornito e nessuna sessione attiva');
      showBlock('🔑 Token JWT richiesto.<br>Richiedi un link valido a checchi@me.com');
      return false;
    }

    try {
      // Verifica firma JWT
      console.log('🔐 Verifica firma JWT...');
      const payload = await verifyJWT(jwtToken, JWT_SECRET);
      console.log('✅ JWT valido:', payload);

      // Verifica se è un token GitHub automatico
      if (!payload.github_auto) {
        console.log('❌ Token non configurato per GitHub automatico');
        showBlock('🔧 Token non compatibile con sistema GitHub automatico.<br>Richiedi un nuovo link a checchi@me.com');
        return false;
      }

      if (!payload.github_repo || !payload.github_issue) {
        console.log('❌ Informazioni GitHub mancanti nel token');
        showBlock('🔧 Token GitHub incompleto.<br>Richiedi un nuovo link a checchi@me.com');
        return false;
      }

      // Genera device fingerprint
      const deviceFingerprint = generateDeviceFingerprint();
      console.log('📱 Device fingerprint:', deviceFingerprint);

      // Genera codice di risposta automatico
      const responseCode = generateResponseCode(payload.sub, payload.jti, deviceFingerprint);
      console.log('🔑 Codice risposta generato:', responseCode);

      // Controlla se c'è già una risposta GitHub
      const existingResponse = await checkGitHubIssueComments(
        payload.github_repo, 
        payload.github_issue, 
        responseCode,
        payload.github_token
      );
      
      if (existingResponse) {
        console.log('✅ Risposta GitHub già presente');
        const session = activateGitHubSession(payload, existingResponse, deviceFingerprint);
        hideBlock();
        startGlobalSessionCountdown(session);
        return true;
      }

      // Nessuna risposta ancora - avvia rilevamento automatico GitHub
      console.log('⏳ Avvio rilevamento automatico risposte GitHub');
      
      showBlock(
        `🔍 Rilevamento automatico risposta GitHub in corso...<br>` +
        `<small>Commenta l'Issue GitHub #${payload.github_issue} per sbloccare l'accesso.<br>` +
        `Repository: <strong>${payload.github_repo}</strong></small>`, 
        true, true, 0
      );

      // Avvia polling GitHub automatico
      startGitHubPolling(
        payload.sub, 
        responseCode, 
        payload.jti, 
        deviceFingerprint, 
        payload.github_repo, 
        payload.github_issue,
        payload.github_token
      );
      
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
  console.log('🚀 DMS Auth Gate Navigation inizializzato');
  checkAccess().then(success => {
    if (success) {
      console.log('✅ Accesso autorizzato - navigazione libera attiva');
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
