@echo off
setlocal

if "%~1"=="" (
  powershell -ExecutionPolicy Bypass -File "%~dp0publish-to-github.ps1"
) else (
  powershell -ExecutionPolicy Bypass -File "%~dp0publish-to-github.ps1" -RepositoryUrl "%~1"
)

if errorlevel 1 (
  echo.
  echo Publish failed.
  exit /b 1
)

echo.
echo Publish script finished.
