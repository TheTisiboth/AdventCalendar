import { Box } from "@mui/material"
import { adminGetAllCalendars, getKindeUsers } from "@actions/admin"
import { ManageCalendarsTable } from "@/components/Admin/ManageCalendarsTable"

// Force dynamic rendering to prevent prerendering at build time
// This page requires authentication which is not available during build
export const dynamic = 'force-dynamic'

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
