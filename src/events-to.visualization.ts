import { ConveyerEvent, ConveyorInitializedEvent, ItemAdded, ItemAddedEvent, ItemEnteredStationEvent, ItemLeftStationEvent, SteppedEvent } from "./domain/events";
import { Belt, Item, Station } from "./domain/Entities";

interface BeltElement {
    next: BeltElement | undefined

    visualize (): string

    consume (event: ConveyerEvent): void;
}

function itemVisualization (item: Item) {
    return `I(${item.name})`;
}

class PlaceModel implements BeltElement {
    next: BeltElement | undefined;
    private item: Item | undefined;

    consume (event: ConveyerEvent): void {
        if (event instanceof ItemAddedEvent) {
            this.item = event.item;
        } else {
            // Profondeur d'abord pour libérer la plase
            if (this.next) {
                this.next.consume(event);
            }
            if (event instanceof SteppedEvent) {

                if (this.item !== undefined) {
                    const item = this.item;
                    this.item = undefined;
                    if (this.next) {
                        this.next.consume(ItemAdded(item))
                    }
                }
            }
        }

    }

    visualize () {
        return this.item ? itemVisualization(this.item) : "_";
    }
}

class StationModel implements BeltElement {
    constructor (private readonly station: Station) {
    }

    next: BeltElement | undefined;

    processingItem: Item | undefined;
    itemAtSamePosition: Item | undefined;

    consume (event: ConveyerEvent): void {
        if (event instanceof ItemEnteredStationEvent) {
            this.processingItem = event.item;
        }
        if (event instanceof ItemLeftStationEvent) {
            this.processingItem = undefined;
            this.itemAtSamePosition = event.item
        }
        if (event instanceof SteppedEvent) {
            if (this.itemAtSamePosition && this.next) {
                this.next.consume(ItemAdded(this.itemAtSamePosition))
                this.itemAtSamePosition = undefined;
            }
        }
    }

    visualize (): string {
        const repeatS = "S".repeat(this.station.size);
        if (this.processingItem) {
            return `${repeatS}[${itemVisualization(this.processingItem)}](${this.station.name})`
        }
        if (this.itemAtSamePosition) {
            return `${repeatS}(${this.station.name})${itemVisualization(this.itemAtSamePosition)}`;
        }
        return `${repeatS}(${this.station.name})`
    }
}

class LastElement implements BeltElement {
    next: BeltElement | undefined;

    constructor (private readonly element: BeltElement) {
        element.next = this
    }

    private leftItems = Array<Item>();

    visualize (): string {
        if (this.leftItems.length > 0) {
            return this.element.visualize() + ": " + this.leftItems.map(i => `I(${i.name})`).join(" ");
        }
        return this.element.visualize();
    }

    consume (event: ConveyerEvent): void {
        if (event instanceof ItemAddedEvent) {
            this.leftItems = Array.of(event.item).concat(this.leftItems);
        }
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
                position += station.size;
            } else {
                this.places.push(new PlaceModel());
                position++
            }
        }

        // Link all element
        for (let i = 0; i < this.places.length - 1; i++) {
            this.places[i]!.next = this.places[i + 1]
        }

        // Substitute last element
        if (position > 0) {
            this.places.push(new LastElement(this.places.pop()!))
        }
    }

    visualize () {
        return this.places.map(e => e.visualize())
            .filter(v => v !== "")
            .join(" ")
    }

    consume (event: ConveyerEvent) {
        this.places[0]!.consume(event);
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