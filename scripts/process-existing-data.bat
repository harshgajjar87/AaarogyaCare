@echo off
echo ============================================================
echo Process Existing Medicine Database
echo ============================================================
echo.
echo This script will process the JSON file you downloaded
echo from: D:\Anand Data and Software
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://www.python.org/
    pause
    exit /b 1
)

echo Running processing script...
echo.
python process-existing-medicine-data.py

if errorlevel 1 (
    echo.
    echo ERROR: Failed to process data
    pause
    exit /b 1
)

echo.
echo ============================================================
echo SUCCESS!
echo ============================================================
echo.
echo The medicine database has been integrated.
echo.
pause
