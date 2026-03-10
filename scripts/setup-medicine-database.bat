@echo off
echo ============================================================
echo Medicine Database Setup - All India Drug Bank
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Checking Python installation...
python --version
echo.

echo [2/4] Installing required packages...
pip install kagglehub pandas
echo.

echo [3/4] Checking Kaggle credentials...
if not exist "%USERPROFILE%\.kaggle\kaggle.json" (
    echo.
    echo WARNING: Kaggle credentials not found!
    echo.
    echo Please follow these steps:
    echo 1. Go to https://www.kaggle.com/
    echo 2. Sign in or create an account
    echo 3. Go to Account settings
    echo 4. Scroll to API section
    echo 5. Click "Create New API Token"
    echo 6. Place the downloaded kaggle.json in: %USERPROFILE%\.kaggle\
    echo.
    echo After setting up credentials, run this script again.
    pause
    exit /b 1
)

echo Kaggle credentials found!
echo.

echo [4/4] Downloading and processing medicine dataset...
python download-medicine-dataset.py

if errorlevel 1 (
    echo.
    echo ERROR: Failed to download or process dataset
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo ============================================================
echo SUCCESS! Medicine database setup complete
echo ============================================================
echo.
echo The medicine database has been integrated into your application.
echo You can now use thousands of Indian medicines in prescriptions!
echo.
echo Next steps:
echo 1. Restart your application (npm start)
echo 2. Go to Doctor Dashboard
echo 3. Create a prescription and test the medicine search
echo.
pause
