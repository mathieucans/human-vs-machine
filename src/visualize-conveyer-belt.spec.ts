import { describe, expect, test } from "vitest";
import { Belt, ConveyorInitialized, Item, ItemAdded, Station } from "./domain/events";
import { visualizationToEvents } from "./visualization-to.events";
import { eventsToVisualization } from "./events-to.visualization";

describe('visualize-conveyer-belt', () => {
    describe.each([
        [[ConveyorInitialized(new Belt(3, []))], "_ _ _"],
        [[ConveyorInitialized(new Belt(4, []))], "_ _ _ _"],
        [[ConveyorInitialized(new Belt(3, [])), ItemAdded(new Item("a"))], "I(a) _ _"],
        [[ConveyorInitialized(new Belt(3, [new Station(0, "s", 1)]))],"S(s) _ _"],
        [[ConveyorInitialized(new Belt(3, [new Station(0,"s", 3)]))], "SSS(s)"],
    ])
    ('%s <-> %s', (events, outputs) => {
        test('eventsToVisualization', () => {

            const result = eventsToVisualization(events);

            expect(result).toEqual(outputs)
        })

        test('visualizationToEvents', () => {

            const result = visualizationToEvents(outputs);

            expect(result).toEqual(events)
        })
    })
});