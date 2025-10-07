#!/bin/bash

# Combined MongoDB initialization script
# 1. Restores seed data if available (includes collections and indexes)
# 2. OR creates empty collections and indexes if no seed data
# This script runs ONCE when the MongoDB container is first created

set -e

SEED_DATA_BASE_DIR="/docker-entrypoint-initdb.d/seed-data"
RESTORE_MARKER="/data/db/.seed_data_restored"
DB_NAME="advent_calendar"

echo "🚀 MongoDB Initialization Starting..."
echo "======================================"

# Check if database was already initialized
if [ -f "$RESTORE_MARKER" ]; then
    echo "✅ Database already initialized (found marker file)"
    echo "   Skipping initialization to preserve data"
    exit 0
fi

# Wait for MongoDB to be fully ready
until mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    echo "Waiting for MongoDB to be ready..."
    sleep 2
done

echo "✅ MongoDB is ready"
echo ""

# Try to find the actual database directory (could be advent_calendar or adventcalendar)
if [ -d "$SEED_DATA_BASE_DIR/advent_calendar" ]; then
    SEED_DATA_DIR="$SEED_DATA_BASE_DIR/advent_calendar"
elif [ -d "$SEED_DATA_BASE_DIR/adventcalendar" ]; then
    SEED_DATA_DIR="$SEED_DATA_BASE_DIR/adventcalendar"
else
    SEED_DATA_DIR=""
fi

if [ -n "$SEED_DATA_DIR" ] && [ -d "$SEED_DATA_DIR" ]; then
    echo "📦 Found seed data at: $SEED_DATA_DIR"
    echo "   Restoring to database: $DB_NAME"
    echo "   (includes collections, indexes, and data)"
    echo ""
    echo "📥 Restoring data from backup..."

    mongorestore \
        --db="$DB_NAME" \
        --gzip \
        --drop \
        "$SEED_DATA_DIR"

    echo ""
    echo "✅ Seed data restored successfully!"

    # Verify restoration
    mongosh "$DB_NAME" --eval "
        print('📊 Database Statistics:');
        print('  Users:', db.users.countDocuments());
        print('  Pictures:', db.pictures.countDocuments());
        print('  Dummy Pictures:', db.dummy_pictures.countDocuments());
    "
else
    echo "ℹ️  No seed data found."
    echo "   Creating empty collections with indexes..."
    echo ""

    # Create collections and indexes only if no seed data
    mongosh "$DB_NAME" --eval "
        db.createCollection('pictures');
        db.createCollection('dummy_pictures');
        db.createCollection('users');

        db.pictures.createIndex({ 'day': 1 }, { unique: true });
        db.dummy_pictures.createIndex({ 'day': 1 }, { unique: true });
        db.users.createIndex({ 'name': 1 }, { unique: true });

        print('✅ Collections and indexes created');
    "

    echo ""
    echo "   You can populate data by calling /api/reset_pictures"
fi

# Create marker file to prevent future re-initialization
touch "$RESTORE_MARKER"
echo ""
echo "🔒 Created marker file to prevent re-initialization"
echo ""
echo "✅ Initialization complete!"
