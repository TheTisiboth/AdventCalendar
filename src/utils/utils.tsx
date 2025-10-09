import dayjs from "dayjs"
import { cloneDeep } from "lodash"
import { STARTING_DATE, ENDING_DATE } from "@/constants"

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
    const currentYear = now.getUTCFullYear()
    const startingDate = new Date(STARTING_DATE)
    startingDate.setUTCFullYear(currentYear) // Actualise with the current year
    const endingDate = new Date(ENDING_DATE)
    endingDate.setUTCFullYear(currentYear) // Actualise with the current year

    // If the advent calendar is over
    if (dayjs(now).isAfter(endingDate)) {
        // The starting date is the set to the next year
        startingDate.setUTCFullYear(currentYear + 1)
        endingDate.setUTCFullYear(currentYear + 1)
    }
    return { startingDate, endingDate }
}
