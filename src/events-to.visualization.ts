import { Belt, ConveyerEvent, ConveyorInitializedEvent, ItemAddedEvent } from "./domain/events";

class InitializedVisualizationAcc implements VisualizationAccumulator {

    private buildIndex = 0;
    private readonly stringBelt:string[] = []
    constructor (private belt: Belt) {

    }

    consume (event: ConveyerEvent): VisualizationAccumulator {
        if (event instanceof ItemAddedEvent) {
            this.stringBelt.push("I(a)")
            this.buildIndex++
        }
        return this;
    }

    toString (): string {
        while(this.buildIndex < this.belt.size) {
            this.stringBelt.push("_")
            this.buildIndex++
        }
        return this.stringBelt.join(" ");
    }
}

interface VisualizationAccumulator {
    consume (event: ConveyerEvent): VisualizationAccumulator
}

class EmptyVisualizationAcc implements VisualizationAccumulator {
    consume (event: ConveyerEvent) {
        if (event instanceof ConveyorInitializedEvent) {
            return new InitializedVisualizationAcc(event.belt);
        }
        throw 'bad event type'
    }
}

export function eventsToVisualization (events: ConveyerEvent[]) {
    const acc = events.reduce((acc, event) => acc.consume(event),
        new EmptyVisualizationAcc() as VisualizationAccumulator);
    return acc.toString()
}