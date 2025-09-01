(function(){
  const root = document.documentElement;
  const vp   = document.getElementById('viewport');
  const hero = document.getElementById('hero');
  const video= hero?.querySelector('video');
  const panel= document.getElementById('panel');
  const back = document.getElementById('backToVideo');
  const t=document.getElementById('p-title'), s=document.getElementById('p-sub'), d=document.getElementById('p-desc');
  const cta=[0,1,2,3].map(i=>document.getElementById('cta'+i));

  function setSizeFromHero(){
    const r = (video || vp).getBoundingClientRect();
    root.style.setProperty('--vw', r.width + 'px');
    root.style.setProperty('--vh', r.height + 'px');
    // fallback duro contro CSS non caricato
    panel.style.width  = r.width + 'px';
    panel.style.height = r.height + 'px';
  }
  setSizeFromHero();
  addEventListener('resize', setSizeFromHero);
  addEventListener('pageshow', setSizeFromHero);
  if ('ResizeObserver' in window && video){
    new ResizeObserver(setSizeFromHero).observe(video);
  }

  const MODULES=[{
    title:"DMS — Riaccendiamo il Commercio",
    sub:"Visione, gemello nazionale del commercio",
    desc:"L'infrastruttura tecnologica per una rivoluzione digitale nei settori del commercio, turismo e servizi.",
    links:[
      {href:"./docs/PROGETTO NAZIONALE.pdf", text:"Apri documento principale (PDF)"},
      {href:"./docs/HUB URBANI E DI PROSSIMITÀ.pdf", text:"Hub Nazionale del Commercio (PDF)"},
      {href:"./docs/DMS & CLUST-ER.pdf", text:"DMS & CLUST-ER (PDF)"},
      {href:"./docs/DMS ECC — Executive.pdf", text:"DMS ECC — Executive (PDF)"}
    ]
  }];

  function openPanel(i, nodeEl){
    const hc = getComputedStyle(nodeEl).getPropertyValue('--hc').trim()
            || getComputedStyle(root).getPropertyValue(`--hc${i}`).trim()
            || '#14b8a6';
    root.style.setProperty('--accent', hc);

    const m = MODULES[i] || MODULES[0];
    t.textContent = m.title; s.textContent = m.sub || ''; d.textContent = m.desc || '';
    cta.forEach((a,k)=>{ const L=m.links?.[k]; if(L){ a.hidden=false; a.href=L.href; a.querySelector('.txt').textContent=L.text; } else { a.hidden=true; } });

    hero.hidden=true; panel.hidden=false; document.body.classList.add('is-panel-open');
    setSizeFromHero();
  }
  function closePanel(){ panel.hidden=true; hero.hidden=false; document.body.classList.remove('is-panel-open'); setSizeFromHero(); }
  back?.addEventListener('click', closePanel);

  document.querySelectorAll('.node').forEach((el,idx)=>{
    el.addEventListener('click', (e)=>{ e.preventDefault(); openPanel(idx, el); }, {passive:false});
  });
})();

