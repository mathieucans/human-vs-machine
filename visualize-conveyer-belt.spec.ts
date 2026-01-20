import { describe, test , expect} from "vitest";

class ConveyorInitializedEvent {
    constructor (belt: any) {

    }

}

function ConveyorInitialized (param: any) {
    return new ConveyorInitializedEvent(param);
}

class Belt {
    constructor (size: number, stations: any[]) {

    }

}

function visualize (events: ConveyorInitializedEvent[]) {
    return "_ _ _"
}
describe('visualize-conveyer-belt', () => {
   describe('Initial examples', () => {
       test('empty belt', () => {
           let events = [ConveyorInitialized(new Belt(3, []))];

           const outputs = visualize(events);

           expect(outputs).toEqual("_ _ _")
       })
   })
});