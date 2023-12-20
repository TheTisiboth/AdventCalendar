import { cloneDeep } from "lodash"

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
