import { Belt, Item, Station } from "./Entities";

export class ConveyorInitializedEvent {
    constructor (
        public readonly belt: Belt) {

    }

    toString () {
        return `ConveyorInitialized(belt=${this.belt}`
    }
}

export class ItemAddedEvent {
    constructor (
        public readonly item: Item) {
    }

    toString () {
        return `ItemAdded(item=${this.item})`;
    }
}

export type ConveyerEvent = ConveyorInitializedEvent | ItemAddedEvent | SteppedEvent
export function ConveyorInitialized (belt: Belt) {
    return new ConveyorInitializedEvent(belt);
}
export function ItemAdded (item: Item) {
    return new ItemAddedEvent(item);
}

export class SteppedEvent {
    toString () {
        return `Stepped`;
    }
}

export const Stepped = new SteppedEvent();

export class PausedEvent {
    toString () {
        return `Paused`;
    }
}

export const Paused = new PausedEvent();

export class ResumedEvent {
    toString () {
        return `Resumed`;
    }
}

export const Resumed = new ResumedEvent();

export class ItemEnteredStationEvent {
    constructor (
        public readonly item: Item,
        public readonly station: Station) {

    }

}

export function ItemEnteredStation(item:Item, station: Station){
    return new ItemEnteredStationEvent(item, station);
}

export class ItemLeftStationEvent {
    constructor (
        public readonly item: Item,
        public readonly station: Station) {

    }

}

export function ItemLeftStation(item:Item, station: Station){
    return new ItemLeftStationEvent(item, station);
}