@echo off
echo Starting Find Animals Game Local Server...
echo.
echo Choose your preferred method:
echo 1. Python HTTP Server (Port 8000)
echo 2. Node.js Live Server (Port 3000) - if Node.js is installed
echo 3. Open file directly in browser
echo.

:CHOICE
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto PYTHON
if "%choice%"=="2" goto NODE
if "%choice%"=="3" goto DIRECT
goto CHOICE

:PYTHON
echo Starting Python HTTP Server on port 8000...
echo Open your browser and go to: http://localhost:8000
echo To make it public, you can use ngrok: ngrok http 8000
echo.
python -m http.server 8000
pause
goto END

:NODE
echo Installing dependencies and starting Node.js server...
npm install
npm start
pause
goto END

:DIRECT
echo Opening game directly in browser...
start index.html
pause
goto END

:END
echo Server stopped.
pause
