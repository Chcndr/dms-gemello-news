#!/usr/bin/env python3
import json
import os
import re

# Carica il docs.json
with open('landing/assets/docs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Lista dei file PDF reali
pdf_files = []
for file in os.listdir('landing/docs'):
    if file.endswith('.pdf'):
        pdf_files.append(file)

print(f"Trovati {len(pdf_files)} file PDF")

# Funzione per trovare il file corrispondente
def find_matching_file(filename, pdf_files):
    # Prima prova il nome esatto
    if filename in pdf_files:
        return filename
    
    # Prova con spazi invece di trattini
    with_spaces = filename.replace('-', ' ')
    if with_spaces in pdf_files:
        return with_spaces
    
    # Prova con trattini invece di spazi
    with_dashes = filename.replace(' ', '-')
    if with_dashes in pdf_files:
        return with_dashes
    
    # Prova ricerca case-insensitive
    filename_lower = filename.lower()
    for pdf in pdf_files:
        if pdf.lower() == filename_lower:
            return pdf
    
    # Prova ricerca parziale
    base_name = filename.replace('.pdf', '').replace('-', ' ').lower()
    for pdf in pdf_files:
        pdf_base = pdf.replace('.pdf', '').lower()
        if base_name in pdf_base or pdf_base in base_name:
            return pdf
    
    return None

# Correggi i nomi dei file
corrected = 0
not_found = []

for doc in data['docs']:
    original_filename = doc['filename']
    matching_file = find_matching_file(original_filename, pdf_files)
    
    if matching_file:
        if matching_file != original_filename:
            print(f"Correzione: {original_filename} -> {matching_file}")
            doc['filename'] = matching_file
            corrected += 1
    else:
        print(f"NON TROVATO: {original_filename}")
        not_found.append(original_filename)

print(f"\nCorrezioni applicate: {corrected}")
print(f"File non trovati: {len(not_found)}")

# Salva il file corretto
with open('landing/assets/docs.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("File docs.json aggiornato!")
