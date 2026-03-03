import { addComponent, addEntity, createWorld, World } from "bitecs";
import Action from "rot-js/lib/scheduler/action";
import { GalaxyMapGenerator, GridMap, RandomMap } from "../map/GridMap";
import { Random } from "../rng/Random";
import { CurrentLevel, Player, Position, Renderable } from "./Components";
import { RNG } from "rot-js";



type EngineOptions = {
    seed?: string | number;
}

export class Engine {
    private scheduler!: Action;
    world!: World;
    private random!: Random;
    private levelMaps!: Map<string, GridMap>;
    private playerId!: number;
    private levelString!: string;
    private previousLevel?: string;

    constructor(options?: EngineOptions) {
        this.random = new Random(options?.seed);
        this.levelMaps = new Map<string, GridMap>();

        const galaxyMap = generateGalaxyMap(this.random);
        this.levelMaps.set('galaxy', galaxyMap);

        this.world = createWorld({
            
        });

        // add a null entity (id = 0)
        addEntity(this.world);

        // add player
        this.playerId = addEntity(this.world);
        addComponent(this.world, this.playerId, Player);
        addComponent(this.world, this.playerId, Renderable);
        Renderable.sprite[this.playerId] = 32;
        Renderable.dark[this.playerId] = 0x808080;
        Renderable.light[this.playerId] = 0xc0c0c0;
        Renderable.detail[this.playerId] = 0x2080c0;
        Renderable.show[this.playerId] = 3;

        // create opening level
        const {x,y} = galaxyMap.entrance;
        const level = this.loadLevel(x, y);

        // spawn player
        addComponent(this.world, this.playerId, Position);
        Position.x[this.playerId] = level.entrance.x;
        Position.y[this.playerId] = level.entrance.y;
        Position.dir[this.playerId] = 0;
        addComponent(this.world, this.playerId, CurrentLevel);

        for (let i = 0; i < 100; i++) {
            const eid = addEntity(this.world);
            addComponent(this.world, eid, Renderable);
            Renderable.sprite[eid] = RNG.getUniformInt(32,35);
            Renderable.dark[eid] = 0x808080;
            Renderable.light[eid] = 0xc0c0c0;
            Renderable.detail[eid] = 0x2080c0;
            Renderable.show[eid] = RNG.getUniformInt(1,3);

            addComponent(this.world, eid, Position);
            Position.x[eid] = RNG.getUniformInt(1,38);
            Position.y[eid] = RNG.getUniformInt(1,18);
            Position.dir[eid] = RNG.getUniformInt(0,7);
            addComponent(this.world, eid, CurrentLevel);
        }

        this.scheduler = new Action();

    }

    private loadLevel(x: number, y: number): GridMap {
        const key = `${x},${y}`;
        this.levelString = key;
        let map = this.levelMaps.get(key);
        if (!map) {
            map = this.createLevel(x, y);
        }
        return map
    }

    private createLevel(x: number, y: number): GridMap {
        const key = `${x},${y}`;
        const rng = this.random.getRNG(key);
        const map = new GridMap(40,20);

        // TODO create level & spawn entities

        this.levelMaps.set(key, map);
        return map
    }

    getCurrentMap(): GridMap {
        const map = this.levelMaps.get(this.levelString);
        if (!map) {
            throw new Error(`Map at ${this.levelString} doesn't exist!`);
        }
        return map
    }

    start() {
        
    }

    async update() {

    }
}



function generateGalaxyMap(rand: Random): GridMap {
    const rng = rand.getRNG('galaxy');
    const map = new GridMap(20, 15).generate(GalaxyMapGenerator(rng));
    return map
}