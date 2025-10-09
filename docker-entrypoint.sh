#!/bin/bash
set -e

echo "🚀 Starting Advent Calendar Application..."
echo ""

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete"
echo ""

# Run seed
echo "🌱 Running database seed..."
npx prisma db seed || echo "⚠️  Seed skipped (database may already be seeded)"

echo ""
echo "✅ Application starting..."
echo ""

# Start the Next.js application
exec node server.js
