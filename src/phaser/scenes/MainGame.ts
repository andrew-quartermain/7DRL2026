import { Scene } from 'phaser';
import { SceneKeys } from './Scenes';
import { GridMap, RandomMap } from '../../map/GridMap';
import { TextureKeys } from '../Keys';

export class MainGame extends Scene {
    constructor() {
        super(SceneKeys.MainGame);
    }

    create() {
        const WIDTH = 80;
        const HEIGHT = 45;
        const TILE_SIZE = 24;

        const map = new GridMap(WIDTH, HEIGHT);
        map.generate(RandomMap);

        //const cursor = this.add.image(0, 0, 'sprites', 16).setOrigin(0);

        const grid = this.make.tilemap({
            width: WIDTH,
            height: HEIGHT,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        });
        grid.addTilesetImage('tiles', TextureKeys.Extruded, TILE_SIZE, TILE_SIZE, 1, 1);
        const bg = grid.createBlankLayer('bg', 'tiles');
        if (!bg) return

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const terrain = map.getTileAt(x,y).terrain;
                const tile = bg.putTileAt(terrain, x, y);
                tile.tint = terrain ? 0x4400aa : 0x000000;
            }
        }

        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            for (let y = 0; y < HEIGHT; y++) {
                for (let x = 0; x < WIDTH; x++) {
                    const tile = bg.getTileAt(x, y);
                    tile.tint = map.getTileAt(x, y).terrain ? 0x4400aa : 0x000000;
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
