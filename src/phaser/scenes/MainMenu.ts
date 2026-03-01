import { Scene, GameObjects } from 'phaser';
import EventBus from '../events/EventBus';
import { SceneKeys } from './Scenes';
import { TextureKeys } from '../Keys';

export class MainMenu extends Scene
{
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super(SceneKeys.MainMenu);
    }

    create ()
    {
        const { width, height } = this.scale; 

        for (let i = 0; i < 8; i++) {
            this.add.image(width * ((i + 0.5) / 8), height * 0.33, TextureKeys.Dark, i % 4).setScale(8);
        }
        for (let i = 0; i < 8; i++) {
            this.add.image(width * ((i + 0.5) / 8), height * 0.5, TextureKeys.Light, i % 4).setScale(8);
        }
        for (let i = 0; i < 8; i++) {
            this.add.image(width * ((i + 0.5) / 8), height * 0.67, TextureKeys.Details, i % 4).setScale(8);
        }

        this.add.image(0,0, TextureKeys.Extruded);


        this.title = this.add.text(width * 0.5, height * 0.2, '>>> SPACE Game Title >>>', {
            fontFamily: 'Anonymous Pro, monospace', fontSize: 128, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.dom(width * 0.5, height * 0.8, createMainMenu());
        
        EventBus.once('start-game', () => {
            this.scene.start(SceneKeys.MainGame);
        });
    }
}

function createMainMenu(): HTMLElement {
    const div = document.createElement('div');
    const ul = document.createElement('ul');
    div.appendChild(ul);
    for (let i = 1; i <= 4; i ++) {
        const li = document.createElement('li');
        li.textContent = `Menu Item ${i}`;
        ul.appendChild(li);

        li.addEventListener('click', () => {
            EventBus.emit('start-game');
        });
    }
    const fs = document.createElement('li');
    fs.textContent = 'fullscreen';
    ul.appendChild(fs);

    fs.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.querySelector('#app')?.requestFullscreen();
        }
    });

    return div
}