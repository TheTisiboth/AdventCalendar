import { CalendarTest } from "@/components/Calendar/CalendarTest"
import { getFakePictures } from "@actions/pictures"

export default async function TestPage() {
  const pictures = await getFakePictures(2025)

  return <CalendarTest pictures={pictures} />
}
