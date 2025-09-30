#!/bin/bash

# Script batch per compressione PDF sicura
# Mantiene qualità di lettura con target ≤5MB per file

echo "=== COMPRESSIONE PDF BATCH ==="
echo "Originali: docs_raw/ → Compressi: docs/"
echo

# Array associativo: nome_file_originale → nome_file_compresso
declare -A pdf_map=(
    ["ANALISIESOLUZIONEDMS.pdf"]="analisi-soluzione-dms.pdf"
    ["CARBONCREDITDMS(2).pdf"]="carbon-credit-dms.pdf"
    ["DMS-RiaccendiamoiMercatiRivitalizziamoleCittà.pdf"]="dms-riaccendiamo-mercati.pdf"
    ["DMSECC(1).pdf"]="dms-ecc-narrativo.pdf"
    ["DMSECLUST-ER(3).pdf"]="dms-cluster-er.pdf"
    ["DOSSIERNAZIONALE(1).pdf"]="dossier-nazionale.pdf"
    ["EQUILIBRIOECOSOSTENIBILE.pdf"]="equilibrio-ecosostenibile.pdf"
    ["EcosistemaDMS-hub+costiPA.pdf"]="ecosistema-costi-pa.pdf"
    ["HUBNAZIONALEDELCOMMERCIO(1).pdf"]="hub-nazionale-commercio.pdf"
    ["HubUrbaniinEmiliaRomagna(1).pdf"]="hub-urbani-prossimita-er.pdf"
    ["LOGICACARBONCREDIT(1).pdf"]="carbon-credit-logica.pdf"
    ["PASSAPORTOEU(1).pdf"]="passaporto-eu.pdf"
    ["PRESENTAZIONEDMS-CITTÀMETROPOLITANADIBOLOGNA(1).pdf"]="presentazione-dms-bologna.pdf"
    ["PRESENTAZIONEDMS-compressed(7).pdf"]="gemello-dms.pdf"
    ["PRESENTAZIONEDMS-compressed(8).pdf"]="dms-ecc-tecnico.pdf"
    ["ScenarioFuturo(1).pdf"]="scenario-futuro.pdf"
)

# Contatori
total=0
success=0
failed=0

for original in "${!pdf_map[@]}"; do
    compressed="${pdf_map[$original]}"
    input_file="docs_raw/$original"
    output_file="docs/$compressed"
    
    if [[ ! -f "$input_file" ]]; then
        echo "❌ SKIP: $original (file non trovato)"
        ((failed++))
        continue
    fi
    
    echo "🔄 Comprimendo: $original → $compressed"
    
    # Dimensione originale
    orig_size=$(stat -c%s "$input_file")
    orig_mb=$(echo "scale=1; $orig_size/1024/1024" | bc)
    
    # Compressione con Ghostscript
    gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 \
       -dPDFSETTINGS=/ebook \
       -dDownsampleColorImages=true -dColorImageResolution=150 -dColorImageDownsampleType=/Bicubic \
       -dDownsampleGrayImages=true  -dGrayImageResolution=150  -dGrayImageDownsampleType=/Bicubic \
       -dDownsampleMonoImages=true  -dMonoImageResolution=300  -dMonoImageDownsampleType=/Bicubic \
       -dAutoFilterColorImages=true -dAutoFilterGrayImages=true \
       -dDetectDuplicateImages=true -dSubsetFonts=true \
       -dFastWebView=true -dNOPAUSE -dBATCH -dQUIET \
       -sOutputFile="$output_file" "$input_file" 2>/dev/null
    
    if [[ $? -eq 0 && -f "$output_file" ]]; then
        # Dimensione compressa
        comp_size=$(stat -c%s "$output_file")
        comp_mb=$(echo "scale=1; $comp_size/1024/1024" | bc)
        reduction=$(echo "scale=1; ($orig_size-$comp_size)*100/$orig_size" | bc)
        
        echo "✅ OK: $orig_mb MB → $comp_mb MB (-$reduction%)"
        ((success++))
    else
        echo "❌ ERRORE: Compressione fallita per $original"
        ((failed++))
    fi
    
    ((total++))
    echo
done

echo "=== RISULTATO FINALE ==="
echo "Totale: $total | Successo: $success | Falliti: $failed"
echo "Dimensioni finali:"
du -sh docs_raw/ docs/

