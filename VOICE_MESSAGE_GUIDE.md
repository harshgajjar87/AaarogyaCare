# Voice Message Feature - User Guide

## How to Send Voice Messages

1. **Open a chat** - Navigate to your chat with a doctor/patient
2. **Click the microphone icon** (🎤) at the bottom of the chat
3. **Start recording** - The icon will turn red indicating recording is active
4. **Click again to stop** - The voice message will be automatically sent

## How to Listen to Voice Messages

When you receive a voice message, you'll see:
- An audio player with play/pause controls
- A timeline showing the duration
- Volume controls

Simply click the **play button** to listen to the voice message.

## Technical Details

### Supported Audio Format
- WAV format (audio/wav)
- Maximum file size: 10MB

### Browser Requirements
- Modern browsers with MediaRecorder API support
- Microphone access permission required

### Server Configuration
- Voice messages are stored in: `server/uploads/chat/`
- Files are served via: `http://localhost:5000/uploads/chat/`

## Troubleshooting

### "Microphone access denied"
- Check browser permissions
- Allow microphone access when prompted
- Verify your device has a working microphone

### Voice message not playing
- Check your internet connection
- Ensure the server is running
- Verify the file was uploaded successfully (check Network tab in DevTools)

### File upload failed
- Check file size (must be under 10MB)
- Ensure server has write permissions to `uploads/chat/` directory
- Verify multer middleware is properly configured

## API Endpoints

### Send Message with File
```
POST /api/chat/:chatId/messages
Content-Type: multipart/form-data

Body:
- message: string (text message)
- file: File (audio/image/document)
```

### Response
```json
{
  "_id": "chatId",
  "messages": [{
    "senderId": "userId",
    "message": "Voice message",
    "fileUrl": "/uploads/chat/filename.wav",
    "fileType": "audio",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }]
}
```

## Database Schema

The Chat model includes:
```javascript
messages: [{
  senderId: ObjectId,
  message: String,
  fileUrl: String,        // Path to uploaded file
  fileType: String,       // 'audio', 'image', 'document', or null
  timestamp: Date
}]
```
