// MongoDB initialization script
// This script runs when the MongoDB container is first created

db = db.getSiblingDB('adventcalendar');

// Create collections
db.createCollection('pictures');
db.createCollection('dummy_pictures');
db.createCollection('users');

// Create indexes for better performance
db.pictures.createIndex({ "day": 1 }, { unique: true });
db.dummy_pictures.createIndex({ "day": 1 }, { unique: true });
db.users.createIndex({ "name": 1 }, { unique: true });

print('✅ Database and collections initialized successfully');
