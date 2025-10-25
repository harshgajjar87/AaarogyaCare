# TODO: Fix App Issues

## Issues Identified
- [x] userRole undefined causing navbar routing issues
- [x] Server not running (ERR_CONNECTION_REFUSED for notifications API)
- [x] Corrupted manifest.json file
- [x] React Router v7 future flag warnings
- [x] Notification routes not mounted in server.js

## Plan
1. [x] Fix manifest.json: Create proper JSON structure
2. [x] Add notification routes to server.js
3. [x] Fix userRole undefined: Ensure role is properly set in AuthContext
4. [x] Add React Router future flags to suppress warnings
5. [ ] Start the server to resolve network errors

## Followup Steps
- [ ] Test the app after fixes
- [ ] Verify navbar shows correctly based on user role
- [ ] Confirm notifications API works
- [ ] Check console for no more warnings/errors
