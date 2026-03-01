import { AUTO, Game, Scale } from 'phaser';
import { SCENES } from './scenes/Scenes';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true,
    },
    scene: SCENES,
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
