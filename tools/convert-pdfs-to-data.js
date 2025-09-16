// tools/convert-pdfs-to-data.js
// Converte <a href="... .pdf"> -> <a href="#" data-pdf="...">
// Copre link a /dms-gemello-news/docs/, /docs/, /assets/doc/ e in generale qualsiasi *.pdf

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const repoRoot = process.cwd();

// Pagine su cui intervenire (aggiungi pattern se necessario)
const patterns = [
  'index.html',
  'landing/**/*.html',
  '*.html'
];

// Regex: trova href="...pdf" (anche con query/hash), ignorando già convertiti (data-pdf presente)
const rePdfHref = /(<a\b[^>]*?\bhref\s*=\s*)(["'])([^"']+?\.pdf(?:\?[^"']*)?(?:#[^"']*)?)\2(?![^>]*\bdata-pdf=)/ig;

// Regex: trova array JavaScript ["Nome", "/path/file.pdf"]
const rePdfArray = /(\["[^"]*",\s*)(["'])([^"']+?\.pdf(?:\?[^"']*)?(?:#[^"']*)?)\2(\])/ig;

// Funzione di normalizzazione: porta /docs/... -> /dms-gemello-news/docs/...
function normalizePdfUrl(href) {
  try {
    // Assolutizza rispetto alla repo GitHub Pages
    let u = new URL(href, 'https://chcndr.github.io/dms-gemello-news/');
    // Normalizza percorsi noti
    if (u.pathname.startsWith('/docs/')) {
      u.pathname = '/dms-gemello-news' + u.pathname;
    }
    // Lascia invariati /dms-gemello-news/docs/ e /assets/doc/... (già assoluti)
    return u.pathname + (u.search || '') + (u.hash || '');
  } catch {
    // Se non è una URL valida, restituisci com'è
    return href;
  }
}

function transform(html, filePath) {
  let changed = false;
  
  // Trasforma href="...pdf" -> href="#" data-pdf="..."
  let out = html.replace(rePdfHref, (m, pre, quote, href) => {
    const norm = normalizePdfUrl(href);
    changed = true;
    console.log(`  [${filePath}] href: ${href} -> data-pdf: ${norm}`);
    return `${pre}"#" data-pdf="${norm}"`;
  });
  
  // Trasforma array ["Nome", "/path.pdf"] -> ["Nome", "#", "/path.pdf"]
  out = out.replace(rePdfArray, (m, pre, quote, href, post) => {
    const norm = normalizePdfUrl(href);
    changed = true;
    console.log(`  [${filePath}] array: ${href} -> ${norm}`);
    // Cambia formato: ["Nome", "/path.pdf"] -> ["Nome", "#", "/path.pdf"]
    return `${pre}"#", "${norm}"${post}`;
  });
  
  return { out, changed };
}

let totalChangedFiles = 0;
let changedList = [];

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { nodir: true, cwd: repoRoot });
  files.forEach(rel => {
    const fp = path.join(repoRoot, rel);
    const html = fs.readFileSync(fp, 'utf8');
    const { out, changed } = transform(html, rel);
    if (changed) {
      fs.writeFileSync(fp, out, 'utf8');
      totalChangedFiles++;
      changedList.push(rel);
      console.log('Updated:', rel);
    }
  });
});

console.log('\nDone. Files changed:', totalChangedFiles);
if (totalChangedFiles) {
  console.log(changedList.map(f => ' - ' + f).join('\n'));
  console.log('\nSuggerimento: esegui un grep per conferma:');
  console.log('  grep -RIn \'data-pdf="\' . | wc -l');
}

