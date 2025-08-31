(() => {
  const N = 12;

  function ensureNodes(){
    const current = document.querySelectorAll('.node');
    if (current.length === N) return current;

    // rimuovi eventuali duplicati/sporco
    current.forEach(n => n.remove());

    // crea in memoria con posizioni già calcolate
    const frag = document.createDocumentFragment();
    const { positions } = computeLayout();

    for (let i=0; i<N; i++){
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'node';
      b.dataset.i = i;
      b.innerHTML = '<span class="tag">PDF</span>';
      b.style.left = positions[i].x + 'px';
      b.style.top  = positions[i].y + 'px';
      frag.appendChild(b);
    }
    document.body.appendChild(frag);
    return document.querySelectorAll('.node');
  }

  function computeLayout(){
    const W = innerWidth, H = innerHeight;
    const root = document.documentElement;
    const BTN = parseFloat(getComputedStyle(root).getPropertyValue('--btnW')) || 140;

    // centro leggermente sopra-metà, come design originale
    const cx = W * 0.5;
    const cy = H * 0.52;

    // margini di sicurezza: niente pulsanti fuori schermo e lontani dal video
    const SAFE = 28;          // dai bordi schermo
    const VSAFE_TOP = 16;     // sopra viewport
    const VSAFE_SIDE = 24;    // lato viewport
    const VSAFE_BOTTOM = 32;  // sotto viewport

    // dimensioni viewport (match CSS clamp 56vw con ratio 16:9)
    const vw = Math.min(Math.max(720, 0.56*W), 1120);
    const vh = vw * 9/16;

    // semiassi ellisse, limitati da schermo e viewport + safe
    const a = Math.min(W*0.36, (W/2 - BTN*0.7 - SAFE), (W - vw)/2 - VSAFE_SIDE);
    const b = Math.min(H*0.28, (H/2 - BTN*0.7 - SAFE), (H - vh)/2 - Math.max(VSAFE_TOP, VSAFE_BOTTOM));

    const positions = [];
    for (let i=0; i<N; i++){
      const t = -Math.PI/2 + i * (2*Math.PI/N);
      const x = Math.round(cx + a*Math.cos(t) - BTN/2);
      const y = Math.round(cy + b*Math.sin(t) - BTN/2);
      positions.push({x,y});
    }
    return { positions };
  }

  function relayout(){
    const nodes = document.querySelectorAll('.node');
    const { positions } = computeLayout();
    nodes.forEach((el,i) => {
      el.style.left = positions[i].x + 'px';
      el.style.top  = positions[i].y + 'px';
    });
  }

  function boot(){
    ensureNodes();   // crea già posizionati → niente flash
    relayout();      // calcolo finale
  }

  // eventi
  addEventListener('resize', debounce(relayout, 80), {passive:true});
  addEventListener('orientationchange', () => setTimeout(relayout, 250), {passive:true});
  addEventListener('pageshow', () => setTimeout(relayout, 0)); // bfcache Safari
  document.addEventListener('DOMContentLoaded', boot);

  function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }
})();

