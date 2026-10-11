@echo off
setlocal
title Push Car Parking Management System to GitHub
echo ========================================================
echo   Pushing to GitHub: Praneth010/car-parking-management-system
echo ========================================================
echo.

set "GIT_CMD=C:\Users\PRANETH\.gemini\antigravity\scratch\mingit\cmd\git.exe"

if not exist "%GIT_CMD%" (
    set "GIT_CMD=git"
)

echo Repository is already committed and ready to push!
echo.
echo If your GitHub repo does not exist yet:
echo 1. Go to https://github.com/new
echo 2. Repository name: car-parking-management-system
echo 3. Click "Create repository" (leave it empty)
echo.
echo --------------------------------------------------------
echo Choose your authentication method:
echo --------------------------------------------------------
echo.
set /p "GITHUB_TOKEN=Enter your GitHub Personal Access Token (or press ENTER to use standard browser login): "

cd /d "%~dp0"

if "%GITHUB_TOKEN%"=="" (
    echo.
    echo [INFO] Attempting standard push (Git may prompt for login)...
    "%GIT_CMD%" push -u origin main
) else (
    echo.
    echo [INFO] Pushing with your token...
    "%GIT_CMD%" push -u https://Praneth010:%GITHUB_TOKEN%@github.com/Praneth010/car-parking-management-system.git main
)

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] Code pushed successfully to GitHub!
    echo Visit: https://github.com/Praneth010/car-parking-management-system
    echo ========================================================
) else (
    echo.
    echo [NOTE] Push did not complete. If you used a token, ensure it has 'repo' permissions.
    echo You can generate a token at: https://github.com/settings/tokens
)

echo.
pause
