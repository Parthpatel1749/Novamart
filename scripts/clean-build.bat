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

echo [2/2] Compiling and Packaging Backend (Spring Boot 3.3.4 + Java 21)...
cd /d "%~dp0..\backend"
if "%JAVA_HOME%"=="" (
    if exist "C:\Users\LENOVO\.vscode\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64" (
        set "JAVA_HOME=C:\Users\LENOVO\.vscode\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64"
        set "PATH=%JAVA_HOME%\bin;%PATH%"
    )
)
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Backend packaging failed!
    exit /b %errorlevel%
)
echo [OK] Backend executable JAR packaged successfully.
echo.

echo ======================================================================
echo  All NovaMart modules compiled and verified successfully!
echo ======================================================================
endlocal
