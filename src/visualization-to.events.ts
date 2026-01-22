import { Belt, ConveyerEvent, ConveyorInitialized, Item, ItemAdded, Station } from "./domain/events";

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

function tokenBuilder (token:string) {
    if (token === "_") {
        return new EmptyToken()
    }
    if (token === "I(a)") {
        return new ItemToken("a")
    }
    if(token.startsWith("S")) {
        return new StationToken(0,"s", 1)
    }
    throw `Unknwon token ${token}`;
}

interface TokenVisitor {

    visitEmpty (token: EmptyToken): void;

    visitItem (token: ItemToken): void;

    visitStation (token: StationToken): void;
}

class TokenToEventsVisitor implements TokenVisitor {
    private _events :ConveyerEvent[] = []
    private readonly stations:Station[] = [];
    constructor(private readonly beltLength: number) {
        this._events.push(ConveyorInitialized(new Belt(this.beltLength, this.stations)))
    }

    visitEmpty(token: EmptyToken): void {
    }
    visitItem(token: ItemToken): void {
        this._events.push(ItemAdded(new Item(token.name)))
    }
    visitStation(token: StationToken): void {
        this.stations.push(new Station(token.position, token.name, token.size))
    }

    events() {
        return this._events
    }
}

export function visualizationToEvents (outputs: string) {
    const tokens = outputs.split(" ").map(tokenBuilder)
    const tokenVisitor = new TokenToEventsVisitor(tokens.length);
    tokens.forEach(token => token.accept(tokenVisitor))
    return tokenVisitor.events()
}