# VPS Deployment Guide (No Atlas)

This guide explains how to deploy the Advent Calendar application to a VPS with a self-contained MongoDB instance, completely independent from MongoDB Atlas.

## Prerequisites

- VPS with Docker and Docker Compose installed
- SSH access to your VPS
- Domain name (optional, for SSL)

## Option A: Deploy with Pre-seeded Data (Recommended)

This option allows you to seed your MongoDB database from a backup committed to your repository.

### Step 1: Backup Your Atlas Data (If You Have Existing Data)

On your **local machine**, run:

```bash
./scripts/backup-atlas-data.sh
```

This creates a backup in `mongo-init/seed-data/`. Commit this to git:

```bash
git add mongo-init/seed-data/
git commit -m "Add MongoDB seed data from Atlas"
git push
```

**Now you can safely delete your MongoDB Atlas cluster!**

### Step 2: Set Up Environment Variables on VPS

SSH into your VPS and create `.env.production`:

```bash
# On your VPS
cd /path/to/adventcalendar
nano .env.production
```

Use these environment variables (NO Atlas connection):

```env
# MongoDB Configuration (Docker internal network)
MONGODB_URI=mongodb://mongodb:27017
MONGODB_DATABASE=adventcalendar
MONGODB_PICTURES_COLLECTION=pictures
MONGODB_DUMMY_PICTURES_COLLECTION=dummy_pictures
MONGODB_USERS_COLLECTION=users

# JWT Secrets - CHANGE THESE TO STRONG RANDOM VALUES!
ACCESS_TOKEN_SECRET=your-super-secret-access-token-change-this-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-change-this-in-production
```

**Generate secure secrets:**

```bash
# Generate strong random secrets
echo "ACCESS_TOKEN_SECRET=$(openssl rand -base64 32)"
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)"
```

Copy these values into your `.env.production` file.

### Step 3: Deploy with Docker Compose

```bash
# Clone or pull latest code
git clone <your-repo-url> /path/to/adventcalendar
# OR
cd /path/to/adventcalendar && git pull

# Start services
docker-compose up -d --build
```

**What happens:**
1. MongoDB container starts
2. `mongo-init/init-db.js` creates collections and indexes
3. `mongo-init/restore-seed-data.sh` automatically restores your Atlas backup (if present)
4. Database is ready with all your data!

### Step 4: Verify Deployment

```bash
# Check containers are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test the API
curl http://localhost:3003/api/get_fake_pictures
```

## Option B: Deploy with Empty Database

If you don't have existing data or want to start fresh:

### Step 1: Same Environment Variables

Use the same `.env.production` from Option A (no Atlas URI needed).

### Step 2: Deploy

```bash
docker-compose up -d --build
```

### Step 3: Populate Database via API

After deployment, populate the database by calling the reset endpoint:

**From your VPS:**
```bash
curl http://localhost:3003/api/reset_pictures
```

**Or from your local machine (if VPS has public IP):**
```bash
curl http://your-vps-ip:3003/api/reset_pictures
```

This creates 24 dummy pictures in the database.

## Environment Variables Explained

### Required Variables (No Atlas!)

```env
# MongoDB URI for Docker internal network
# This connects to the MongoDB container via Docker's internal DNS
MONGODB_URI=mongodb://mongodb:27017

# Database name
MONGODB_DATABASE=adventcalendar

# Collection names (must match your application)
MONGODB_PICTURES_COLLECTION=pictures
MONGODB_DUMMY_PICTURES_COLLECTION=dummy_pictures
MONGODB_USERS_COLLECTION=users

# JWT secrets for authentication
ACCESS_TOKEN_SECRET=<generate-random-32-char-string>
REFRESH_TOKEN_SECRET=<generate-random-32-char-string>
```

### Important Notes:

1. **`MONGODB_URI=mongodb://mongodb:27017`**
   - Uses Docker's internal network
   - `mongodb` is the service name from docker-compose.yml
   - Port 27017 is internal to Docker (not exposed publicly)

2. **NO `MONGODB_URI_ATLAS` needed!**
   - This was only for migration
   - Not used in production deployment

3. **Collection names**
   - Must match what your application expects
   - These are lowercase in the Docker setup

4. **JWT Secrets**
   - Generate strong random strings
   - **Never** commit these to git
   - Use different values for production vs development

## Database Population Methods

### Method 1: Seed Data from Backup (Automatic)

If `mongo-init/seed-data/` exists in your repository:

```bash
# Data is automatically restored on first container start
docker-compose up -d
```

The `restore-seed-data.sh` script runs automatically and restores your data.

### Method 2: Call Reset API

```bash
# This creates 24 dummy pictures
curl http://localhost:3003/api/reset_pictures
```

### Method 3: Manual MongoDB Restore (Advanced)

If you have a backup file but didn't commit it to the repo:

```bash
# Copy backup to container
docker cp ./backup adventcalendar-mongodb-1:/tmp/backup

# Restore
docker exec adventcalendar-mongodb-1 mongorestore \
  --db=adventcalendar \
  --gzip \
  /tmp/backup/adventcalendar
```

### Method 4: Manual Data Entry

Access MongoDB shell:

```bash
docker exec -it adventcalendar-mongodb-1 mongosh adventcalendar
```

Then insert data manually (not recommended for 24 items).

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
- [ ] (Optional) Backup Atlas data and commit to repo
- [ ] Clone repository to VPS
- [ ] Run `docker-compose up -d --build`
- [ ] Verify containers are healthy: `docker-compose ps`
- [ ] (If no seed data) Populate database: `curl http://localhost:3003/api/reset_pictures`
- [ ] Test API endpoints work
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate
- [ ] Configure firewall: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`

## Maintenance Commands

### View Logs
```bash
docker-compose logs -f app
docker-compose logs -f mongodb
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

### Backup Database
```bash
docker exec adventcalendar-mongodb-1 mongodump \
  --db=adventcalendar \
  --out=/data/backup \
  --gzip

docker cp adventcalendar-mongodb-1:/data/backup ./backup-$(date +%Y%m%d)
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

### Can't connect to MongoDB

Check MongoDB is healthy:
```bash
docker-compose ps
docker exec -it adventcalendar-mongodb-1 mongosh adventcalendar --eval "db.stats()"
```

### Empty database after deployment

If seed data wasn't restored, check:
```bash
docker-compose logs mongodb | grep -i "seed\|restore"
```

Manually populate:
```bash
curl http://localhost:3003/api/reset_pictures
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
- Can't connect to MongoDB (check `MONGODB_URI`)
- Port conflicts

## Security Checklist

- [ ] Changed default JWT secrets
- [ ] Removed MongoDB port exposure in production (edit docker-compose.yml)
- [ ] Set up firewall rules
- [ ] Configured SSL/HTTPS
- [ ] Regular backups scheduled
- [ ] Keep Docker images updated: `docker-compose pull && docker-compose up -d`

## Summary: No Atlas Required!

Your application now runs completely self-contained:

1. **MongoDB runs in Docker** - No external database service needed
2. **Data persists in Docker volumes** - Survives container restarts
3. **Seed data in git** - Database can be initialized from backup
4. **Simple environment variables** - Just point to `mongodb://mongodb:27017`

You have **zero dependency** on MongoDB Atlas. Everything runs on your VPS!
