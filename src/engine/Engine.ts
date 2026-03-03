import { createWorld, World } from "bitecs";
import murmurhash from "murmurhash";
import { RNG } from "rot-js";
import Action from "rot-js/lib/scheduler/action";
import { GridMap, RandomMap } from "../map/GridMap";
import { Position } from "./Components";

const MAX_INT = Math.pow(2, 32) - 1;

type EngineOptions = {
    seed?: string | number;
}

export class Engine {
    private scheduler!: Action;
    private world!: World;
    private rng!: typeof RNG;
    worldSeed!: number;
    galaxyMap!: GridMap;

    constructor(options?: EngineOptions) {
        this.worldSeed = generateSeed(options?.seed);
        this.rng = RNG.setSeed(this.worldSeed).clone();
        this.galaxyMap = generateGalaxyMap(this.worldSeed);

        

        this.world = createWorld({
            
        });


        this.scheduler = new Action();

    }

    start() {

    }

    async update() {

        
    }
}

function generateSeed(seed?: number | string) {
    if (!seed) {
        return RNG.getUniformInt(0, MAX_INT);
    } 
    if (typeof seed === 'string') {
        return murmurhash(seed);
    } 
    return seed;
        
}

function generateGalaxyMap(seed: number): GridMap {
    const rng = RNG.setSeed(seed).clone();
    const min = 16;
    const max = 32;
    const map = new GridMap(20, 15).generate(RandomMap({rng, min, max}));
    return map
}