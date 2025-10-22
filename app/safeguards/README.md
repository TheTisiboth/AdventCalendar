# Safeguards

Reusable validation and access control for server component pages.

## Purpose

Safeguards provide a clean, declarative way to enforce business rules, authentication, and validation at the top of your server components. They centralize common checks that would otherwise be duplicated across pages.

## Usage

Import safeguards at the top of your server component pages:

```typescript
import { requireAuth, requireAdmin, requireAdventPeriod, validateYearParam } from "@safeguards"

export default async function MyPage({ params }) {
  // Apply safeguards at the start of your component
  await requireAuth()
  const year = validateYearParam(params.year, "/archive")

  // ... rest of your page logic
}
```

## Available Safeguards

### Authentication (`auth.ts`)

#### `requireAuth()`
Requires user to be authenticated. Redirects to login if not.

```typescript
const user = await requireAuth()
```

#### `requireAdmin()`
Requires user to be an admin. Redirects to home if not authenticated or not admin.

```typescript
const admin = await requireAdmin()
```

#### `getCurrentUser()`
Gets the current user without requiring authentication. Returns `null` if not logged in.

```typescript
const user = await getCurrentUser()
if (user) {
  // User is logged in
}
```

#### `checkIsAdmin()`
Checks if the current user is an admin. Returns `boolean`.

```typescript
const isAdmin = await checkIsAdmin()
```

### Calendar Validation (`calendar.ts`)

#### `requireAdventPeriod()`
Ensures we're in the advent period (December 1-24). Redirects to home if not.

```typescript
await requireAdventPeriod()
```

#### `checkAdventPeriod()`
Checks if we're in the advent period without redirecting. Returns `boolean`.

```typescript
const inPeriod = checkAdventPeriod()
```

### Parameter Validation (`params.ts`)

#### `validateYearParam(yearParam, fallbackRoute)`
Validates and parses a year parameter. Redirects to fallback route if invalid.

```typescript
const year = validateYearParam(params.year, "/archive")
```

#### `requireValidYear(yearParam)`
Validates year parameter (2000-2100 range). Returns 404 if invalid.

```typescript
const year = requireValidYear(params.year)
```

#### `requireValidId(idParam)`
Validates numeric ID parameter. Returns 404 if invalid or < 1.

```typescript
const id = requireValidId(params.id)
```

## Benefits

1. **DRY Principle** - Write validation logic once, use everywhere
2. **Consistency** - Same behavior across all pages
3. **Readability** - Clear intent at the top of each page
4. **Maintainability** - Update logic in one place
5. **Type Safety** - Proper TypeScript types for all safeguards
6. **Server-Side** - All checks happen on the server for security

## Example: Protected Admin Page

```typescript
import { Box } from "@mui/material"
import { requireAdmin } from "@safeguards"
import { getAdminData } from "@actions/admin"

export default async function AdminDashboard() {
  // Safeguard: Require admin access
  await requireAdmin()

  // Fetch data (only executes if user is admin)
  const data = await getAdminData()

  return <Box>{/* ... */}</Box>
}
```

## Example: Year-Based Archive Page

```typescript
import { validateYearParam } from "@safeguards"
import { getCalendar } from "@actions/calendars"

export default async function ArchivePage({ params }) {
  // Safeguard: Validate year parameter
  const year = validateYearParam(params.year, "/archive")

  // Fetch calendar (only executes with valid year)
  const calendar = await getCalendar(year)

  return <div>{/* ... */}</div>
}
```

## Adding New Safeguards

1. Create a new file in `/app/safeguards/` (e.g., `permissions.ts`)
2. Export your safeguard functions
3. Add exports to `/app/safeguards/index.ts`
4. Document in this README

Example:

```typescript
// app/safeguards/permissions.ts
import { redirect } from "next/navigation"
import { requireAuth } from "./auth"

export async function requirePremiumUser() {
  const user = await requireAuth()

  if (!user.isPremium) {
    redirect("/upgrade")
  }

  return user
}
```
