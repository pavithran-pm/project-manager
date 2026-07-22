@echo off
REM One-click launcher for Windows: installs dependencies on first run,
REM starts the dev server, and opens the app in your browser.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo Node.js is not installed. Download the LTS version from:
  echo   https://nodejs.org
  echo Install it, then double-click run.bat again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies - first run only, takes a minute...
  call npm install
)

echo Starting Techjays Project Tracker at http://localhost:5173 ...
start /b cmd /c "timeout /t 3 >nul & start http://localhost:5173"
call npm run dev
