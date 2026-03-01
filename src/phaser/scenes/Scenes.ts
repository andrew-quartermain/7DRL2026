import { Boot } from './Boot';
import { GameOver } from './GameOver';
import { MainGame as MainGame } from './MainGame';
import { MainMenu } from './MainMenu';
import { Preloader } from './Preloader';

export const SCENES = [
    Boot, Preloader, MainMenu, MainGame, GameOver,
];

export enum SceneKeys {
    Boot = 'boot',
    Preloader = 'preloader',
    MainMenu = 'main-menu',
    MainGame = 'main-game',
    GameOver = 'game-over',
};