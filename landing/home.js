(function(){
  const N = 12;
  const BTN = 140;                 // lato card (px) – come nello ZIP buono
  const SAFE = 24;                 // margine di sicurezza da bordi e video
  const VIDEO_RATIO = 16/9;

  function layout(){
    const W = innerWidth, H = innerHeight;

    // Centro scena leggermente alto (come l'originale)
    const cx = W * 0.5;
    const cy = H * 0.52;

    // Dimensioni video centrato, mai troppo grande
    const maxVideoW = Math.min(W * 0.62, W - 2*(SAFE + BTN)); // non invadere i nodi
    const maxVideoH = Math.min(H * 0.42, H - 2*(SAFE + BTN));
    let vw = Math.min(maxVideoW, maxVideoH * VIDEO_RATIO);
    let vh = vw / VIDEO_RATIO;

    const videoLeft = cx - vw/2;
    const videoTop  = cy - vh/2;

    const vp = document.getElementById('viewport');
    vp.style.width  = vw + 'px';
    vp.style.height = vh + 'px';
    vp.style.left   = videoLeft + 'px';
    vp.style.top    = videoTop  + 'px';

    // Ellisse: assicura che nessun bottone esca dal bordo o tocchi il video
    const a = Math.min(
      cx - (SAFE + BTN/2),              // sinistra
      (W - cx) - (SAFE + BTN/2)         // destra
    );
    const b = Math.min(
      (videoTop - SAFE) - BTN/2,        // sopra il video
      (H - (videoTop + vh) - SAFE) - BTN/2  // sotto il video
    );

    // Se molto stretto, riduci un filo il video per fare spazio ai nodi
    if (a < BTN || b < BTN) {
      const shrink = 0.92;
      const nvw = vw * shrink, nvh = vh * shrink;
      vp.style.width = nvw + 'px';
      vp.style.height = nvh + 'px';
      vp.style.left = (cx - nvw/2) + 'px';
      vp.style.top  = (cy - nvh/2) + 'px';
      // ricalcola b con video più piccolo
      const vTop = cy - nvh/2;
      const b = Math.min((vTop - SAFE) - BTN/2, (H - (vTop + nvh) - SAFE) - BTN/2);
    }

    // Posizionamento nodi – sincrono, nessun flash a (0,0)
    const nodes = document.querySelectorAll('.node');
    nodes.forEach((el, i) => {
      const t = -Math.PI/2 + (2*Math.PI*i)/N;
      const x = cx + a * Math.cos(t) - BTN/2;
      const y = cy + b * Math.sin(t) - BTN/2;
      el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
      el.style.width = el.style.height = BTN + 'px';
    });
  }

  // Esegui subito e ad ogni resize/pageshow
  layout();
  addEventListener('resize', layout, {passive:true});
  addEventListener('pageshow', layout);
})();

// spotlight leggero (rAF)
(function(){
  const glow = document.getElementById('glowLayer');
  let mx=0, my=0, ticking=false;
  addEventListener('pointermove', e => {
    mx=e.clientX; my=e.clientY;
    if(!ticking){
      requestAnimationFrame(()=>{ 
        glow.style.setProperty('--mx', mx+'px');
        glow.style.setProperty('--my', my+'px');
        ticking=false;
      });
      ticking=true;
    }
  }, {passive:true});
})();

// Puntale lancetta
(function(){
  const tip = document.getElementById('handTip');
  function placeTip(x, y){ tip.style.transform = `translate(${x-5}px,${y-5}px)`; }
  
  // Animazione lancetta con puntale
  let start = null;
  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const T = 12000; // 12 secondi per giro completo
    const angle = -Math.PI/2 + (2 * Math.PI * (elapsed % T)) / T;
    
    const W = innerWidth, H = innerHeight;
    const cx = W * 0.5, cy = H * 0.52;
    const radius = Math.min(W * 0.3, H * 0.25);
    
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    
    placeTip(x, y);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

