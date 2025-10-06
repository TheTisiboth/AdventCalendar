# AdventCalendar

An interactive Advent Calendar web application built with Next.js.

## Stack

- **Frontend**: [Next.js 15.5](https://nextjs.org/) with React
- **UI Framework**: [Material-UI (MUI)](https://mui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [MongoDB](https://www.mongodb.com/) (self-hosted in Docker)
- **Authentication**: JWT with access/refresh tokens
- **Deployment**: Docker + Docker Compose
- **Responsive**: Desktop and mobile compatible

## Development

```bash
# Install dependencies
npm install

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

## Deployment

See [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) for complete deployment instructions to a VPS with Docker.

### Quick Deploy

1. Backup your MongoDB Atlas data (if applicable):
   ```bash
   ./scripts/backup-atlas-data.sh
   git add mongo-init/seed-data/
   git commit -m "Add seed data"
   ```

2. On your VPS, create `.env.production`:
   ```env
   MONGODB_URI=mongodb://mongodb:27017
   MONGODB_DATABASE=adventcalendar
   MONGODB_PICTURES_COLLECTION=pictures
   MONGODB_DUMMY_PICTURES_COLLECTION=dummy_pictures
   MONGODB_USERS_COLLECTION=users
   ACCESS_TOKEN_SECRET=<generate-random-secret>
   REFRESH_TOKEN_SECRET=<generate-random-secret>
   ```

3. Deploy:
   ```bash
   docker-compose up -d --build
   ```

## Project Structure

- `/app` - Next.js app directory (pages, API routes)
- `/src` - React components and utilities
- `/mongo-init` - MongoDB initialization scripts and seed data
- `/scripts` - Deployment and maintenance scripts
- `/public` - Static assets

## Environment Variables

See [.env.production.example](./.env.production.example) for required environment variables.

## License

Private project
