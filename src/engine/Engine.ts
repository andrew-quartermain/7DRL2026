import { addComponent, addEntity, createWorld, Or, query, World } from "bitecs";
import Action from "rot-js/lib/scheduler/action";
import { GalaxyMapGenerator, GridMap, RandomMap } from "../map/GridMap";
import { Random } from "../rng/Random";
import { AI, CurrentLevel, Player, Position, Renderable, Turn } from "./Components";
import { RNG } from "rot-js";
import { Moves } from "../phaser/scenes/MainGame";
import EventBus from "../phaser/events/EventBus";

const DIRECTIONS = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
];

const COLORS: Phaser.Types.Display.ColorObject[][] = [
    Phaser.Display.Color.HSVColorWheel(0.5, 0.3),
    Phaser.Display.Color.HSVColorWheel(0.3, 0.7),
    Phaser.Display.Color.HSVColorWheel(0.7, 0.75),
];

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

        this.world = createWorld({});

        // add player
        this.playerId = createPlayer(this.world);

        // create opening level
        const level = this.loadLevel(galaxyMap.entrance.x, galaxyMap.entrance.y);

        // spawn player
        spawn(this.world, level, this.playerId, level.entrance.x, level.entrance.y, 0);

        // spawn mobs
        spawnRandom(this.world, level, 100);

        // TODO: spawn items


        this.scheduler = new Action();

        // give each entity a turn
        const entities = query(this.world, [CurrentLevel, Or(Player, AI)]);
        for (const eid of entities) {
            addComponent(this.world, eid, Turn);
            Turn.player[eid] = eid === this.playerId;
            Turn.count[eid] = 0;
            this.scheduler.add(eid, true, RNG.getUniformInt(1, 100));
        }

        this.runTurns();

    }

    runTurns() {
        let eid = this.scheduler.next();
        while (!Turn.player[eid]) {

            let duration = this.takeTurn(eid);
            this.scheduler.setDuration(duration);
            eid = this.scheduler.next();
        }
    }

    takeTurn(eid: number): number {
        let move: Moves | null = RNG.getItem(['bump','turn-left', 'turn-right', 'wait']);
        if (!move) {
            move = 'wait';
        }
        return this.makeMove(eid, move)
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

    playerMove(move: Moves) {
        let duration = this.makeMove(this.playerId, move);

        this.triggerNextTurn(duration);
    }

    makeMove(eid: number, move: Moves): number {
        let duration = 100;
        const x = Position.x[eid];
        const y = Position.y[eid];
        const dir = Position.facing[eid];
        switch (move) {
            case "bump":
                const [dx, dy] = DIRECTIONS[dir];
                const toX = x + dx;
                const toY = y + dy;
                const map = this.getCurrentMap();
                if (!map.inBounds(toX, toY)) {
                    console.log('Out of bounds!');
                    return 0
                }
                if (map.getTileAt(toX, toY).mob) {
                    console.log('blocked!');
                    return 0
                }
                Position.x[eid] += dx;
                Position.y[eid] += dy;
                map.moveMob(x,y,toX,toY);
                duration = 100;
                break;
            case "wait":
                duration = 100;
                break;
            case "turn-left":
                duration = 25;
                Position.facing[eid] = (8 + dir - 1) % 8;
                break;
            case "turn-right":
                duration = 25;
                Position.facing[eid] = (8 + dir + 1) % 8;
                break;
            default:

        }
        return duration
    }

    triggerNextTurn(duration: number) {
        this.scheduler.setDuration(duration);
        this.runTurns();
        EventBus.emit('next-turn', 'hello');
    }

    private createLevel(x: number, y: number): GridMap {
        const key = `${x},${y}`;
        const rng = this.random.getRNG(key);
        const map = new GridMap(40, 20);

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

function spawnRandom(world: World, level: GridMap, n: number) {
    for (let i = 0; i < n; i++) {
        let x = RNG.getUniformInt(1, level.width - 2);
        let y = RNG.getUniformInt(1, level.height - 2);
        while (level.getTileAt(x, y).mob) {
            x = RNG.getUniformInt(1, level.width - 2);
            y = RNG.getUniformInt(1, level.height - 2);
        }

        const eid = createMob(world);

        spawn(
            world,
            level,
            eid,
            x,
            y,
            RNG.getUniformInt(0, 7),
        );
    }
}

function spawn(world: World, level: GridMap, eid: number, x: number, y: number, facing?: number) {
    addComponent(world, eid, Position);
    Position.x[eid] = x;
    Position.y[eid] = y;
    Position.facing[eid] = facing ?? 0;
    addComponent(world, eid, CurrentLevel);

    level.addMob(
        x,
        y,
        eid,
    );
}

function createPlayer(world: World): number {
    const playerId = addEntity(world);
    addComponent(world, playerId, Player);
    addComponent(world, playerId, Renderable);
    Renderable.sprite[playerId] = 32;
    Renderable.dark[playerId] = 0x808080;
    Renderable.light[playerId] = 0xc0c0c0;
    Renderable.detail[playerId] = 0x2080c0;
    Renderable.show[playerId] = 3;
    return playerId
}

function createMob(world: World): number {
    const eid = addEntity(world);
    addComponent(world, eid, Renderable);
    Renderable.sprite[eid] = RNG.getUniformInt(32, 35);
    const tint = RNG.getUniformInt(0, 360);
    Renderable.dark[eid] = COLORS[0][tint].color;
    Renderable.light[eid] = COLORS[1][(tint + 20) % 359].color;
    Renderable.detail[eid] = COLORS[0][(tint * tint + 20) % 360].color;
    Renderable.show[eid] = RNG.getUniformInt(1, 3);
    addComponent(world, eid, AI);
    return eid
}


function generateGalaxyMap(rand: Random): GridMap {
    const rng = rand.getRNG('galaxy');
    const map = new GridMap(20, 15).generate(GalaxyMapGenerator(rng));
    return map
}