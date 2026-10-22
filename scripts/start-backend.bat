@echo off
setlocal
echo ======================================================================
echo Starting NovaMart Backend (Spring Boot 3.3.4, Port 8080)...
echo ======================================================================
cd /d "%~dp0..\backend"
if exist "C:\Users\LENOVO\.vscode\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64" (
    set "JAVA_HOME=C:\Users\LENOVO\.vscode\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64"
    set "PATH=%JAVA_HOME%\bin;C:\Program Files\apache-maven-3.9.16\bin;%PATH%"
) else if exist "C:\Users\LENOVO\.vscode\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64" (
    set "JAVA_HOME=C:\Users\LENOVO\.vscode\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64"
    set "PATH=%JAVA_HOME%\bin;C:\Program Files\apache-maven-3.9.16\bin;%PATH%"
)
call mvn spring-boot:run
endlocal
