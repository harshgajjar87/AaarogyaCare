# Render Deployment Guide - Blueprint Setup

## Overview
This project uses Render Blueprint to deploy two services:
1. **aarogyacare-api** - Node.js backend (Port 10000)
2. **aarogyacare-python** - Python voice assistant (Port 10000)

## Deployment Steps

### 1. Push Changes to GitHub
```bash
git add render.yaml server/voice_assistant.py
git commit -m "Add Render Blueprint configuration"
git push origin main
```

### 2. Deploy on Render

#### Option A: Using Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository: `harshgajjar87/AaarogyaCare`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

#### Option B: Manual Service Creation
If Blueprint doesn't work, create services manually:

**Service 1: Node.js API**
- Name: `aarogyacare-api`
- Environment: `Node`
- Build Command: `cd server && npm install`
- Start Command: `cd server && node server.js`
- Add all environment variables from `.env`

**Service 2: Python Voice Assistant**
- Name: `aarogyacare-python`
- Environment: `Python 3`
- Build Command: `pip install -r server/requirements.txt`
- Start Command: `python server/voice_assistant.py`
- Add `GOOGLE_API_KEY` environment variable

### 3. Configure Environment Variables

After deployment, add these secrets in Render Dashboard for **aarogyacare-api**:
- `MONGO_URI`
- `JWT_SECRET`
- `MAIL_USER`
- `ADMIN_EMAIL`
- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`
- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `GOOGLE_API_KEY`

For **aarogyacare-python**:
- `GOOGLE_API_KEY`

**Note:** `PYTHON_SERVICE_URL` will be auto-configured by Blueprint to point to the Python service.

### 4. Update Frontend Environment Variables

After deployment, update your client `.env` with:
```
REACT_APP_API_BASE_URL=https://aarogyacare-api.onrender.com
```

### 5. Verify Deployment

Test endpoints:
- Node.js API: `https://aarogyacare-api.onrender.com/api/health`
- Python Service: `https://aarogyacare-python.onrender.com/voice/speak`

## Important Notes

- ⚠️ Free tier services spin down after 15 minutes of inactivity
- ⚠️ First request after spin-down may take 30-60 seconds
- ⚠️ Both services must be running for voice features to work
- ✅ Services auto-link via Blueprint configuration
- ✅ Python service URL is automatically injected into Node.js service

## Troubleshooting

### Python Service Not Starting
- Check logs in Render Dashboard
- Verify `requirements.txt` is in `server/` directory
- Ensure `GOOGLE_API_KEY` is set

### Node.js Can't Connect to Python Service
- Verify both services are deployed
- Check `PYTHON_SERVICE_URL` environment variable
- Ensure Python service is not sleeping

### Build Failures
- Check build logs for missing dependencies
- Verify paths in `render.yaml` are correct
- Ensure all required files are committed to Git

## Cost Optimization

Free tier limits:
- 750 hours/month per service
- Services sleep after 15 min inactivity
- 100 GB bandwidth/month

To keep services active:
- Use a cron job to ping services every 10 minutes
- Upgrade to paid plan ($7/month per service)
