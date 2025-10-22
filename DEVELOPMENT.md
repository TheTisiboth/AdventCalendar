# Local Development Guide

This guide explains how to run the Advent Calendar application locally for development.

## Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed
- Git

## Option 1: Hybrid Setup (Recommended) ⭐

Run PostgreSQL in Docker and Next.js locally. This gives you the best of both worlds:
- ✅ Database isolation and consistency
- ✅ Fast hot reload for code changes
- ✅ No Docker overhead for the app

### Steps:

1. **Start PostgreSQL**
   ```bash
   docker compose up postgres -d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed with sample data
   npm run db:seed
   ```

4. **Start Next.js dev server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Open http://localhost:3000

### Stopping

```bash
# Stop Next.js: Ctrl+C in terminal

# Stop PostgreSQL
docker compose down
```

---

## Option 2: Full Docker Setup

Run everything in Docker with hot reload enabled.

### Steps:

1. **Start all services**
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

2. **Access the app**
   - Open http://localhost:3000

### Stopping

```bash
docker compose -f docker-compose.dev.yml down
```

### Notes for Docker setup:
- Source code is mounted as a volume, so changes are reflected immediately
- `node_modules` and `.next` are excluded from volume mounting for performance
- First build may take a few minutes

---

## Option 3: Production Docker

Test the production build locally:

```bash
# Build and start
docker compose up --build

# Access at http://localhost:3003
```

---

## Useful Commands

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset and reseed database (⚠️ DELETES ALL DATA)
npx prisma migrate reset --force

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Code Quality

```bash
# Run linter
npm run lint

# Run type checking
npm run type-check

# Run both
npm run check

# Run tests
npm test

# Run tests once
npm run test:run
```

### Docker Commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f postgres

# Execute commands in running container
docker compose exec app sh
docker compose exec postgres psql -U my_postgres_user -d advent_calendar

# Rebuild containers
docker compose build --no-cache

# Remove all containers and volumes (fresh start)
docker compose down -v
```

---

## Environment Variables

The `.env` file contains all necessary configuration. Key variables:

- `DATABASE_URL`: PostgreSQL connection string (port 5434 for Docker)
- `AWS_*`: S3 bucket configuration for image storage
- `KINDE_*`: Authentication configuration
- `CDN_URL`: URL for serving images

---

## Database Access

### Via Docker

```bash
docker compose exec postgres psql -U my_postgres_user -d advent_calendar
```

### Via Local Tools

Connect using:
- Host: `localhost`
- Port: `5434`
- Database: `advent_calendar`
- User: `my_postgres_user`
- Password: `my_safe_pwd`

---

## Troubleshooting

### Port Already in Use

If port 3000 or 5434 is already in use:

```bash
# Find process using port
lsof -ti:3000
lsof -ti:5434

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# Check PostgreSQL logs
docker compose logs postgres
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset and resync database
npx prisma migrate reset
```

### Docker Issues

```bash
# Clean up everything
docker compose down -v
docker system prune -a

# Rebuild from scratch
docker compose up --build --force-recreate
```

---

## Development Workflow

1. Start PostgreSQL: `docker compose up postgres -d`
2. Start Next.js: `npm run dev`
3. Make code changes (hot reload happens automatically)
4. If schema changes: `npx prisma migrate dev --name your_change`
5. Commit changes
6. Stop services: `Ctrl+C` and `docker compose down`

---

## Testing the Archive Feature

After the recent changes, calendars are automatically archived based on their year:

1. Create calendars for different years via the admin panel
2. Calendars with `year < current year` appear in the archive automatically
3. Only the current year's calendar appears on the main page

To test with past years:
```bash
# Create a 2023 calendar via admin panel
# Or modify seed.ts and run: npm run db:seed
```
