export class ConveyorInitializedEvent {
    constructor (
        public readonly belt: Belt) {

    }

    toString () {
        return `ConveyorInitialized(belt=${this.belt}`
    }
}

export class Belt {
    constructor (
        public readonly size: number,
        public readonly stations: Station[]) {

    }

    toString () {
        return `Belt(size=${this.size}, stations=[${this.stations.join(', ')}])`;
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

export class Item {
    constructor (public readonly name: string) {

    }

    toString () {
        return `Item(name=${this.name})`;
    }

}

export class Station {
    constructor (
        public readonly position: number,
        public readonly name: string,
        public readonly size: number) {

    }

    toString () {
        return `Station(position=${this.position}, name=${this.name}, size=${this.size})`;
    }

}

export type ConveyerEvent = ConveyorInitializedEvent | ItemAddedEvent
export function ConveyorInitialized (belt: Belt) {
    return new ConveyorInitializedEvent(belt);
}
export function ItemAdded (item: Item) {
    return new ItemAddedEvent(item);
}

