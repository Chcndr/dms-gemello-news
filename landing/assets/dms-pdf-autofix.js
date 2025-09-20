/**
 * DMS PDF AutoFix - Soluzione stand-alone autoinstallante
 * 
 * Questo script:
 * 1. Intercetta tutti i link PDF e li apre nel visualizzatore interno
 * 2. Crea automaticamente un modal se non presente
 * 3. Rimuove tutti i testi di debug e watermark
 * 4. Assicura comportamento coerente su tutte le pagine
 * 5. Funziona indipendentemente senza dipendenze
 */

(function() {
    'use strict';
    
    console.log('DMS PDF AutoFix v2.0 - Inizializzazione...');
    
    // Configurazione
    const CONFIG = {
        modalId: 'dms-pdf-modal',
        debugSelectors: [
            '[class*="pdf-enforcer"]',
            '[id*="pdf-enforcer"]',
            'div:contains("PDF ENFORCER")',
            'span:contains("finale-006")',
            '.debug-badge',
            '.watermark',
            '[data-debug]'
        ],
        pdfViewerUrl: '/dms-gemello-news/landing/pdfjs-lite/',
        blackBackground: true
    };
    
    // Utility per trovare elementi che contengono testo specifico
    function findElementsWithText(text) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const elements = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.textContent.includes(text)) {
                elements.push(node.parentElement);
            }
        }
        
        return elements;
    }
    
    // Rimuove tutti i testi di debug e watermark
    function removeDebugElements() {
        console.log('Rimozione elementi di debug...');
        
        // Rimuovi elementi con selettori CSS
        CONFIG.debugSelectors.forEach(selector => {
            try {
                if (selector.includes(':contains')) {
                    // Gestione speciale per :contains (non supportato nativamente)
                    const text = selector.match(/contains\("([^"]+)"\)/)?.[1];
                    if (text) {
                        const elements = findElementsWithText(text);
                        elements.forEach(el => {
                            console.log('Rimosso elemento debug:', el);
                            el.style.display = 'none';
                        });
                    }
                } else {
                    document.querySelectorAll(selector).forEach(el => {
                        console.log('Rimosso elemento debug:', el);
                        el.style.display = 'none';
                    });
                }
            } catch (e) {
                console.warn('Errore nel selettore:', selector, e);
            }
        });
        
        // Rimuovi testi specifici
        const debugTexts = ['PDF ENFORCER', 'finale-006', 'debug-', 'watermark'];
        debugTexts.forEach(text => {
            const elements = findElementsWithText(text);
            elements.forEach(el => {
                if (el.textContent.trim() === text || el.textContent.includes(text)) {
                    console.log('Rimosso testo debug:', text, el);
                    el.style.display = 'none';
                }
            });
        });
    }
    
    // Crea il modal per il visualizzatore PDF se non esiste
    function createPdfModal() {
        if (document.getElementById(CONFIG.modalId)) {
            return document.getElementById(CONFIG.modalId);
        }
        
        console.log('Creazione modal PDF...');
        
        const modal = document.createElement('div');
        modal.id = CONFIG.modalId;
        modal.innerHTML = `
            <div class="dms-modal-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
            ">
                <div class="dms-modal-content" style="
                    width: 95%;
                    height: 95%;
                    background: ${CONFIG.blackBackground ? '#000' : '#fff'};
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                ">
                    <button class="dms-modal-close" style="
                        position: absolute;
                        top: 10px;
                        right: 15px;
                        background: rgba(255, 255, 255, 0.9);
                        border: none;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                        font-weight: bold;
                        cursor: pointer;
                        z-index: 10001;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #333;
                    ">×</button>
                    <iframe class="dms-modal-iframe" style="
                        width: 100%;
                        height: 100%;
                        border: none;
                        background: ${CONFIG.blackBackground ? '#000' : '#fff'};
                    "></iframe>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners per il modal
        const overlay = modal.querySelector('.dms-modal-overlay');
        const closeBtn = modal.querySelector('.dms-modal-close');
        const iframe = modal.querySelector('.dms-modal-iframe');
        
        // Chiudi modal
        function closeModal() {
            overlay.style.display = 'none';
            iframe.src = '';
            document.body.style.overflow = '';
        }
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Chiudi con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                closeModal();
            }
        });
        
        return modal;
    }
    
    // Apre un PDF nel modal interno
    function openPdfInModal(pdfUrl) {
        console.log('Apertura PDF nel modal:', pdfUrl);
        
        const modal = createPdfModal();
        const overlay = modal.querySelector('.dms-modal-overlay');
        const iframe = modal.querySelector('.dms-modal-iframe');
        
        // Costruisci URL del viewer
        let viewerUrl = CONFIG.pdfViewerUrl;
        if (!viewerUrl.includes('?')) {
            viewerUrl += '?';
        } else {
            viewerUrl += '&';
        }
        viewerUrl += `src=${encodeURIComponent(pdfUrl)}`;
        
        // Rimuovi il parametro v=finale-006 per evitare debug
        viewerUrl = viewerUrl.replace(/[&?]v=finale-006/g, '');
        
        iframe.src = viewerUrl;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Rimuovi debug elements dopo il caricamento
        iframe.onload = () => {
            setTimeout(removeDebugElements, 500);
        };
    }
    
    // Intercetta tutti i link PDF
    function interceptPdfLinks() {
        console.log('Intercettazione link PDF...');
        
        // Selettori per link PDF
        const pdfSelectors = [
            'a[href*=".pdf"]',
            'a[href*="pdfjs-lite"]',
            'a[href*="/assets/doc/"]',
            '.doc',
            'a[data-spot]'
        ];
        
        pdfSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(link => {
                // Evita di processare link già processati
                if (link.hasAttribute('data-dms-processed')) {
                    return;
                }
                
                link.setAttribute('data-dms-processed', 'true');
                
                // Rimuovi target="_blank" per evitare nuove finestre
                link.removeAttribute('target');
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let pdfUrl = link.href;
                    
                    // Estrai URL PDF se è un link al viewer
                    if (pdfUrl.includes('pdfjs-lite')) {
                        const urlParams = new URLSearchParams(pdfUrl.split('?')[1]);
                        const srcParam = urlParams.get('src');
                        if (srcParam) {
                            pdfUrl = decodeURIComponent(srcParam);
                        }
                    }
                    
                    // Assicurati che sia un URL completo
                    if (pdfUrl.startsWith('/')) {
                        pdfUrl = window.location.origin + pdfUrl;
                    }
                    
                    console.log('Click intercettato su PDF:', pdfUrl);
                    openPdfInModal(pdfUrl);
                });
            });
        });
    }
    
    // Observer per elementi dinamici
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldProcess = true;
                }
            });
            
            if (shouldProcess) {
                setTimeout(() => {
                    interceptPdfLinks();
                    removeDebugElements();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('MutationObserver attivato');
    }
    
    // Inizializzazione
    function init() {
        console.log('DMS PDF AutoFix - Avvio inizializzazione');
        
        // Rimuovi debug elements immediatamente
        removeDebugElements();
        
        // Intercetta link PDF esistenti
        interceptPdfLinks();
        
        // Setup observer per contenuto dinamico
        setupMutationObserver();
        
        // Rimuovi debug elements periodicamente
        setInterval(removeDebugElements, 2000);
        
        console.log('DMS PDF AutoFix - Inizializzazione completata');
    }
    
    // Avvia quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Esporta funzioni per debug
    window.dmsPdfAutoFix = {
        removeDebugElements,
        interceptPdfLinks,
        openPdfInModal,
        createPdfModal
    };
    
})();
