import { Belt, ConveyerEvent, ConveyorInitialized, Item, ItemAdded } from "./domain/events";

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

function tokenBuilder (token:string) {
    switch (token) {
        case "_":
            return new EmptyToken()
        case "I(a)":
            return new ItemToken("a")
        default:
            throw `Unknwon token ${token}`;
    }
}

interface TokenVisitor {

    visitEmpty (token: EmptyToken): void;

    visitItem (token: ItemToken): void;
}

class TokenToEventsVisitor implements TokenVisitor {
    private _events :ConveyerEvent[] = []
    constructor(private readonly beltLength: number) {
        this._events.push(ConveyorInitialized(new Belt(this.beltLength, [])))
    }
    visitEmpty(token: EmptyToken): void {
    }
    visitItem(token: ItemToken): void {
        this._events.push(ItemAdded(new Item(token.name)))
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