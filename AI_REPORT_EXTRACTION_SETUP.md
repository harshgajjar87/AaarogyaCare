# AI Medical Report Extraction Feature - Setup Guide

## Overview
This feature allows users to upload medical report images (JPG/PNG) or PDFs, and automatically extract test values using Groq's AI models. The extracted data auto-fills the form fields for user review before submission.

## Architecture

### Frontend (React)
- **Component**: `MedicalReportUploader.js` - File upload UI with drag-and-drop
- **Integration**: Added to `ReportAnalysis.js` component
- **Features**:
  - File validation (JPG, PNG, PDF, max 10MB)
  - Image preview
  - Loading states
  - Success/error feedback
  - Auto-fill form fields with extracted data

### Backend (Node.js)
- **Controller**: `aiExtractionController.js` - Handles file processing and Groq API calls
- **Route**: `aiExtractionRoutes.js` - API endpoint configuration
- **Endpoint**: `POST /api/ai/extract-medical-report`

## Installation Steps

### 1. Install Required Dependencies

```bash
# Navigate to server directory
cd server

# Install pdf-parse for PDF text extraction
npm install pdf-parse

# Verify other dependencies are installed
npm install multer axios dotenv
```

### 2. Configure Environment Variables

Add your Groq API key to `server/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

To get a free Groq API key:
1. Visit https://console.groq.com/
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your .env file

### 3. Verify File Structure

Ensure these files exist:
```
server/
├── controllers/
│   └── aiExtractionController.js  ✓ Created
├── routes/
│   └── aiExtractionRoutes.js      ✓ Created
└── server.js                       ✓ Updated

client/
└── src/
    └── components/
        ├── MedicalReportUploader.js  ✓ Created
        └── ReportAnalysis.js         ✓ Updated
```

### 4. Restart Your Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## How It Works

### Workflow

1. **User uploads file** → MedicalReportUploader component
2. **File validation** → Check type (JPG/PNG/PDF) and size (<10MB)
3. **Send to backend** → POST to `/api/ai/extract-medical-report`
4. **Backend processing**:
   - Images: Convert to base64
   - PDFs: Extract text using pdf-parse
5. **AI extraction**:
   - Images: Use `meta-llama/llama-4-scout-17b-16e-instruct` (Llama 4 Scout vision model)
   - PDFs: Use `llama-3.3-70b-versatile` (text model)
6. **Structured output**: AI returns strict JSON with medical values
7. **Auto-fill form**: React updates form state with extracted data
8. **User review**: User can verify/edit values before submission

### Supported Report Types

The system supports extraction for:
- Blood Test / CBC (Complete Blood Count)
- Lipid Profile
- Thyroid Function
- Liver Function
- Kidney Function
- Diabetes Panel
- Vitamin Levels
- Urine Analysis

### AI Prompt Strategy

The system uses a strict system prompt that:
- Forces JSON-only output (no markdown, no explanations)
- Defines exact field names and data types
- Handles missing values with `null`
- Removes units and returns only numbers
- Adapts to different report types

## Usage Example

### Frontend Usage

```javascript
import MedicalReportUploader from './MedicalReportUploader';

function MyComponent() {
  const [formData, setFormData] = useState({});

  const handleDataExtracted = (extractedData) => {
    // Auto-fill form with AI-extracted values
    setFormData(prev => ({
      ...prev,
      ...extractedData
    }));
  };

  return (
    <MedicalReportUploader 
      onDataExtracted={handleDataExtracted}
      reportType="blood"
    />
  );
}
```

### API Request Example

```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('reportType', 'blood');

const response = await axios.post('/api/ai/extract-medical-report', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Response format:
{
  success: true,
  extractedData: {
    hemoglobin: 13.5,
    wbc: 7500,
    rbc: 4.8,
    platelets: 250000,
    // ... other fields
  },
  message: 'Medical report data extracted successfully'
}
```

## Groq API Models Used

### For Images: meta-llama/llama-4-scout-17b-16e-instruct
- Multimodal model (text + vision)
- Can analyze medical report images
- Supports JSON mode for structured output
- Extracts text and numerical values from images

### For PDFs: llama-3.3-70b-versatile
- Fast text-only model
- Processes extracted PDF text
- Returns structured JSON output

## Error Handling

The system handles:
- Invalid file types
- File size limits (10MB)
- Missing API keys
- AI extraction failures
- JSON parsing errors
- Network errors

## Security Considerations

1. **File Validation**: Only JPG, PNG, PDF allowed
2. **Size Limits**: Max 10MB per file
3. **Authentication**: Endpoint protected with `protect` middleware
4. **Temporary Storage**: Files deleted after processing
5. **API Key Security**: Stored in environment variables

## Testing

### Test with Sample Report

1. Navigate to Health Prediction page
2. Click "Report Analysis"
3. Select a report type (e.g., "Blood Test")
4. Upload a medical report image or PDF
5. Click "Extract Data with AI"
6. Verify extracted values appear in form fields
7. Review and edit if needed
8. Click "Analyze Report"

### Sample Test Data

Create a test image with text like:
```
BLOOD TEST REPORT
Patient: John Doe
Date: 2024-01-15

Hemoglobin: 13.5 g/dL
WBC Count: 7500 cells/mcL
RBC Count: 4.8 million/mcL
Platelet Count: 250000 /mcL
Hematocrit: 42%
```

## Troubleshooting

### Issue: "Groq API key not configured"
**Solution**: Add `GROQ_API_KEY` to `server/.env`

### Issue: "Failed to parse AI response"
**Solution**: The AI returned non-JSON text. Check Groq API status or try again.

### Issue: "PDF text extraction failed"
**Solution**: 
- Ensure pdf-parse is installed: `npm install pdf-parse`
- Try uploading an image instead of PDF
- Some PDFs are image-based and need OCR

### Issue: File upload fails
**Solution**: 
- Check file size (<10MB)
- Verify file type (JPG/PNG/PDF only)
- Ensure uploads/ directory exists

### Issue: No data extracted
**Solution**:
- Ensure report image is clear and readable
- Check that report contains numerical values
- Try a different report type

## Future Enhancements

Potential improvements:
1. **OCR for image-based PDFs**: Add Tesseract.js for scanned PDFs
2. **Multi-page PDF support**: Extract from multiple pages
3. **Confidence scores**: Show AI confidence for each value
4. **Manual corrections**: Allow users to mark incorrect extractions
5. **Learning from corrections**: Improve prompts based on user feedback
6. **Batch processing**: Upload multiple reports at once
7. **Report templates**: Support more report types
8. **Language support**: Extract from non-English reports

## API Rate Limits

Groq free tier limits:
- 30 requests per minute
- 14,400 requests per day

For production, consider:
- Implementing rate limiting
- Adding request queuing
- Upgrading to paid tier if needed

## Support

For issues or questions:
1. Check console logs (browser and server)
2. Verify all dependencies are installed
3. Ensure Groq API key is valid
4. Test with simple, clear report images first

## License

This feature is part of the AarogyaCare application.
