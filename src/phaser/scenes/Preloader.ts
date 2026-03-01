import { Scene } from 'phaser';
import { SceneKeys } from './Scenes';
import { TextureKeys } from '../Keys';

export class Preloader extends Scene {
    constructor() {
        super(SceneKeys.Preloader);
    }

    init() {
        const { width, height } = this.scale;

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(width * 0.5, height * 0.5, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(width * 0.5 - 230, height * 0.5, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.spritesheet(
            TextureKeys.Source,
            TextureKeys.Source,
            {
                frameWidth: 24,
                frameHeight: 24,
                spacing: 0,
            });
        this.load.image('logo', 'logo.png');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        const sourceTexture = this.textures.get(TextureKeys.Source);

        prepareSpritesheets(this);
        sourceTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start(SceneKeys.MainMenu);
    }
}

const PIXEL_LIGHT = 0xffffff;
const PIXEL_DARK = 0x808080;
const PIXEL_DETAIL = 0x8080ff;

function prepareSpritesheets(scene: Phaser.Scene) {



    extrudeTiles(scene);

    scene.textures.addSpriteSheet(
        '',
        scene.textures.get(TextureKeys.Extruded),
        {
            frameWidth: 24,
            frameHeight: 24,
            margin: 1,
            spacing: 1
        });
    scene.textures.addSpriteSheet(
        '',
        scene.textures.get(TextureKeys.Dark),
        {
            frameWidth: 24,
            frameHeight: 24,
            margin: 1,
            spacing: 1
        });

    scene.textures.addSpriteSheet(
        '',
        scene.textures.get(TextureKeys.Light),
        {
            frameWidth: 24,
            frameHeight: 24,
            margin: 1,
            spacing: 1
        });

    scene.textures.addSpriteSheet(
        '',
        scene.textures.get(TextureKeys.Details),
        {
            frameWidth: 24,
            frameHeight: 24,
            margin: 1,
            spacing: 1
        });

    scene.textures.get(TextureKeys.Dark).setFilter(Phaser.Textures.FilterMode.NEAREST);
    scene.textures.get(TextureKeys.Light).setFilter(Phaser.Textures.FilterMode.NEAREST);
    scene.textures.get(TextureKeys.Details).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function extrudeTiles(scene: Phaser.Scene) {
    const tex = scene.textures.get(TextureKeys.Source).getSourceImage(0) as HTMLImageElement;

    const SIZE = 1 + ((24 + 1) * 16);
    const source = scene.textures.createCanvas('temp', tex.width, tex.height);
    source?.draw(0, 0, tex);
    const extruded = scene.textures.createCanvas(TextureKeys.Extruded, SIZE, SIZE);
    const dark = scene.textures.createCanvas(TextureKeys.Dark, SIZE, SIZE);
    const light = scene.textures.createCanvas(TextureKeys.Light, SIZE, SIZE);
    const details = scene.textures.createCanvas(TextureKeys.Details, SIZE, SIZE);


    let offsetX = 0;
    let offsetY = 0;

    for (let y = 0, dy = 1; y < tex.height; y++, dy++) {
        for (let x = 0, dx = 1; x < tex.width; x++, dx++) {
            const pixel = source?.getPixel(x, y) as Phaser.Display.Color;
            const { red, green, blue, alpha, color } = pixel;

            switch (color) {
                case 0:
                    break;
                case PIXEL_DARK:
                    dark?.setPixel(dx, dy, 255, 255, 255, 255);
                    break;
                case PIXEL_LIGHT:
                    light?.setPixel(dx, dy, 255, 255, 255, 255);
                    break;
                case PIXEL_DETAIL:
                    details?.setPixel(dx, dy, 255, 255, 255, 255);
                    break;
                default:

            }
            extruded?.setPixel(dx, dy, red, green, blue, alpha);

            offsetX++;
            if (offsetX % 24 === 0) {
                offsetX = 0;
                dx++;
            }
        }
        offsetY++;
        if (offsetY % 24 === 0) {
            offsetY = 0;
            dy++;
        }
    }

    dark?.refresh();
    light?.refresh();
    details?.refresh();
    extruded?.refresh();

}