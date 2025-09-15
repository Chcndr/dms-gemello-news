# DMS · Gemello del Commercio — Routing & Collocazione (GitHub Pages)

**Repository:** `Chcndr/dms-gemello-news`  
**Branch:** `main` · **Pages:** root `/`

## 1) OROLOGIO (home video + 12 pulsanti)

- **URL live:**  
  https://chcndr.github.io/dms-gemello-news/landing/home.html?v=lock

- **Percorso file:**  
  `/landing/home.html`

- **Dipendenze principali:**  
  `/data/modules.json` (testi pulsanti) · `/videos/` (hero) · `/assets/` (poster/icone)

- **Note:** autoplay muto iOS-safe; pulsante per attivare audio; link tasto "0" → Politica 0.

---

## 2) POLITICA 0 (maxi-slide a schermo pieno)

- **URL live:**  
  https://chcndr.github.io/dms-gemello-news/landing/pol0/?open=1&v=pol0-001

- **Percorso file:**  
  `/landing/pol0/index.html`

- **Assets slide:**  
  `/landing/pol0/slides/01.jpg` … `47.jpg` (oriente 1920×1080; no bande nere)

- **Ritorno all'orologio:**  
  link "← Torna all'orologio" → `../home.html`

- **Note:** apertura diretta in lightbox sulla slide #1; frecce laterali per navigazione.

---

## 3) MAPPA MINISTERI (sezione interattiva)

- **URL live:**  
  https://chcndr.github.io/dms-gemello-news/landing/ministeri/?v=lock

- **Percorso file:**  
  `/landing/ministeri/index.html`

- **Assets:**  
  `/landing/ministeri/assets/*` (icone, SVG, CSS)

- **Note:** evidenzia 2–3 norme per ministero; coerente con alias in modules.json.

---

## 4) SPOT (documenti + CTA "legge ufficiale")

- **URL live (homepage del sito):**  
  https://chcndr.github.io/dms-gemello-news/ → serve `/index.html`

- **Percorso file:**  
  `/index.html` (Spot è la home di GitHub Pages)

- **Dati & documenti:**  
  `/data/modules.json` (elenco 12 moduli/pulsanti)  
  `/docs/` (PDF) · `/assets/` (thumbnails) · `/videos/` (hero/cover se presente)

- **Deep-link (facoltativo, se abilitato):**  
  `/?open=<alias>` es. `/?open=903` (apre la scheda specifica)

- **Note:** CTA "Vai alla legge ufficiale" stessa scheda (niente nuova tab).

---

## Check veloce post-deploy

1. **Orologio** apre e il tasto "0" porta a `/landing/pol0/` (slide 1 in lightbox).
2. **Politica 0:** frecce ‹ › funzionano; bottone "← Torna all'orologio" ok.
3. **Mappa Ministeri:** pagina raggiungibile, evidenzia tasti norme per ministero.
4. **Spot (home):** apre da root; pulsanti PDF e CTA operativi; (opz.) `?open=…`.

---

## Dove toccare cosa (riassunto)

- `/landing/home.html` → Orologio (video + 12 moduli)
- `/landing/pol0/` → Maxi-slide Politica 0
- `/landing/ministeri/` → Mappa Ministeri
- `/index.html` → Spot (home)
- `/data/modules.json` → Nomi/ordini/alias dei 12 moduli
- `/docs/` → PDF dei moduli
- `/videos/` e `/assets/` → media (poster, clip, immagini)

---

## Commit tip

**Messaggi suggeriti:**
- `docs: add README_ROUTES with all live paths`
- `fix(routes): align pol0/home/ministeri paths + cache busters`

