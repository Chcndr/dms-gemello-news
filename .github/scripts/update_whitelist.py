#!/usr/bin/env python3
"""
DMS Whitelist Updater
Aggiorna whitelist.json con nuove sessioni temporanee
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta

def update_whitelist(sub, jti=None, scope="news-private", minutes=60):
    """
    Aggiorna whitelist.json con nuova sessione
    
    Args:
        sub (str): Email/subject dell'utente
        jti (str, optional): Token ID
        scope (str): Scope di accesso
        minutes (int): Durata in minuti
    """
    
    # Normalizza input
    sub = sub.lower().strip()
    scope = scope.strip() or "news-private"
    
    # Calcola scadenza
    now = datetime.now(timezone.utc)
    exp = int((now + timedelta(minutes=minutes)).timestamp())
    
    # Path del file
    whitelist_path = 'landing/viewer/whitelist.json'
    
    # Carica whitelist esistente o crea nuova
    if os.path.exists(whitelist_path):
        with open(whitelist_path, 'r') as f:
            data = json.load(f)
    else:
        data = {
            'version': 1,
            'generated_at': now.isoformat(),
            'entries': []
        }
    
    # Assicura struttura corretta
    if 'entries' not in data:
        data['entries'] = []
    
    # Cerca entry esistente per sub o jti
    existing_index = -1
    for i, entry in enumerate(data['entries']):
        if (entry.get('sub', '').lower() == sub) or (jti and entry.get('jti') == jti):
            existing_index = i
            break
    
    # Crea nuova entry
    new_entry = {
        'sub': sub,
        'scope': [scope],
        'exp': exp
    }
    
    if jti:
        new_entry['jti'] = jti
    
    # Aggiorna o inserisci entry
    if existing_index >= 0:
        data['entries'][existing_index] = new_entry
        print(f'✅ Aggiornata entry esistente per {sub}')
    else:
        data['entries'].append(new_entry)
        print(f'✅ Creata nuova entry per {sub}')
    
    # Aggiorna metadata
    data['generated_at'] = now.isoformat()
    
    # Salva file
    os.makedirs(os.path.dirname(whitelist_path), exist_ok=True)
    with open(whitelist_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f'📋 Whitelist aggiornata:')
    print(f'   - Email: {sub}')
    print(f'   - JTI: {jti or "N/A"}')
    print(f'   - Scope: {scope}')
    print(f'   - Scadenza: {datetime.fromtimestamp(exp, timezone.utc).isoformat()}')
    print(f'   - Durata: {minutes} minuti')
    
    return data

def cleanup_expired(whitelist_path='landing/viewer/whitelist.json'):
    """
    Rimuove entry scadute dalla whitelist
    """
    if not os.path.exists(whitelist_path):
        print('❌ Whitelist non trovata')
        return
    
    with open(whitelist_path, 'r') as f:
        data = json.load(f)
    
    if 'entries' not in data:
        return
    
    now = int(datetime.now(timezone.utc).timestamp())
    original_count = len(data['entries'])
    
    # Filtra entry non scadute
    data['entries'] = [entry for entry in data['entries'] if entry.get('exp', 0) > now]
    
    removed_count = original_count - len(data['entries'])
    
    if removed_count > 0:
        # Aggiorna metadata
        data['generated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Salva file
        with open(whitelist_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f'🧹 Rimosse {removed_count} entry scadute')
    else:
        print('✅ Nessuna entry scaduta da rimuovere')

def main():
    """
    Entry point per uso da command line
    """
    if len(sys.argv) < 2:
        print('Uso: python3 update_whitelist.py <email> [jti] [scope] [minutes]')
        print('Esempio: python3 update_whitelist.py user@example.com abc123 news-private 60')
        sys.exit(1)
    
    sub = sys.argv[1]
    jti = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else None
    scope = sys.argv[3] if len(sys.argv) > 3 else "news-private"
    minutes = int(sys.argv[4]) if len(sys.argv) > 4 else 60
    
    try:
        update_whitelist(sub, jti, scope, minutes)
        print('🎉 Operazione completata con successo!')
    except Exception as e:
        print(f'❌ Errore: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()
