(function(){
  const viewport = document.getElementById('viewport');

  function setViewportSizeFromHero(){
    const hero = document.getElementById('hero') || viewport;
    const r = hero.getBoundingClientRect();
    viewport.style.setProperty('--vw', Math.round(r.width)  + 'px');
    viewport.style.setProperty('--vh', Math.round(r.height) + 'px');
  }

  // Call allineamento su load/resize
  window.addEventListener('load', setViewportSizeFromHero, {once:true});
  window.addEventListener('resize', ()=>requestAnimationFrame(setViewportSizeFromHero));

  // Render del pannello (accetta accent colore)
  function renderPanel(mod, accent){
    return `
      <div class="panel" style="--accent:${accent}">
        <!-- (opzionale, per dopo) <button class="expand" data-expand>⤢</button> -->
        ${mod.html || ''}
      </div>`;
  }

  async function loadModules(){
    try{ const r = await fetch('./data/modules.json'); return r.ok ? r.json() : []; }
    catch{ return []; }
  }

  async function openPanelByIndex(i, accent){
    // Misura PRIMA di sostituire il contenuto
    setViewportSizeFromHero();

    const data = await loadModules();
    const m = data.find(x => +x.id === +i) || { title: 'Modulo ' + (i+1), html:'' };

    // Sostituisci il video col pannello mantenendo la misura del video
    viewport.innerHTML = renderPanel(m, accent);

    // (Toggle fullscreen pronto ma DISABILITATO)
    const exp = viewport.querySelector('[data-expand]');
    if (exp){
      exp.addEventListener('click', (e)=>{
        e.preventDefault();
        // toggle semplice: full viewport
        const p = viewport.querySelector('.panel');
        const full = p.hasAttribute('data-full');
        p.toggleAttribute('data-full', !full);
        if (!full){
          p.style.width  = 'min(96vw, 1200px)';
          p.style.height = 'min(86vh, 820px)';
        } else {
          p.style.width  = getComputedStyle(viewport).getPropertyValue('--vw');
          p.style.height = getComputedStyle(viewport).getPropertyValue('--vh');
        }
      });
    }
  }

  // Click sui 12 pulsanti: passa il colore del tasto come accent
  document.querySelectorAll('.node').forEach((btn, i)=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const hc = getComputedStyle(btn).getPropertyValue('--hc').trim() || '#14b8a6';
      openPanelByIndex(i, hc);
    });
  });
})();

