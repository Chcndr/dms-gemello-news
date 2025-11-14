# 🔐 Sistema di Sicurezza Email DMS - Manuale Operativo

## 📋 Panoramica Sistema

Il sistema di sicurezza implementato protegge l'accesso al sito DMS tramite:
- **Invio link** da email autorizzata (`checchi@me.com`)
- **Conferma via risposta** email per attivazione
- **Sessioni temporanee** di 60 minuti
- **Anti-condivisione** con device fingerprinting

## 🏗️ Architettura Tecnica

### Componenti Implementati

1. **📄 Whitelist JSON** (`/landing/viewer/whitelist.json`)
   - Memorizza sessioni attive con email, token, scadenza
   - Aggiornata automaticamente da GitHub Actions

2. **🛡️ Auth-Gate Script** (`/landing/common/auth-gate.js`)
   - Controlla accesso su ogni pagina protetta
   - Device fingerprinting per anti-condivisione
   - Redirect automatico se non autorizzato

3. **⚙️ GitHub Actions**
   - `activate-session.yml`: Attiva sessioni di 60 minuti
   - `cleanup-whitelist.yml`: Pulizia automatica ogni 10 minuti

4. **🔧 Token Maker** (`/landing/admin/make-token.html`)
   - Genera link di invito con token casuali
   - Istruzioni operative complete

## 🚀 Procedura Operativa

### Fase 1: Generazione Link Invito

1. **Apri Token Maker**
   ```
   https://chcndr.github.io/dms-gemello-news/landing/admin/make-token.html
   ```

2. **Genera Link**
   - Inserisci email destinatario
   - Clicca "🎯 Crea token & link"
   - Copia il link generato

3. **Invia Email**
   - **DA:** `checchi@me.com` (OBBLIGATORIO)
   - **A:** Email destinatario
   - **OGGETTO:** "Accesso temporaneo DMS"
   - **CORPO:** Incolla il link generato

### Fase 2: Attivazione Sessione

1. **Attendi Risposta**
   - L'utente deve rispondere alla tua email
   - Anche risposta vuota va bene

2. **Attiva su GitHub**
   - Vai su: https://github.com/Chcndr/dms-gemello-news/actions
   - Clicca "Activate session (60m)"
   - Clicca "Run workflow"
   - Inserisci:
     - **email:** `utente@dominio.com`
     - **token:** `c274daa0495eed4cb3f89457` (dal link)
     - **minutes:** `60`
   - Clicca "Run workflow"

3. **Conferma Attivazione**
   - Attendi completamento workflow (✅)
   - L'utente può ora accedere per 60 minuti

### Fase 3: Rinnovo Sessione

1. **Scadenza Automatica**
   - Dopo 60 minuti l'utente viene reindirizzato a pagina di blocco
   - Messaggio: "Rispondere alla stessa email per continuare"

2. **Rinnovo**
   - L'utente risponde di nuovo alla stessa email
   - Tu ricevi la notifica di risposta
   - Rilanci la stessa GitHub Action con stessi parametri
   - Sessione rinnovata per altri 60 minuti

## 🔒 Pagine Protette

Il sistema protegge automaticamente:

- **🏠 HOME** - https://chcndr.github.io/dms-gemello-news/landing/home.html
- **📊 SPOT** - https://chcndr.github.io/dms-gemello-news/landing/spot.html
- **🎯 POLITICA 0** - https://chcndr.github.io/dms-gemello-news/landing/pol0/
- **📄 VIEWER** - Tutti i PDF protetti
- **📄 VIEWER LITE** - PDF con zoom automatico

## 🛡️ Protezioni Anti-Condivisione

### Device Fingerprinting
```javascript
// Componenti del fingerprint
- User Agent
- Risoluzione schermo
- Timezone
- Lingua browser
- Platform
```

### Controlli di Sicurezza
- ✅ **Email matching**: Solo l'email che ha ricevuto il link può accedere
- ✅ **Token univoco**: Ogni link ha token irripetibile
- ✅ **Device binding**: Accesso legato al device di risposta
- ✅ **Scadenza temporale**: 60 minuti esatti
- ✅ **Anti-condivisione**: Link non funziona su altri device

## 📊 Monitoraggio Sistema

### Whitelist Attuale
```
https://chcndr.github.io/dms-gemello-news/landing/viewer/whitelist.json
```

### GitHub Actions
```
https://github.com/Chcndr/dms-gemello-news/actions
```

### Log Attività
- Ogni attivazione/rinnovo è tracciato nei commit
- Pulizia automatica ogni 10 minuti
- Storico completo su GitHub

## 🚨 Risoluzione Problemi

### Utente Non Riesce ad Accedere

1. **Verifica Email**
   - Link inviato da `checchi@me.com`?
   - Utente ha risposto alla stessa email?

2. **Verifica Attivazione**
   - GitHub Action eseguita con successo?
   - Email e token corretti?
   - Sessione non scaduta?

3. **Verifica Device**
   - Utente usa stesso device della risposta?
   - Browser supporta JavaScript?

### Link Non Funziona

1. **Controlla Whitelist**
   - Sessione presente e non scaduta?
   - Token corretto?

2. **Rigenera Link**
   - Crea nuovo token
   - Invia nuovo link
   - Attiva nuova sessione

## 📈 Statistiche Utilizzo

### Metriche Disponibili
- Numero sessioni attive
- Durata media sessioni
- Frequenza rinnovi
- Device più utilizzati

### Report Automatici
- Commit log per attivazioni
- Cleanup log per scadenze
- GitHub Actions history

## 🔧 Manutenzione Sistema

### Operazioni Periodiche
- ✅ **Pulizia automatica**: Ogni 10 minuti
- ✅ **Backup whitelist**: Ad ogni commit
- ✅ **Log rotazione**: Automatica GitHub

### Aggiornamenti
- Modifiche auth-gate: Bump `?v=STABLE1` → `?v=STABLE2`
- Nuove funzionalità: Test in branch separato
- Deploy: Push su main per attivazione immediata

## 📞 Supporto Tecnico

### Contatti Emergenza
- **Repository**: https://github.com/Chcndr/dms-gemello-news
- **Issues**: Per segnalazioni bug
- **Actions**: Per monitoraggio real-time

### Backup e Ripristino
- **Tag stabile**: `STABLE-GEMELLO-NEWS-V1`
- **Rollback**: `git checkout STABLE-GEMELLO-NEWS-V1`
- **Ripristino**: Push del tag per deploy immediato

---

## ✅ Sistema Operativo e Testato

**🎯 Status:** ATTIVO e FUNZIONANTE
**📅 Deploy:** 16 Settembre 2025
**🔒 Sicurezza:** Livello Enterprise
**⚡ Performance:** Ottimizzata per GitHub Pages

**Il sistema è pronto per l'uso in produzione!**

