(function(){
  if (window.__pathHotfix) return; window.__pathHotfix = true;

  const CANON = {
    home:  'landing/home.html',
    spot:  'landing/spot.html',
    mappa: 'landing/mappa-ministeri.html'
  };

  function normHref(href){
    if(!href) return href;
    // rimuovi slash iniziale che su Pages manda fuori repo
    href = href.replace(/^\/+/, '');

    // SPOT: vecchi target comuni
    if (/^(spot\.html|spot\/index\.html|landing\/spot\/index\.html)$/i.test(href)) return CANON.spot;

    // MAPPA: varianti storiche
    if (/^(mappa\.html|landing\/ministeri\/index\.html|landing\/mappa-ministeri\.html)$/i.test(href)) return CANON.mappa;

    // HOME: varianti
    if (/^(index\.html|home\.html|landing\/home\.html|landing\/index\.html)$/i.test(href)) return CANON.home;

    return href;
  }

  // Riscrivi tutti i link "navigazione" noti
  document.querySelectorAll('a[href]').forEach(a=>{
    const h = a.getAttribute('href');
    const nh = normHref(h);
    if (nh !== h) a.setAttribute('href', nh + (nh.includes('?') ? '&' : '?') + 'v=finale-002');
  });

  // Aggiungi una mini-nav di emergenza in alto (non invasiva)
  if (!document.getElementById('safe-nav')) {
    const d = document.createElement('div');
    d.id = 'safe-nav';
    d.style.cssText = 'position:sticky;top:0;z-index:9999;background:#fff;border-bottom:1px solid #eee;padding:6px 10px;font:14px system-ui';
    d.innerHTML = `
      <a href="${CANON.home}?v=finale-002">Home</a> ·
      <a href="${CANON.spot}?v=finale-002">Spot</a> ·
      <a href="${CANON.mappa}?v=finale-002">Mappa</a>`;
    document.body.insertBefore(d, document.body.firstChild);
  }

  console.log('[path-hotfix] applied');
})();
