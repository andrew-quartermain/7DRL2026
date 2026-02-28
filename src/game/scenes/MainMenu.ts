import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale; 


        this.logo = this.add.image(width * 0.5, height * 0.5, 'sprites', 0);
        this.logo.setScale(8);

        this.title = this.add.text(width * 0.5, height * 0.6, 'Main Menu', {
            fontFamily: 'Anonymous Pro, monospace', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(width * 0.5, height * 0.7, 'Main Menu', {
            fontFamily: 'monospace', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        

        this.input.once('pointerdown', () => {

            this.scene.start('MainGame');

        });
    }
}
