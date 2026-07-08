#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  Genera automaticamente GALLERIA_DONNA.js e GALLERIA_UOMO.js
#  leggendo i file immagine presenti nelle rispettive cartelle.
#
#  Come usarlo (Mac / Linux):
#  1. Apri il Terminale
#  2. Vai nella cartella del sito:  cd /percorso/DEF_HBR_SITE
#  3. Esegui:  bash genera_galleria.sh
#  Poi ricarica il sito nel browser (F5).
# ─────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"

genera() {
  folder="$1"
  output="$2"
  varname="$3"
  entries=""
  for f in "$folder"/*; do
    [ -f "$f" ] || continue
    name="$(basename "$f")"
    # salta file nascosti e .gitkeep
    case "$name" in .*|.gitkeep) continue ;; esac
    # accetta solo immagini comuni
    ext="${name##*.}"
    case "${ext,,}" in
      jpg|jpeg|png|webp|gif|avif) ;;
      *) continue ;;
    esac
    if [ -z "$entries" ]; then
      entries="  \"$name\""
    else
      entries="$entries,
  \"$name\""
    fi
  done
  {
    echo "// Auto-generato da genera_galleria — non modificare manualmente."
    echo "// Per aggiornare: aggiungi/rimuovi foto dalla cartella $folder"
    echo "// e poi esegui genera_galleria.bat (Windows) o genera_galleria.sh (Mac/Linux)."
    echo "window.$varname = ["
    [ -n "$entries" ] && echo "$entries"
    echo "];"
  } > "$output"
  echo "  ✓ $output aggiornato"
}

echo "Scansione cartelle..."
genera "IMMAGINI_DONNA" "GALLERIA_DONNA.js" "GALLERIA_DONNA_DATA"
genera "IMMAGINI_UOMO"  "GALLERIA_UOMO.js"  "GALLERIA_UOMO_DATA"
echo "Fatto! Ricarica il sito nel browser (F5)."
