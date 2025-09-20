// DMS Spot Hardener — forza apertura in-page + cleanup
(function(){
  const SEL_TRIGGERS = 'a.pdfBtn, button.pdfBtn, [data-pdf], [data-spot]';

  const $ = (s, el=document)=> el.querySelector(s);
  const $$ = (s, el=document)=> Array.from(el.querySelectorAll(s));

  // 0) CLEANUP badge/scritte (safe)
  const BAD = ['#pdf-enforcer','.pdf-enforcer','.pdfEnforcer','.print-guard','.printGuard','.pdf-watermark','.viewer-status','.debug-label'];
  function cleanBad(root=document){
    BAD.forEach(s => $$(s, root).forEach(n => n.remove()));
  }
  cleanBad();

  // 1) Ensure modal exists (reuse existing Modal Lite if present)
  function ensureModal(){
    let modal = $('#dmsModalLite') || $('#pdfModal');
    let frame = $('#dmsMlFrame') || $('#pdfFrame');
    let closeBtn = modal && modal.querySelector('.dms-ml__close, .dms-modal__close');
    if (modal && frame && closeBtn) return {modal, frame, closeBtn, variant: 'existing'};

    // Inject minimal modal if none
    modal = document.createElement('div');
    modal.id = 'dmsModalLite';
    modal.className = 'dms-ml';
    modal.setAttribute('aria-hidden','true');
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.innerHTML = `
      <div class="dms-ml__backdrop"></div>
      <div class="dms-ml__dialog" role="document">
        <button class="dms-ml__close" aria-label="Chiudi">×</button>
        <iframe id="dmsMlFrame" class="dms-ml__frame" title="Viewer"></iframe>
      </div>`;
    document.body.appendChild(modal);
    frame = $('#dmsMlFrame');
    closeBtn = $('.dms-ml__close', modal);

    // Minimal CSS (inline) — low impact
    const css = document.createElement('style');
    css.textContent = `
      .dms-ml{position:fixed;inset:0;display:none}
      .dms-ml[aria-hidden="false"]{display:block}
      .dms-ml__backdrop{position:absolute;inset:0;background:#0007}
      .dms-ml__dialog{position:absolute;left:3dvw;right:3dvw;top:6dvh;bottom:6dvh;background:#0b0e14;border:1px solid #1e2636;border-radius:12px;box-shadow:0 10px 40px #000a;display:flex;flex-direction:column;overflow:hidden;min-height:60dvh}
      .dms-ml__close{position:absolute;top:8px;right:8px;z-index:2;background:#121826;border:1px solid #1e2636;color:#eaeefb;border-radius:10px;padding:6px 10px;cursor:pointer}
      .dms-ml__frame{flex:1;width:100%;min-height:50dvh;border:0;background:#111}
      html.dms-ml-lock,body.dms-ml-lock{height:100%;overflow:hidden;overscroll-behavior:none}
    `;
    document.head.appendChild(css);

    return {modal, frame, closeBtn, variant: 'injected'};
  }

  const modalRefs = ensureModal();
  function lock(){ document.documentElement.classList.add('dms-ml-lock'); document.body.classList.add('dms-ml-lock'); }
  function unlock(){ document.documentElement.classList.remove('dms-ml-lock'); document.body.classList.remove('dms-ml-lock'); }

  let touchHandler;
  function enableBlock(){ touchHandler = (e)=>{ e.preventDefault(); }; modalRefs.modal.addEventListener('touchmove', touchHandler, {passive:false}); }
  function disableBlock(){ if(touchHandler) modalRefs.modal.removeEventListener('touchmove', touchHandler); }

  function cbUrl(url){ return url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now(); }

  function openModal(url){
    modalRefs.frame.src = cbUrl(url);
    modalRefs.modal.setAttribute('aria-hidden','false');
    lock(); enableBlock();
  }
  function closeModal(){
    modalRefs.modal.setAttribute('aria-hidden','true');
    modalRefs.frame.src = 'about:blank';
    disableBlock(); unlock();
  }

  modalRefs.closeBtn.addEventListener('click', closeModal);
  (modalRefs.modal.querySelector('.dms-ml__backdrop')||modalRefs.modal).addEventListener('click', (e)=>{
    if (e.target.classList.contains('dms-ml__backdrop')) closeModal();
  });
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  // 2) Normalize problematic buttons/links (spot + orologio)
  function normalizeTriggers(scope=document){
    $$(SEL_TRIGGERS, scope).forEach(el => {
      // prefer data-pdf/spot, fallback a href
      const href = el.getAttribute('href');
      if (!el.dataset.pdf && !el.dataset.spot && href && href !== '#') {
        if (!href.startsWith('#')) el.dataset.pdf = href;
      }
    });
  }
  normalizeTriggers();

  // 3) Intercetta TUTTI i click su triggers e forza in-page (capture=true)
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('a,button,[data-pdf],[data-spot]');
    if (!t || !t.matches(SEL_TRIGGERS)) return;

    let url = t.dataset.pdf || t.dataset.spot || t.getAttribute('href');
    if (!url || url==='#' || url.startsWith('javascript:')) return;

    e.preventDefault(); e.stopPropagation();
    t.removeAttribute('target'); // evita nuova tab
    openModal(url);
  }, true);

  // 4) Pulizia badge anche dentro iframe (same-origin)
  ['#dmsMlFrame','#pdfFrame','#viewerFrame'].forEach(id=>{
    const fr = document.querySelector(id);
    if (!fr) return;
    fr.addEventListener('load', ()=>{
      try { cleanBad(fr.contentDocument || fr.contentWindow.document); } catch(_){}
    });
  });

  // 5) Re-normalizza se la pagina cambia dinamicamente
  const mo = new MutationObserver(()=> normalizeTriggers());
  mo.observe(document.documentElement, {childList:true, subtree:true});

})();