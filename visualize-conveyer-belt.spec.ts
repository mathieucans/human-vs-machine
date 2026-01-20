import { describe, test, expect } from "vitest";



function ConveyorInitialized (belt: Belt) {
    return new ConveyorInitializedEvent(belt);
}

class ConveyorInitializedEvent {
    constructor (
        public readonly  belt: Belt) {

    }

}

class Belt {
    constructor (
        public readonly size: number,
        public readonly stations: any[]) {

    }

}

function eventsToVisualization (events: ConveyorInitializedEvent[]) {
    return "_ _ _"
}
function visualizationToEvents (outputs: string) {
    return [ConveyorInitialized(new Belt(3, []))]
}
describe('visualize-conveyer-belt', () => {
    describe.each([
        [[ConveyorInitialized(new Belt(3, []))], "_ _ _"]
    ])('Initial examples %s <-> %s', (events, outputs) => {
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