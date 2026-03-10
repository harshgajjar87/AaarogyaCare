@echo off
echo ==========================================
echo AI Medical Report Extraction Setup
echo ==========================================
echo.

REM Check if we're in the project root
if not exist "server" (
    echo Error: server directory not found
    echo Please run this script from the project root directory
    exit /b 1
)
if not exist "client" (
    echo Error: client directory not found
    echo Please run this script from the project root directory
    exit /b 1
)

echo Installing backend dependencies...
cd server
call npm install pdf-parse
if %errorlevel% neq 0 (
    echo Error installing dependencies
    cd ..
    exit /b 1
)
echo Backend dependencies installed
echo.

echo Checking environment configuration...
if not exist ".env" (
    echo Warning: .env file not found in server directory
    echo Please create server/.env and add your GROQ_API_KEY
) else (
    findstr /C:"GROQ_API_KEY" .env >nul
    if %errorlevel% equ 0 (
        echo GROQ_API_KEY found in .env
    ) else (
        echo Warning: GROQ_API_KEY not found in .env
        echo Please add: GROQ_API_KEY=your_api_key_here
    )
)
echo.

cd ..

echo Verifying file structure...
set all_files_exist=1

if exist "server\controllers\aiExtractionController.js" (
    echo server\controllers\aiExtractionController.js
) else (
    echo server\controllers\aiExtractionController.js ^(missing^)
    set all_files_exist=0
)

if exist "server\routes\aiExtractionRoutes.js" (
    echo server\routes\aiExtractionRoutes.js
) else (
    echo server\routes\aiExtractionRoutes.js ^(missing^)
    set all_files_exist=0
)

if exist "client\src\components\MedicalReportUploader.js" (
    echo client\src\components\MedicalReportUploader.js
) else (
    echo client\src\components\MedicalReportUploader.js ^(missing^)
    set all_files_exist=0
)

echo.

if %all_files_exist% equ 1 (
    echo All required files are in place
) else (
    echo Some files are missing. Please check the setup.
    exit /b 1
)

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Add your GROQ_API_KEY to server\.env
echo    Get a free key at: https://console.groq.com/
echo.
echo 2. Start your servers:
echo    Terminal 1: cd server ^&^& npm run dev
echo    Terminal 2: cd client ^&^& npm start
echo.
echo 3. Test the feature:
echo    - Navigate to Health Prediction -^> Report Analysis
echo    - Select a report type
echo    - Upload a medical report image or PDF
echo    - Watch the AI extract and auto-fill the values!
echo.
echo For detailed documentation, see:
echo    AI_REPORT_EXTRACTION_SETUP.md
echo.
pause
