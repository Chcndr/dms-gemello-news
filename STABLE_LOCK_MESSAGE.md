# 🔒 STABLE LOCK — dms-gemello-news (HOME + SPOT + Politica 0) OK in produzione

## Status Confermato

✅ **Lightbox PDF attiva e fullscreen** su HOME e SPOT (viewer protetto PDF.js, zoom/fit ok, ritorno alla pagina chiamante ok).

✅ **Anti-stampa/anti-salva/anti-context attivi** nel viewer (Ctrl+P / Ctrl+S / tasto destro bloccati).

✅ **Politica 0: blocco stampa abilitato** (niente stampa "tutte le slide").

✅ **"Codice fantasma" su SPOT: non più visibile** né selezionabile.

✅ **Tutti i tasti che prima aprivano PDF diretti** ora passano dal viewer protetto.

## Richieste Operative (LOCK)

### 1. Bump parametri cache su risorse aggiornate (?v=20250916a):
- `/landing/spot.html`
- `/landing/home.html` 
- `/landing/viewer/*`
- CSS/JS correlati

### 2. Commit + tag di stabilizzazione:
```bash
git add .
git commit -m "lock: STABLE-NEWS-LOCK-20250916-IT (HOME+SPOT viewer protetto, anti-stampa Pol0, cleanup)"
git tag -a STABLE-NEWS-LOCK-20250916-IT -m "DMS · Gemello NEWS — lock stabile 2025-09-16"
git push && git push --tags
```

### 3. (Opzionale) GitHub Release con note:
"Feature: viewer protetto su HOME/SPOT, anti-stampa Pol0; Fix: overlay residui; QA: test desktop+mobile ok"

## Smoke Test Post-Deploy

**HOME/OROLOGIO:** un tasto a caso → apre lightbox → × chiude e resta in HOME.

**SPOT:** "DMS Set" → lightbox → protezioni attive → × chiude e resta in SPOT.

**Politica 0:** Ctrl+P mostra overlay blocco (nessuna stampa).

**Se tutto ok → chiudere come STABILE.**

---

**Tag creato:** `STABLE-NEWS-LOCK-20250916-IT`
**Deploy:** https://chcndr.github.io/dms-gemello-news/

