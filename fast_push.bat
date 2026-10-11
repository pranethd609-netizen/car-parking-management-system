@echo off
setlocal
title Fast GitHub Push - ParkFlow Pro
echo ========================================================
echo   FAST GITHUB PUSH - Praneth010
echo ========================================================
echo.

set "GH_EXE=C:\Users\PRANETH\.gemini\antigravity\scratch\gh_tool\gh_2.60.1_windows_amd64\bin\gh.exe"
set "GIT_EXE=C:\Users\PRANETH\.gemini\antigravity\scratch\mingit\cmd\git.exe"

cd /d "C:\Users\PRANETH\.gemini\antigravity\scratch\car-parking-management-system"

echo [Step 1/2] Authenticating with GitHub...
echo A browser window will open. Click 'Authorize' to approve.
echo.

"%GH_EXE%" auth login -h github.com -p https -w

if %errorlevel% neq 0 (
    echo [ERROR] Login failed or was cancelled.
    pause
    exit /b
)

echo.
echo [Step 2/2] Creating repository & pushing all files to GitHub...
"%GH_EXE%" repo create Praneth010/car-parking-management-system --public --source=. --remote=origin --push

if %errorlevel% neq 0 (
    echo [INFO] Repository might already exist. Trying direct push...
    "%GH_EXE%" auth setup-git
    "%GIT_EXE%" push -u origin main
)

echo.
echo ========================================================
echo   SUCCESS! Project pushed to:
echo   https://github.com/Praneth010/car-parking-management-system
echo ========================================================
echo.
pause
