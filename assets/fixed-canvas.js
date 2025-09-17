(function(){
  var isIpad = /iPad/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIpad) { document.documentElement.classList.add("is-ipad"); return; }
  document.documentElement.classList.add("is-fixed-canvas");
  var vp = document.querySelector("meta[name=\"viewport\"]");
  if (!vp) { vp = document.createElement("meta"); vp.setAttribute("name","viewport"); document.head.appendChild(vp); }
  vp.setAttribute("content","width=1280, initial-scale=1, maximum-scale=1, user-scalable=no");
  var letterbox = document.createElement("div"); letterbox.id = "letterbox";
  var stage = document.createElement("div"); stage.id = "stage"; letterbox.appendChild(stage);
  var nodes = Array.from(document.body.childNodes); nodes.forEach(function(n){ stage.appendChild(n); });
  document.body.appendChild(letterbox);
  var css = ":root{--stage-w:1280px;--stage-h:720px;--stage-bg:#ffffff;} html.is-fixed-canvas, html.is-fixed-canvas body{height:100%;margin:0;} html.is-fixed-canvas #letterbox{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--stage-bg);overflow:hidden;} html.is-fixed-canvas #stage{width:var(--stage-w);height:var(--stage-h);max-width:var(--stage-w);max-height:var(--stage-h);transform-origin:center center;will-change:transform;} @media (max-width:1280px),(max-height:720px){ html.is-fixed-canvas #stage{transform:scale(min(100vw/var(--stage-w),100vh/var(--stage-h)));} } html.is-fixed-canvas #stage .full-viewport, html.is-fixed-canvas #stage .hero, html.is-fixed-canvas #stage .canvas, html.is-fixed-canvas #stage .viewport{width:100%;height:100%;} html.is-fixed-canvas #stage, html.is-fixed-canvas #stage *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;backface-visibility:hidden;transform-style:preserve-3d;}";
  var style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
})();
