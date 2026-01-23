import { ConveyerEvent, ConveyorInitialized, ItemAdded, Stepped } from "./domain/events";
import { Belt, Item, Station } from "./domain/Entities";

interface Token {
    accept(visitor: TokenVisitor): void
}

class EmptyToken implements Token {
    accept(visitor: TokenVisitor): void {
        visitor.visitEmpty(this)
    }
}

class ItemToken implements Token{
    constructor (public readonly name: string) {
    }

    accept(visitor: TokenVisitor): void {
        visitor.visitItem(this)
    }
}

class StationToken implements Token {
    constructor (
        public readonly position: number,
        public readonly name: string,
        public readonly size: number) {

    }

    accept(visitor: TokenVisitor): void {
        visitor.visitStation(this)
    }

}

class EmptyTokenWithItemsLeft implements Token {
    leftItems: ItemToken[] = []
    accept(visitor: TokenVisitor): void {
        visitor.visitLastEmptyToken(this)
    }

    addLeftItem (itemToken: ItemToken) {
        this.leftItems = Array.of(itemToken).concat(this.leftItems)
    }
}

function reduceToTokenList (previous: Token[], token:string) {
    if (token === "_") {
        return previous.concat(new EmptyToken())
    }
    if (token === "_:") {
        return previous.concat(new EmptyTokenWithItemsLeft())
    }
    if (token.startsWith("I(")) {
        const name = token.slice(2, token.length - 1)
        const lastToken = previous[previous.length-1];
        if(lastToken instanceof EmptyTokenWithItemsLeft) {
            lastToken.addLeftItem(new ItemToken(name))
            return previous
        }
        return previous.concat(new ItemToken(name))
    }
    if(token.startsWith("S")) {
        let size = 0;
        while (size < token.length && token.at(size) === "S") {
            size++;
        }
        return previous.concat(new StationToken(0,"s", size))
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
    private _events :ConveyerEvent[] = []
    private readonly stations:Station[] = [];
    private  beltLength: number = 0
    visitEmpty(token: EmptyToken): void {
        this.beltLength++
    }

    visitItem(token: ItemToken): void {
        this._events.push(ItemAdded(new Item(token.name)))
        this.beltLength++
        for (let i = 1; i < this.beltLength; i++) {
            this._events.push(Stepped)
        }
    }
    visitStation(token: StationToken): void {
        this.stations.push(new Station(token.position, token.name, token.size))
        this.beltLength+=token.size;
    }

    visitLastEmptyToken(token: EmptyTokenWithItemsLeft): void {
        this.beltLength++
        for (const leftItem of token.leftItems) {
            this._events.push(ItemAdded(new Item(leftItem.name)))
            this._events.push(Stepped)
        }
        for (let i = 1; i < this.beltLength; i++) {
            this._events.push(Stepped)
        }

    }

    events() {
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