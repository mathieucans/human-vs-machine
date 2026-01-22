import { Belt, Item } from "./Entities";

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

class SteppedEvent {
}

export const Stepped = new SteppedEvent();