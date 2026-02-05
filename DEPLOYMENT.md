# Deployment Guide for AarogyaCare

## Render Deployment

### Prerequisites
- Render account
- MongoDB Atlas database
- Mailjet account (for email services)
- Razorpay account (for payments)

### Environment Variables Required on Render

Set the following environment variables in your Render service settings:

```
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
MAIL_USER=your_email@gmail.com
ADMIN_EMAIL=your_admin_email@gmail.com
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
PYTHON_SERVICE_URL=your_python_service_url
BASE_URL=https://your-render-app-name.onrender.com
REACT_APP_API_BASE_URL=https://your-render-app-name.onrender.com
```

### Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Render

2. **Service Configuration**:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node server.js`
   - Environment: Node

3. **Environment Variables**: Add all the variables listed above in the Render dashboard

4. **Deploy**: Render will automatically deploy your application

### Important Notes

- **Mailjet Configuration**: If Mailjet credentials are missing, email features will be disabled but the app will still run
- **Razorpay Configuration**: If Razorpay credentials are missing, payment features will be disabled but the app will still run
- **MongoDB**: Ensure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0) or add Render's IP ranges
- **CORS**: The app is configured to handle CORS for production deployment

### Troubleshooting

1. **Environment Variables Not Loading**: 
   - Ensure all required variables are set in Render dashboard
   - Check for typos in variable names
   - Restart the service after adding variables

2. **Database Connection Issues**:
   - Verify MongoDB connection string
   - Check MongoDB Atlas network access settings
   - Ensure database user has proper permissions

3. **Payment Issues**:
   - Verify Razorpay credentials are correct
   - Check Razorpay dashboard for test/live mode settings

4. **Email Issues**:
   - Verify Mailjet credentials
   - Check Mailjet account status and limits

### Health Check

After deployment, verify these endpoints:
- `GET /` - Should return basic server info
- `GET /api/auth/test` - Should return API status
- Database connection logs should show "✅ MongoDB Connected"

### Monitoring

- Check Render logs for any startup errors
- Monitor database connections
- Set up alerts for service downtime