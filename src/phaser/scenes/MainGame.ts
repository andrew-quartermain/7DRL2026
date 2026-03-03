import { Scene, Tilemaps } from 'phaser';
import { SceneKeys } from './Scenes';
import { GridMap, RandomMap } from '../../map/GridMap';
import { TextureKeys } from '../Keys';
import { RNG } from 'rot-js';
import { addComponent, addEntity, createWorld, observe, onAdd, query } from 'bitecs';
import { Engine } from '../../engine/Engine';
import { CurrentLevel, Player, Position, Renderable } from '../../engine/Components';

const TILE_SIZE = 24;
const TILEMAP_KEYS = [
    TextureKeys.Dark,
    TextureKeys.Light,
    TextureKeys.Details,
];

const COLORS: Phaser.Types.Display.ColorObject[][] = [
    Phaser.Display.Color.HSVColorWheel(0.5, 0.3),
    Phaser.Display.Color.HSVColorWheel(0.3, 0.7),
    Phaser.Display.Color.HSVColorWheel(0.7, 0.75),
];

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

    set glyph(idx: number) {
        this._dark.getTileAt(this.x, this.y,).index = idx;
        this._light.getTileAt(this.x, this.y,).index = idx;
        this._details.getTileAt(this.x, this.y,).index = idx;
    }

    set show(range: number) {
        this._dark.getTileAt(this.x, this.y,).alpha = range > 0 ? 1 : 0;
        this._light.getTileAt(this.x, this.y,).alpha = range > 1 ? 1 : 0;
        this._details.getTileAt(this.x, this.y,).alpha = range > 2 ? 1 : 0;
    }

    set rotation(angle: number) {
        this._dark.getTileAt(this.x, this.y,).rotation = angle;
        this._light.getTileAt(this.x, this.y,).rotation = angle;
        this._details.getTileAt(this.x, this.y,).rotation = angle;
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
    private tileMap?: Phaser.Tilemaps.Tilemap;
    private tileProxy!: TileProxy;
    engine!: Engine;

    constructor() {
        super(SceneKeys.MainGame);
    }

    create() {
        this.engine = new Engine();


        const map = this.engine.getCurrentMap();

        this.loadNewMap(map);

        this.engine.start();

        this.updateEntities();


        const zoomIn = this.input.keyboard?.addKey('o');
        const zoomOut = this.input.keyboard?.addKey('p');

        zoomIn?.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.cameras.main.zoom += 1;
        });
        zoomOut?.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            this.cameras.main.zoom -= 1;
        });

        const keys = this.input.keyboard?.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        }, true, true);

        

        this.cameras.main.zoom = 2;

    }

    updateEntities() {
        const entities = query(this.engine.world, [Position, Renderable, CurrentLevel])
        for (const eid of entities) {
            const x = Position.x[eid];
            const y = Position.y[eid];
            this.tileProxy.x = x;
            this.tileProxy.y = y;


            this.tileProxy.rotation = Position.dir[eid] * Math.PI / 4;
            this.tileProxy.glyph = Renderable.sprite[eid];
            this.tileProxy.dark = Renderable.dark[eid];
            this.tileProxy.light = Renderable.light[eid];
            this.tileProxy.details = Renderable.detail[eid];
            this.tileProxy.show = Renderable.show[eid];
        }
    }

    loadNewMap(map: GridMap) {
        if (this.tileMap) {
            this.tileMap.destroy();
        }

        this.tileMap = this.make.tilemap({
            width: map.width,
            height: map.height,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        });

        const bg = this.tileMap.createBlankLayer('bg', TextureKeys.Light);
        const layers: { [key: string]: Phaser.Tilemaps.TilemapLayer } = {};
        for (const key of TILEMAP_KEYS) {
            this.tileMap.addTilesetImage(key, key, TILE_SIZE, TILE_SIZE, 1, 1);
            layers[key] = this.tileMap.createBlankLayer(key, key) as Phaser.Tilemaps.TilemapLayer;
            layers[key].fill(0);
        }
        const uiLayer = this.tileMap.createBlankLayer('info', TextureKeys.Light);

        if (!bg || !uiLayer) {
            throw new Error('Tilemap layers may not be null');
        }
        bg.fill(1);
        bg.setTint(0x000000);
        uiLayer.fill(16).setTint(0x201080).setAlpha(0.7);

        this.tileProxy = new TileProxy(bg, layers.dark, layers.light, layers.details);



        // probably delete this bit:
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            for (let y = 0; y < map.height; y++) {
                for (let x = 0; x < map.width; x++) {
                    const tile = uiLayer.getTileAt(x, y);
                    tile.tint = 0x201080;
                }
            }
            const x = Math.floor(pointer.worldX / TILE_SIZE);
            const y = Math.floor(pointer.worldY / TILE_SIZE);

            const tile = uiLayer.getTileAt(x, y);
            if (!tile) return
            tile.tint = 0x8800cc;
        });

        this.cameras.main.centerOn(bg.getCenter().x, bg.getCenter().y);

    }

    updateFromMap(map: GridMap) {

    }


}


function createTilemap(scene: Scene) {

}

