import { Scene } from 'phaser';
import { SceneKeys } from './Scenes';
import { GridMap, RandomMap } from '../../map/GridMap';
import { TextureKeys } from '../Keys';
import { RNG } from 'rot-js';
import { addComponent, addEntity, createWorld } from 'bitecs';

class TileProxy {
    x!: number;
    y!: number;

    constructor(
        private _bg: Phaser.Tilemaps.TilemapLayer,
        private _dark: Phaser.Tilemaps.TilemapLayer,
        private _light: Phaser.Tilemaps.TilemapLayer,
        private _details: Phaser.Tilemaps.TilemapLayer,
    ) {
        this.x = -1;
        this.y = -1;
    }
    set bg(tint: number) {
        this._bg.getTileAt(this.x, this.y).tint = tint;
    }
    set dark(tint: number) {
        this._dark.getTileAt(this.x, this.y).tint = tint;
    }
    set light(tint: number) {
        this._light.getTileAt(this.x, this.y).tint = tint;
    }
    set details(tint: number) {
        this._details.getTileAt(this.x, this.y).tint = tint;
    }
}

export class MainGame extends Scene {
    constructor() {
        super(SceneKeys.MainGame);
    }

    create() {
        this.cameras.main.zoom = 4;
        const WIDTH = 80;
        const HEIGHT = 45;
        const TILE_SIZE = 24;

        const map = new GridMap(WIDTH, HEIGHT);
        map.generate(RandomMap);

        const grid = this.make.tilemap({
            width: WIDTH,
            height: HEIGHT,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        });

        const keys = [
            TextureKeys.Dark,
            TextureKeys.Light,
            TextureKeys.Details,
        ];
        const COLORS: Phaser.Types.Display.ColorObject[][] = [
            Phaser.Display.Color.HSVColorWheel(0.4, 0.6),
            Phaser.Display.Color.HSVColorWheel(0.3, 0.7),
            Phaser.Display.Color.HSVColorWheel(0.7, 0.75),
        ];

        const layers: { [key: string]: Phaser.Tilemaps.TilemapLayer } = {};

        for (const key of keys) {
            grid.addTilesetImage(key, key, TILE_SIZE, TILE_SIZE, 1, 1);
        }

        const bg = grid.createBlankLayer('bg', TextureKeys.Light);
        for (const key of keys) {
            layers[key] = grid.createBlankLayer(key, key) as Phaser.Tilemaps.TilemapLayer;
        }

        if (!bg) {
            throw new Error('Tilemap layer cannot be null!!!');
        }

        bg.fill(1);
        bg.setTint(0x000000);

        

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {

                const terrain = map.getTileAt(x, y).terrain;
                if (!terrain) continue
                let i = 0;
                const sprite = RNG.getUniformInt(32,35);
                const rotation = RNG.getUniformInt(0,3) * Math.PI / 2;
                const tint = RNG.getUniformInt(0,360);

                for (const key of keys) {
                    const tile = layers[key].putTileAt(sprite, x, y);
                    tile.rotation = rotation;
                    tile.tint = COLORS[i][(tint + (i * i * 20)) % 360].color;
                    i++;
                }

            }
        }

        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            for (let y = 0; y < HEIGHT; y++) {
                for (let x = 0; x < WIDTH; x++) {
                    const tile = bg.getTileAt(x, y);
                    tile.tint = 0x000000;
                }
            }
            const x = Math.floor(pointer.worldX / TILE_SIZE);
            const y = Math.floor(pointer.worldY / TILE_SIZE);

            const tile = bg.getTileAt(x, y);
            tile.tint = 0x8800cc;
        });

        const zoomIn = this.input.keyboard?.addKey('o');
        const zoomOut = this.input.keyboard?.addKey('p');

        zoomIn?.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.cameras.main.zoom += 1;
        });
        zoomOut?.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.cameras.main.zoom -= 1;
        });
    }
}


function createTilemap(scene: Scene) {

}

