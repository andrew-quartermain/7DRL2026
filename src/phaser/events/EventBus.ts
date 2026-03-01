export type GameEvent = 'start-game';

class EventBus extends Phaser.Events.EventEmitter {
    emit(event: GameEvent, ...args: any[]): boolean {
        return super.emit(event, args)
    }
    on(event: GameEvent, fn: Function, context?: any): this {
        return super.on(event, fn, context)
    }
    once(event: GameEvent, fn: Function, context?: any): this {
        return super.once(event, fn, context)
    }
    off(event: GameEvent, fn?: Function, context?: any, once?: boolean): this {
        return super.off(event, fn, context, once)
    }
}

export default new EventBus();