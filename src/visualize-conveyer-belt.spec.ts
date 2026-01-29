import { describe, expect, test } from "vitest";
import { ConveyorInitialized, ItemAdded, ItemEnteredStation, ItemLeftStation, Paused, Resumed, Stepped } from "./domain/events";
import { visualizationToEvents } from "./visualization-to.events";
import { eventsToVisualization } from "./events-to.visualization";
import { Belt, Item, Station } from "./domain/Entities";

describe('visualize-conveyer-belt', () => {

    const itemI = new Item("i")
    const stationA2 = new Station(0, "a", 2)

    describe.each([
        // [[ConveyorInitialized(new Belt(3, []))], "_ _ _"],
        // [[ConveyorInitialized(new Belt(4, []))], "_ _ _ _"],
        // [[ConveyorInitialized(new Belt(3, [])), ItemAdded(new Item("a"))], "I(a) _ _"],
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
        [[
            ConveyorInitialized(new Belt(4, [stationA2])),
            ItemAdded(itemI),
            ItemEnteredStation(itemI, stationA2),
            ItemLeftStation(itemI, stationA2)
        ], `SS(a)I(i) _ _`],
        [[
            ConveyorInitialized(new Belt(4, [stationA2])),
            ItemAdded(itemI),
            ItemEnteredStation(itemI, stationA2),
            ItemLeftStation(itemI, stationA2),
            Stepped
        ], "SS(a) I(i) _"]
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

    describe("Adding paused and resumed : ", () => {

        const station1 = new Station(1, "s1", 1)
        const station2 = new Station(2, "s2", 2)
        const belt = new Belt(4, [station1, station2])
        const item1 = new Item("i1")
        const item2 = new Item("i2")
        describe.each([
            [[ConveyorInitialized(belt)], "_ S(s1) SS(s2)"],
            [[
                ConveyorInitialized(belt),
                ItemAdded(item1),
                Stepped,
                ItemEnteredStation(item1, station1),
                Paused,
            ],'_ S[I(i1)](s1) SS(s2)'],
            [[
                ConveyorInitialized(belt),
                ItemAdded(item1),
                Stepped,
                ItemEnteredStation(item1, station1),
                Paused,
                ItemAdded(item2)
            ],`I(i2) S[I(i1)](s1) SS(s2)`],
            [
                [
                    ConveyorInitialized(belt),
                    ItemAdded(item1),
                    Stepped,
                    ItemEnteredStation(item1, station1),
                    Paused,
                    ItemAdded(item2),
                    ItemLeftStation(item1, station1),
                    Resumed,
                ], `I(i2) S(s1)I(i1) SS(s2)`
            ]
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
    })

});


