/* DMS Auth Gate (GitHub Pages) */
(function(){
  const qs = new URLSearchParams(location.search);
  const email = (qs.get('email')||'').trim().toLowerCase();
  const token = (qs.get('token')||'').trim();
  const adminKey = (qs.get('admin')||'').trim();
  const WLURL = '/dms-gemello-news/landing/viewer/whitelist.json';
  
  // Codice admin segreto per accesso permanente
  const ADMIN_SECRET = 'dms-gemello-2025-admin-key-secure';

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

  // Controllo admin key per accesso permanente
  const checkAdminKey = () => {
    if (adminKey === ADMIN_SECRET) {
      hideBlock();
      return true;
    }
    return false;
  };

  // Controllo admin key prima di tutto
  if (checkAdminKey()) {
    return; // Accesso admin garantito
  }

  // param mancanti -> blocco (solo se non admin)
  if (!email || !token) {
    showBlock('Link incompleto. Assicurati che contenga <b>?email=…&token=…</b> oppure usa il link admin.');
    return;
  }

  const uaHash = async () => {
    const s = (navigator.userAgent || '') + '|' + (navigator.platform||'') + '|' + (navigator.language||'');
    const d = new TextEncoder().encode(s);
    const h = await crypto.subtle.digest('SHA-256', d);
    return 'sha256-' + Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
  };

  async function check(){
    // Prima controlla se è admin key
    if (checkAdminKey()) {
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

