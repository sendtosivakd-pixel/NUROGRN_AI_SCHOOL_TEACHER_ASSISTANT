@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Nurogenai - Native Setup (ULTRA-DEBUG)
echo ===================================================
echo.

:: 1. Check for Python
echo [DEBUG] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo [ERROR] Python not found.
    pause
    exit /b
)

:: 2. Check for Node.js and NPM
echo [DEBUG] Checking Node.js...
node -v
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found.
    pause
    exit /b
)

echo [DEBUG] Checking NPM...
call npm -v
if %errorlevel% neq 0 (
    echo [ERROR] NPM not found.
    pause
    exit /b
)

:: 3. Setup Backend
echo [1/4] Setting up Backend API...
pushd services\api
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python scripts\init_local_db.py
popd
echo [SUCCESS] Backend setup complete.
echo.
echo === READY FOR FRONTEND SETUP ===
pause

:: 4. Setup Frontend
echo [2/4] Setting up Frontend Web App...
echo [DEBUG] Root directory is: %cd%

if not exist "package.json" (
    echo [ERROR] Root package.json not found!
    pause
    exit /b
)

echo [DEBUG] Starting npm install...
:: Using 'cmd /c' is sometimes safer than 'call' for npm in batch scripts
cmd /c npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed with error code %errorlevel%
    pause
    exit /b
)

echo [SUCCESS] Frontend setup complete.
pause

:: 5. Explaining launch
echo.
echo [3/4] Setup Complete!
echo.
echo Ready to launch services.
pause

:: 6. Launching
echo [4/4] Starting services...

:: Launch API
start "Nuro API Server" cmd /k "cd services\api && .venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Launch Web App
start "Nuro Web App" cmd /k "npm run dev --workspace @nuro/web"

echo.
echo ===================================================
echo   DONE! Check the new windows that opened.
echo ===================================================
pause
