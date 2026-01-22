import { Belt, ConveyerEvent, ConveyorInitializedEvent, Item, ItemAddedEvent, Station } from "./domain/events";

interface BeltElement {
    visualize (): string

    consume (event: ConveyerEvent): void;
}


class PlaceModel implements BeltElement {
    private item?: Item;

    consume (event: ConveyerEvent): void {
        if (event instanceof ItemAddedEvent) {
            this.item = event.item;
        }
    }

    visualize () {
        return this.item ? "I(a)" : "_";
    }
}

class StationModel implements BeltElement {
    constructor (private readonly station: Station) {
    }

    consume (event: ConveyerEvent): void {
    }

    visualize (): string {
        return `${"S".repeat(this.station.size)}(${this.station.name})`
    }
}

class BeltModel {

    private places = new Array<BeltElement>();

    constructor (belt: Belt) {
        let position = 0;
        while (position < belt.size) {
            const station = belt.stations.find(s => s.position === position);
            if (station) {
                this.places.push(new StationModel(station))
                position = station.size;
            } else {
                this.places.push(new PlaceModel());
                position++
            }
        }
    }

    visualize () {
        return this.places.map(e => e.visualize()).join(" ")
    }

    consume (event: ConveyerEvent) {
        if (event instanceof ItemAddedEvent) {
            this.places[0]!.consume(event);
        } else {
            for (const place of this.places) {
                place.consume(event);
            }
        }
    }
}

class EventsModel {

    private beltModel?: BeltModel;

    consume (event: ConveyerEvent) {
        if (event instanceof ConveyorInitializedEvent) {
            this.beltModel = new BeltModel(event.belt);
        }
        if (this.beltModel) {
            this.beltModel.consume(event);
        }
    }

    visualize () {
        return this.beltModel?.visualize() ?? ""
    }
}

export function eventsToVisualization (events: ConveyerEvent[]) {
    const eventsModel = new EventsModel();
    for (const event of events) {
        eventsModel.consume(event);
    }
    return eventsModel.visualize();
}