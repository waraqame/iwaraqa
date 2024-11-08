# Waraqa - Google Cloud Deployment Guide

## Prerequisites
1. Install Google Cloud CLI
2. Install Node.js 18+
3. PostgreSQL installed locally for development

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up local PostgreSQL database:
```bash
createdb waraqa
```

3. Set up environment variables in `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/waraqa
NODE_ENV=development
```

## Google Cloud Setup

1. Create new Google Cloud project:
```bash
gcloud projects create waraqa-prod --name="Waraqa Production"
gcloud config set project waraqa-prod
```

2. Enable required APIs:
```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  appengine.googleapis.com
```

3. Create Cloud SQL instance:
```bash
gcloud sql instances create waraqa-db \
  --database-version=POSTGRES_15 \
  --cpu=1 \
  --memory=3840MB \
  --region=us-central1 \
  --root-password=[YOUR_ROOT_PASSWORD]
```

4. Create database:
```bash
gcloud sql databases create waraqa --instance=waraqa-db
```

5. Create database user:
```bash
gcloud sql users create waraqa-user \
  --instance=waraqa-db \
  --password=[USER_PASSWORD]
```

6. Get connection name:
```bash
gcloud sql instances describe waraqa-db --format='value(connectionName)'
```

7. Update app.yaml with your values:
- Replace [USER] with waraqa-user
- Replace [PASSWORD] with the user password from step 5
- Replace [INSTANCE_CONNECTION_NAME] with the connection name from step 6

## Local Development with Cloud SQL

1. Install Cloud SQL Auth proxy:
```bash
curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy
```

2. Authenticate:
```bash
gcloud auth application-default login
```

3. Start Cloud SQL proxy:
```bash
./cloud-sql-proxy [INSTANCE_CONNECTION_NAME]
```

## Database Migration

1. Generate migration:
```bash
npm run db:migrate
```

2. Push migration to database:
```bash
npm run db:push
```

## Deployment

1. Initialize App Engine:
```bash
gcloud app create --region=us-central
```

2. Deploy:
```bash
gcloud app deploy
```

3. Set up custom domain:
```bash
gcloud app domains verify waraqa.me
gcloud app domain-mappings create waraqa.me
```

4. Update DNS records as instructed by Google Cloud Console

## Important Notes

1. Database Backups:
- Automated backups are enabled by default
- Configure point-in-time recovery if needed

2. Monitoring:
- Set up Cloud Monitoring alerts for:
  - Database CPU usage
  - Storage usage
  - Connection count
  - Error rates

3. Security:
- Keep Cloud SQL Auth proxy running for local development
- Never commit sensitive credentials
- Use Cloud Secret Manager for production secrets

4. Scaling:
- App Engine will auto-scale based on load
- Monitor database connections
- Adjust instance class if needed

## Troubleshooting

1. Connection Issues:
- Verify Cloud SQL Auth proxy is running
- Check network/firewall settings
- Verify connection string format

2. Migration Failures:
- Check database permissions
- Verify connection string
- Review migration logs

3. Deployment Issues:
- Check build logs: `gcloud app logs tail`
- Verify service account permissions
- Check resource quotas

## Regular Maintenance

1. Update dependencies monthly
2. Review and rotate database credentials
3. Monitor database performance
4. Check and optimize queries
5. Review and update security settings

## Useful Commands

```bash
# View app logs
gcloud app logs tail

# Check database status
gcloud sql instances describe waraqa-db

# Connect to database
gcloud sql connect waraqa-db --user=waraqa-user

# List all instances
gcloud sql instances list

# View current deployment
gcloud app describe
```