# Deployment TODO List

## Frontend Deployment on Vercel
- [x] Create vercel.json configuration file in client directory
- [x] Update axios baseURL in client/src/utils/axios.js to use environment variable
- [ ] Deploy client directory on Vercel
- [ ] Set REACT_APP_API_URL environment variable on Vercel

## Backend Deployment on Render
- [x] Create Procfile in server directory for Render deployment
- [ ] Deploy server directory on Render
- [ ] Set environment variables on Render (MONGO_URI, PORT, JWT_SECRET, etc.)
- [ ] Update frontend REACT_APP_API_URL with Render backend URL

## Documentation
- [x] Create DEPLOYMENT.md with detailed deployment instructions
- [x] Update README.md to include deployment section

## Testing
- [ ] Test deployed frontend and backend integration
- [ ] Verify all API calls work correctly
