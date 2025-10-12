export const API_BASE_PATH = "/api/"

export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL!
export const ONE_SECOND_MS = 1000
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60
export const ONE_HOUR_MS = ONE_MINUTE_MS * 60
export const ONE_DAY_MS = ONE_HOUR_MS * 24

// Using ISO 8601 format with timezone offset for UTC+1 (Germany/Central European Time)
export const STARTING_DATE = "2024-12-01T00:00:00+01:00"
export const ENDING_DATE = "2024-12-24T23:59:59+01:00"
