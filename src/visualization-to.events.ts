import { ConveyerEvent, ConveyorInitialized, ItemAdded, ItemEnteredStation, ItemLeftStation, Paused, Stepped } from "./domain/events";
import { Belt, Item, Station } from "./domain/Entities";

interface Token {
    accept (visitor: TokenVisitor): void
}

class EmptyToken implements Token {
    accept (visitor: TokenVisitor): void {
        visitor.visitEmpty(this)
    }
}

class ItemToken implements Token {
    constructor (public readonly name: string) {
    }

    accept (visitor: TokenVisitor): void {
        visitor.visitItem(this)
    }
}

class StationToken implements Token {
    itemAtSamePosition: ItemToken | undefined;
    processingItem: ItemToken | undefined;

    constructor (
        public readonly position: number,
        public readonly name: string,
        public readonly size: number) {

    }

    accept (visitor: TokenVisitor): void {
        visitor.visitStation(this)
    }

}

class EmptyTokenWithItemsLeft implements Token {
    leftItems: ItemToken[] = []

    accept (visitor: TokenVisitor): void {
        visitor.visitLastEmptyToken(this)
    }

    addLeftItem (itemToken: ItemToken) {
        this.leftItems = Array.of(itemToken).concat(this.leftItems)
    }
}

function extractName (token: string, index: number) {
    if (token.at(index) !== "(") {
        throw 'Invalid character' + token.at(index)
    }
    const endNameIndex = token.indexOf(')', index);
    const name = token.substring(index + 1, endNameIndex);
    return name;
}

class TokenReader {
    private index = 0
    constructor (private token: string) {

    }

    readStationSize () {
        while (this.readCharIf("S")) {
        }
        return this.index
    }

    readProcessingTokenIfAny () {
        if(this.readCharIf("[")){
            const item = this.readItemIfAny()
            this.readCharIf("]")
            return item;
        }
        return undefined;
    }

    readStationName () {
        return this.readName();
    }

    readItemIfAny () {
        if (this.readCharIf("I")) {
            return  new ItemToken(this.readName());
        }
        return undefined;
    }

    private currentChar () {
        return this.token.at(this.index);
    }

    readName() {
        if (this.readChar() !== "(") {
            throw 'Invalid character' + this.currentChar()
        }
        let name = ""
        let current = this.readChar();
        while (current !== ')') {
            name += current;
            current = this.readChar();
        }
        return name;
    }

    private readChar () {
        return this.token.at(this.index++);
    }

    readCharIf (value: string) {
        if(this.currentChar() === value) {
            this.index++;
            return true;
        }
        return false;
    }
}

function reduceToTokenList (previous: Token[], token: string) {
    if (token === "_") {
        return previous.concat(new EmptyToken())
    }
    if (token === "_:") {
        return previous.concat(new EmptyTokenWithItemsLeft())
    }
    const reader = new TokenReader(token);
    if (reader.readCharIf("I")) {
        const token =  new ItemToken(reader.readName());
        const lastToken = previous[previous.length - 1];
        if (lastToken instanceof EmptyTokenWithItemsLeft) {
            lastToken.addLeftItem(token)
            return previous
        }
        return previous.concat(token)
    }
    if (reader.readCharIf("S")) {
        const size = reader.readStationSize();
        const processingItem = reader.readProcessingTokenIfAny()
        const name = reader.readStationName()
        const stationToken = new StationToken(previous.length, name, size);
        stationToken.processingItem = processingItem;
        stationToken.itemAtSamePosition = reader.readItemIfAny()
        return previous.concat(
            stationToken
        )
    }
    throw `Unknwon token ${token}`;
}

interface TokenVisitor {

    visitEmpty (token: EmptyToken): void;

    visitItem (token: ItemToken): void;

    visitStation (token: StationToken): void;

    visitLastEmptyToken (token: EmptyTokenWithItemsLeft): void;
}

class TokenToEventsVisitor implements TokenVisitor {
    private _events: ConveyerEvent[] = []
    private readonly stations: Station[] = [];
    private beltLength: number = 0

    visitEmpty (token: EmptyToken): void {
        this.beltLength++
    }

    visitItem (token: ItemToken): void {
        const item = new Item(token.name);
        this._events.push(ItemAdded(item))
        const itemFinalPosition = this.beltLength;
        this.beltLength++
        let itemPosition = 0;

        this.stations.filter(station => station.position < itemFinalPosition)
            .forEach(station => {
                this._events.push(ItemEnteredStation(item, station));
                this._events.push(ItemLeftStation(item, station));
                itemPosition += station.position + station.size -1;
            })

        while (itemPosition < itemFinalPosition) {
            this._events.push(Stepped)
            itemPosition++;
        }
    }

    visitStation (token: StationToken): void {
        const station = new Station(token.position, token.name, token.size);
        this.stations.push(station)
        this.beltLength += token.size;

        if (token.processingItem) {
            const item = new Item(token.processingItem.name);
            this._events.push(
                ItemAdded(item),
                Stepped,
                ItemEnteredStation(item, station),
                Paused
            )
        }

        if (token.itemAtSamePosition) {
            const item = new Item(token.itemAtSamePosition.name);
            this._events.push(
                ItemAdded(item),
                ItemEnteredStation(item, station),
                ItemLeftStation(item, station))
        }
    }

    visitLastEmptyToken (token: EmptyTokenWithItemsLeft): void {
        this.beltLength++
        for (const leftItem of token.leftItems) {
            this._events.push(ItemAdded(new Item(leftItem.name)))
            this._events.push(Stepped)
        }
        for (let i = 1; i < this.beltLength; i++) {
            this._events.push(Stepped)
        }

    }

    events () {
        const conveyorInitializedEvents: ConveyerEvent[] = [ConveyorInitialized(new Belt(this.beltLength, this.stations))];
        return conveyorInitializedEvents.concat(this._events)
    }
}

export function visualizationToEvents (outputs: string) {
    const tokens = outputs.split(" ").reduce(reduceToTokenList, [])
    const tokenVisitor = new TokenToEventsVisitor();
    tokens.forEach(token => token.accept(tokenVisitor))
    return tokenVisitor.events()
}