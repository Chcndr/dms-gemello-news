DMS Modal Lite — Patch minima (stabile & non invasiva)
Data: 2025-09-20

Obiettivo
- Rendere la finestra (viewer) stabile, sempre in-page, senza aprire schede del browser.
- Impatto minimo: 2 file (CSS+JS) + 2 righe di include in pagina.
- Compatibile iPad/Safari (blocca overscroll solo quando il modal è aperto).

Installazione (2 passi)
1) Inserisci in <head> e prima di </body>:
   <link rel="stylesheet" href="/assets/dms-modal-lite.css?v=1">
   <script src="/assets/dms-modal-lite.js?v=1" defer></script>

2) Aggiungi UNA VOLTA, subito dopo l'apertura del <body> o a fine pagina (comunque nel DOM):
   <div id="dmsModalLite" class="dms-ml" aria-hidden="true" role="dialog" aria-modal="true">
     <div class="dms-ml__backdrop"></div>
     <div class="dms-ml__dialog" role="document">
       <button class="dms-ml__close" aria-label="Chiudi">×</button>
       <iframe id="dmsMlFrame" class="dms-ml__frame" title="Viewer"></iframe>
     </div>
   </div>

Uso (nessuna modifica ai bottoni)
- Qualsiasi elemento con uno di questi attributi verrà aperto nel modal:
  [data-pdf], [data-spot], a.pdfBtn (con href)
- Non è necessario rimuovere target="_blank", lo neutralizza lo script durante l'apertura.

Compatibilità
- Non tocca i tuoi stili esistenti, a eccezione dei layer dichiarati NON cliccabili
  solo mentre il modal è aperto. Nessuna modifica alla struttura "orologio".

Rollback
- Per tornare indietro, rimuovi i due include e il markup del modal. Fine.
