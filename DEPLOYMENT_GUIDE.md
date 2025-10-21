# Deployment Guide for Kids B-Care to Vercel

## Prerequisites Completed ✅
1. Database configured with Neon PostgreSQL
2. Environment variables set up locally (.env.local)
3. Database schema pushed to Neon
4. Favicon and logo configured
5. vercel.json configuration created

## Manual Deployment Steps

### 1. Login to Vercel
Run the following command and follow the authentication process:
```bash
npx vercel login
```

### 2. Deploy the Project
Run this command to deploy to production:
```bash
npx vercel --prod
```

When prompted:
- Set up and deploy: Y
- Which scope: Choose your account
- Link to existing project?: N (if first time) or Y (if updating)
- Project name: kids-b-care (or your preferred name)
- Directory: ./ (current directory)

### 3. Set Environment Variables on Vercel Dashboard

Go to your project on [Vercel Dashboard](https://vercel.com/dashboard) and add these environment variables:

#### Required Environment Variables:
```
DATABASE_URL=[Your Neon PostgreSQL connection string]
```

#### Optional PostgreSQL Variables (for debugging):
```
PGDATABASE=[Your database name]
PGHOST=[Your Neon host]
PGPORT=5432
PGUSER=[Your database user]
PGPASSWORD=[Your database password]
```

**Note:** Get your actual database credentials from your Neon dashboard or .env.local file.

### 4. Redeploy After Setting Environment Variables
After adding environment variables, trigger a new deployment:
```bash
npx vercel --prod
```

## Alternative: Using Vercel CLI with Environment Variables

You can also deploy with environment variables directly:
```bash
npx vercel --prod --build-env DATABASE_URL="[Your PostgreSQL connection string]" --env DATABASE_URL="[Your PostgreSQL connection string]"
```

## Files Created/Modified
- `.env.local` - Local environment variables
- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from deployment
- `.gitignore` - Updated to exclude .env files
- `client/index.html` - Added favicon configuration

## Project Structure
The project is configured to:
- Build the client with Vite
- Bundle the server with esbuild
- Serve both API and client from the same deployment
- Use Neon PostgreSQL for database
- Support serverless functions with 10-second timeout

## Troubleshooting

### If deployment fails:
1. Check that all dependencies are installed: `npm install`
2. Test build locally: `npm run build`
3. Verify database connection: `npm run db:push`
4. Check Vercel logs for specific errors

### If database connection fails:
1. Verify DATABASE_URL is correctly set in Vercel environment variables
2. Ensure SSL mode is set to 'require' in the connection string
3. Check if the database is accessible from Vercel's servers

## Next Steps After Deployment
1. Visit your deployed URL (shown after successful deployment)
2. Test the application features
3. Monitor logs in Vercel Dashboard for any runtime errors
4. Set up a custom domain if desired (in Vercel Dashboard > Settings > Domains)
