import murmurhash from "murmurhash";
import { RNG } from "rot-js";

const MAX_INT = Math.pow(2, 32) - 1;

export class Random {
    private worldSeed!: string;
    private rng!: typeof RNG;
    private dice!: typeof RNG;

    constructor(_seed?: number | string) {
        const seed = generateSeed(_seed);
        this.worldSeed = seed.toString();
        this.rng = RNG.clone().setSeed(seed);
        this.dice = this.rng.clone();
    }

    getRNG(_seed: string): typeof RNG {
        const seed = murmurhash(this.worldSeed + _seed);
        this.rng.setSeed(seed);
        return this.rng;
    }


}

function generateSeed(seed?: number | string): number {
    if (!seed) {
        return RNG.getUniformInt(0, MAX_INT);
    } 
    if (typeof seed === 'string') {
        return murmurhash(seed);
    } 
    return seed;
}