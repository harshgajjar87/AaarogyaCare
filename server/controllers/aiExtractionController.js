const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Helper function to convert image to base64
const imageToBase64 = async (filePath) => {
  const imageBuffer = await fs.readFile(filePath);
  return imageBuffer.toString('base64');
};

// Helper function to extract text from PDF (simple text extraction)
const extractTextFromPDF = async (filePath) => {
  try {
    // For simple PDFs, we'll use a basic approach
    // In production, consider using pdf-parse or pdfjs-dist
    const pdfParse = require('pdf-parse');
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    // If text extraction fails, we'll convert to image
    return null;
  }
};

// System prompt for structured JSON extraction - extracts ALL fields from report
const getSystemPrompt = (reportType) => {
  return `You are a medical report data extraction AI. Extract ALL medical test values from the report, not just predefined fields.

CRITICAL RULES:
1. Return ONLY a valid JSON object, no markdown, no explanations
2. Do NOT wrap the JSON in markdown code blocks
3. Extract ALL numerical values and their parameter names from the report
4. If a value is not found, omit it from the JSON (don't use null)
5. Convert all values to numbers (remove units)
6. Use camelCase for field names (e.g., "whiteBloodCells" not "White Blood Cells")
7. Include EVERY parameter you can find in the report

For ${reportType} reports, commonly include but are NOT LIMITED to:
- All blood cell counts (WBC, RBC, Hemoglobin, Hematocrit, Platelets, etc.)
- All differential counts (Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils)
- All indices (MCV, MCH, MCHC, RDW, MPV, PDW, etc.)
- Any other parameters present in the report

Example response format:
{
  "hemoglobin": 13.5,
  "wbc": 7500,
  "rbc": 4.8,
  "platelets": 250000,
  "neutrophils": 60,
  "lymphocytes": 30,
  "mcv": 90,
  "mch": 30,
  "mchc": 34,
  "rdw": 13.5,
  "mpv": 9.5,
  "pdw": 12.0,
  "esr": 10
}

Extract ALL values you can find and return ONLY the JSON object.`;
};

// Main extraction function
exports.extractMedicalReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, msg: 'No file uploaded' });
    }

    const reportType = req.body.reportType || 'blood';
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let extractedData;
    let fullReportText = ''; // Store the complete report text
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    if (!GROQ_API_KEY && !GOOGLE_API_KEY) {
      await fs.unlink(filePath);
      return res.status(500).json({ success: false, msg: 'AI API keys not configured' });
    }

    const systemPrompt = getSystemPrompt(reportType);

    // Process based on file type
    if (fileType.startsWith('image/')) {
      // Handle image files - Try Gemini first, then Groq
      const base64Image = await imageToBase64(filePath);
      
      try {
        // Try Gemini Vision first
        console.log('Attempting Gemini Vision API for image extraction...');
        
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
          {
            contents: [{
              parts: [
                { text: `${systemPrompt}\n\nExtract the medical test values from this report image and return only the JSON object.` },
                {
                  inline_data: {
                    mime_type: fileType,
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2000,
              responseMimeType: "application/json"
            }
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
        extractedData = JSON.parse(geminiText.replace(/```json\n?|\n?```/g, '').trim());
        console.log('Gemini Vision API succeeded');
        
      } catch (geminiError) {
        console.log('Gemini Vision failed, falling back to Groq:', geminiError.message);
        
        // Fallback to Groq vision model
        const imageUrl = `data:${fileType};base64,${base64Image}`;
        
        const groqResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Extract the medical test values from this report image and return only the JSON object.' },
                  { type: 'image_url', image_url: { url: imageUrl } }
                ]
              }
            ],
            temperature: 0.1,
            max_completion_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const aiResponse = groqResponse.data.choices[0].message.content;
        extractedData = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, '').trim());
        console.log('Groq Vision API succeeded as fallback');
      }
      
    } else if (fileType === 'application/pdf') {
      // Handle PDF files
      const extractedText = await extractTextFromPDF(filePath);
      fullReportText = extractedText || ''; // Store the full PDF text

      if (!extractedText) {
        await fs.unlink(filePath);
        return res.status(400).json({ 
          success: false, 
          msg: 'PDF text extraction failed. Please upload an image of the report instead.' 
        });
      }

      const userPrompt = `Extract the medical test values from this report text:\n\n${extractedText}`;

      try {
        // Try Gemini first for text extraction
        console.log('Attempting Gemini API for PDF text extraction...');
        
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
          {
            contents: [{
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2000,
              responseMimeType: "application/json"
            }
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
        extractedData = JSON.parse(geminiText.replace(/```json\n?|\n?```/g, '').trim());
        console.log('Gemini API succeeded for PDF');
        
      } catch (geminiError) {
        console.log('Gemini failed for PDF, falling back to Groq:', geminiError.message);
        
        // Fallback to Groq
        const groqResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const aiResponse = groqResponse.data.choices[0].message.content;
        extractedData = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, '').trim());
        console.log('Groq API succeeded as fallback for PDF');
      }
    } else {
      await fs.unlink(filePath);
      return res.status(400).json({ success: false, msg: 'Unsupported file type' });
    }

    // Clean up uploaded file
    await fs.unlink(filePath);

    // Return the extracted data AND the full report text
    res.json({
      success: true,
      extractedData,
      fullText: fullReportText, // Include full text for comprehensive analysis
      message: 'Medical report data extracted successfully'
    });

  } catch (error) {
    console.error('AI Extraction Error:', error.response?.data || error.message);
    
    // Clean up file if it exists
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('File cleanup error:', unlinkError);
      }
    }

    res.status(500).json({ 
      success: false, 
      msg: error.response?.data?.error?.message || 'Failed to extract data from report' 
    });
  }
};
