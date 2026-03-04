# Test Gemini API Key with Postman

## Method 1: Direct Google API Request

### Request Details:
- **Method**: POST
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY`
- **Replace**: `YOUR_API_KEY` with your actual key: `AIzaSyAJkZO7KcgIPgpptbPT0KOnCBwZFB1mczA`

### Headers:
```
Content-Type: application/json
```

### Body (raw JSON):
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Say hello in one sentence"
        }
      ]
    }
  ]
}
```

### Full URL (Ready to use):
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAJkZO7KcgIPgpptbPT0KOnCBwZFB1mczA
```

---

## Method 2: Test via Your Server Endpoint

I'll create a test endpoint in your server that you can call from Postman.

### Request Details:
- **Method**: GET
- **URL**: `http://localhost:5000/api/test/gemini`

This will test your Gemini API key and return the result.

---

## Expected Responses:

### Success (200):
```json
{
  "success": true,
  "message": "Gemini API is working",
  "response": "Hello! ..."
}
```

### Error (500):
```json
{
  "success": false,
  "error": "Error message here",
  "details": "..."
}
```

---

## Common Error Codes:

- **400**: Invalid API key format
- **403**: API key doesn't have permission / API not enabled
- **404**: Model not found (wrong model name or API version)
- **429**: Quota exceeded / Rate limit
