@echo off
cd /d "%~dp0"
echo ====================================================
echo   Starting BrightPath Full-Stack Application
echo ====================================================
echo.
echo 1. Launching Python FastAPI Backend on http://127.0.0.1:8000 ...
start "BrightPath Backend" cmd /k "cd /d ""%~dp0"" && python backend/run.py"

echo 2. Launching React Vite Frontend on http://localhost:5173 ...
start "BrightPath Frontend" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev"

echo 3. Opening browser at http://localhost:5173 ...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ====================================================
echo   Servers are running!
echo   Frontend: http://localhost:5173
echo   Backend API: http://127.0.0.1:8000/docs
echo ====================================================
echo.
echo If Windows Terminal grouped them into tabs, check the top tab bar.
echo You can keep this window open or close it.
pause
