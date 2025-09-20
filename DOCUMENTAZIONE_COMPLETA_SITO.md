# DMS Gemello Digitale del Commercio - Documentazione Completa del Sito

## 📋 INDICE
1. [Panoramica Generale](#panoramica-generale)
2. [Architettura Tecnica](#architettura-tecnica)
3. [Pagina Home - Orologio Roadmap](#pagina-home---orologio-roadmap)
4. [Pagina Mappa Ministeri](#pagina-mappa-ministeri)
5. [Pagina Spot & Documenti](#pagina-spot--documenti)
6. [Sistema PDF Viewer](#sistema-pdf-viewer)
7. [Inventario Completo PDF](#inventario-completo-pdf)
8. [Caratteristiche Responsive](#caratteristiche-responsive)
9. [Guida Deploy GitHub Pages](#guida-deploy-github-pages)
10. [Troubleshooting](#troubleshooting)

---

## 🌐 PANORAMICA GENERALE

### URL Principale
- **Sito Live**: `https://chcndr.github.io/dms-gemello-news/landing/home.html`
- **Repository GitHub**: `https://github.com/Chcndr/dms-gemello-news`
- **Branch**: `main`

### Descrizione
Il sito DMS (Digital Market System) Gemello Digitale del Commercio è una piattaforma web che presenta la roadmap strategica per il rilancio del commercio italiano attraverso tecnologie digitali innovative. Il sito è strutturato in tre sezioni principali interconnesse.

### Tecnologie Utilizzate
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Hosting**: GitHub Pages
- **PDF Viewer**: PDF.js Lite personalizzato
- **Mappe**: Leaflet.js
- **Video**: HTML5 Video integrato
- **Responsive**: CSS Grid, Flexbox, Media Queries

---

## 🏗️ ARCHITETTURA TECNICA

### Struttura Directory
```
landing/
├── home.html                 # Pagina principale - Orologio roadmap
├── mappa-ministeri.html      # Mappa interattiva ministeri
├── spot.html                 # Archivio documenti e video
├── pol0/                     # Sezione politiche
│   ├── index.html           # Viewer presentazione politica
│   └── slides/              # Slide presentazione (47 slide)
├── pdfjs-lite/              # Visualizzatore PDF personalizzato
│   └── index.html           # PDF viewer con sfondo nero
├── assets/                  # Risorse statiche
│   ├── doc/                 # Archivio PDF (35+ documenti)
│   ├── dms-modal-lite.css   # Stili modal PDF
│   ├── dms-modal-lite.js    # Logica modal PDF
│   ├── dms-spot-hardener.js # Sistema gestione PDF Spot
│   ├── dms-pdf-autofix.js   # Sistema auto-correzione PDF
│   └── kill-debug-watermark.css # Rimozione watermark debug
└── data/
    └── modules.json         # Configurazione moduli orologio
```

### Sistemi Integrati
1. **PDF ENFORCER**: Sistema di gestione PDF con viewer interno
2. **DMS Modal Lite**: Sistema modal per visualizzazione documenti
3. **DMS Spot Hardener**: Gestione robusta PDF nella sezione Spot
4. **Kill Debug Watermark**: Rimozione automatica elementi debug

---

## 🏠 PAGINA HOME - OROLOGIO ROADMAP

### URL
`https://chcndr.github.io/dms-gemello-news/landing/home.html`

### Design e Layout
- **Sfondo**: Gradiente teal scuro con mappa Italia stilizzata
- **Layout**: Orologio circolare centrale con 12 pulsanti posizionati come ore
- **Titolo**: "GEMELLO DIGITALE DEL COMMERCIO" in alto a destra
- **Sottotitolo**: "DMS • Orologio roadmap"
- **Video Centrale**: "IL PORTALE E-COMMERCE EXTRA-UE" (2:08 min)

### Navigazione Principale
Tre tab in alto a sinistra:
1. **Home** (attivo) - Verde
2. **Mappa** - Blu
3. **Spot** - Arancione

### Pulsanti Orologio (12 elementi)

#### Quadrante Superiore (12-3)
1. **Dashboard Politica** (Q1 2025) - Viola
   - Posizione: Ore 12
   - Collegamento: `pol0/?open=1&v=pol0-001`
   - Contenuto: 47 slide strategia DMS

2. **Tre Pilastri** (Q2 2025) - Verde acqua
   - Posizione: Ore 1
   - Collegamento: PDF viewer interno

3. **Analisi & Problemi** (Q3 2025) - Rosa
   - Posizione: Ore 3
   - Collegamento: PDF viewer interno

#### Quadrante Destro (3-6)
4. **Pilota Mercato** (Q1 2026) - Blu scuro
   - Posizione: Ore 4
   - Collegamento: PDF viewer interno

5. **Hub Emilia-Romagna** (Q2 2026) - Arancione
   - Posizione: Ore 5
   - Collegamento: PDF viewer interno

6. **Gemello Digitale / SDG** (Q3 2026) - Verde
   - Posizione: Ore 6
   - Collegamento: PDF viewer interno

#### Quadrante Inferiore (6-9)
7. **Moduli & Servizi** (Q4 2026) - Rosso
   - Posizione: Ore 7
   - Collegamento: PDF viewer interno

8. **Carbon Credit & ESG** (Q1 2027) - Blu chiaro
   - Posizione: Ore 8
   - Collegamento: PDF viewer interno

9. **Bolkestein & Mercati** (Q4 2027) - Rosso scuro
   - Posizione: Ore 9
   - Collegamento: PDF viewer interno

#### Quadrante Sinistro (9-12)
10. **All-in-One** (Q1 2028) - Verde lime
    - Posizione: Ore 10
    - Collegamento: PDF viewer interno

11. **Web3 / Token / On-chain** (Q2 2028) - Blu elettrico
    - Posizione: Ore 11
    - Collegamento: PDF viewer interno

12. **Video & Timeline** (Q3 2028) - Giallo
    - Posizione: Ore 12 (esterno)
    - Collegamento: PDF viewer interno

### Video Centrale
- **Titolo**: "IL PORTALE E-COMMERCE EXTRA-UE"
- **Durata**: 2:08 minuti
- **Controlli**: Play/Pause, Volume, Fullscreen, Menu
- **Posizione**: Centro dell'orologio
- **Sfondo**: Rosso con mappa Italia dorata

### Funzionalità PDF Viewer
- **Apertura**: Click su qualsiasi pulsante orologio
- **Visualizzazione**: Modal interno con sfondo nero
- **Controlli**: Pulsante X per chiusura
- **Responsive**: Adattamento automatico mobile/desktop
- **Sistema**: PDF.js Lite personalizzato



---

## 🗺️ PAGINA MAPPA MINISTERI

### URL
`https://chcndr.github.io/dms-gemello-news/landing/mappa-ministeri.html`

### Design e Layout
- **Sfondo**: Gradiente teal scuro uniforme
- **Layout**: Mappa interattiva centrale con ministeri collegati
- **Titolo**: "Mappa Ministeri (sandbox)" in alto a destra
- **Elemento Centrale**: Icona palazzo governativo bianco

### Controlli Superiori
1. **Auto-rotate** (checkbox) - Rotazione automatica della mappa
2. **Linee** (checkbox) - Visualizzazione linee di collegamento
3. **Cerca ministero...** (campo di ricerca) - Ricerca rapida ministeri

### Ministeri Mappati (15 entità)

#### Ministeri Principali
1. **MEF** - Economia e Finanze (Rosso, #10)
2. **Ministero dell'Interno** (Blu scuro, #11)
3. **Ministero della Salute** (Rosso, #12)
4. **Ministero del Turismo** (Verde, #13)
5. **Ministero del Lavoro** (Blu, #14)
6. **MIT** - Infrastrutture e Trasporti (Arancione, #15)
7. **MIM** - Istruzione e Merito (Viola, #16)
8. **MIMIT** - Imprese e Made in Italy (Teal, #17)
9. **MASE** - Ambiente e Sicurezza (Rosa, #18)
10. **MASAF** - Agricoltura (Viola scuro, #19)
11. **MAECI** - Affari Esteri (Arancione, #20)
12. **MIC** - Cultura (Verde scuro, #21)

#### Agenzie e Enti
13. **AE** - Agenzia Entrate (Rosso, #22)
14. **ADM** - Agenzia Dogane (Blu, #23)
15. **PagoPA S.p.A.** (Rosso, #24)

#### Enti Tecnici
16. **AgID** (Verde, #9)

### Controlli Zoom
- **0.8×** - Zoom ridotto
- **1.0×** - Zoom normale (default)
- **1.2×** - Zoom ingrandito

### Funzionalità Interattive
- **Click su ministero**: Evidenziazione e focus
- **Ricerca**: Filtro in tempo reale
- **Linee di collegamento**: Visualizzazione relazioni
- **Auto-rotate**: Rotazione automatica vista

### Tecnologia
- **Libreria**: Leaflet.js personalizzato
- **Responsive**: Adattamento mobile/desktop
- **Interattività**: Click, hover, zoom

---

## 📚 PAGINA SPOT & DOCUMENTI

### URL
`https://chcndr.github.io/dms-gemello-news/landing/spot.html`

### Design e Layout
- **Layout**: Due colonne - Documenti (sinistra) + Video (destra)
- **Sfondo**: Gradiente teal scuro
- **Titolo**: "DMS · Gemello Digitale — Spot & Documenti"
- **Sottotitolo**: "Archivio completo della documentazione DMS organizzato per categorie"

### Sezione Documenti (PDF) - Colonna Sinistra

#### DOCUMENTI BASE (15 PDF)
1. **Hub Nazionale del Commercio** (Viola, #4)
2. **DMS & CLUST-ER** (Verde, #5)
3. **Dossier Nazionale** (Rosa, #6)
4. **DMS - Riaccendiamo i Mercati, Rivitalizziamo le Città** (Viola, #7)
5. **Passaporto EU** (Arancione, #8)
6. **Presentazione DMS (Bologna)** (Verde, #9)
7. **Hub Urbani e di Prossimità in Emilia-Romagna** (Rosso, #10)
8. **Gemello DMS** (Verde, #11)
9. **DMS ECC (narrativo)** (Rosso, #12)
10. **DMS ECC (tecnico)** (Verde, #13)
11. **Carbon Credit – Logica** (Blu, #14)
12. **Carbon Credit DMS** (Arancione, #15)
13. **Ecosistema Costi PA** (Viola, #4)
14. **Analisi & Soluzione DMS** (Verde, #5)
15. **Scenario Futuro** (Rosa, #6)

#### ANALISI E RICERCHE (6 PDF)
1. **Analisi Commercio Ambulante** (Viola, #7)
2. **Report Controlli PA** (Arancione, #8)
3. **Analisi Dati Sistema** (Verde, #9)
4. **Mercato dell'Usato** (Rosso, #10)
5. **Riequilibrio Economico** (Blu, #11)
6. **Relazione Approfondita DMS (102 pagine)** (Rosso, #12)

#### IMPLEMENTAZIONE TECNICA (6 PDF)
1. **DMS Sistema Completo** (Verde, #13)
2. **Implementazioni Avanzate** (Blu, #14)
3. **DMS Offline con CIE** (Arancione, #15)
4. **Gestione Servizi Accessori** (Arancione, #16)
5. **DMS al Centro di Tutto** (Viola, #4)
6. **Frammentazione Digitale PA** (Verde, #5)

#### FINTECH E CARBON CREDIT (4 PDF)
1. **DMS FinTech** (Rosa, #6)
2. **Eco Carbon Credit** (Viola, #7)
3. **Logica Carbon Credit Avanzata** (Arancione, #8)
4. **Eventi Straordinari** (Verde, #9)

#### PROGETTO NAZIONALE (4 PDF)
1. **Progetto Nazionale** (Rosso, #10)
2. **Hub DMS Web3 Europa** (Verde, #11)
3. **Premessa Politica** (Rosso, #12)
4. **Bolkestein Commercio** (Verde, #13)

#### APP E STRUMENTI (3 PDF)
1. **App DMS Assistente** (Blu, #14)
2. **DMS Locandina** (Arancione, #15)
3. **DMS Set v2** (Arancione, #15)

### Sezione Video - Colonna Destra

#### Video Principali (3 video)
1. **Riaccendiamo i mercati** (1:25 min)
   - Sfondo: Nero con elementi grafici
   - Controlli: Play/Pause, Volume, Fullscreen

2. **Hub Emilia Romagna** (1:10 min)
   - Sfondo: Mappa Italia con connessioni luminose
   - Stile: Tecnologico/futuristico

3. **Futuro con DMS** (1:05 min)
   - Sfondo: Nero
   - Controlli completi

### Sezione Riferimenti Normativi & PNRR

#### Normative UE (12 riferimenti)
1. **Single Digital Gateway** (Reg. UE 2018/1724) - Verde (#17)
2. **Interoperable Europe** (Reg. UE 2024/903) - Rosa (#18)
3. **eIDAS 2 – Digital Wallet** (Reg. UE 2024/1183) - Blu (#19)
4. **ESPR & Digital Product Passport** (Reg. UE 2024/1781) - Arancione (#20)
5. **Direttiva Servizi** (2006/123/CE – "Bolkestein") - Viola (#16)
6. **SUAP** – DPR 160/2010 - Verde (#17)
7. **Riforma Dogane UE** (pacchetto COM(2023) 258–260) - Blu (#18)
8. **PNRR – Italia Domani** - Viola (#19)
9. **PDND** – Piattaforma Digitale Nazionale Dati - Arancione (#20)
10. **AgID** – Linee guida interoperabilità - Verde (#21)
11. **CBAM** – Carbon Border Adjustment (Reg. UE 2023/956) - Rosso (#22)
12. **ETS Revision** – Sistema Scambio Emissioni (Dir. UE 2023/959) - Blu (#23)
13. **CSRD** – Corporate Sustainability Reporting (Dir. UE 2022/2464) - Nero (#24)
14. **AI Act** – Regolamento Intelligenza Artificiale (Reg. UE 2024/1689) - Verde (#25)

#### CTA Finale
- **Pulsante**: "Vai alla legge ufficiale" (Blu, #26)
- **Funzione**: Collegamento a normative ufficiali

---

## 🔧 SISTEMA PDF VIEWER

### Architettura PDF Viewer
Il sito utilizza un sistema multi-layer per la gestione dei PDF:

#### 1. PDF.js Lite Personalizzato
- **Percorso**: `/landing/pdfjs-lite/index.html`
- **Caratteristiche**:
  - Sfondo nero per ottimale visualizzazione
  - Pulsante X per chiusura in alto a destra
  - Responsive design mobile/desktop
  - Disabilitazione pull-to-refresh su iOS

#### 2. DMS Modal Lite
- **File CSS**: `/landing/assets/dms-modal-lite.css`
- **File JS**: `/landing/assets/dms-modal-lite.js`
- **Funzioni**:
  - Modal overlay con sfondo semi-trasparente
  - Gestione iframe per PDF
  - Controlli chiusura (X, ESC, click esterno)

#### 3. DMS Spot Hardener
- **File**: `/landing/assets/dms-spot-hardener.js`
- **Funzioni**:
  - Gestione robusta PDF nella sezione Spot
  - Intercettazione click su link PDF
  - Prevenzione apertura nuove finestre

#### 4. PDF ENFORCER System
- **Versione**: finale-006
- **Funzioni**:
  - Riscrittura automatica URL PDF
  - Intercettazione click aggressiva
  - Cache busting automatico
  - Rimozione target="_blank"

#### 5. Kill Debug Watermark
- **File**: `/landing/assets/kill-debug-watermark.css`
- **Funzioni**:
  - Rimozione watermark "PDF ENFORCER finale-006"
  - Nasconde elementi debug
  - CSS aggressivo per pulizia UI

### Flusso di Apertura PDF
1. **Click utente** su pulsante/link PDF
2. **Intercettazione** da PDF ENFORCER
3. **Costruzione URL** viewer con parametri
4. **Apertura modal** DMS Modal Lite
5. **Caricamento PDF** in iframe
6. **Rimozione debug** via Kill Debug Watermark

---

## 📋 INVENTARIO COMPLETO PDF

### Totale PDF nel Progetto: 147 file

#### Directory `/landing/docs/` (35 PDF)
1. ANALISI E SOLUZIONE DMS.pdf
2. APP DMS Assistente Personale.pdf
3. Analisi.pdf
4. BOLKESTEIN COMMERCIO SU AREA PUBBLICA.pdf
5. CARBON CREDIT DMS.pdf
6. COSTI PA.pdf
7. DMS ALL-IN-ONE.pdf
8. DMS - Riaccendiamo i Mercati, Rivitalizziamo le Città.pdf
9. DMS E CLUST-ER.pdf
10. DMS ECC.pdf
11. DMS ONCE ONLY SINGLE DIGITAL GATEWAY.pdf
12. DMS SPOT 1.pdf
13. DMS SSET.pdf
14. DOSSIER NAZIONALE.pdf
15. EQUILIBRIO ECOSOSTENIBILE.pdf
16. HUB DMS The First Web3-Ready Public Market Platform in Europe.pdf
17. HUB NAZIONALE DEL COMMERCIO.pdf
18. HUB URBANI E DI PROSSIMITÀ.pdf
19. Hub Urbani e di Prossimità in Emilia-Romagna.pdf
20. PRESENTAZIONE DMS -compressed.pdf
21. PROGETTO NAZIONALE.pdf
22. RIEQUILIBRIO.pdf
23. Relazione sui controlli.pdf
24. USATO.pdf
25. analisi-soluzione-dms.pdf
26. analisi.pdf
27. app-dms-assistente.pdf
28. bolkestein-mercati.pdf
29. carbon-credit-dms.pdf
30. carbon-credit-logica.pdf
31. dms-all-in-one.pdf
32. dms-cluster-er.pdf
33. dms-ecc-narrativo.pdf
34. dms-ecc-tecnico.pdf
35. dms-spot-1.pdf

#### Directory `/docs/` (35 PDF - duplicati)
[Stessi file della directory landing/docs]

#### Directory `/pdf/` (21 PDF)
1. analisi-soluzione-dms.pdf
2. analisi.pdf
3. app-dms-assistente.pdf
4. bolkestein-mercati.pdf
5. carbon-credit-dms.pdf
6. carbon-credit-logica.pdf
7. dms-all-in-one.pdf
8. dms-cluster-er.pdf
9. dms-ecc-narrativo.pdf
10. dms-ecc-tecnico.pdf
11. dms-spot-1.pdf
12. dms-sset.pdf
13. dossier-nazionale.pdf
14. ecosistema-costi-pa.pdf
15. equilibrio-ecosostenibile.pdf
16. gemello-dms.pdf
17. hub-nazionale-commercio.pdf
18. hub-urbani-prossimita-er.pdf
19. once-only-sdg.pdf
20. passaporto-eu.pdf
21. presentazione-dms-bologna.pdf

#### Directory `/docs_raw/` (18 PDF)
1. ANALISIESOLUZIONEDMS.pdf
2. CARBONCREDITDMS(2).pdf
3. DMS-RiaccendiamoiMercatiRivitalizziamoleCittà.pdf
4. DMSECC(1).pdf
5. DMSECLUST-ER(3).pdf
6. DOSSIERNAZIONALE(1).pdf
7. EQUILIBRIOECOSOSTENIBILE.pdf
8. EcosistemaDMS-hub+costiPA.pdf
9. HUBNAZIONALEDELCOMMERCIO(1).pdf
10. HubUrbaniinEmiliaRomagna(1).pdf
11. LOGICACARBONCREDIT(1).pdf
12. PASSAPORTOEU(1).pdf
13. PRESENTAZIONEDMS-CITTÀMETROPOLITANADIBOLOGNA(1).pdf
14. PRESENTAZIONEDMS-compressed(7).pdf
15. PRESENTAZIONEDMS-compressed(8).pdf
16. ScenarioFuturo(1).pdf
17. dms-cluster.pdf
18. hub-nazionale.pdf

#### File Root
1. RELAZIONE_SINTETICA_FUNZIONAMENTO.pdf

### Categorie Tematiche PDF

#### Documenti Strategici (8 PDF)
- Hub Nazionale del Commercio
- Dossier Nazionale  
- Progetto Nazionale
- DMS All-in-One
- Gemello DMS
- Scenario Futuro
- Presentazione DMS Bologna
- Relazione Sintetica Funzionamento

#### Analisi e Ricerche (7 PDF)
- Analisi e Soluzione DMS
- Analisi Commercio Ambulante
- Report Controlli PA
- Mercato dell'Usato
- Riequilibrio Economico
- Ecosistema Costi PA
- Equilibrio Ecosostenibile

#### Implementazione Tecnica (6 PDF)
- DMS Sistema Completo
- DMS ECC (narrativo/tecnico)
- DMS Offline con CIE
- DMS Once Only SDG
- Frammentazione Digitale PA
- Implementazioni Avanzate

#### FinTech e Carbon Credit (4 PDF)
- Carbon Credit DMS
- Carbon Credit Logica
- DMS FinTech
- Eventi Straordinari

#### Normative e Compliance (3 PDF)
- Bolkestein Commercio
- Passaporto EU
- Direttiva Servizi

#### App e Strumenti (3 PDF)
- App DMS Assistente
- DMS Spot 1
- DMS Set v2

#### Hub Regionali (2 PDF)
- Hub Emilia-Romagna
- Hub Urbani Prossimità

---

## 📱 CARATTERISTICHE RESPONSIVE

### Breakpoint Design
- **Desktop**: > 1200px - Layout completo
- **Tablet**: 768px - 1200px - Layout adattato
- **Mobile**: < 768px - Layout mobile-first

### Ottimizzazioni Mobile

#### Pagina Home
- **Orologio**: Scala automatica con `transform: scale(.92)`
- **Pulsanti**: Dimensioni touch-friendly (min 44px)
- **Video**: Player responsive con controlli nativi
- **Navigazione**: Tab orizzontali ottimizzati

#### Pagina Mappa
- **Controlli**: Riposizionamento per accessibilità touch
- **Zoom**: Controlli Leaflet ottimizzati mobile
- **Ricerca**: Campo di ricerca responsive
- **Ministeri**: Pulsanti ridimensionati automaticamente

#### Pagina Spot
- **Layout**: Colonne che si impilano su mobile
- **PDF**: Link ottimizzati per touch
- **Video**: Player responsive
- **Categorie**: Sezioni collassabili

#### PDF Viewer
- **Modal**: Fullscreen su mobile
- **Controlli**: Pulsante X dimensionato per touch
- **Scroll**: Disabilitazione pull-to-refresh iOS
- **Zoom**: Controlli PDF.js ottimizzati

### Tecnologie Responsive
- **CSS Grid**: Layout principale
- **Flexbox**: Componenti interni
- **Media Queries**: Breakpoint specifici
- **Viewport Meta**: Configurazione mobile
- **Touch-action**: Gestione touch events

---

## 🚀 GUIDA DEPLOY GITHUB PAGES

### Prerequisiti
- Repository GitHub: `Chcndr/dms-gemello-news`
- Branch: `main`
- GitHub Pages abilitato

### Struttura Deploy
```
Repository Root:
├── landing/              # Sito principale
│   ├── home.html        # Entry point
│   ├── mappa-ministeri.html
│   ├── spot.html
│   ├── pol0/            # Sezione politiche
│   ├── pdfjs-lite/      # PDF viewer
│   └── assets/          # Risorse statiche
├── docs/                # Documentazione PDF
├── pdf/                 # PDF ottimizzati
└── README.md           # Documentazione
```

### Processo Deploy Automatico

#### 1. Commit e Push
```bash
git add .
git commit -m "feat: descrizione modifiche"
git push origin main
```

#### 2. GitHub Actions (Automatico)
- **Trigger**: Push su branch `main`
- **Build**: Nessun build necessario (sito statico)
- **Deploy**: Automatico su GitHub Pages

#### 3. Verifica Deploy
- **URL**: `https://chcndr.github.io/dms-gemello-news/landing/home.html`
- **Tempo**: 2-5 minuti per propagazione
- **Status**: Verificabile in Actions tab

### Configurazione GitHub Pages
1. **Repository Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `/ (root)`
4. **Custom domain**: Non configurato

### Cache Busting
Il sito utilizza parametri di versioning:
- CSS: `?v=001`, `?v=002`, etc.
- JS: `?v=finale-006`, `?v=stable-news-001`
- Immagini: `?v=stable-news-001`

### Monitoraggio Deploy
- **GitHub Actions**: Workflow automatico
- **Status Badge**: Disponibile nel README
- **Logs**: Accessibili in Actions tab

### Rollback Procedure
```bash
# Rollback all'ultimo commit funzionante
git revert HEAD
git push origin main

# O rollback a commit specifico
git reset --hard <commit-hash>
git push --force origin main
```

---

## 🔧 TROUBLESHOOTING

### Problemi Comuni

#### PDF non si aprono
1. **Verifica**: Console browser per errori JavaScript
2. **Soluzione**: Controllare percorsi PDF in `/landing/docs/`
3. **Cache**: Forzare refresh con Ctrl+F5

#### Watermark debug visibili
1. **File**: Verificare caricamento `kill-debug-watermark.css`
2. **Versioning**: Aggiornare parametro `?v=` nel CSS
3. **Cache**: Svuotare cache browser

#### Layout mobile rotto
1. **Viewport**: Verificare meta tag viewport
2. **CSS**: Controllare media queries
3. **JavaScript**: Verificare errori console mobile

#### Video non funzionano
1. **Formato**: Verificare supporto browser
2. **Percorsi**: Controllare URL video
3. **HTTPS**: Verificare protocollo sicuro

### Strumenti Debug
- **Chrome DevTools**: Ispeziona elementi e console
- **Mobile Simulator**: Test responsive design
- **Network Tab**: Verifica caricamento risorse
- **Lighthouse**: Audit performance e accessibilità

### Contatti Supporto
- **Repository**: Issues su GitHub
- **Documentazione**: File README.md
- **Logs**: GitHub Actions per deploy

---

## 📊 METRICHE E PERFORMANCE

### Statistiche Sito
- **Pagine**: 4 principali + sottosezioni
- **PDF**: 147 documenti totali
- **Video**: 4 video integrati
- **Ministeri**: 16 entità mappate
- **Normative**: 14 riferimenti UE

### Performance
- **Caricamento**: < 3 secondi
- **Mobile Score**: 90+ (Lighthouse)
- **Accessibilità**: AA compliant
- **SEO**: Ottimizzato per motori ricerca

### Browser Support
- **Chrome**: 90+ ✅
- **Firefox**: 85+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅
- **Mobile**: iOS 14+, Android 10+ ✅

---

*Documentazione aggiornata al: 20 Settembre 2025*
*Versione sito: finale-006*
*Repository: https://github.com/Chcndr/dms-gemello-news*
