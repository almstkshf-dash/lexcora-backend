# Vercel Deployment Guide

## Steps to Deploy Successfully

### 1. Set Environment Variables in Vercel Dashboard
Go to your Vercel project settings and add these environment variables:

```
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

If using Cloudflare R2:
```
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
```

### 2. Database Considerations
- Ensure your database allows connections from Vercel's IP ranges
- Consider using a cloud database service like:
  - PlanetScale (MySQL)
  - AWS RDS
  - Google Cloud SQL
  - Azure Database

### 3. File Upload Considerations
- Vercel has a serverless environment, so local file uploads won't persist
- Consider using:
  - Cloudflare R2 (already configured)
  - AWS S3
  - Google Cloud Storage

### 4. Common Issues and Solutions

#### "Function exceeded timeout"
- Add this to vercel.json:
```json
{
  "functions": {
    "index.js": {
      "maxDuration": 30
    }
  }
}
```

#### "Module not found" errors
- Ensure all dependencies are in package.json
- Run `npm install` locally to verify

#### Database connection issues
- Check firewall settings
- Verify connection strings
- Use connection pooling

### 5. Testing Locally
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start the server
npm start
```

### 6. Deployment Commands
```bash
# Deploy to Vercel
vercel --prod

# Or connect your GitHub repository for automatic deployments
```

## Troubleshooting

If you're still getting build errors:

1. Check the Vercel build logs for specific error messages
2. Ensure all required environment variables are set
3. Verify database connectivity
4. Check that all route files exist and are properly structured
5. Test the application locally first

## Performance Optimization

1. Enable compression in your app.js:
```javascript
const compression = require('compression');
app.use(compression());
```

2. Add caching headers for static files
3. Optimize database queries
4. Use connection pooling (already implemented)