/**
 * S3 Migration Script
 * Migrates S3 keys from "year/day.jpg" format to "year/calendarId/day.jpg" format
 *
 * Run this AFTER database migration but BEFORE deploying new code
 * Usage: npx tsx scripts/migrate-s3-keys.ts
 */

import { PrismaClient } from '@prisma/client'
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const DRY_RUN = process.env.DRY_RUN === 'true'

async function migrateS3Keys() {
  console.log('Starting S3 key migration...')
  console.log(`DRY_RUN: ${DRY_RUN}`)

  // Get all pictures with their calendar info
  const pictures = await prisma.picture.findMany({
    include: {
      calendar: true
    },
    orderBy: { id: 'asc' }
  })

  console.log(`Found ${pictures.length} pictures to migrate`)

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ pictureId: number; error: string }> = []

  for (const picture of pictures) {
    const oldKey = picture.key

    // Skip if key is a full URL (fake calendar)
    if (oldKey.startsWith('http://') || oldKey.startsWith('https://')) {
      console.log(`Skipping fake calendar picture ${picture.id}: ${oldKey}`)
      continue
    }

    // Skip if already migrated (contains calendarId in path)
    if (oldKey.includes(`/${picture.calendarId}/`)) {
      console.log(`Picture ${picture.id} already migrated: ${oldKey}`)
      successCount++
      continue
    }

    const newKey = `${picture.year}/${picture.calendarId}/${picture.day}.jpg`

    console.log(`Migrating picture ${picture.id}:`)
    console.log(`  Old: ${oldKey}`)
    console.log(`  New: ${newKey}`)

    try {
      if (!DRY_RUN) {
        // Copy object to new key
        await s3Client.send(new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${oldKey}`,
          Key: newKey
        }))

        // Update database
        await prisma.picture.update({
          where: { id: picture.id },
          data: { key: newKey }
        })

        // Delete old object (comment out to keep for rollback)
        await s3Client.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: oldKey
        }))
      }

      successCount++
      console.log(`  ✓ Success`)
    } catch (error) {
      errorCount++
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push({ pictureId: picture.id, error: errorMessage })
      console.error(`  ✗ Error: ${errorMessage}`)
    }
  }

  console.log('\n=== Migration Summary ===')
  console.log(`Total pictures: ${pictures.length}`)
  console.log(`Successful: ${successCount}`)
  console.log(`Errors: ${errorCount}`)

  if (errors.length > 0) {
    console.log('\nFailed migrations:')
    errors.forEach(({ pictureId, error }) => {
      console.log(`  Picture ${pictureId}: ${error}`)
    })
  }

  await prisma.$disconnect()
}

migrateS3Keys().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
