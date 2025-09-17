(function(){
  if (window.__fixedCanvasSafeApplied) return;
  window.__fixedCanvasSafeApplied = true;
  function isIpad(){return /iPad/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);} 
  function apply(){try{console.log('[fixed-canvas-safe] start');}catch(e){}
    if(isIpad()){document.documentElement.classList.add('is-ipad');console.log('[fixed-canvas-safe] iPad → skip');return;}
    document.documentElement.classList.add('is-fixed-canvas-safe');
    var vp=document.querySelector('meta[name="viewport"]');
    if(!vp){vp=document.createElement('meta');vp.setAttribute('name','viewport');document.head.appendChild(vp);} 
    vp.setAttribute('content','width=1280, initial-scale=1, maximum-scale=1, user-scalable=no');
    var css=`:root{--stage-w:1280;--stage-h:720;--stage-bg:#ffffff;}
html.is-fixed-canvas-safe,html.is-fixed-canvas-safe body{height:100%;margin:0;background:var(--stage-bg);} 
html.is-fixed-canvas-safe body{display:grid;place-content:center;min-height:100dvh;min-width:100dvw;transform-origin:center center;} 
@media (max-width:1280px),(max-height:720px){html.is-fixed-canvas-safe body{transform:scale(min(100dvw/var(--stage-w),100dvh/var(--stage-h)));}} 
html.is-fixed-canvas-safe body::before{content:'';width:calc(var(--stage-w)*1px);height:calc(var(--stage-h)*1px);} 
html.is-fixed-canvas-safe body,html.is-fixed-canvas-safe body *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;backface-visibility:hidden;transform-style:preserve-3d;}`;
    var style=document.getElementById('fixed-canvas-safe-style');
    if(!style){style=document.createElement('style');style.id='fixed-canvas-safe-style';document.head.appendChild(style);} 
    style.textContent=css;try{console.log('[fixed-canvas-safe] applied OK');}catch(e){}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',apply,{once:true});}else{apply();}
})();
