@echo off
setlocal
cd /d "%~dp0"
set "MARE_NODE=node"
where node >nul 2>nul
if errorlevel 1 (
  set "MARE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)
if not "%MARE_NODE%"=="node" if not exist "%MARE_NODE%" (
  echo Instale o Node.js 22 ou superior e abra este arquivo novamente.
  pause
  exit /b 1
)
echo Mare Viva - mantenha esta janela aberta durante a partida.
echo Endereco: http://localhost:3210
start "" "http://localhost:3210"
"%MARE_NODE%" server.mjs
pause
