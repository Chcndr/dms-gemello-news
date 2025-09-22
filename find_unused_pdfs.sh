#!/bin/bash

echo "=== PDF NON UTILIZZATI IN SPOT ==="
echo

# Lista tutti i PDF nella directory
all_pdfs=$(ls assets/doc/*.pdf | sed 's|assets/doc/||' | sort)

# Lista i PDF utilizzati nel codice (rimuovi duplicati)
used_pdfs=$(grep -o 'assets/doc/[^"]*\.pdf' landing/spot.html | grep -v "MEF\|salute\|PCM" | sed 's|assets/doc/||' | sort | uniq)

# Trova i PDF non utilizzati
echo "PDF presenti ma NON utilizzati in Spot:"
echo "======================================"
for pdf in $all_pdfs; do
    if ! echo "$used_pdfs" | grep -q "^$pdf$"; then
        size=$(du -h "assets/doc/$pdf" | cut -f1)
        echo "- $pdf ($size)"
    fi
done

echo
echo "Totale PDF presenti: $(echo "$all_pdfs" | wc -l)"
echo "Totale PDF utilizzati: $(echo "$used_pdfs" | wc -l)"
echo "Totale PDF NON utilizzati: $(comm -23 <(echo "$all_pdfs") <(echo "$used_pdfs") | wc -l)"
