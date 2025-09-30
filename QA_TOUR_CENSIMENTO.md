# 🧭 QA tour + Censimento link/tasti (HOME, SPOT, Politica 0)

Per favore fate un giro completo del sito e compilate le tabelle di censimento qui sotto. 

**Obiettivo:** mappare tutti i tasti, dove puntano, che cosa aprono (viewer / esterno / interno), e verificare le protezioni.

## Ambiente di Test
- **Desktop:** Chrome/Edge/Firefox
- **Mobile:** iOS Safari, Android Chrome
- **Testare con:** rete normale + finestra anonima (cache pulita)

## Percorsi
- **HOME/OROLOGIO:** https://chcndr.github.io/dms-gemello-news/landing/home.html
- **SPOT:** https://chcndr.github.io/dms-gemello-news/landing/spot.html
- **Politica 0:** https://chcndr.github.io/dms-gemello-news/landing/pol0/

---

## A) Censimento tasti — HOME/OROLOGIO

| Pagina | Pulsante (ID/Etichetta) | Target (URL) | Tipo apertura | Protezioni (se PDF) | Ritorno (×/ESC) | Note |
|--------|-------------------------|--------------|---------------|---------------------|-----------------|------|
| home.html | DMS Sistema Completo | /docs/DMS…pdf → viewer | Lightbox viewer | Ctrl+P/S/Context: OFF | Torna a HOME: OK | |
| home.html | … | … | viewer/esterno/ancora | … | … | … |

**Valori ammessi "Tipo apertura":** viewer, esterno (nuova scheda), ancora interna.
**Ritorno:** "OK" se chiudendo la lightbox si rimane nella stessa pagina.

---

## B) Censimento documenti PDF

| Nome documento | Percorso file | URL viewer (completo) | Protezioni attive | Pagine | Peso (MB) | Versione ?v= |
|----------------|---------------|----------------------|-------------------|--------|-----------|--------------|
| DMS Set v2 | /docs/DMS…pdf | /landing/viewer/?src=…&v=20250916a | P, S, Context bloccati | 24 | 3.8 | 20250916a |
| … | … | … | … | … | … | … |

**Protezioni attive:** indicare P (Print), S (Save), Context (menu).

---

## C) Schede ministeri / riferimenti normativi

| Scheda (ID) | Ministero / Ente | Claim/beneficio | Riferimento normativo | URL ufficiale | Stato link |
|-------------|------------------|-----------------|----------------------|---------------|------------|
| M-01 | MIMIT | DMS come sportello unico… | DL/Direttiva/Art. … | https://… | 200/OK |
| … | … | … | … | … | … |

**Nota:** indicare la pagina in cui si apre (es. SPOT "card verde"), il pulsante che la richiama, e verificare che l'URL punti alla legge corretta.

---

## D) Politica 0 — verifica anti-stampa

| Slide | Anti-stampa overlay | Back "← Torna all'orologio" | Note |
|-------|--------------------|-----------------------------|------|
| 01 | SI | OK | |
| … | … | … | … |

---

## Bug/Anomalie
Allegare screenshot + dispositivo + passi per riprodurre.

## Output Atteso
Restituire le 4 tabelle (Markdown/CSV) + elenco eventuali fix suggeriti.

**Grazie** 🙌

---

**Template creato:** 2025-09-16
**Ambiente:** https://chcndr.github.io/dms-gemello-news/

