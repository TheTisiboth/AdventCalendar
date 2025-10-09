# VPS Deployment Guide

This guide explains how to deploy the Advent Calendar application to a VPS with PostgreSQL database running in Docker.

## Prerequisites

- VPS with Docker and Docker Compose installed
- SSH access to your VPS
- Domain name (optional, for SSL)

## Step 1: Set Up Environment Variables on VPS

SSH into your VPS and create `.env.production`:

```bash
# On your VPS
cd /path/to/adventcalendar
nano .env.production
```

Create the environment file with these variables:

```env
# PostgreSQL Configuration
# Note: Database name is hardcoded as 'advent_calendar' in docker-compose.yml
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_TO_SECURE_PASSWORD

# JWT Secrets - CHANGE THESE TO STRONG RANDOM VALUES!
ACCESS_TOKEN_SECRET=CHANGE_ME_TO_RANDOM_32_CHARS
REFRESH_TOKEN_SECRET=CHANGE_ME_TO_RANDOM_32_CHARS
```

**Generate secure secrets:**

```bash
# Generate strong random secrets
echo "ACCESS_TOKEN_SECRET=$(openssl rand -base64 32)"
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
```

Copy these values into your `.env.production` file.

## Step 2: Deploy with Docker Compose

```bash
# Clone or pull latest code
git clone <your-repo-url> /path/to/adventcalendar
# OR
cd /path/to/adventcalendar && git pull

# Start services
docker-compose up -d --build
```

**What happens:**
1. PostgreSQL container starts with healthcheck
2. App container waits for PostgreSQL to be healthy
3. `docker-entrypoint.sh` runs Prisma migrations (`prisma migrate deploy`)
4. Database is seeded automatically if empty
5. Next.js application starts on port 3003

## Step 3: Verify Deployment

```bash
# Check containers are running
docker-compose ps

# Check logs
docker-compose logs -f app
docker-compose logs -f postgres

# Test the API
curl http://localhost:3003/api/get_fake_pictures
```

Expected response: JSON array of 24 pictures.

## Environment Variables Explained

### Required Variables

```env
# PostgreSQL user (used to construct DATABASE_URL)
POSTGRES_USER=postgres

# PostgreSQL password (used to construct DATABASE_URL)
# IMPORTANT: Change to a strong random password in production
POSTGRES_PASSWORD=<generate-random-password>

# JWT secrets for authentication
# Generate with: openssl rand -base64 32
ACCESS_TOKEN_SECRET=<generate-random-32-char-string>
REFRESH_TOKEN_SECRET=<generate-random-32-char-string>
```

### Automatic Configuration

The following are automatically configured in `docker-compose.yml`:

- **Database Name**: `advent_calendar` (hardcoded)
- **DATABASE_URL**: Automatically constructed as `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/advent_calendar?schema=public`
- **PostgreSQL Port**: 5432 (internal Docker network)
- **App Port**: 3003 (exposed to host on port 3003)

### Important Notes:

1. **`@postgres:5432`**
   - Uses Docker's internal network
   - `postgres` is the service name from docker-compose.yml
   - Port 5432 is internal to Docker

2. **Never commit `.env.production` to git**
   - Listed in `.gitignore`
   - Use different secrets for development vs production

3. **Database persistence**
   - Data is stored in Docker volume `postgres_data`
   - Survives container restarts
   - Only deleted with `docker-compose down -v`

## Database Migrations

Migrations are automatically applied on container startup via `docker-entrypoint.sh`.

### Manual migration (if needed)

```bash
# Apply pending migrations
docker exec adventcalendar-app-1 npx prisma migrate deploy

# View migration status
docker exec adventcalendar-app-1 npx prisma migrate status
```

### Database Seeding

The database is automatically seeded on first startup if tables are empty:
- 1 admin user (username: `paula`, password: `paul@2k23`)
- 24 Pictures (day 1-24)
- 24 DummyPictures (Lorem Picsum placeholder images)

To manually reseed:

```bash
docker exec adventcalendar-app-1 npm run db:seed
```

## Setting Up Reverse Proxy (Nginx)

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/adventcalendar
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/adventcalendar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Add SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Complete Deployment Checklist

- [ ] VPS with Docker and Docker Compose installed
- [ ] `.env.production` created with secure secrets
- [ ] Clone repository to VPS
- [ ] Run `docker-compose up -d --build`
- [ ] Verify containers are healthy: `docker-compose ps`
- [ ] Test API endpoints work
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate
- [ ] Configure firewall: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`

## Maintenance Commands

### View Logs
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
cd /path/to/adventcalendar
git pull
docker-compose up -d --build
```

### Access PostgreSQL Shell
```bash
docker exec -it adventcalendar-postgres-1 psql -U postgres -d advent_calendar
```

Common queries:
```sql
-- View all tables
\dt

-- Count pictures
SELECT COUNT(*) FROM "Picture";

-- View users
SELECT id, name, role FROM "User";
```

### Backup Database
```bash
# Backup to file
docker exec adventcalendar-postgres-1 pg_dump -U postgres advent_calendar > backup-$(date +%Y%m%d).sql

# Backup with compression
docker exec adventcalendar-postgres-1 pg_dump -U postgres advent_calendar | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore Database
```bash
# From plain SQL file
docker exec -i adventcalendar-postgres-1 psql -U postgres advent_calendar < backup.sql

# From compressed file
gunzip -c backup.sql.gz | docker exec -i adventcalendar-postgres-1 psql -U postgres advent_calendar
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove All Data (Careful!)
```bash
docker-compose down -v  # This deletes the database volume!
```

## Troubleshooting

### Can't connect to PostgreSQL

Check PostgreSQL is healthy:
```bash
docker-compose ps
docker exec -it adventcalendar-postgres-1 psql -U postgres -d advent_calendar -c "SELECT version();"
```

### Database migrations fail

Check if database is accessible:
```bash
docker-compose logs postgres
docker exec adventcalendar-postgres-1 pg_isready -U postgres
```

### Empty database after deployment

Manually seed the database:
```bash
docker exec adventcalendar-app-1 npm run db:seed
```

### Port 3003 already in use

Change the port in `docker-compose.yml`:
```yaml
ports:
  - "8080:3003"  # Access on port 8080 instead
```

### App container crashes

Check logs:
```bash
docker-compose logs app
```

Common issues:
- Missing environment variables
- Can't connect to PostgreSQL (check `DATABASE_URL`)
- Port conflicts
- Prisma Client not generated (should happen during build)

### Prisma Client errors

Regenerate Prisma Client:
```bash
docker-compose down
docker-compose up -d --build
```

## Security Checklist

- [ ] Changed default JWT secrets
- [ ] Changed default PostgreSQL password
- [ ] Removed PostgreSQL port exposure in production (not exposed by default)
- [ ] Set up firewall rules
- [ ] Configured SSL/HTTPS
- [ ] Regular backups scheduled
- [ ] Keep Docker images updated: `docker-compose pull && docker-compose up -d`

## Architecture Overview

Your application runs completely self-contained:

1. **PostgreSQL runs in Docker** - No external database service needed
2. **Data persists in Docker volumes** - Survives container restarts
3. **Automatic migrations** - Applied on startup via docker-entrypoint.sh
4. **Automatic seeding** - Database initialized if empty
5. **Type-safe queries** - Prisma ORM provides full TypeScript support

Everything runs on your VPS with zero external dependencies!
