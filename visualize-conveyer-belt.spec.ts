import { describe, test, expect } from "vitest";

function ConveyorInitialized (belt: Belt) {
    return new ConveyorInitializedEvent(belt);
}

class ConveyorInitializedEvent {
    constructor (
        public readonly belt: Belt) {

    }

    toString() {
        return `ConveyorInitialized(belt=${this.belt}`
    }
}

class Belt {
    constructor (
        public readonly size: number,
        public readonly stations: any[]) {

    }

    toString() {
        return `Belt(size=${this.size}, stations=[${this.stations.join(', ')}])`;
    }
}

class ItemAddedEvent {
    constructor (
        public readonly item: Item) {
    }

    toString() {
        return `ItemAdded(item=${this.item})`;
    }
}

function ItemAdded (item: any) {
    return new ItemAddedEvent(item);
}

class Item {
    constructor (public readonly name: string) {

    }

    toString() {
        return `Item(name=${this.name})`;
    }

}

type ConveyerEvent = ConveyorInitializedEvent | ItemAddedEvent

class InitializedVisualizationAcc implements VisualizationAccumulator{
    constructor (private belt: Belt) {

    }

    consume(event: ConveyerEvent): VisualizationAccumulator {
        return this;
    }

    toString() : string {
        return Array.from( { length: this.belt.size }, () => "_" ).join(" ");
    }
}

interface VisualizationAccumulator {
    consume (event: ConveyerEvent) : VisualizationAccumulator
}

class EmptyVisualizationAcc implements VisualizationAccumulator {
    consume (event: ConveyerEvent) {
        if (event instanceof ConveyorInitializedEvent) {
            return new InitializedVisualizationAcc(event.belt);
        }
        throw 'bad event type'
    }
}

function eventsToVisualization (events: ConveyerEvent[]) {
    const acc = events.reduce((acc, event) => acc.consume(event),
        new EmptyVisualizationAcc() as VisualizationAccumulator);
    return acc.toString()
}
function visualizationToEvents (outputs: string) {
    const tokens = outputs.split(" ")
    return [ConveyorInitialized(new Belt(tokens.length, []))]
}

describe('visualize-conveyer-belt', () => {
    describe.each([
        [[ConveyorInitialized(new Belt(3, []))], "_ _ _"],
        [[ConveyorInitialized(new Belt(4, []))], "_ _ _ _"],
        [[ConveyorInitialized(new Belt(3, [])), ItemAdded(new Item("a"))], "I(a) _ _"],
    ])
    ('%s <-> %s', (events, outputs) => {
        test('eventsToVisualization', () => {

            const result = eventsToVisualization(events);

            expect(result).toEqual(outputs)
        })

        test('eventsToVisualization', () => {

            const result = visualizationToEvents(outputs);

            expect(result).toEqual(events)
        })
    })
});