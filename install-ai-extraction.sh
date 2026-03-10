#!/bin/bash

echo "=========================================="
echo "AI Medical Report Extraction Setup"
echo "=========================================="
echo ""

# Check if we're in the project root
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd server
npm install pdf-parse
echo "✅ Backend dependencies installed"
echo ""

echo "📝 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found in server directory"
    echo "Please create server/.env and add your GROQ_API_KEY"
else
    if grep -q "GROQ_API_KEY" .env; then
        echo "✅ GROQ_API_KEY found in .env"
    else
        echo "⚠️  Warning: GROQ_API_KEY not found in .env"
        echo "Please add: GROQ_API_KEY=your_api_key_here"
    fi
fi
echo ""

cd ..

echo "🔍 Verifying file structure..."
files_to_check=(
    "server/controllers/aiExtractionController.js"
    "server/routes/aiExtractionRoutes.js"
    "client/src/components/MedicalReportUploader.js"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        all_files_exist=false
    fi
done
echo ""

if [ "$all_files_exist" = true ]; then
    echo "✅ All required files are in place"
else
    echo "❌ Some files are missing. Please check the setup."
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Add your GROQ_API_KEY to server/.env"
echo "   Get a free key at: https://console.groq.com/"
echo ""
echo "2. Start your servers:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd client && npm start"
echo ""
echo "3. Test the feature:"
echo "   - Navigate to Health Prediction → Report Analysis"
echo "   - Select a report type"
echo "   - Upload a medical report image or PDF"
echo "   - Watch the AI extract and auto-fill the values!"
echo ""
echo "📖 For detailed documentation, see:"
echo "   AI_REPORT_EXTRACTION_SETUP.md"
echo ""
