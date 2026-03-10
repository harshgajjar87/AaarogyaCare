# Query/Ticket Notification System

## Overview
Implemented a comprehensive notification system that alerts patients when admins reply to their support tickets/queries submitted through the chatbot.

## Changes Made

### 1. Backend - Admin Controller
**File:** `server/controllers/adminController.js`

#### Enhanced `replyToQuery` function:
- Added notification creation when admin replies to a query
- Tries to find user by `userId` first (if user was logged in when submitting)
- Falls back to email lookup if `userId` is not available
- Creates in-app notification for registered users
- Sends email notification to all users (registered or guest)
- Logs notification status for debugging

### 2. Backend - Query Model
**File:** `server/models/Query.js`

#### Added new field:
- `userId`: Optional field to store the user's ID if they were logged in when submitting the query
- This allows for more reliable notification delivery to registered users

### 3. Backend - Contact Controller
**File:** `server/controllers/contactController.js`

#### Enhanced `submitContact` function:
- Now captures `userId` from `req.user` if available (when user is logged in)
- Stores `userId` in the query document for future reference
- Updated email notification to admin to indicate if query is from registered user
- Maintains backward compatibility for guest users

### 4. Backend - Auth Middleware
**File:** `server/middleware/authMiddleware.js`

#### Added new middleware:
- `optionalAuth`: New middleware that attempts to authenticate but doesn't block if no token provided
- Allows routes to be accessible to both authenticated and guest users
- Sets `req.user` to null if no valid token is found
- Exported for use in contact routes

### 5. Backend - Contact Routes
**File:** `server/routes/contactRoutes.js`

#### Updated route:
- Added `optionalAuth` middleware to contact submission route
- Allows tracking of user identity when logged in
- Maintains public accessibility for guest users

### 6. Frontend - Admin Queries Page
**File:** `client/src/pages/AdminQueries.js`

#### Major UI/UX Improvements:
- Added inline reply form within the query details modal
- Added state management for reply message and sending status
- Implemented `handleReply` function to send replies via API
- Enhanced modal to show:
  - Previous admin replies (if any)
  - Reply timestamp
  - Status badge with color coding
  - Inline reply textarea
  - Send button with loading state
- Improved modal layout with better spacing and scrolling
- Added "Send Reply & Notify" button that clearly indicates notification will be sent
- Auto-refreshes query list after successful reply

## How It Works

### For Logged-in Users:
1. Patient submits query/ticket through chatbot
2. System captures their `userId` along with email
3. Query is saved to database with user reference
4. Email notification sent to admin (AarogyaCare55@gmail.com)
5. Admin views query in Admin Queries page
6. Admin types reply in inline form and clicks "Send Reply & Notify"
7. System:
   - Saves reply to database
   - Updates query status to "replied"
   - Creates in-app notification for the patient
   - Sends email to patient's email address
8. Patient receives:
   - In-app notification (bell icon)
   - Email notification with admin's reply

### For Guest Users:
1. Guest submits query through contact form
2. System saves query with email only (no userId)
3. Email notification sent to admin
4. Admin replies through the system
5. System attempts to find user by email
6. If user exists: Creates in-app notification + sends email
7. If user doesn't exist: Only sends email notification

## Benefits

1. **Dual Notification System**: Both in-app and email notifications ensure users don't miss replies
2. **Better User Experience**: Patients get immediate notification when admin responds
3. **Inline Reply**: Admins can reply directly from the interface without opening email client
4. **Status Tracking**: Query status automatically updates to "replied"
5. **Reply History**: Shows previous replies if admin needs to follow up
6. **Guest Support**: Works for both registered and guest users
7. **Reliable Delivery**: Uses userId when available, falls back to email lookup

## Testing Recommendations

1. Test as logged-in patient:
   - Submit query through chatbot
   - Check if notification appears after admin reply
   - Verify email is received

2. Test as guest user:
   - Submit query without logging in
   - Verify email notification is received after admin reply

3. Test admin workflow:
   - View queries in admin panel
   - Send reply through inline form
   - Verify success message appears
   - Check query status updates to "replied"

4. Test notification system:
   - Check notification bell icon shows new notification
   - Verify notification message is clear and actionable
   - Test notification click behavior

## API Endpoints

- `POST /api/contact` - Submit query (with optional auth)
- `GET /api/admin/queries` - Get all queries (admin only)
- `POST /api/admin/queries/:id/reply` - Reply to query (admin only)

## Database Schema

```javascript
Query {
  name: String,
  email: String,
  subject: String,
  message: String,
  userId: ObjectId (optional),
  status: String (new/read/replied/closed),
  adminReply: String,
  repliedAt: Date,
  repliedBy: ObjectId
}
```
