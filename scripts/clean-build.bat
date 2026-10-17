@echo off
setlocal
echo ======================================================================
echo           NovaMart Clean ^& Build Verification Suite
echo ======================================================================
echo.

echo [1/2] Building Frontend (React 19 + Vite)...
cd /d "%~dp0..\frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    exit /b %errorlevel%
)
echo [OK] Frontend build succeeded.
echo.

echo [2/2] Compiling Backend (Spring Boot 3.3.4 + Java 21)...
cd /d "%~dp0..\backend"
call mvn test-compile
if %errorlevel% neq 0 (
    echo [ERROR] Backend compilation failed!
    exit /b %errorlevel%
)
echo [OK] Backend compilation succeeded.
echo.

echo ======================================================================
echo  All NovaMart modules compiled and verified successfully!
echo ======================================================================
endlocal
