DMS Spot Hardener — Patch unico (FORZA apertura in-page + pulizia residui)
Data: 2025-09-20

Cosa fa (tutto-in-uno)
1) Inietta (se mancante) un modal leggero in-page (iframe) per PDF/Spot.
2) Intercetta TUTTI i click di orologio/spot ([data-pdf], [data-spot], a.pdfBtn, button.pdfBtn):
   - rimuove target="_blank"
   - forza apertura nel modal (mai nuova scheda)
   - aggiunge cache-buster
3) Scansiona e rimuove badge/scritte debug note (pdf-enforcer/print-guard/etc).
4) Normalizza gli href dei bottoni problematici (impatto minimo, solo se necessario).
5) Blocca overscroll/pull-to-refresh quando il modal è aperto (iPad/Safari).

Installazione
- Copia i file in /assets/ e includi SOLO questo JS in tutte le pagine (home, mappa, spot):
  <script src="/assets/dms-spot-hardener.js?v=1" defer></script>

- Non servono altre modifiche. Se avevi già "Modal Lite", questo script lo riutilizza e non reinietta nulla.

Rollback
- Rimuovi il tag <script> qui sopra.
