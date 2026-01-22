import { Belt, ConveyerEvent, ConveyorInitializedEvent } from "./domain/events";

class InitializedVisualizationAcc implements VisualizationAccumulator {
    constructor (private belt: Belt) {

    }

    consume (event: ConveyerEvent): VisualizationAccumulator {
        return this;
    }

    toString (): string {
        return Array.from({ length: this.belt.size }, () => "_").join(" ");
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