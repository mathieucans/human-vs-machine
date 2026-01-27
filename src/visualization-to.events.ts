import { ConveyerEvent, ConveyorInitialized, ItemAdded, ItemEnteredStation, ItemEnteredStationEvent, ItemLeftStation, Paused, Stepped } from "./domain/events";
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

class StationTokenReader {
    private index = 0
    constructor (private token: string) {

    }

    readSize () {
        while (this.index < this.token.length && this.token.at(this.index) === "S") {
            this.index++;
        }
        return this.index
    }

    readProcessingTokenIfAny () {
        if(this.token.substring(this.index).startsWith("[")){
            this.index ++;
            const itemName = extractName(this.token, ++this.index);
            this.index+=itemName.length + 3
            return new ItemToken(itemName);
        }
        return undefined;
    }

    readStationName () {
        const name = extractName(this.token, this.index);
        this.index += name.length + 2
        return name;
    }

    readItemIfAny () {
        if (this.char() === "I") {
            return  new ItemToken(this.readName2());
        }
        return undefined;
    }

    private readName2() {
        if (this.token.at(this.index) !== "(") {
            throw 'Invalid character' + this.token.at(this.index)
        }
        const endNameIndex = this.token.indexOf(')', this.index);
        const name = this.token.substring(this.index + 1, endNameIndex);
        return name;
    }

    private char () {
        return this.token.at(this.index++);
    }
}

function reduceToTokenList (previous: Token[], token: string) {
    if (token === "_") {
        return previous.concat(new EmptyToken())
    }
    if (token === "_:") {
        return previous.concat(new EmptyTokenWithItemsLeft())
    }
    if (token.startsWith("I(")) {
        const name = extractName(token, 1);
        const lastToken = previous[previous.length - 1];
        if (lastToken instanceof EmptyTokenWithItemsLeft) {
            lastToken.addLeftItem(new ItemToken(name))
            return previous
        }
        return previous.concat(new ItemToken(name))
    }
    if (token.startsWith("S")) {
        const reader = new StationTokenReader(token)
        const size = reader.readSize();
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