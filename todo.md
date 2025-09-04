# TODO - Ripristino Mappa Elegante e Sistemazione Navigazione

## Fase 1: Backup e preparazione git ✅
- [x] Creato tag di backup SAFE_BEFORE_FIX_20250904-0708
- [x] Creato branch fix/mappa-elegante-nav-spot

## Fase 2: Analisi stato attuale dei file ✅
- [x] Verificato mappa-ministeri.html - ha già modal elegante implementata
- [x] Verificato spot.html - NON ESISTE (causa 404)
- [x] Verificato home.html - link Spot punta a "/dms-gemello-news/"
- [x] Verificato mappa-ministeri.html - manca navbar coerente

## Fase 3: Implementazione mappa elegante con modal ✅
- [x] Verificato che modal in mappa-ministeri.html funzioni correttamente
- [x] Aggiunto navbar coerente (Home • Mappa • Spot) con percorsi relativi
- [x] Aggiunto cache-buster ai link di navigazione

## Fase 4: Sistemazione Spot 404 e navbar coerente ✅
- [x] Creato landing/spot.html con redirect a ../index.html (root del progetto)
- [x] Uniformato navbar su tutti i file con percorsi relativi
- [x] Verificato che tutti i link usino percorsi relativi

## Fase 5: Test e verifica finale ✅
- [x] Testato navigazione Home → Mappa → Spot
- [x] Verificato modal elegante con overlay e frecce (limitazioni CORS in locale)
- [x] Testato chiusura con Esc (da verificare in produzione)
- [x] Verificato multi-slide per MEF/AgID (file presenti in cards/)

## Fase 6: Commit e PR
- [ ] Commit solo i file modificati
- [ ] Aprire PR
- [ ] Verificare i 3 URL prima del merge

