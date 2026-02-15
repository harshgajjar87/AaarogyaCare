const axios = require('axios');

exports.textToSpeech = async (req, res) => {
  try {
    const { text, language = 'english' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'Google API key not configured' });
    }

    const voiceConfig = {
      english: { languageCode: 'en-IN', name: 'en-IN-Standard-A' },
      hindi: { languageCode: 'hi-IN', name: 'hi-IN-Standard-A' },
      gujarati: { languageCode: 'gu-IN', name: 'gu-IN-Standard-A' }
    };

    const voice = voiceConfig[language] || voiceConfig.english;

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
      {
        input: { text },
        voice: { languageCode: voice.languageCode, name: voice.name },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95, pitch: 0 }
      }
    );

    res.json({ audioContent: response.data.audioContent, contentType: 'audio/mp3' });

  } catch (error) {
    console.error('TTS error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Text-to-speech failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
};
