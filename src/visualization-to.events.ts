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

function tokenBuilder (token:string) {
    if (token === "_") {
        return new EmptyToken()
    }
    if (token === "I(a)") {
        return new ItemToken("a")
    }
    if(token.startsWith("S")) {
        let size = 0;
        while (size < token.length && token.at(size) === "S") {
            size++;
        }
        return new StationToken(0,"s", size)
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
    private  beltLength: number = 0

    visitEmpty(token: EmptyToken): void {
        this.beltLength++
    }
    visitItem(token: ItemToken): void {
        this._events = Array.of<ConveyerEvent>(ItemAdded(new Item(token.name))).concat(this._events)
        this.beltLength++
        for (let i = 1; i < this.beltLength; i++) {
            this._events.push(Stepped)
        }
    }
    visitStation(token: StationToken): void {
        this.stations.push(new Station(token.position, token.name, token.size))
        this.beltLength+=token.size;
    }

    events() {
        const conveyorInitializedEvents: ConveyerEvent[] = [ConveyorInitialized(new Belt(this.beltLength, this.stations))];
        return conveyorInitializedEvents.concat(this._events)
    }
}

export function visualizationToEvents (outputs: string) {
    const tokens = outputs.split(" ").map(tokenBuilder)
    const tokenVisitor = new TokenToEventsVisitor();
    tokens.forEach(token => token.accept(tokenVisitor))
    return tokenVisitor.events()
}