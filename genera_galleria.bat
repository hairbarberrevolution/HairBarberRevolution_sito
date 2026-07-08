@echo off
REM ─────────────────────────────────────────────────────────────────
REM  Genera automaticamente GALLERIA_DONNA.js e GALLERIA_UOMO.js
REM  leggendo i file immagine presenti nelle rispettive cartelle.
REM
REM  Come usarlo (Windows):
REM  Dopo aver aggiunto o rimosso foto dalle cartelle IMMAGINI_DONNA
REM  o IMMAGINI_UOMO, fai doppio click su questo file.
REM  Poi ricarica il sito nel browser (F5).
REM ─────────────────────────────────────────────────────────────────

cd /d "%~dp0"

call :genera IMMAGINI_DONNA GALLERIA_DONNA.js GALLERIA_DONNA_DATA
call :genera IMMAGINI_UOMO  GALLERIA_UOMO.js  GALLERIA_UOMO_DATA
echo.
echo Fatto! Ricarica il sito nel browser (F5).
pause
exit /b

:genera
setlocal EnableDelayedExpansion
set folder=%1
set output=%2
set varname=%3
set entries=
set first=1
for %%F in (%folder%\*.jpg %folder%\*.jpeg %folder%\*.png %folder%\*.webp %folder%\*.gif %folder%\*.JPG %folder%\*.JPEG %folder%\*.PNG %folder%\*.WEBP %folder%\*.GIF %folder%\*.avif %folder%\*.AVIF) do (
  if /I "%%~nxF" NEQ ".gitkeep" (
    if !first!==1 (
      set entries=  "%%~nxF"
      set first=0
    ) else (
      set entries=!entries!,^
  "%%~nxF"
    )
  )
)
(
  echo // Auto-generato da genera_galleria — non modificare manualmente.
  echo // Per aggiornare: aggiungi/rimuovi foto dalla cartella %folder%
  echo // e poi esegui genera_galleria.bat ^(Windows^) o genera_galleria.sh ^(Mac/Linux^).
  echo window.%varname% = [
  if not "!entries!"=="" echo !entries!
  echo ];
) > %output%
echo   ^> %output% aggiornato
endlocal
exit /b
