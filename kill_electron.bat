@ECHO OFF

TASKKILL /F /IM "IMAGENAME eq electron-vite.exe" 2>NUL | FIND /I /N "electron-vite.exe" >NUL
IF NOT "%ERRORLEVEL%" == "0" (
    ECHO "electron-vite.exe" is not running.
) ELSE (
    ECHO "electron-vite.exe" is running.
    TASKKILL /F /IM electron-vite.exe
    ECHO "electron-vite.exe" is killed.
)

TIMEOUT /T 1 /NOBREAK
PUSHD %~dp0

EXIT /B 0