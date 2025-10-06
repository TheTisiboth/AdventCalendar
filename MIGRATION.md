# Next.js Migration Complete

## Summary

Successfully migrated the Advent Calendar app from Vite + Netlify Functions to Next.js 15.

## What Was Changed

### 1. Project Structure
- Created `app/` directory with Next.js App Router structure
- Migrated all Netlify Functions to Next.js API routes in `app/api/`
- Created pages in `app/(pages)/` for routing

### 2. API Routes (app/api/)
All serverless functions converted to Next.js API routes:
- `/api/authenticate` - JWT authentication check
- `/api/login` - User login
- `/api/logout` - User logout
- `/api/token` - Refresh token
- `/api/get_pictures` - Get real pictures (authenticated)
- `/api/get_fake_pictures` - Get dummy pictures (public)
- `/api/open_picture` - Open a real picture (authenticated)
- `/api/open_fake_picture` - Open a dummy picture (public)
- `/api/reset_pictures` - Reset dummy pictures (public)

### 3. Database Connection
- Created `app/api/lib/mongodb.ts` with connection caching for Next.js
- Created `app/api/lib/models.ts` with Mongoose models
- Created `app/api/lib/auth.ts` with JWT utilities

### 4. Client Components
Added `"use client"` directive to components using React hooks:
- All Calendar components
- NavBar
- Home
- All page components

### 5. Configuration
- Updated `package.json` scripts: `npm run dev`, `npm run build`, `npm start`
- Created `next.config.js`
- Updated `tsconfig.json` for Next.js
- Copied `.env` to `.env.local` for Next.js environment variables
- Updated API path constant from `/.netlify/functions/` to `/api/`

## How to Run

### Development
```bash
npm run dev
```
Server runs on http://localhost:3000

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Deploying to Your VPS

### Option 1: Standalone Build (Recommended)
```bash
# Build the app
npm run build

# Copy these to your VPS:
# - .next/
# - public/
# - package.json
# - next.config.js
# - .env.local (rename to .env on server)

# On VPS:
npm install --production
npm start
```

### Option 2: Using PM2
```bash
# On VPS after copying files:
npm install -g pm2
pm2 start npm --name "advent-calendar" -- start
pm2 save
pm2 startup
```

### Option 3: Docker
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Then:
```bash
docker build -t advent-calendar .
docker run -p 3000:3000 --env-file .env advent-calendar
```

## Environment Variables
Make sure these are set on your VPS:
```
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE=advent_calendar
MONGODB_PICTURES_COLLECTION=Pictures
MONGODB_DUMMY_PICTURES_COLLECTION=dummyPictures
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

## Testing

The app has been tested and confirmed working:
- ✅ API routes respond correctly
- ✅ MongoDB connection works
- ✅ Reset pictures creates 24 dummy pictures
- ✅ Get fake pictures returns 24 items

Access the test page at: http://localhost:3000/test

## Notes

- The old Vite setup is still available via `npm run dev:vite` if needed
- All original functionality preserved
- No breaking changes to the app logic
- Client-side state management (Zustand) unchanged
- Material-UI components work as before
