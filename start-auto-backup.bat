@echo off
setlocal
echo ======================================================================
echo           Starting NovaMart Continuous Auto-Backup System
echo   (Monitors MySQL database changes & code changes automatically)
echo ======================================================================
echo.
cd /d "%~dp0"
node scripts/auto-backup-watcher.js
pause
endlocal
