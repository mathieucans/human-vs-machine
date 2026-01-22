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
        public readonly stations: any[]) {

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

export type ConveyerEvent = ConveyorInitializedEvent | ItemAddedEvent
export function ConveyorInitialized (belt: Belt) {
    return new ConveyorInitializedEvent(belt);
}
export function ItemAdded (item: any) {
    return new ItemAddedEvent(item);
}