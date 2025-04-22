@echo off
:: 관리자 권한으로 실행 확인
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo 관리자 권한이 필요합니다...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

:: hosts 파일 수정
echo.
echo hosts 파일에 git.electron.vite 도메인 추가 중...

:: hosts 파일 경로
set HOSTS_FILE=%SYSTEMROOT%\System32\drivers\etc\hosts

:: 도메인이 이미 있는지 확인
findstr /C:"git.electron.vite" "%HOSTS_FILE%" > nul
if %errorlevel% equ 0 (
    echo 도메인이 이미 hosts 파일에 존재합니다.
    exit /B 0
)

:: 도메인 추가
echo.>> "%HOSTS_FILE%"
echo # electron-vite 업데이트 서버>> "%HOSTS_FILE%"
echo 127.0.0.1 git.electron.vite>> "%HOSTS_FILE%"
echo.

if %errorlevel% equ 0 (
    echo hosts 파일 수정 완료!
    exit /B 0
) else (
    echo hosts 파일 수정 실패!
    exit /B 1
)
