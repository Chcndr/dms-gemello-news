(()=>{const N=12;
function computeLayout(){
  const W=innerWidth,H=innerHeight,root=document.documentElement;
  const BTN=parseFloat(getComputedStyle(root).getPropertyValue('--btnW'))||140;
  const cx=W*.5, cy=H*.52, SAFE=28, VTOP=16, VSIDE=24, VBOT=32;
  const vw=Math.min(Math.max(720,.56*W),1120), vh=vw*9/16;
  const a=Math.min(W*.36,(W/2-BTN*.7-SAFE),(W-vw)/2-VSIDE);
  const b=Math.min(H*.28,(H/2-BTN*.7-SAFE),(H-vh)/2-Math.max(VTOP,VBOT));
  const P=[]; for(let i=0;i<N;i++){const t=-Math.PI/2+i*(2*Math.PI/N);
    P.push({x:Math.round(cx+a*Math.cos(t)-BTN/2), y:Math.round(cy+b*Math.sin(t)-BTN/2)});}
  return P;
}
function ensureNodes(){
  document.querySelectorAll('.node').forEach(n=>n.remove());
  const P=computeLayout(), f=document.createDocumentFragment();
  for(let i=0;i<N;i++){const b=document.createElement('button');
    b.type='button'; b.className='node'; b.dataset.i=i; b.innerHTML='<span class="tag">PDF</span>';
    b.style.left=P[i].x+'px'; b.style.top=P[i].y+'px'; f.appendChild(b);}
  document.body.appendChild(f);
}
function relayout(){const P=computeLayout();
  document.querySelectorAll('.node').forEach((el,i)=>{el.style.left=P[i].x+'px'; el.style.top=P[i].y+'px';});
}
function boot(){ensureNodes(); relayout();}
addEventListener('resize',((fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};})(relayout,80),{passive:true});
addEventListener('orientationchange',()=>setTimeout(relayout,250),{passive:true});
addEventListener('pageshow',()=>setTimeout(relayout,0));
document.addEventListener('DOMContentLoaded',boot);
})();

