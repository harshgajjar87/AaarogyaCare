# Deployment Instructions

## Frontend Deployment on Vercel

1. Go to https://vercel.com and sign in or create an account.
2. Create a new project and import your GitHub repository.
3. Set the root directory to `client`.
4. Set the build command to `npm run build`.
5. Set the output directory to `build`.
6. Add an environment variable `REACT_APP_API_URL` with the URL of your backend deployed on Render (e.g., `https://your-backend.onrender.com/api`).
7. Deploy the project.
8. After deployment, your frontend will be available at the Vercel URL.

## Backend Deployment on Render

1. Go to https://render.com and sign in or create an account.
2. Create a new Web Service.
3. Connect your GitHub repository.
4. Set the root directory to `server`.
5. Set the start command to `npm start`.
6. Set environment variables:
   - `MONGO_URI`: Your MongoDB connection string.
   - `PORT`: Usually 10000 or leave blank to use default.
   - Any other environment variables your app requires (e.g., JWT_SECRET).
7. Deploy the service.
8. After deployment, note the service URL (e.g., `https://your-backend.onrender.com`).

## Post-Deployment Steps

1. Update the `REACT_APP_API_URL` environment variable on Vercel with the actual Render backend URL.
2. Redeploy the frontend on Vercel to apply the new API URL.
3. Test the deployed application to ensure all features work correctly.

## Environment Variables

### Backend (Render)
- `MONGO_URI`: MongoDB connection string
- `PORT`: Port number (optional, defaults to 5000)
- `JWT_SECRET`: Secret key for JWT tokens
- Any other secrets or configuration values

### Frontend (Vercel)
- `REACT_APP_API_URL`: Full URL to the backend API (e.g., `https://your-backend.onrender.com/api`)

## Notes
- Ensure your MongoDB database allows connections from Render's IP addresses.
- The Procfile in the server directory specifies the start command for Render.
- The vercel.json in the client directory configures the build and routing for Vercel.
