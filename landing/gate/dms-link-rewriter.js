// DMS Link Rewriter – tiene tutto dentro la shell hash e apre i PDF col viewer protetto
(function(){
  const REPO_BASE = '/dms-gemello-news';
  const SECURE_VIEWER = REPO_BASE + '/landing/secure/pdf.html?f=';

  function rewrite(root){
    (root||document).querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href'); if(!href) return;

      // PDF → passano dal viewer protetto
      if(/\.(pdf)$/i.test(href)){
        const abs = href.startsWith('http') ? href : (REPO_BASE + (href.startsWith('/')?'':'/') + href.replace(/^\.?\//,''));
        a.setAttribute('href', SECURE_VIEWER+encodeURIComponent(abs));
        return;
      }
      // Pagine interne comuni → forzate in hash (se qualcuno ha messo link "piena pagina")
      const map={
        [REPO_BASE+'/']:'#/home', [REPO_BASE+'/index.html']:'#/home',
        [REPO_BASE+'/spot/']:'#/spot', [REPO_BASE+'/spot/index.html']:'#/spot',
        [REPO_BASE+'/mappe/']:'#/mappe', [REPO_BASE+'/mappe/index.html']:'#/mappe'
      };
      const url=new URL(href, location.origin);
      if(map[url.pathname]) a.setAttribute('href', map[url.pathname]);
    });
  }
  document.addEventListener('DOMContentLoaded',()=>rewrite(document));
})();
