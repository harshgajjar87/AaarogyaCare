# Voice/Audio Troubleshooting Guide

## Issue: No sound from AI Voice Call

### Quick Fixes to Try:

1. **Test Audio Button**
   - Open the AI Voice Call modal
   - Click the "🔊 Test Audio" button before starting a call
   - This should say "Testing audio. Can you hear me?"
   - If you hear this, audio is working!

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for these messages:
     - ✅ "Speech started successfully" - Audio should be playing
     - ❌ "Speech error" - There's an issue
   - Check for any error messages

3. **Browser Audio Settings**
   - Make sure your browser tab is not muted (check tab icon)
   - Check system volume is not muted
   - Try clicking the speaker icon in your browser's address bar

4. **Browser Compatibility**
   - **Best:** Chrome/Edge (best Web Speech API support)
   - **Good:** Safari (works but may need user interaction first)
   - **Limited:** Firefox (limited voice options)

5. **Permissions**
   - Make sure microphone permission is granted
   - Some browsers block audio until user interacts with page

### Common Issues:

#### Issue: "Speech started" logs but no sound
**Solution:** 
- Check if system audio is muted
- Try a different browser (Chrome recommended)
- Check if other websites can play audio

#### Issue: No voices available
**Solution:**
- Wait a few seconds for voices to load
- Refresh the page
- Check `chrome://settings/languages` and ensure speech synthesis is enabled

#### Issue: Audio cuts off or doesn't start
**Solution:**
- The fix with `window.speechSynthesis.resume()` should handle this
- Try the "Test Audio" button first
- Make sure you interact with the page before starting call

### Testing Voices:

1. Open `client/public/test-voices.html` in your browser
2. This page shows all available voices
3. Test different languages with the buttons
4. Indian voices will be highlighted in green

### Debug Checklist:

- [ ] Browser console shows "✅ Speech started successfully"
- [ ] System volume is not muted
- [ ] Browser tab is not muted
- [ ] Using Chrome or Edge browser
- [ ] Microphone permission granted
- [ ] Test Audio button works
- [ ] Other audio on the website works

### Still Not Working?

If none of the above works:

1. **Try the test page:**
   ```
   Open: http://localhost:3000/test-voices.html
   ```

2. **Check browser support:**
   ```javascript
   // Run in console:
   console.log('Speech Synthesis:', 'speechSynthesis' in window);
   console.log('Voices:', window.speechSynthesis.getVoices());
   ```

3. **Try a simple test:**
   ```javascript
   // Run in console:
   const utterance = new SpeechSynthesisUtterance('Hello');
   utterance.volume = 1.0;
   window.speechSynthesis.speak(utterance);
   ```

### Recent Fixes Applied:

1. ✅ Added `utterance.volume = 1.0` to ensure maximum volume
2. ✅ Added `window.speechSynthesis.resume()` to fix pause issues
3. ✅ Added detailed console logging for debugging
4. ✅ Added "Test Audio" button for quick testing
5. ✅ Added error details logging

### Next Steps:

If you're still having issues, please check:
1. What browser are you using?
2. What do you see in the console when you click "Test Audio"?
3. Does the test-voices.html page work?
