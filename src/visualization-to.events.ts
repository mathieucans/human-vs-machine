import { Belt, ConveyorInitialized } from "./domain/events";

export function visualizationToEvents (outputs: string) {
    const tokens = outputs.split(" ")
    return [ConveyorInitialized(new Belt(tokens.length, []))]
}