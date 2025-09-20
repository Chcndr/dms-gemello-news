// DMS Modal Lite — JS minimale e robusto
(function(){
  const $ = (s, el=document)=> el.querySelector(s);
  const $$ = (s, el=document)=> [...el.querySelectorAll(s)];
  const modal = $('#dmsModalLite');
  const frame = $('#dmsMlFrame');
  const closeBtn = $('.dms-ml__close', modal);
  if(!modal || !frame || !closeBtn){ console.warn('DMS Modal Lite: markup mancante'); return; }

  function lock(){ document.documentElement.classList.add('dms-ml-lock'); document.body.classList.add('dms-ml-lock'); }
  function unlock(){ document.documentElement.classList.remove('dms-ml-lock'); document.body.classList.remove('dms-ml-lock'); }

  let touchHandler;
  function enableBlock(){ touchHandler = (e)=>{ e.preventDefault(); }; modal.addEventListener('touchmove', touchHandler, {passive:false}); }
  function disableBlock(){ if(touchHandler) modal.removeEventListener('touchmove', touchHandler); }

  function cbUrl(url){ return url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now(); }

  function openModal(url){
    frame.src = cbUrl(url);
    modal.setAttribute('aria-hidden','false');
    lock(); enableBlock();
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    frame.src = 'about:blank';
    disableBlock(); unlock();
  }

  closeBtn.addEventListener('click', closeModal);
  $('.dms-ml__backdrop', modal).addEventListener('click', closeModal);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  // Cattura click ovunque ma solo su trigger noti; priorità alta (capture)
  function isTrigger(el){
    return el && (el.matches('a.pdfBtn, [data-pdf], [data-spot], button[data-pdf], button[data-spot]'));
  }

  document.addEventListener('click', (e)=>{
    const t = e.target.closest('a,button,[data-pdf],[data-spot]');
    if(!t || !isTrigger(t)) return;

    // Se ha href valido o data-*, apri nel modal e impedisci nuova tab
    let url = t.getAttribute('href');
    if (t.dataset.pdf) url = t.dataset.pdf;
    if (t.dataset.spot) url = t.dataset.spot;
    if (!url || url==='#') return;

    e.preventDefault(); e.stopPropagation();
    t.removeAttribute('target'); // neutralizza _blank
    openModal(url);
  }, true);

  // Hardening opzionale: non forziamo rewrite degli href esistenti (low impact)

})();