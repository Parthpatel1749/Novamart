@echo off
setlocal
echo ======================================================================
echo       Pushing NovaMart to GitHub: https://github.com/Parthpatel1749/Novamart
echo ======================================================================
echo.
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"

echo Staging any recent changes...
git add .

echo Pushing to main branch on GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo  [SUCCESS] Project uploaded to https://github.com/Parthpatel1749/Novamart !
    echo ======================================================================
) else (
    echo.
    echo [NOTE] If a browser window opened, click "Authorize Git" to finish login.
)

echo.
pause
endlocal
