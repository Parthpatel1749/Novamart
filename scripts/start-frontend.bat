@echo off
setlocal
echo ======================================================================
echo Starting NovaMart Unified Frontend (Port 5173)...
echo ======================================================================
cd /d "%~dp0..\frontend"
start "" "http://localhost:5173/"
call npm run dev
endlocal
