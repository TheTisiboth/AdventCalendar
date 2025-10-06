#!/bin/bash

# Script to create a one-time backup from MongoDB Atlas
# This backup will be committed to the repository for initial deployment
# Usage: ./scripts/backup-atlas-data.sh

set -e

echo "🔄 Creating Atlas Backup for Repository"
echo "========================================"
echo ""

# Check if mongodump is installed
command -v mongodump >/dev/null 2>&1 || { echo "❌ mongodump is required. Install MongoDB Database Tools."; exit 1; }

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ .env.local file not found"
    exit 1
fi

# Check if Atlas URI is set
if [ -z "$MONGODB_URI" ]; then
    echo "❌ MONGODB_URI is not set in .env.local"
    echo "Make sure it points to your MongoDB Atlas cluster"
    exit 1
fi

# Create backup directory in mongo-init
BACKUP_DIR="./mongo-init/seed-data"
rm -rf "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

echo "📦 Dumping data from MongoDB Atlas..."
echo "Database: $MONGODB_DATABASE"
echo ""

# Remove query parameters from URI to avoid conflicts
# mongodump handles connection options better with --db flag
CLEAN_URI=$(echo "$MONGODB_URI" | sed 's/?.*$//')

mongodump \
    --uri="$CLEAN_URI" \
    --db="$MONGODB_DATABASE" \
    --out="$BACKUP_DIR" \
    --gzip

echo ""
echo "✅ Backup completed successfully!"
echo ""
echo "📊 Verifying backup..."
find "$BACKUP_DIR" -name "*.bson.gz" -o -name "*.metadata.json.gz" | while read file; do
    echo "  ✓ $(basename $(dirname $file))/$(basename $file)"
done

echo ""
echo "🎉 Done! Your Atlas data has been backed up to: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. The backup is now in mongo-init/seed-data/"
echo "2. This will be used to initialize the database on first run"
echo "3. You can now safely delete your MongoDB Atlas cluster"
echo "4. Run 'git add mongo-init/seed-data' to commit the backup"
echo ""
