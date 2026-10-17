@echo off
setlocal
set "ROOT=%~dp0"

echo ======================================================================
echo           Starting NovaMart E-Commerce Platform (Port 5173 ^& 8080)
echo ======================================================================
echo.
echo [1/2] Starting Spring Boot Backend on http://localhost:8080...
start "NovaMart Backend [8080]" /D "%ROOT%backend" cmd /k mvn spring-boot:run

echo [2/2] Starting NovaMart Unified Frontend on http://localhost:5173...
start "NovaMart Frontend [5173]" /D "%ROOT%frontend" cmd /k npm run dev

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
