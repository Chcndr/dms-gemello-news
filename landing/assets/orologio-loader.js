// DMS Orologio Loader - Carica dinamicamente i dati dell'orologio dai JSON
(function() {
  'use strict';

  let orologioData = null;
  let docsData = null;

  // Carica i dati JSON
  async function loadData() {
    try {
      const [orologioResponse, docsResponse] = await Promise.all([
        fetch('./assets/orologio.json'),
        fetch('./assets/docs.json')
      ]);

      if (!orologioResponse.ok || !docsResponse.ok) {
        throw new Error('Errore nel caricamento dei JSON');
      }

      orologioData = await orologioResponse.json();
      docsData = await docsResponse.json();

      console.log('Dati orologio caricati:', orologioData.tasti.length, 'tasti');
      console.log('Dati documenti caricati:', docsData.docs.length, 'documenti');

      return true;
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      return false;
    }
  }

  // Trova un documento per ID
  function findDocById(docId) {
    if (!docsData) return null;
    return docsData.docs.find(doc => doc.id === docId);
  }

  // Genera HTML per i link PDF di un tasto
  function buildLinksForTasto(tastoNum) {
    if (!orologioData || !docsData) return '<p>Dati non disponibili</p>';

    const tasto = orologioData.tasti.find(t => t.tasto === tastoNum);
    if (!tasto) return '<p>Tasto non trovato</p>';

    let html = '';
    
    if (tasto.docs && tasto.docs.length > 0) {
      tasto.docs.forEach(docObj => {
        // docObj è un oggetto con {id, title}, non solo un ID
        const docId = docObj.id;
        const doc = findDocById(docId);
        if (doc) {
          const pdfUrl = `./docs/${doc.filename}`;
          html += `
            <a href="${pdfUrl}" class="pdf-link" target="_blank" style="
              display: flex; align-items: center; justify-content: space-between;
              padding: 12px 16px; margin: 8px 0; 
              background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2);
              border-radius: 8px; color: var(--ink); text-decoration: none;
              transition: background 0.2s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.05)'">
              <span>${doc.title}</span>
              <span style="color: #14b8a6; font-weight: 600; font-size: 13px;">Apri ⤴</span>
            </a>
          `;
        } else {
          // Se il documento non esiste, usa il titolo dal JSON
          html += `
            <div style="
              display: flex; align-items: center; justify-content: space-between;
              padding: 12px 16px; margin: 8px 0; 
              background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1);
              border-radius: 8px; color: #9bd6de; opacity: 0.6;
            ">
              <span>${docObj.title}</span>
              <span style="color: #f59e0b; font-weight: 600; font-size: 13px;">In preparazione</span>
            </div>
          `;
        }
      });
    }

    if (!html) {
      html = '<p style="color: #9bd6de; font-style: italic;">Documenti in preparazione...</p>';
    }

    return html;
  }

  // Sovrascrivi la funzione openPanelByIndex originale
  function enhanceOpenPanelByIndex() {
    // Forza override completo
    window.openPanelByIndex = function(i, accent, data) {
      console.log(`[OROLOGIO LOADER] Tasto ${i} cliccato`);
      
      // Tasto 0 (Dashboard Politica) mantiene il comportamento originale
      if (i === 0) {
        window.top.location.href = '/dms-gemello-news/landing/pol0/?open=1&v=pol0-001';
        return;
      }

      // Per gli altri tasti, usa i dati JSON
      const tastoNum = i + 1; // i è 0-based, tasto è 1-based
      const tasto = orologioData ? orologioData.tasti.find(t => t.tasto === tastoNum) : null;

      if (!tasto) {
        console.warn(`Tasto ${tastoNum} non trovato nei dati JSON`);
        return;
      }

      // Trova il pannello
      const panel = document.getElementById('panel');
      if (!panel) {
        console.error('Pannello non trovato');
        return;
      }

      // Imposta il colore accent
      panel.style.setProperty('--accent', accent || '#14b8a6');

      // Aggiorna il contenuto del pannello
      const titleEl = panel.querySelector('#panel-title');
      const subEl = panel.querySelector('#panel-sub');
      const bodyEl = panel.querySelector('#panel-body');

      if (titleEl) titleEl.textContent = tasto.title || `Modulo ${tastoNum}`;
      if (subEl) subEl.textContent = tasto.roadmap || 'In sviluppo';
      if (bodyEl) {
        const content = buildLinksForTasto(tastoNum);
        bodyEl.innerHTML = content;
        console.log(`Contenuto generato per tasto ${tastoNum}:`, content.length, 'caratteri');
      }

      // Mostra il pannello
      panel.hidden = false;
      document.body.classList.add('panel-open');

      console.log(`[OROLOGIO LOADER] Pannello aperto per tasto ${tastoNum}: ${tasto.title}`);
    };
    
    // Forza anche override di eventuali altre funzioni
    if (window.__openPanelByIndex) {
      window.__openPanelByIndex = window.openPanelByIndex;
    }
  }

  // Inizializza quando i dati sono pronti
  async function init() {
    const dataLoaded = await loadData();
    if (dataLoaded) {
      enhanceOpenPanelByIndex();
      console.log('Orologio loader inizializzato con successo');
    } else {
      console.error('Impossibile inizializzare orologio loader');
    }
  }

  // Avvia l'inizializzazione
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
