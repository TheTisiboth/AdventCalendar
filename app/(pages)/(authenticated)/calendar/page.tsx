import Calendar from "@/components/Calendar/Calendar"
import { getCurrentCalendarYear } from "@/utils/utils"
import { getPictures } from "@actions/pictures"
import { requireAdventPeriod } from "@safeguards"

export default async function CalendarPage() {
  await requireAdventPeriod()

  // Get current calendar year
  const year = getCurrentCalendarYear()

  // Fetch pictures on the server
  const pictures = await getPictures(year)

  return <Calendar pictures={pictures} year={year} />
}
