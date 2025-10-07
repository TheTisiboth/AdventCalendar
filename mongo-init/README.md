# MongoDB Initialization

This directory contains the initialization script and seed data for MongoDB.

## Files

- `init-and-restore.sh` - Combined initialization script (creates collections OR restores seed data)
- `seed-data/` - Contains MongoDB dump files (optional)

## How It Works

When you run `docker-compose up` for the first time:

1. MongoDB container starts
2. `init-and-restore.sh` checks for the marker file (`.seed_data_restored`)
3. If marker exists, skip initialization (preserves existing data)
4. If no marker:
   - **With seed data**: Restores backup from `seed-data/` (includes collections, indexes, and data)
   - **Without seed data**: Creates empty collections with indexes
5. Creates marker file to prevent re-running
6. Database is ready!

**Important:** The initialization only happens ONCE. On subsequent container restarts, the script detects the marker file and skips to preserve your data.

## Workflow

### Before Deleting Atlas

1. **Backup your Atlas data first:**
   ```bash
   ./scripts/backup-atlas-data.sh
   ```
   This creates a backup in `mongo-init/seed-data/`

2. **Commit the backup to git:**
   ```bash
   git add mongo-init/seed-data/
   git commit -m "Add MongoDB seed data from Atlas"
   ```

3. **Now you can safely delete your MongoDB Atlas cluster**

### On First Deployment

Deploy with Docker:
```bash
docker-compose up -d --build
```

The init script will automatically:
- Detect and restore your committed seed data, OR
- Create empty collections if no seed data exists

## Directory Structure

```
mongo-init/
├── init-and-restore.sh           # Combined initialization script
├── README.md                     # This file
└── seed-data/                    # MongoDB dumps (created by backup script)
    └── advent_calendar/          # or adventcalendar/
        ├── users.bson.gz
        ├── users.metadata.json.gz
        ├── pictures.bson.gz
        ├── pictures.metadata.json.gz
        ├── dummy_pictures.bson.gz
        └── dummy_pictures.metadata.json.gz
```

## Notes

- The `seed-data/` directory should be committed to git if you want to deploy with initial data
- If `seed-data/` doesn't exist, the database starts with empty collections
- You can populate an empty database by calling `/api/reset_pictures`
- **The initialization only happens once** - a marker file prevents re-running on container restarts
- To force a fresh initialization, delete the Docker volume: `docker-compose down -v && docker-compose up -d`
- The script handles both `advent_calendar` and `adventcalendar` directory naming
- `mongorestore` with `--drop` ensures clean restoration and includes indexes from the backup
