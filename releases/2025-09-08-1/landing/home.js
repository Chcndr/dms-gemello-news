(function(){
  const RATIO = 16/9;                // video
  const BTN   = 140;                 // lato pulsante (px)
  const SAFE  = 44;                  // margine di sicurezza (px)
  const N     = 12;

  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function layout(){
    const W  = innerWidth, H = innerHeight;
    const cx = W * 0.50;
    const cy = H * 0.52;

    // Spazio utile per i NODI dal centro ai bordi (senza video)
    const Aroom = Math.min(cx, W-cx) - (SAFE + BTN/2);   // semi-asse orizzontale massimo
    const Broom = Math.min(cy, H-cy) - (SAFE + BTN/2);   // semi-asse verticale massimo

    // Dimensioni video massime tenendo conto che ai nodi serve spazio sopra/sotto e dx/sx
    // vincolo verticale: dopo aver piazzato il video, deve rimanere almeno BTN/2 + SAFE
    // sopra e sotto per i nodi → vh <= 2*(Broom - (BTN/2 + SAFE))
    let vhMaxFromNodes = 2 * (Broom - (BTN/2 + SAFE));
    // vincolo orizzontale simile
    let vwMaxFromNodes = 2 * (Aroom - (BTN/2 + SAFE));

    // limiti estetici generali del video
    const vhMaxSoft = H * 0.42;
    const vwMaxSoft = W * 0.62;

    // prima scegliamo vh, poi adeguiamo vw al RATIO e ricalcoliamo se serve
    let vh = clamp(vhMaxFromNodes, 180, vhMaxSoft);
    let vw = Math.min(vh * RATIO, vwMaxSoft, vwMaxFromNodes);

    // se l'orizzontale è stretto, ricalcola vh dal limite orizzontale
    if (vw > vwMaxFromNodes) {
      vw = vwMaxFromNodes;
      vh = vw / RATIO;
    }

    // Se per qualsiasi motivo resta poco spazio ai nodi, riduci finché basta
    for (let k=0; k<8; k++){
      const topClear    = (cy - vh/2) - (SAFE + BTN/2);
      const bottomClear = (H - (cy + vh/2)) - (SAFE + BTN/2);
      if (Math.min(topClear, bottomClear) >= BTN*0.80) break; // spazio ok
      vh *= 0.92; vw = vh * RATIO;
    }

    // Applica il video centrato
    const vp = document.getElementById('viewport');
    vp.style.width  = vw + 'px';
    vp.style.height = vh + 'px';
    vp.style.left   = (cx - vw/2) + 'px';
    vp.style.top    = (cy - vh/2) + 'px';

    // Semi-assi ellisse per i nodi, garantiti fuori dal rettangolo video
    const a = Aroom;
    const b = Math.min(
      (cy - vh/2) - (SAFE + BTN/2),
      (H - (cy + vh/2)) - (SAFE + BTN/2)
    );

    // Posiziona i 12 pulsanti senza animazioni/flash
    const nodes = document.querySelectorAll('.node');
    nodes.forEach((el, i) => {
      const t = -Math.PI/2 + (2*Math.PI*i)/N;
      const x = cx + a * Math.cos(t) - BTN/2;
      const y = cy + b * Math.sin(t) - BTN/2;
      el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
      el.style.width = el.style.height = BTN + 'px';
    });
  }

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

