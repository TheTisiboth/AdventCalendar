import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check current state
  const pictureCount = await prisma.picture.count()
  const calendarCount = await prisma.calendar.count()

  // If fully seeded, skip
  if (pictureCount > 0 && calendarCount > 0) {
    console.log('✅ Database already seeded')
    console.log('   Found:', pictureCount, 'pictures,', calendarCount, 'calendars')
    console.log('   Skipping seed to preserve data')
    return
  }

  // Seed calendars FIRST (needed for foreign key constraint)
  let calendar2023Id: number
  let calendar1996Id: number

  if (calendarCount === 0) {
    console.log('📦 Creating calendars...')
    const cal2023 = await prisma.calendar.create({
      data: {
        year: 2023,
        title: 'Advent Calendar 2023',
        description: 'A beautiful collection of moments from 2023',
        isPublished: true,
        isFake: false
      }
    })
    const cal1996 = await prisma.calendar.create({
      data: {
        year: 1996,
        title: 'Test Calendar 1996',
        description: 'A test calendar with fake pictures for demo purposes',
        isPublished: true,
        isFake: true
      }
    })
    calendar2023Id = cal2023.id
    calendar1996Id = cal1996.id
    console.log('✅ Calendars created')
  } else {
    console.log('✅ Calendars already exist')
    // Fetch existing calendar IDs
    const cal2023 = await prisma.calendar.findFirst({ where: { year: 2023 } })
    const cal1996 = await prisma.calendar.findFirst({ where: { year: 1996 } })
    if (!cal2023 || !cal1996) {
      throw new Error('Calendar lookup failed')
    }
    calendar2023Id = cal2023.id
    calendar1996Id = cal1996.id
  }

  // Seed pictures (AFTER ensuring calendars exist)
  if (pictureCount === 0) {
    console.log('📦 Creating pictures...')

    // Create 2023 pictures (real) - using local timezone
      await prisma.picture.createMany({
          data: [
              { day: 1, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/1.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 1) },
              { day: 2, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/2.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 2) },
              { day: 3, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/3.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 3) },
              { day: 4, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/4.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 4) },
              { day: 5, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/5.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 5) },
              { day: 6, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/6.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 6) },
              { day: 7, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/7.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 7) },
              { day: 8, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/8.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 8) },
              { day: 9, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/9.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 9) },
              { day: 10, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/10.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 10) },
              { day: 11, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/11.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 11) },
              { day: 12, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/12.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 12) },
              { day: 13, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/13.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 13) },
              { day: 14, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/14.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 14) },
              { day: 15, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/15.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 15) },
              { day: 16, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/16.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 16) },
              { day: 17, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/17.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 17) },
              { day: 18, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/18.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 18) },
              { day: 19, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/19.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 19) },
              { day: 20, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/20.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 20) },
              { day: 21, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/21.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 21) },
              { day: 22, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/22.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 22) },
              { day: 23, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/23.jpg`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 23) },
              { day: 24, year: 2023, calendarId: calendar2023Id, key: `2023/${calendar2023Id}/24.png`, isOpenable: false, isOpen: true, date: new Date(2023, 11, 24) }
          ]
      })


    console.log('✅ Pictures created (2023 real)')

    // Create 1996 fake pictures - using local timezone
    await prisma.picture.createMany({
        data: [
          { day: 1, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=1', isOpenable: false, isOpen: true, date: new Date(1996, 11, 1) },
          { day: 2, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=2', isOpenable: false, isOpen: false, date: new Date(1996, 11, 2) },
          { day: 3, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=3', isOpenable: false, isOpen: false, date: new Date(1996, 11, 3) },
          { day: 4, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=4', isOpenable: false, isOpen: false, date: new Date(1996, 11, 4) },
          { day: 5, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=5', isOpenable: false, isOpen: false, date: new Date(1996, 11, 5) },
          { day: 6, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=6', isOpenable: false, isOpen: false, date: new Date(1996, 11, 6) },
          { day: 7, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=7', isOpenable: false, isOpen: false, date: new Date(1996, 11, 7) },
          { day: 8, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=8', isOpenable: false, isOpen: false, date: new Date(1996, 11, 8) },
          { day: 9, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=9', isOpenable: false, isOpen: false, date: new Date(1996, 11, 9) },
          { day: 10, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=10', isOpenable: false, isOpen: false, date: new Date(1996, 11, 10) },
          { day: 11, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=11', isOpenable: false, isOpen: false, date: new Date(1996, 11, 11) },
          { day: 12, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=12', isOpenable: false, isOpen: false, date: new Date(1996, 11, 12) },
          { day: 13, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=13', isOpenable: false, isOpen: false, date: new Date(1996, 11, 13) },
          { day: 14, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=14', isOpenable: false, isOpen: false, date: new Date(1996, 11, 14) },
          { day: 15, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=15', isOpenable: false, isOpen: false, date: new Date(1996, 11, 15) },
          { day: 16, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=16', isOpenable: false, isOpen: false, date: new Date(1996, 11, 16) },
          { day: 17, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=17', isOpenable: false, isOpen: false, date: new Date(1996, 11, 17) },
          { day: 18, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=18', isOpenable: false, isOpen: false, date: new Date(1996, 11, 18) },
          { day: 19, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=19', isOpenable: false, isOpen: false, date: new Date(1996, 11, 19) },
          { day: 20, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=20', isOpenable: false, isOpen: false, date: new Date(1996, 11, 20) },
          { day: 21, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=21', isOpenable: false, isOpen: false, date: new Date(1996, 11, 21) },
          { day: 22, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=22', isOpenable: false, isOpen: false, date: new Date(1996, 11, 22) },
          { day: 23, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=23', isOpenable: false, isOpen: false, date: new Date(1996, 11, 23) },
          { day: 24, year: 1996, calendarId: calendar1996Id, key: 'https://picsum.photos/200/300?sig=24', isOpenable: false, isOpen: false, date: new Date(1996, 11, 24) }
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
