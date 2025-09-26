/* DMS Auth Gate (GitHub Pages) */
(function(){
  const qs = new URLSearchParams(location.search);
  const email = (qs.get('email')||'').trim().toLowerCase();
  const token = (qs.get('token')||'').trim();
  const WLURL = '/dms-gemello-news/landing/viewer/whitelist.json';
  
  // IP Whitelist permanente per admin
  const ADMIN_IPS = [
    '172.225.99.108'  // Admin IP (iCloud Private Relay)
  ];

  // overlay
  const showBlock = (msg) => {
    const el = document.createElement('div');
    el.id = 'dmsLock';
    el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.92);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font:600 16px system-ui';
    el.innerHTML = `<div><div style="font-size:22px;margin-bottom:8px">Accesso protetto</div>
    <div style="opacity:.9">${msg || 'Rispondi all'email di invito da <b>checchi@me.com</b> per sbloccare 60 minuti.'}</div></div>`;
    document.body.appendChild(el);
  };
  const hideBlock = ()=>{ const x=document.getElementById('dmsLock'); if(x) x.remove(); };

  // Funzione per ottenere IP pubblico
  const getPublicIP = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (e) {
      return null;
    }
  };

  // Controllo IP admin prima di tutto
  const checkAdminIP = async () => {
    const userIP = await getPublicIP();
    if (userIP && ADMIN_IPS.includes(userIP)) {
      hideBlock();
      return true;
    }
    return false;
  };

  // param mancanti -> controlla IP admin, poi blocco
  if (!email || !token) {
    checkAdminIP().then(isAdmin => {
      if (!isAdmin) {
        showBlock('Link incompleto. Assicurati che contenga <b>?email=…&token=…</b>.');
      }
    });
    return;
  }

  const uaHash = async () => {
    const s = (navigator.userAgent || '') + '|' + (navigator.platform||'') + '|' + (navigator.language||'');
    const d = new TextEncoder().encode(s);
    const h = await crypto.subtle.digest('SHA-256', d);
    return 'sha256-' + Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
  };

  async function check(){
    // Prima controlla se è admin IP
    if (await checkAdminIP()) {
      return true;
    }
    
    try{
      const res = await fetch(WLURL + '?v=' + Date.now(), {cache:'no-store'});
      if(!res.ok) throw 0;
      const wl = await res.json();
      const now = new Date().toISOString();
      const ua = await uaHash();
      const ok = (wl.sessions||[]).find(s =>
        s.email?.toLowerCase()===email &&
        s.token===token &&
        s.expires>now &&
        (!s.ua || s.ua===ua)   // se ua non presente, accetta; se presente, deve combaciare
      );
      if (ok){ hideBlock(); return true; }
      showBlock('Sessione non attiva o scaduta.<br>Rispondi alla mail per sbloccare/estendere di 60 minuti.');
      return false;
    }catch(e){
      showBlock('Verifica accesso non disponibile. Riprova fra qualche secondo.');
      return false;
    }
  }

  // Prima verifica; poi poll ogni 10s (così si sblocca live dopo la tua Action)
  check();
  setInterval(check, 10000);
})();

