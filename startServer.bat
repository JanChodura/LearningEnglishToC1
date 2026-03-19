@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "HTML_DIR=%ROOT_DIR%html"
set "PORT=8000"
set "PY311=C:\Users\jncho\AppData\Local\Programs\Python\Python311\python.exe"

if not exist "%HTML_DIR%" (
  echo html directory not found: "%HTML_DIR%"
  exit /b 1
)

pushd "%HTML_DIR%" >nul

echo Serving "%HTML_DIR%" at http://localhost:%PORT%/

if exist "%PY311%" (
  "%PY311%" -m http.server %PORT%
  set "EXIT_CODE=%ERRORLEVEL%"
  popd >nul
  exit /b %EXIT_CODE%
)

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -m http.server %PORT%
  if not errorlevel 1 (
    set "EXIT_CODE=%ERRORLEVEL%"
    popd >nul
    exit /b %EXIT_CODE%
  )
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  python -m http.server %PORT%
  set "EXIT_CODE=%ERRORLEVEL%"
  popd >nul
  exit /b %EXIT_CODE%
)

echo Python launcher not found. Install Python or add py/python to PATH.
popd >nul
exit /b 1
