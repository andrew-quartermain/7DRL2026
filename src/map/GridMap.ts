import { RNG } from "rot-js";

type MapGenerator = (map: GridMap) => GridMap;

class MapCell {
    idx: number;
    constructor(private map: GridMap) { }

    get terrain(): number {
        return this.map.terrain[this.idx] ?? 0;
    }
}

export class GridMap {
    size!: number;
    terrain!: number[];
    proxy!: MapCell;
    entrance!: {x: number, y: number};
    exit!: {x: number, y: number};

    constructor(public width: number, public height: number) {
        this.size = width * height;
        this.terrain = Array(this.size);
        this.proxy = new MapCell(this);
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
}

export const RandomMap = (options: { rng: typeof RNG, min: number, max: number }): MapGenerator => {
    return (map) => {
        const { rng, min, max } = options;
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
        map.entrance = {x: 3, y: rng.getUniformInt(5,10)};
        map.exit = {x: 17, y: rng.getUniformInt(5, 10)};
        return map
    }
}

export const GalaxyMapGenerator = (options: {}): MapGenerator => {
    return (map: GridMap) => {
        return map
    }
}
