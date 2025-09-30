/* DMS Auth Gate (GitHub Pages) - VERSIONE PULITA */
(function(){
  const qs = new URLSearchParams(location.search);
  const email = (qs.get('email')||'').trim().toLowerCase();
  const token = (qs.get('token')||'').trim();
  const adminKey = (qs.get('admin')||'').trim();
  const WLURL = '/dms-gemello-news/landing/viewer/whitelist.json';
  
  // UNICA chiave admin valida
  const PERSONAL_ADMIN_KEY = 'checchi';

  // overlay di blocco
  const showBlock = (msg) => {
    const el = document.createElement('div');
    el.id = 'dmsLock';
    el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.92);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font:600 16px system-ui';
    el.innerHTML = `<div><div style="font-size:22px;margin-bottom:8px">🔒 Accesso Protetto</div>
    <div style="opacity:.9">${msg || 'Rispondi all\'email di invito da <b>checchi@me.com</b> per sbloccare 60 minuti.'}</div></div>`;
    document.body.appendChild(el);
  };
  
  const hideBlock = () => { 
    const x = document.getElementById('dmsLock'); 
    if(x) x.remove(); 
  };

  // CONTROLLO PRINCIPALE - LOGICA SEMPLICE E CHIARA
  const checkAccess = async () => {
    
    // 1. CONTROLLO ADMIN KEY - PRIORITÀ ASSOLUTA
    if (adminKey) {
      if (adminKey === PERSONAL_ADMIN_KEY) {
        hideBlock();
        return true; // ACCESSO GARANTITO
      } else {
        showBlock('🚫 Chiave admin non valida.<br>Usa il sistema email+token normale.');
        return false; // BLOCCATO
      }
    }
    
    // 2. CONTROLLO EMAIL+TOKEN - SISTEMA NORMALE
    if (!email || !token) {
      showBlock('🔗 Link incompleto.<br>Assicurati che contenga <b>?email=…&token=…</b>');
      return false; // BLOCCATO
    }
    
    // 3. VERIFICA WHITELIST
    try {
      const res = await fetch(WLURL + '?v=' + Date.now(), {cache:'no-store'});
      if (!res.ok) throw new Error('Fetch failed');
      
      const wl = await res.json();
      const now = new Date().toISOString();
      
      // Hash user agent per sicurezza
      const uaString = (navigator.userAgent || '') + '|' + (navigator.platform||'') + '|' + (navigator.language||'');
      const uaData = new TextEncoder().encode(uaString);
      const uaHashBuffer = await crypto.subtle.digest('SHA-256', uaData);
      const ua = 'sha256-' + Array.from(new Uint8Array(uaHashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
      
      const validSession = (wl.sessions||[]).find(s =>
        s.email?.toLowerCase() === email &&
        s.token === token &&
        s.expires > now &&
        (!s.ua || s.ua === ua)
      );
      
      if (validSession) {
        hideBlock();
        return true; // ACCESSO GARANTITO
      } else {
        showBlock('⏰ Sessione non attiva o scaduta.<br>Rispondi alla mail per sbloccare/estendere di 60 minuti.');
        return false; // BLOCCATO
      }
      
    } catch (error) {
      showBlock('🌐 Verifica accesso non disponibile.<br>Riprova fra qualche secondo.');
      return false; // BLOCCATO
    }
  };

  // AVVIO CONTROLLO
  checkAccess().then(success => {
    // Se admin key funziona, NON fare polling
    if (adminKey && adminKey === PERSONAL_ADMIN_KEY) {
      return; // STOP - Admin accesso garantito
    }
    
    // POLLING ogni 10 secondi SOLO per sistema email+token
    setInterval(checkAccess, 10000);
  });
  
})();
