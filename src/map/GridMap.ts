import { RNG } from "rot-js";

type MapGenerator = (map: GridMap) => GridMap;

class MapCell {
    idx: number;
    constructor(private map: GridMap) {}

    get terrain(): number {
        return this.map.terrain[this.idx];
    }
}

export class GridMap {
    size!: number;
    terrain!: number[];
    proxy!: MapCell;

    constructor(public width: number, public height: number) {
        this.size = width * height;
        this.terrain = Array(this.size).fill(0);
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

export const RandomMap: MapGenerator = (map) => {
    const n = Math.floor(map.size / 16);
    for (let i = 0; i < n; i++) {
        let x = RNG.getUniformInt(0,map.width);
        let y = RNG.getUniformInt(0,map.height);
        while (map.getTileAt(x,y).terrain) {
            x = RNG.getUniformInt(0,map.width);
            y = RNG.getUniformInt(0,map.height);
        }
        map.putTerrainAt(19, x, y);
    }
    return map
}
