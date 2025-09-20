# 🚀 GUIDA DEPLOY STABILE - DMS Gemello News

## ⚡ DEPLOY RAPIDO (2 MINUTI)

### 1. Clone Repository
```bash
git clone https://github.com/Chcndr/dms-gemello-news.git
cd dms-gemello-news
```

### 2. Modifica Files
```bash
# Modifica i file necessari in:
# - landing/home.html
# - landing/spot.html  
# - landing/mappa-ministeri.html
# - landing/assets/
```

### 3. Deploy Automatico
```bash
git add .
git commit -m "feat: descrizione modifiche"
git push origin main
```

### 4. Verifica (2-5 min)
- **URL Live**: https://chcndr.github.io/dms-gemello-news/landing/home.html
- **Status**: https://github.com/Chcndr/dms-gemello-news/actions

---

## 🏗️ ARCHITETTURA STABILE

### Entry Points
- **Home**: `/landing/home.html` (Orologio roadmap)
- **Mappa**: `/landing/mappa-ministeri.html` (16 ministeri)
- **Spot**: `/landing/spot.html` (147 PDF + video)

### Sistemi Critici
1. **PDF Viewer**: `/landing/pdfjs-lite/` (sfondo nero)
2. **Modal System**: `/landing/assets/dms-modal-lite.*`
3. **Debug Killer**: `/landing/assets/kill-debug-watermark.css`

### File Non Toccare
- `/landing/pol0/` (47 slide politiche)
- `/landing/assets/doc/` (immagini ministeri)
- `/docs/`, `/pdf/`, `/docs_raw/` (archivi PDF)

---

## 🔧 MODIFICHE SICURE

### ✅ Modifiche Consentite
- Aggiungere PDF in `/landing/docs/`
- Modificare CSS in `/landing/assets/`
- Aggiornare contenuti HTML
- Aggiungere video/immagini

### ❌ Modifiche Rischiose
- Rimuovere sistema PDF ENFORCER
- Modificare `/landing/pdfjs-lite/`
- Cambiare struttura directory
- Rimuovere `kill-debug-watermark.css`

---

## 🐛 TROUBLESHOOTING RAPIDO

### PDF non si aprono
```bash
# Verifica percorsi
ls -la landing/docs/
# Controlla console browser per errori
```

### Watermark debug visibili
```bash
# Aggiorna versione CSS
sed -i 's/?v=001/?v=002/g' landing/pol0/index.html
sed -i 's/?v=001/?v=002/g' landing/pdfjs-lite/index.html
```

### Layout mobile rotto
```bash
# Verifica viewport meta tag
grep -r "viewport" landing/
```

---

## 📋 CHECKLIST PRE-DEPLOY

- [ ] Test PDF viewer funzionante
- [ ] Nessun watermark debug visibile
- [ ] Layout responsive OK
- [ ] Video riproducibili
- [ ] Link navigazione funzionanti
- [ ] Console browser senza errori

---

## 🔄 ROLLBACK VELOCE

```bash
# Rollback ultimo commit
git revert HEAD
git push origin main

# Rollback a commit specifico
git log --oneline -5
git reset --hard <commit-hash>
git push --force origin main
```

---

## 📊 STATUS SISTEMA

### ✅ Funzionante
- PDF viewer con sfondo nero
- Rimozione watermark debug
- Layout responsive
- Navigazione tra pagine
- Video integrati

### 🔧 Configurato
- GitHub Pages automatico
- Cache busting attivo
- Mobile optimization
- Cross-browser compatibility

### 📈 Performance
- Caricamento < 3 sec
- Mobile Score 90+
- 147 PDF disponibili
- 16 ministeri mappati

---

## 🆘 SUPPORTO EMERGENZA

### Contatti
- **Repository**: https://github.com/Chcndr/dms-gemello-news
- **Issues**: GitHub Issues tab
- **Actions**: GitHub Actions per logs deploy

### Backup
- **Branch main**: Sempre stabile
- **Commit history**: Rollback disponibile
- **PDF Archive**: Multipli backup in `/docs/`, `/pdf/`

---

*Guida aggiornata: 20 Settembre 2025*
*Sistema testato e stabile ✅*
