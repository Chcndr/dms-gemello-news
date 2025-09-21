// DMS Docs Loader - Carica dinamicamente i documenti dai file JSON
(function() {
  'use strict';

  // Configurazione categorie
  const CATEGORIES = {
    'Documenti Base': ['t1', 't2', 't3', 't4'],
    'Analisi e Ricerche': ['t5', 't6'],
    'Implementazione Tecnica': ['t7', 't8'],
    'FinTech e Carbon Credit': ['t9'],
    'Progetto Nazionale': ['t10'],
    'App e Strumenti': ['t11']
  };

  // Funzione per caricare e renderizzare i documenti
  async function loadAndRenderDocs() {
    try {
      // Carica il file docs.json
      const response = await fetch('./assets/docs.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const docs = data.docs || [];
      
      console.log(`Caricati ${docs.length} documenti da docs.json`);
      
      // Organizza documenti per categoria
      const docsByCategory = {};
      
      // Inizializza categorie
      Object.keys(CATEGORIES).forEach(cat => {
        docsByCategory[cat] = [];
      });
      
      // Raggruppa documenti per categoria basandosi sui tag
      docs.forEach(doc => {
        const tags = doc.tags || [];
        let assigned = false;
        
        // Trova la categoria appropriata
        for (const [categoryName, categoryTags] of Object.entries(CATEGORIES)) {
          if (tags.some(tag => categoryTags.includes(tag))) {
            docsByCategory[categoryName].push(doc);
            assigned = true;
            break;
          }
        }
        
        // Se non assegnato, metti in "Documenti Base"
        if (!assigned) {
          docsByCategory['Documenti Base'].push(doc);
        }
      });
      
      // Genera HTML
      let html = '';
      
      Object.entries(docsByCategory).forEach(([categoryName, categoryDocs]) => {
        if (categoryDocs.length > 0) {
          html += `<h3 class="section-title">${categoryName}</h3>`;
          
          categoryDocs.forEach(doc => {
            const pdfUrl = `./docs/${doc.filename}`;
            html += `
              <a href="${pdfUrl}" class="doc" target="_blank">
                <span>${doc.title}</span>
                <span style="color:#14b8a6; font-weight:600; font-size:13px">Apri ⤴</span>
              </a>
            `;
          });
        }
      });
      
      // Inserisci nell'elemento docs
      const docsContainer = document.getElementById('docs');
      if (docsContainer) {
        docsContainer.innerHTML = html;
        console.log('Documenti renderizzati con successo');
      } else {
        console.error('Elemento #docs non trovato');
      }
      
    } catch (error) {
      console.error('Errore nel caricamento dei documenti:', error);
      
      // Fallback: mostra messaggio di errore
      const docsContainer = document.getElementById('docs');
      if (docsContainer) {
        docsContainer.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #ff6b6b;">
            <p>Errore nel caricamento dei documenti.</p>
            <p style="font-size: 12px; opacity: 0.7;">Dettagli: ${error.message}</p>
          </div>
        `;
      }
    }
  }

  // Avvia il caricamento quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRenderDocs);
  } else {
    loadAndRenderDocs();
  }

})();
