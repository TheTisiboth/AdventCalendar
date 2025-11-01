import dayjs from "dayjs"
import { cloneDeep } from "lodash"
import { ADVENT_START, ADVENT_END } from "@/constants"

export const shuffle = <T,>(array: T[], seed: number) => {
    const copy = cloneDeep(array)
    let m = copy.length,
        t,
        i

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(random(seed) * m--)
        // And swap it with the current element.
        t = copy[m]
        copy[m] = copy[i]
        copy[i] = t
        ++seed
    }
    return copy
}

function random(seed: number) {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
}

export const computeStartingAndEndingDate = () => {
    const now = new Date()
    const currentYear = now.getFullYear()

    // Build dates dynamically using current year and configured month/day
    // Note: month is 0-indexed in Date constructor (0 = January, 11 = December)
    const startingDate = new Date(currentYear, ADVENT_START.month - 1, ADVENT_START.day, 0, 0, 0)
    const endingDate = new Date(currentYear, ADVENT_END.month - 1, ADVENT_END.day, 23, 59, 59)

    // If the advent calendar is over
    if (dayjs(now).isAfter(endingDate)) {
        // The starting date is set to the next year
        startingDate.setFullYear(currentYear + 1)
        endingDate.setFullYear(currentYear + 1)
    }
    return { startingDate, endingDate }
}

/**
 * Checks if the current date is within the Advent period (December 1-24) in local timezone
 * @returns true if we're in the Advent period, false otherwise
 */
export const isInAdventPeriod = (): boolean => {
    const now = dayjs()
    const { startingDate, endingDate } = computeStartingAndEndingDate()
    const start = dayjs(startingDate)
    const end = dayjs(endingDate)

    return (now.isAfter(start) || now.isSame(start)) && (now.isBefore(end) || now.isSame(end))
}

/**
 * Gets the appropriate calendar year to display
 * If we're in the Advent period (Dec 1-24), returns the current year
 * Otherwise, returns the most recent completed Advent calendar year
 * @returns The year of the calendar to display
 */
export const getCurrentCalendarYear = (): number => {
    const now = dayjs()
    const currentYear = now.year()
    const { startingDate } = computeStartingAndEndingDate()

    // If we're in the Advent period, show current year's calendar
    if (isInAdventPeriod()) {
        return currentYear
    }

    // If we're before December 1st, show last year's calendar
    if (now.isBefore(dayjs(startingDate))) {
        return currentYear - 1
    }

    // If we're after December 24th, show this year's calendar (as archive)
    return currentYear
}
