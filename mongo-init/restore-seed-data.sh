#!/bin/bash

# This script runs inside the MongoDB container on initialization
# It restores data from the seed-data directory if it exists
# Only runs ONCE - marks itself as complete to prevent re-running

set -e

SEED_DATA_DIR="/docker-entrypoint-initdb.d/seed-data/adventcalendar"
RESTORE_MARKER="/data/db/.seed_data_restored"

echo "🌱 Checking for seed data..."

# Check if data was already restored
if [ -f "$RESTORE_MARKER" ]; then
    echo "✅ Database already initialized (found marker file)"
    echo "   Skipping seed data restoration"
    exit 0
fi

if [ -d "$SEED_DATA_DIR" ]; then
    echo "📦 Found seed data, restoring..."

    # Wait for MongoDB to be fully ready
    until mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        echo "Waiting for MongoDB to be ready..."
        sleep 2
    done

    echo "✅ MongoDB is ready"
    echo "📥 Restoring data from backup..."

    mongorestore \
        --db=adventcalendar \
        --gzip \
        --drop \
        "$SEED_DATA_DIR"

    echo "✅ Seed data restored successfully!"

    # Create marker file to prevent future restorations
    touch "$RESTORE_MARKER"
    echo "🔒 Created marker file to prevent re-seeding"

    # Verify restoration
    mongosh adventcalendar --eval "
        print('📊 Database Statistics:');
        print('  Users:', db.users.countDocuments());
        print('  Pictures:', db.pictures.countDocuments());
        print('  Dummy Pictures:', db.dummy_pictures.countDocuments());
    "
else
    echo "ℹ️  No seed data found. Starting with empty database."
    echo "   You can populate data by calling /api/reset_pictures"
fi

echo "✅ Initialization complete!"
