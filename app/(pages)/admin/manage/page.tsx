import { Box } from "@mui/material"
import { adminGetAllCalendars, getKindeUsers } from "@actions/admin"
import { ManageCalendarsTable } from "@/components/Admin/ManageCalendarsTable"

export default async function ManageCalendars() {
    const [calendars, users] = await Promise.all([
        adminGetAllCalendars(),
        getKindeUsers()
    ])

    return (
        <Box>
            <ManageCalendarsTable calendars={calendars} users={users} />
        </Box>
    )
}
