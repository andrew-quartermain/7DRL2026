import { RNG } from "rot-js";

type MapGenerator = (map: GridMap) => GridMap;

class MapCell {
    idx: number;
    constructor(private map: GridMap) { }

    get terrain(): number {
        return this.map.terrain[this.idx] ?? 0;
    }
    get mob(): number {
        return this.map.mobs[this.idx] ?? 0;
    }
}

export class GridMap {
    size!: number;
    terrain!: number[];
    mobs!: number[];
    proxy!: MapCell;
    entrance!: { x: number, y: number };
    exit!: { x: number, y: number };

    constructor(public width: number, public height: number) {
        this.size = width * height;
        this.terrain = Array(this.size);
        this.mobs = Array(this.size);

        this.proxy = new MapCell(this);
        this.entrance = { x: 0, y: 0 };
        this.exit = { x: width - 1, y: height - 1 };
    }

    addMob(x: number, y: number, eid: number) {
        const idx = this.indexAt(x, y);
        if (idx === -1) {
            console.warn(`Mob ${eid} cannot be placed at ${x}, ${y}. 
                Position is out of bounds.`);
            return
        }
        if (this.mobs[idx]) {
            console.warn(`Mob ${eid} cannot be placed at ${x}, ${y}. 
                ${this.mobs[idx]} is already there!`);
            return
        }
        this.mobs[idx] = eid;
    }

    moveMob(fromX: number, fromY: number, toX: number, toY: number) {
        let src = this.indexAt(fromX, fromY);
        let mob = this.mobs[src];
        let dst = this.indexAt(toX, toY);
        this.mobs[dst] = mob;
        delete this.mobs[src];
    }

    indexAt(x: number, y: number): number {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return -1
        }
        return y * this.width + x;
    }

    putTerrainAt(type: number, x: number, y: number) {
        const idx = this.indexAt(x, y);
        if (idx < 0) {
            return
        }
        this.terrain[idx] = type;
    }

    inBounds(x: number, y: number): boolean {
        return this.indexAt(x, y) !== -1;
    }

    getTileAt(x: number, y: number): MapCell {
        const idx = this.indexAt(x, y);
        if (idx === -1) {

        }
        this.proxy.idx = idx;
        return this.proxy
    }

    generate(generator: MapGenerator): GridMap {
        return generator(this)
    }

    setEntrance(x: number, y: number): this {
        this.entrance.x = x;
        this.entrance.y = y;
        return this
    }

    setExit(x: number, y: number): this {
        this.exit.x = x;
        this.exit.y = y;
        return this
    }
}

export const RandomMap = (rng: typeof RNG, options: { min: number, max: number }): MapGenerator => {
    return (map) => {
        const { min, max } = options;
        const n = rng.getUniformInt(min, max);
        for (let i = 0; i < n; i++) {
            let x = RNG.getUniformInt(0, map.width);
            let y = RNG.getUniformInt(0, map.height);
            while (map.getTileAt(x, y).terrain) {
                x = RNG.getUniformInt(0, map.width);
                y = RNG.getUniformInt(0, map.height);
            }
            map.putTerrainAt(17, x, y);
        }
        map.entrance = { x: 3, y: rng.getUniformInt(5, 10) };
        map.exit = { x: 17, y: rng.getUniformInt(5, 10) };
        return map
    }
}

export const GalaxyMapGenerator = (rng: typeof RNG): MapGenerator => {
    return (map: GridMap) => {
        map.setEntrance(2, RNG.getUniformInt(5, 10));
        map.setExit(17, RNG.getUniformInt(5, 10));
        return map
    }
}
