# MongoDB Initialization

This directory contains scripts and data for initializing the MongoDB database.

## Files

- `init-db.js` - Creates collections and indexes
- `restore-seed-data.sh` - Restores data from backup (if present)
- `seed-data/` - Contains MongoDB dump files (optional)

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

When you run `docker-compose up` for the first time:

1. MongoDB container starts
2. `init-db.js` creates collections and indexes
3. `restore-seed-data.sh` checks for seed data
4. If `seed-data/` exists, it restores the backup
5. A marker file (`.seed_data_restored`) is created in the database volume
6. Your database is ready with all your Atlas data!

**Important:** The restore only happens ONCE. On subsequent container restarts, the script detects the marker file and skips restoration to preserve your production data.

## Directory Structure

```
mongo-init/
├── init-db.js                    # Collection setup
├── restore-seed-data.sh          # Data restoration
├── README.md                     # This file
└── seed-data/                    # MongoDB dumps (created by backup script)
    └── adventcalendar/
        ├── users.bson.gz
        ├── users.metadata.json.gz
        ├── pictures.bson.gz
        ├── pictures.metadata.json.gz
        ├── dummy_pictures.bson.gz
        └── dummy_pictures.metadata.json.gz
```

## Notes

- The `seed-data/` directory should be committed to git if you want to deploy with initial data
- If `seed-data/` doesn't exist, the database starts empty
- You can always populate an empty database by calling `/api/reset_pictures`
- **The restore only happens once** - a marker file prevents re-seeding on container restarts
- To force a re-seed, delete the Docker volume: `docker-compose down -v && docker-compose up -d`
