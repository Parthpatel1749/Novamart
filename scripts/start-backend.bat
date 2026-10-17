@echo off
setlocal
echo ======================================================================
echo Starting NovaMart Backend (Spring Boot 3.3.4, Port 8080)...
echo ======================================================================
cd /d "%~dp0..\backend"
mvn spring-boot:run
endlocal
