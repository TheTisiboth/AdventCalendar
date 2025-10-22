# AdventCalendar

An interactive Advent Calendar web application built with Next.js.

## Stack

- **Frontend**: [Next.js 15.5](https://nextjs.org/) with React
- **UI Framework**: [Material-UI (MUI)](https://mui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [PostgreSQL 16](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT with access/refresh tokens
- **Deployment**: Docker + Docker Compose
- **Responsive**: Desktop and mobile compatible

## Development

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

The app will be available at `http://localhost:3000`

## Database Management

```bash
# Create a new migration (after schema changes)
npx prisma migrate dev --name description_of_changes

# Apply migrations
npx prisma migrate deploy

# Seed the database
npm run db:seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Production Database Management

When deploying on a VPS with Docker (Dokploy):

```bash
# Reset and reseed database (⚠️ DELETES ALL DATA)
docker exec -it <container-name> sh
npx prisma migrate reset --force

# Reset database without seeding
docker exec -it <container-name> npx prisma migrate reset --force --skip-seed

# Delete postgres volume for completely fresh start (⚠️ DELETES ALL DATA)
docker compose -p adventcalendar-app-r47mo1 down
docker volume rm adventcalendar-app-r47mo1_postgres_data
# Then redeploy from Dokploy dashboard
```

## Deployment

See [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) for complete deployment instructions to a VPS with Docker.

### Quick Deploy

1. On your VPS, create `.env.production`:
   ```env
   # PostgreSQL Configuration
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=<secure-random-password>

   # JWT Secrets
   ACCESS_TOKEN_SECRET=<generate-random-secret>
   REFRESH_TOKEN_SECRET=<generate-random-secret>
   ```

2. Generate secure secrets:
   ```bash
   openssl rand -base64 32
   ```

3. Deploy:
   ```bash
   docker-compose up -d --build
   ```

## Project Structure

- `/app` - Next.js app directory (pages, API routes)
- `/src` - React components and utilities
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Environment Variables

See [.env.production.example](./.env.production.example) for required environment variables.

## Technical Notes

### Dynamic Rendering for Authenticated Pages

All authenticated pages use `export const dynamic = 'force-dynamic'` to prevent Next.js from attempting to prerender them at build time. This is necessary because:

1. These pages require authentication via Kinde
2. Authentication is not available during the build process
3. Without this setting, Docker builds would fail with "Authentication required" errors

Affected pages:
- `/app/(pages)/(authenticated)/archive/page.tsx`
- `/app/(pages)/(authenticated)/calendar/page.tsx`
- `/app/(pages)/(authenticated)/archive/[year]/page.tsx`
- `/app/(pages)/admin/manage/page.tsx`

This ensures pages are rendered on-demand when users visit them, with proper authentication checks.

## License

Private project
