export class Belt {
    constructor (
        public readonly size: number,
        public readonly stations: Station[]) {

    }

    toString () {
        return `Belt(size=${this.size}, stations=[${this.stations.join(', ')}])`;
    }

}

export class Item {
    constructor (public readonly name: string) {

    }

    toString () {
        return `Item(name=${this.name})`;
    }

}

export class  Station {
    constructor (
        public readonly position: number,
        public readonly name: string,
        public readonly size: number) {

    }

    toString () {
        return `Station(position=${this.position}, name=${this.name}, size=${this.size})`;
    }

}