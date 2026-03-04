const express = require('express');
const router = express.Router();
const axios = require('axios');

// Test Gemini API
router.get('/gemini', async (req, res) => {
  try {
    console.log('Testing Gemini API...');
    
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GOOGLE_API_KEY not configured in .env'
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('API Key preview:', apiKey.substring(0, 15) + '...');

    // Test with direct REST API call
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'Say hello in one sentence'
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Gemini API is working!');
    
    res.json({
      success: true,
      message: 'Gemini API is working',
      response: response.data.candidates[0].content.parts[0].text,
      fullResponse: response.data
    });

  } catch (error) {
    console.error('❌ Gemini API test failed');
    console.error('Error:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);

    res.status(500).json({
      success: false,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data,
      apiKeyPreview: process.env.GOOGLE_API_KEY?.substring(0, 15) + '...'
    });
  }
});

// Test OpenAI API
router.get('/openai', async (req, res) => {
  try {
    console.log('Testing OpenAI API...');
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OPENAI_API_KEY not configured in .env'
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say hello in one sentence' }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ OpenAI API is working!');
    
    res.json({
      success: true,
      message: 'OpenAI API is working',
      response: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('❌ OpenAI API test failed');
    console.error('Error:', error.message);
    console.error('Status:', error.response?.status);

    res.status(500).json({
      success: false,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data
    });
  }
});

// Test Groq API
router.get('/groq', async (req, res) => {
  try {
    console.log('Testing Groq API...');
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY not configured in .env'
      });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'user', content: 'Say hello in one sentence' }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Groq API is working!');
    
    res.json({
      success: true,
      message: 'Groq API is working',
      response: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('❌ Groq API test failed');
    console.error('Error:', error.message);
    console.error('Status:', error.response?.status);

    res.status(500).json({
      success: false,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data
    });
  }
});

// Test all APIs at once
router.get('/all', async (req, res) => {
  const results = {
    gemini: { tested: false },
    openai: { tested: false },
    groq: { tested: false }
  };

  // Test Gemini
  try {
    if (process.env.GOOGLE_API_KEY) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [{ parts: [{ text: 'Say hello' }] }]
        }
      );
      results.gemini = { tested: true, working: true, response: response.data.candidates[0].content.parts[0].text };
    }
  } catch (error) {
    results.gemini = { tested: true, working: false, error: error.message, status: error.response?.status };
  }

  // Test OpenAI
  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say hello' }],
          max_tokens: 20
        },
        {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
        }
      );
      results.openai = { tested: true, working: true, response: response.data.choices[0].message.content };
    }
  } catch (error) {
    results.openai = { tested: true, working: false, error: error.message, status: error.response?.status };
  }

  // Test Groq
  try {
    if (process.env.GROQ_API_KEY) {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: 'Say hello' }],
          max_tokens: 20
        },
        {
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
        }
      );
      results.groq = { tested: true, working: true, response: response.data.choices[0].message.content };
    }
  } catch (error) {
    results.groq = { tested: true, working: false, error: error.message, status: error.response?.status };
  }

  res.json(results);
});

module.exports = router;
