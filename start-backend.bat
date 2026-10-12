@echo off
cd /d "%~dp0"
echo Starting BrightPath Python FastAPI Backend on http://127.0.0.1:8000 ...
python backend/run.py
pause
