// ===== util =====
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// spotlight semplice (leggero)
(function spotlight(){
  const g = $("#glowLayer");
  const s = document.createElement("div");
  Object.assign(s.style,{
    position:"absolute", inset:"0", pointerEvents:"none",
    background:"radial-gradient(240px 240px at 50% 50%, rgba(20,184,166,.22), transparent 60%)",
    opacity:0, transition:"opacity .15s ease"
  });
  g.appendChild(s);
  const move = e=>{
    const x = (e.touches? e.touches[0].clientX : e.clientX) || innerWidth/2;
    const y = (e.touches? e.touches[0].clientY : e.clientY) || innerHeight/2;
    s.style.background = `radial-gradient(240px 240px at ${x}px ${y}px, rgba(20,184,166,.22), transparent 60%)`;
    s.style.opacity = .9;
  };
  addEventListener("pointermove", move, {passive:true});
  addEventListener("pointerleave", ()=> s.style.opacity = 0);
})();

// video iOS-safe con retry
(function videoHero(){
  const v = $("#hero");
  let tries = 0;
  function play(){ v.play().catch(()=>{ if(tries++<8) setTimeout(play, 300); }); }
  v.muted = true;
  v.setAttribute("playsinline",""); v.setAttribute("webkit-playsinline","");
  ["loadeddata","visibilitychange","pageshow"].forEach(ev=> addEventListener(ev, play));
  play();
})();

// layout ellisse sicura
function layout(){
  const W = innerWidth, H = innerHeight;

  const SAFE = 24;       // bordo schermo
  const GAP  = 24;       // distanza minima dal video

  // dimensione pulsante
  let btnW = Math.max(96, Math.min(Math.round(W*0.09), 150));
  document.documentElement.style.setProperty('--btnW', `${btnW}px`);

  // viewport (16:9) — dimensione calcolata
  let vw = Math.min(W * 0.62, 1280);
  let vh = vw * 9/16;
  const maxVH = H * 0.45;
  if (vh > maxVH){ vh = maxVH; vw = vh * 16/9; }

  // semiasse orizzontale: tiene i laterali dentro
  const a = Math.floor((W - 2*SAFE - btnW) / 2);

  // vincoli verticali: schermo e video
  const bMaxByScreen = Math.floor((H - 2*SAFE - btnW) / 2);
  let   bMinByVideo  = Math.ceil((vh + btnW)/2 + GAP);

  // se serve, riduco video per soddisfare i vincoli
  while (bMinByVideo > bMaxByScreen && vh > 180){
    vw *= 0.96; vh = vw*9/16;
    bMinByVideo = Math.ceil((vh + btnW)/2 + GAP);
  }
  const b = Math.min(bMaxByScreen, Math.max(bMinByVideo, Math.floor(H*0.34)));

  // centro scena con clamp verticale
  let cx = W/2, cy = H*0.52;
  const cyMin = b + SAFE + btnW/2;
  const cyMax = H - SAFE - btnW/2 - b;
  cy = Math.max(cyMin, Math.min(cy, cyMax));

  // posiziona viewport
  $("#viewport>video").style.width = `${vw}px`;
  $("#viewport>video").style.maxHeight = `${maxVH}px`;
  $("#viewport").style.left = `${cx - vw/2}px`;
  $("#viewport").style.top  = `${cy - vh/2}px`;
  $("#viewport").style.width  = `${vw}px`;
  $("#viewport").style.height = `${vh}px`;

  // disegna tacche + lancetta
  const svg = $("#ellipseLayer");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = "";
  const g = document.createElementNS("http://www.w3.org/2000/svg","g"); svg.appendChild(g);

  const N=12;
  for(let i=0;i<N;i++){
    const t = -Math.PI/2 + 2*Math.PI*i/N;
    const ix = cx + (a-18)*Math.cos(t), iy = cy + (b-18)*Math.sin(t);
    const ex = cx + a*Math.cos(t),      ey = cy + b*Math.sin(t);
    const ln = document.createElementNS(svg.namespaceURI,"line");
    ln.setAttribute("x1",ix); ln.setAttribute("y1",iy);
    ln.setAttribute("x2",ex); ln.setAttribute("y2",ey);
    ln.setAttribute("stroke","rgba(220,245,255,.6)");
    ln.setAttribute("stroke-width","2"); ln.setAttribute("stroke-linecap","round");
    g.appendChild(ln);
  }
  const cap = document.createElementNS(svg.namespaceURI,"circle");
  cap.setAttribute("cx",cx); cap.setAttribute("cy",cy); cap.setAttribute("r","10");
  cap.setAttribute("fill","rgba(255,255,255,.75)"); g.appendChild(cap);

  const hand = document.createElementNS(svg.namespaceURI,"line");
  hand.id="hand"; hand.setAttribute("x1",cx); hand.setAttribute("y1",cy);
  hand.setAttribute("x2",cx);  hand.setAttribute("y2",cy);
  hand.setAttribute("stroke","rgba(255,255,255,.9)");
  hand.setAttribute("stroke-width","3"); hand.setAttribute("stroke-linecap","round");
  g.appendChild(hand);

  const tip = document.createElementNS(svg.namespaceURI,"polygon");
  tip.id="handTip"; tip.setAttribute("fill","rgba(255,255,255,.9)"); g.appendChild(tip);

  // posiziona i 12 pulsanti con translate da centro (mai off-screen)
  const nodes = $$(".node");
  nodes.forEach((el,i)=>{
    const t = -Math.PI/2 + 2*Math.PI*i/N;
    const x = a*Math.cos(t) - btnW/2;
    const y = b*Math.sin(t) - btnW/2;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  });

  // anima lancetta con puntale triangolare
  let start=null;
  function anim(ts){
    if(!start) start=ts;
    const T=12000, th=-Math.PI/2 + 2*Math.PI*((ts-start)%T)/T;
    const px=cx+a*Math.cos(th)*0.95, py=cy+b*Math.sin(th)*0.95;
    hand.setAttribute("x2",px); hand.setAttribute("y2",py);
    const bx=cx+a*Math.cos(th)*0.86, by=cy+b*Math.sin(th)*0.86,
          nx=-Math.sin(th), ny=Math.cos(th), tipW=18;
    tip.setAttribute("points",`${px},${py} ${bx+nx*tipW},${by+ny*tipW} ${bx-nx*tipW},${by-ny*tipW}`);
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);

  // mostra i nodi solo a layout completato (evita flash)
  document.body.dataset.laid = "1";
}

// bootstrap robusto (DOMContentLoaded + pageshow + resize)
(function boot(){
  const run = ()=> layout();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, {once:true});
  } else run();
  addEventListener("pageshow", () => layout());
  let t; addEventListener("resize", ()=>{ clearTimeout(t); t=setTimeout(layout, 80); });
})();

