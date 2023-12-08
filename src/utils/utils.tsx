import { cloneDeep } from "lodash"

export const shuffle = (array: any[], seed: number) => {
    var copy = cloneDeep(array)
    var m = copy.length, t, i;

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(random(seed) * m--);
        // And swap it with the current element.
        t = copy[m];
        copy[m] = copy[i];
        copy[i] = t;
        ++seed
    }
    return copy;
}

function random(seed: number) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}