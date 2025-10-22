/**
 * Safeguards - Reusable validation and access control for pages
 *
 * Use these at the top of your server component pages to enforce
 * business rules, authentication, and validation logic.
 */

// Auth safeguards
export {
    requireAuth,
    requireAdmin,
    getCurrentUser,
    checkIsAdmin
} from "./auth"

// Calendar safeguards
export {
    requireAdventPeriod,
    checkAdventPeriod
} from "./calendar"

// Parameter validation safeguards
export {
    validateYearParam,
    requireValidYear,
    requireValidId
} from "./params"
