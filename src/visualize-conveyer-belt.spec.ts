import { describe, expect, test } from "vitest";
import { ConveyorInitialized, ItemAdded, ItemEnteredStation, ItemLeftStation, Stepped } from "./domain/events";
import { visualizationToEvents } from "./visualization-to.events";
import { eventsToVisualization } from "./events-to.visualization";
import { Belt, Item, Station } from "./domain/Entities";

describe('visualize-conveyer-belt', () => {

    const itemI = new Item("i")
    const stationA2 = new Station(0, "a", 2)

    describe.each([
        [[ConveyorInitialized(new Belt(3, []))], "_ _ _"],
        [[ConveyorInitialized(new Belt(4, []))], "_ _ _ _"],
        [[ConveyorInitialized(new Belt(3, [])), ItemAdded(new Item("a"))], "I(a) _ _"],
        [[ConveyorInitialized(new Belt(3, [new Station(0, "s", 1)]))], "S(s) _ _"],
        [[ConveyorInitialized(new Belt(3, [new Station(0, "s", 3)]))], "SSS(s)"],
        [[ConveyorInitialized(new Belt(3, [])), ItemAdded(new Item("a")), Stepped, Stepped], "_ _ I(a)"],
        [[
            ConveyorInitialized(new Belt(3, [])),
            ItemAdded(new Item("a")),
            Stepped,
            Stepped,
            Stepped
        ], `_ _ _: I(a)`],
        [[
            ConveyorInitialized(new Belt(3, [])),
            ItemAdded(new Item("a")),
            Stepped,
            ItemAdded(new Item("b")),
            Stepped,
            Stepped,
            Stepped
        ], `_ _ _: I(b) I(a)`],
        [            [
            ConveyorInitialized(new Belt(4, [stationA2])),
            ItemAdded(itemI),
            ItemEnteredStation(itemI, stationA2),
            ItemLeftStation(itemI, stationA2)
        ], `SS(a)I(i) _ _`]
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