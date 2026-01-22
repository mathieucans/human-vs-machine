import { describe, expect, test } from "vitest";
import { Belt, type ConveyerEvent, ConveyorInitializedEvent, Item, ItemAddedEvent } from "./domain/events";

function ConveyorInitialized (belt: Belt) {
    return new ConveyorInitializedEvent(belt);
}

function ItemAdded (item: any) {
    return new ItemAddedEvent(item);
}

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