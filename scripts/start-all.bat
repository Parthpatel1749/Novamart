@echo off
setlocal
set "ROOT=%~dp0..\"

echo ======================================================================
echo           Starting NovaMart E-Commerce Platform (Port 5173 ^& 8080)
echo ======================================================================
echo.
echo [1/2] Starting Spring Boot Backend on http://localhost:8080...
start "NovaMart Backend [8080]" cmd /k "call %ROOT%scripts\start-backend.bat"

echo [2/3] Starting NovaMart Unified Frontend on http://localhost:5173...
start "NovaMart Frontend [5173]" cmd /k "call %ROOT%scripts\start-frontend.bat"

echo [3/3] Starting NovaMart Continuous Auto-Backup (DB ^& Code Safety)...
start "NovaMart Auto-Backup Watcher" /D "%ROOT%" cmd /k node scripts/auto-backup-watcher.js

echo.
echo Waiting 5 seconds for development servers to initialize...
ping 127.0.0.1 -n 6 >nul 2>&1

echo.
echo Opening NovaMart in your default browser...
start "" "http://localhost:5173/"

echo.
echo ======================================================================
echo  NovaMart Web Application is online:
echo    - Customer Storefront:      http://localhost:5173/
echo    - Admin Operations Portal:  http://localhost:5173/admin
echo    - Delivery Partner Portal:  http://localhost:5173/delivery-partner
echo    - Backend REST API:         http://localhost:8080/
echo ======================================================================
endlocal
