@echo off
title BrightPath
echo ===================================================
echo   Starting BrightPath - Educational Adventure Platform
echo ===================================================
cd /d "c:\Users\Zee\Desktop\autism\BrightPath"

echo Starting server and opening in your browser...
start "" http://localhost:5173/

npm.cmd run dev
pause

