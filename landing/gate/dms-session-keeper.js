// DMS Session Keeper – mantiene la sessione 60' in TUTTE le sezioni hash
(function(){
  const SS_KEY='dms/session';              // usato dal tuo gate
  const NAME_KEY='DMS/SESSION_JSON';       // backup in window.name
  const TTL=60*60;                          // 60 min in secondi
  const now=()=>Math.floor(Date.now()/1000);

  function read(){ try{return JSON.parse(sessionStorage.getItem(SS_KEY)||'null')}catch{return null} }
  function write(v){ v?sessionStorage.setItem(SS_KEY,JSON.stringify(v)):sessionStorage.removeItem(SS_KEY) }

  const qs=new URLSearchParams(location.search);
  if(qs.has('t')||qs.has('s')||qs.has('exp')){           // arrivo dal link col token
    const sess={
      sub:qs.get('sub')||null,
      jti:qs.get('jti')||null,
      scope:(qs.get('scope')||'').split(',').filter(Boolean),
      exp:parseInt(qs.get('exp')||'0',10) || (now()+TTL)
    };
    write(sess);
    try{ window.name = JSON.stringify({[NAME_KEY]:sess}); }catch{}
    ['t','s','exp','sub','jti','scope'].forEach(k=>qs.delete(k));
    history.replaceState({},'',location.pathname+(qs.toString()?('?'+qs.toString()):'')+location.hash);
  }

  let sess=read();
  if(!sess && window.name){                 // ripristina se perdi la sessione tra ancore/partial reload
    try{
      const o=JSON.parse(window.name);
      if(o && o[NAME_KEY] && o[NAME_KEY].exp>now()){ write(o[NAME_KEY]); sess=o[NAME_KEY]; }
    }catch{}
  }
  if(sess && sess.exp<=now()){ write(null); try{window.name='';}catch{} }
  window.DMS_SESSION={ get:()=>read(), clear:()=>{write(null); try{window.name='';}catch{}} };
})();
