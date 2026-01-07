# DigitalOcean Deployment Guide

This guide walks you through deploying the LEAP Emergency Assistance Fund application to DigitalOcean App Platform.

## Prerequisites
- DigitalOcean account
- GitHub repository connected to DigitalOcean
- Admin credentials configured

## Deployment Steps

### Option 1: Deploy via DigitalOcean Dashboard (Recommended for first deploy)

1. **Log in to DigitalOcean**
   - Go to https://cloud.digitalocean.com/

2. **Create New App**
   - Click "Create" → "Apps"
   - Choose "GitHub" as source
   - Authorize DigitalOcean to access your GitHub account
   - Select repository: `cartyd/leap`
   - Select branch: `main`
   - Click "Next"

3. **Configure Resources**
   - **Name**: `leap-prototype`
   - **Region**: New York (or closest to your users)
   - **Build Command**: `npm run build`
   - **Run Command**: `bash scripts/start.sh`
   - **HTTP Port**: `8080`
   - Click "Next"

4. **Set Environment Variables**
   Add these environment variables:
   
   ```
   NODE_ENV=production
   PORT=8080
   DATABASE_URL=file:/data/prod.db
   UPLOADS_DIR=/data/uploads
   SESSION_SECRET=<generate-secure-random-string>
   CSRF_SECRET=<generate-secure-random-string>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=<your-secure-password>
   MAX_FILE_SIZE=10485760
   ```

   **Important**: Generate secure secrets using:
   ```bash
   openssl rand -base64 32
   ```

5. **Add Persistent Storage (IMPORTANT)**
   - Under "Resources", click "Edit" on your web service
   - Scroll to "Storage"
   - Click "Add Storage"
   - **Mount Path**: `/data`
   - **Size**: 1 GB (can increase later)
   - Click "Save"

6. **Review & Launch**
   - Plan: Basic ($5/month)
   - Review all settings
   - Click "Create Resources"

7. **Wait for Deployment**
   - Initial deployment takes 5-10 minutes
   - Watch the build logs for any errors
   - Once complete, click on the URL to view your app

### Option 2: Deploy via CLI (doctl)

If you have `doctl` installed:

```bash
# Create app from spec file
doctl apps create --spec .do/app.yaml

# Get app ID
doctl apps list

# Monitor deployment
doctl apps logs <app-id> --follow
```

## Post-Deployment

### Test the Application
1. Visit your app URL (e.g., `https://leap-prototype-xxxxx.ondigitalocean.app`)
2. Click "Start Application"
3. Test the full flow through all 6 steps
4. Test admin panel at `/admin/applications`

### Access Admin Panel
- URL: `https://your-app-url.ondigitalocean.app/admin/applications`
- Username: Value of `ADMIN_USERNAME` env var
- Password: Value of `ADMIN_PASSWORD` env var

### View Logs
In DigitalOcean dashboard:
- Go to your app
- Click "Runtime Logs" tab
- Real-time logs will appear

### Important Notes for SQLite Prototype

⚠️ **Data Persistence**:
- SQLite database is stored in `/data/prod.db`
- File uploads are stored in `/data/uploads`
- Both require persistent storage (configured in step 5)
- Without persistent storage, all data will be lost on each deployment

⚠️ **Limitations**:
- SQLite is not recommended for production
- No built-in backups
- Single-instance only (cannot scale horizontally)
- For production, migrate to PostgreSQL

## Updating the App

Every push to `main` branch will automatically trigger a new deployment if you enabled "Deploy on Push".

Alternatively, manually trigger from dashboard:
1. Go to your app
2. Click "Settings" tab
3. Click "Force Rebuild and Deploy"

## Troubleshooting

### Build Fails
- Check build logs in dashboard
- Ensure all dependencies are in `package.json`
- Verify `npm run build` works locally

### App Crashes on Startup
- Check runtime logs
- Verify environment variables are set correctly
- Ensure `/data` persistent storage is mounted

### Database Errors
- Ensure `DATABASE_URL` points to `/data/prod.db`
- Verify persistent storage is configured
- Check that migrations ran (see logs for "prisma migrate deploy")

### File Upload Fails
- Verify `UPLOADS_DIR=/data/uploads` is set
- Ensure persistent storage is mounted at `/data`
- Check disk space usage

## Migration to Production (PostgreSQL)

When ready for production:
1. Create DigitalOcean Managed PostgreSQL database ($15/month)
2. Update `prisma/schema.prisma` provider to `postgresql`
3. Update `DATABASE_URL` environment variable
4. Run migrations: `npx prisma migrate deploy`
5. Consider migrating uploads to Spaces (S3-compatible storage)

## Cost Estimate

**Prototype (SQLite)**:
- App: $5/month (Basic plan)
- Storage: $0.10/GB/month
- **Total**: ~$5-6/month

**Production (PostgreSQL)**:
- App: $12/month (Professional plan for multiple instances)
- Database: $15/month (Managed PostgreSQL)
- Spaces: $5/month (250GB storage for uploads)
- **Total**: ~$32/month

## Support

For issues specific to DigitalOcean:
- Documentation: https://docs.digitalocean.com/products/app-platform/
- Support: https://www.digitalocean.com/support/
