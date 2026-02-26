# Render Environment Variables Checklist

## ⚠️ CRITICAL: Email Not Working Fix

If you're getting 500 errors when sending emails, it means **Mailjet environment variables are missing** on Render.

### Required Environment Variables for aarogyacare-api Service

Go to Render Dashboard → aarogyacare-api → Environment → Add the following:

#### Database
- `MONGO_URI` = Your MongoDB connection string

#### Authentication
- `JWT_SECRET` = Your JWT secret key

#### Email Configuration (CRITICAL for email functionality)
- `MAIL_USER` = Your email address
- `ADMIN_EMAIL` = Admin email address
- `MAILJET_API_KEY` = Your Mailjet API key
- `MAILJET_SECRET_KEY` = Your Mailjet secret key

#### AI Services
- `OPENAI_API_KEY` = Your OpenAI API key
- `GROQ_API_KEY` = Your Groq API key
- `GOOGLE_API_KEY` = Your Google API key

#### Payment Gateway
- `RAZORPAY_KEY_ID` = Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` = Your Razorpay secret

#### Other
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `BASE_URL` = `https://aarogyacare-api.onrender.com`

### Required Environment Variables for aarogyacare-python Service

- `GOOGLE_API_KEY` = Your Google API key
- `PORT` = `10000`

## How to Add Environment Variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your service (aarogyacare-api)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Copy values from your local `.env` file
6. Add each variable one by one
7. Click **Save Changes**
8. Service will automatically redeploy

## Verify Email Configuration

After adding environment variables, check the logs:
1. Go to Render Dashboard → aarogyacare-api → Logs
2. Look for: `✅ SMTP Server is ready`
3. If you see `❌ SMTP Connection Error`, double-check your Mailjet credentials

## Test Email Functionality

After deployment:
1. Try sending an OTP during registration
2. Try submitting a contact form
3. Check Render logs for any email errors

## Common Issues

### Issue: "SMTP Connection Error"
**Solution:** Verify MAILJET_API_KEY and MAILJET_SECRET_KEY are set correctly

### Issue: "Authentication failed"
**Solution:** Make sure there are no extra spaces in the API keys

### Issue: "Missing credentials"
**Solution:** The app will crash on startup if Mailjet credentials are missing. Add them immediately.

## Where to Find Your Credentials

All credentials are in your local `server/.env` file. Copy them from there to Render.

**IMPORTANT:** Never commit the `.env` file or expose credentials in public repositories.
