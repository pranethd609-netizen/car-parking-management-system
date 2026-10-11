@echo off
title ParkFlow Pro - Car Parking Management System
echo ========================================================
echo   ParkFlow Pro - Car Parking Management System
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b
)

cd /d "%~dp0backend"

if not exist "node_modules" (
    echo [INFO] Installing required dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b
    )
)

echo [INFO] Starting ParkFlow Pro Server at http://localhost:5000 ...
echo [INFO] Opening default browser...
start "" "http://localhost:5000"

node server.js
pause
