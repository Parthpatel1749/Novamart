@echo off
setlocal
set "ROOT=%~dp0..\"

echo ======================================================================
echo    NovaMart Non-Containerized High-Concurrency Production Launcher
echo ======================================================================
echo.

:: 1. Verify Java Environment
if "%JAVA_HOME%"=="" (
    if exist "C:\Users\LENOVO\.vscode\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64" (
        set "JAVA_HOME=C:\Users\LENOVO\.vscode\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64"
        set "PATH=%JAVA_HOME%\bin;%PATH%"
    )
)

:: 2. Check Backend JAR existence
if not exist "%ROOT%backend\target\ecommerce-backend-0.0.1-SNAPSHOT.jar" (
    echo [ERROR] Backend executable JAR not found in backend\target.
    echo Please run clean-build.bat first to build production artifacts.
    pause
    exit /b 1
)

:: 3. Check Frontend dist existence
if not exist "%ROOT%frontend\dist\index.html" (
    echo [ERROR] Frontend dist build not found in frontend\dist.
    echo Please run clean-build.bat first to build production assets.
    pause
    exit /b 1
)

echo [1/2] Starting High-Concurrency Spring Boot Backend (Java 21 Loom Virtual Threads)...
start "NovaMart Backend [Prod 8080]" /D "%ROOT%backend" java -Xms1024m -Xmx2048m -XX:+UseG1GC -Dspring.profiles.active=prod -jar target\ecommerce-backend-0.0.1-SNAPSHOT.jar

echo [2/2] Serving Optimized Frontend SPA (Vite Production Build) on Port 5173...
start "NovaMart Frontend [Prod 5173]" /D "%ROOT%frontend" npx --yes serve -s dist -l 5173

echo.
echo ======================================================================
echo  NovaMart Non-Containerized Production Deployment is Active!
echo    - Storefront & Portals:  http://localhost:5173/
echo    - Backend Health Probe:  http://localhost:8080/actuator/health
echo    - Metrics Prometheus:    http://localhost:8080/actuator/metrics
echo ======================================================================
endlocal
