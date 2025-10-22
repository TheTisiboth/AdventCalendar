import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if database is already seeded
  const pictureCount = await prisma.picture.count()
  const calendarCount = await prisma.calendar.count()

  if (pictureCount > 0 && calendarCount > 0) {
    console.log('✅ Database already seeded')
    console.log('   Found:', pictureCount, 'pictures,', calendarCount, 'calendars')
    console.log('   Skipping seed to preserve data')
    return
  }

  // Seed calendars FIRST (needed for foreign key constraint)
  if (calendarCount === 0) {
    console.log('📦 Creating calendars...')
    await prisma.calendar.createMany({
      data: [
        {
          year: 2023,
          title: 'Advent Calendar 2023',
          description: 'A beautiful collection of moments from 2023',
          isPublished: true,
          isFake: false
        },
        {
          year: 1996,
          title: 'Test Calendar 1996',
          description: 'A test calendar with fake pictures for demo purposes',
          isPublished: true,
          isFake: true
        }
      ]
    })
    console.log('✅ Calendars created')
  }

  // Seed pictures if not exists (AFTER calendars)
  if (pictureCount === 0) {
    console.log('📦 Creating pictures...')

    // Create 2023 pictures (real)
      await prisma.picture.createMany({
          data: [
              { day: 1, year: 2023, key: '2023/1.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-01T00:00:00.000Z') },
              { day: 2, year: 2023, key: '2023/2.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-02T00:00:00.000Z') },
              { day: 3, year: 2023, key: '2023/3.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-03T00:00:00.000Z') },
              { day: 4, year: 2023, key: '2023/4.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-04T00:00:00.000Z') },
              { day: 5, year: 2023, key: '2023/5.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-05T00:00:00.000Z') },
              { day: 6, year: 2023, key: '2023/6.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-06T00:00:00.000Z') },
              { day: 7, year: 2023, key: '2023/7.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-07T00:00:00.000Z') },
              { day: 8, year: 2023, key: '2023/8.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-08T00:00:00.000Z') },
              { day: 9, year: 2023, key: '2023/9.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-09T00:00:00.000Z') },
              { day: 10, year: 2023, key: '2023/10.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-10T00:00:00.000Z') },
              { day: 11, year: 2023, key: '2023/11.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-11T00:00:00.000Z') },
              { day: 12, year: 2023, key: '2023/12.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-12T00:00:00.000Z') },
              { day: 13, year: 2023, key: '2023/13.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-13T00:00:00.000Z') },
              { day: 14, year: 2023, key: '2023/14.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-14T00:00:00.000Z') },
              { day: 15, year: 2023, key: '2023/15.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-15T00:00:00.000Z') },
              { day: 16, year: 2023, key: '2023/16.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-16T00:00:00.000Z') },
              { day: 17, year: 2023, key: '2023/17.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-17T00:00:00.000Z') },
              { day: 18, year: 2023, key: '2023/18.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-18T00:00:00.000Z') },
              { day: 19, year: 2023, key: '2023/19.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-19T00:00:00.000Z') },
              { day: 20, year: 2023, key: '2023/20.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-20T00:00:00.000Z') },
              { day: 21, year: 2023, key: '2023/21.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-21T00:00:00.000Z') },
              { day: 22, year: 2023, key: '2023/22.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-22T00:00:00.000Z') },
              { day: 23, year: 2023, key: '2023/23.jpg', isOpenable: false, isOpen: true, date: new Date('2023-12-23T00:00:00.000Z') },
              { day: 24, year: 2023, key: '2023/24.png', isOpenable: false, isOpen: true, date: new Date('2023-12-24T00:00:00.000Z') }
          ]
      })


    console.log('✅ Pictures created (2023 real)')

    // Create 1996 fake pictures
    await prisma.picture.createMany({
        data: [
          { day: 1, year: 1996, key: 'https://picsum.photos/200/300?sig=1', isOpenable: false, isOpen: true, date: new Date('1996-12-01T00:00:00.000Z') },
          { day: 2, year: 1996, key: 'https://picsum.photos/200/300?sig=2', isOpenable: false, isOpen: false, date: new Date('1996-12-02T00:00:00.000Z') },
          { day: 3, year: 1996, key: 'https://picsum.photos/200/300?sig=3', isOpenable: false, isOpen: false, date: new Date('1996-12-03T00:00:00.000Z') },
          { day: 4, year: 1996, key: 'https://picsum.photos/200/300?sig=4', isOpenable: false, isOpen: false, date: new Date('1996-12-04T00:00:00.000Z') },
          { day: 5, year: 1996, key: 'https://picsum.photos/200/300?sig=5', isOpenable: false, isOpen: false, date: new Date('1996-12-05T00:00:00.000Z') },
          { day: 6, year: 1996, key: 'https://picsum.photos/200/300?sig=6', isOpenable: false, isOpen: false, date: new Date('1996-12-06T00:00:00.000Z') },
          { day: 7, year: 1996, key: 'https://picsum.photos/200/300?sig=7', isOpenable: false, isOpen: false, date: new Date('1996-12-07T00:00:00.000Z') },
          { day: 8, year: 1996, key: 'https://picsum.photos/200/300?sig=8', isOpenable: false, isOpen: false, date: new Date('1996-12-08T00:00:00.000Z') },
          { day: 9, year: 1996, key: 'https://picsum.photos/200/300?sig=9', isOpenable: false, isOpen: false, date: new Date('1996-12-09T00:00:00.000Z') },
          { day: 10, year: 1996, key: 'https://picsum.photos/200/300?sig=10', isOpenable: false, isOpen: false, date: new Date('1996-12-10T00:00:00.000Z') },
          { day: 11, year: 1996, key: 'https://picsum.photos/200/300?sig=11', isOpenable: false, isOpen: false, date: new Date('1996-12-11T00:00:00.000Z') },
          { day: 12, year: 1996, key: 'https://picsum.photos/200/300?sig=12', isOpenable: false, isOpen: false, date: new Date('1996-12-12T00:00:00.000Z') },
          { day: 13, year: 1996, key: 'https://picsum.photos/200/300?sig=13', isOpenable: false, isOpen: false, date: new Date('1996-12-13T00:00:00.000Z') },
          { day: 14, year: 1996, key: 'https://picsum.photos/200/300?sig=14', isOpenable: false, isOpen: false, date: new Date('1996-12-14T00:00:00.000Z') },
          { day: 15, year: 1996, key: 'https://picsum.photos/200/300?sig=15', isOpenable: false, isOpen: false, date: new Date('1996-12-15T00:00:00.000Z') },
          { day: 16, year: 1996, key: 'https://picsum.photos/200/300?sig=16', isOpenable: false, isOpen: false, date: new Date('1996-12-16T00:00:00.000Z') },
          { day: 17, year: 1996, key: 'https://picsum.photos/200/300?sig=17', isOpenable: false, isOpen: false, date: new Date('1996-12-17T00:00:00.000Z') },
          { day: 18, year: 1996, key: 'https://picsum.photos/200/300?sig=18', isOpenable: false, isOpen: false, date: new Date('1996-12-18T00:00:00.000Z') },
          { day: 19, year: 1996, key: 'https://picsum.photos/200/300?sig=19', isOpenable: false, isOpen: false, date: new Date('1996-12-19T00:00:00.000Z') },
          { day: 20, year: 1996, key: 'https://picsum.photos/200/300?sig=20', isOpenable: false, isOpen: false, date: new Date('1996-12-20T00:00:00.000Z') },
          { day: 21, year: 1996, key: 'https://picsum.photos/200/300?sig=21', isOpenable: false, isOpen: false, date: new Date('1996-12-21T00:00:00.000Z') },
          { day: 22, year: 1996, key: 'https://picsum.photos/200/300?sig=22', isOpenable: false, isOpen: false, date: new Date('1996-12-22T00:00:00.000Z') },
          { day: 23, year: 1996, key: 'https://picsum.photos/200/300?sig=23', isOpenable: false, isOpen: false, date: new Date('1996-12-23T00:00:00.000Z') },
          { day: 24, year: 1996, key: 'https://picsum.photos/200/300?sig=24', isOpenable: false, isOpen: false, date: new Date('1996-12-24T00:00:00.000Z') }
        ]
      })

    console.log('✅ Pictures created (1996 fake)')
  }

  console.log('')
  console.log('📊 Database Statistics:')
  console.log('  Pictures:', await prisma.picture.count())
  console.log('  Calendars:', await prisma.calendar.count())
  console.log('')
  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
