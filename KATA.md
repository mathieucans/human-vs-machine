# kata.visualize-conveyer-belt

Implement the following 2 functions:

* `eventsToVisualization(List[Event]) -> Visualization`
* `visualizationToEvents(Visualization) -> List[Event])`

To pass the kata, all the examples listed in the readme should work.

## Domain

Given these events:

```
ConveyorInitialized(belt: Belt)
ItemAdded(item: Item)
ItemEnteredStation(item: Item, station: Station)
ItemLeftStation(item: Item, station: Station)
Stepped
Paused
Resumed
```

With

```
Station(name: String, size: Int)
Belt(length: Int, stations: List((Position, Station)))
Item(name: String)
Position: Int
```

## Visualization

Here is how a visualization looks like:

### a Belt

`_`: an empty position on a belt.

For example: `Belt(5, [])` looks like: `_ _ _ _ _` (there is always a space for clarity)

So, in our functions this would look like this:

```
events = [ConveyorInitialized(belt=Belt(size=1, stations=[]))]
visualization = eventsToVisualization(events)
assert visaulization == "_"
```

and

```
visualization = "_"
events = visualizationToEvents(visualization)
assert events == [ConveyorInitialized(belt=Belt(size=1, stations=[]))]
```

From now on for brevity we will always write this as:

```
Events: [ConveyorInitialized(belt=Belt(size=1, stations=[]))]
Output: "_"
```

When you see this, you should write a test that checks your function from `events -> visualization` and from `visualization -> events`

### Stations and Items

`S(a)` is a Station with name a and size 1
`SSS(b)` is a Station with name b and size 3

`I(a)` is an Item with name a

## Some initial examples

You can assume that all examples are valid

Events: `[ConveyorInitialized(belt=Belt(size=3, stations=[]))]`
Output: `_ _ _`

Events: `[ConveyorInitialized(belt=Belt(size=3, stations=[])), ItemAdded(item=Item(name="a"))]`
Output: `I(a) _ _`

Events: `[ConveyorInitialized(belt=Belt(size=3, stations=[(0, Station(name="s", size=1))]))]`
Output: `S(s) _ _`

Events: `[ConveyorInitialized(belt=Belt(size=3, stations=[(0, Station(name="s", size=3))]))]`
Output: `SSS(s)`

## New rules

### Stepping

`Stepped` means: the belt moved one position to the right. All items one the belt will move 1 to the right.

Events: `[ConveyorInitialized(belt=Belt(size=3, stations=[])), ItemAdded(item=Item(name="a")), Stepped, Stepped]`
Output: `_ _ I(a)`

After the belt we have a queue of items that left the belt.

```
Events: `[
  ConveyorInitialized(belt=Belt(size=3, stations=[])),
  ItemAdded(item=Item(name="a")),
  Stepped,
  Stepped,
  Stepped
]`
Output: `_ _ _: I(a)`
```
With multiple items leaving the belt it looks like this:

```
Events: `[
  ConveyorInitialized(belt=Belt(size=3, stations=[])),
  ItemAdded(item=Item(name="a")),
  Stepped,
  ItemAdded(item=Item(name="b")),
  Stepped,
  Stepped,
  Stepped
]`
Output: `_ _ _: I(b) I(a)`
```


### Enter and leaving stations.

You can make the following assumption:
* items always enter the station at position 0 (position relative to the station) and leave the station at the end of the station. They do not progress beyond the station.
* when any item is in a station, the belt can't be moved.

`S[I(i)](a)`: A station with name a, of size 1 is processing item i
We would have an event: ItemEnteredStation(Item(i), Station(a))

`SS[I(i)]S(a)`: A station with name a, of size 3 is processing item i on position 1
We would have an event: ItemEnteredStation(Item(i), Station(a))

*warning*:
`S(a)I(i)` and `S(a) I(i)` are not the same.
The first is we have a station and item on the same position. But the item left the station (processing by the station was done): `ItemLeftStation(Item(i),Station(a))`.
For `S(a) I(i)` we have an additional `Stepped` event.

The second one: the station is at position 0 and the item on position 1.

```
item = Item(name="i")
station = Station(name="a", size=2)
Events: [
  ConveyorInitialized(belt=Belt(size=4, stations=[(0, station))])),
  ItemAdded(item),
  ItemEnteredStation(item, station),
  ItemLeftStation(item, station)
]
Output: "SS(a)I(i) _ _"
```

```
item = Item(name="i")
station = Station(name="a", size=2)
Events: [
  ConveyorInitialized(belt=Belt(size=3, stations=[(0, station))])),
  ItemAdded(item), ItemEnteredStation(item, station),
  ItemLeftStation(item, station),
  Stepped
]
Output: "SS(a) I(i) _"
```

## Adding paused and resumed.

* You must emit a `Paused` when you go from no items in a station to at least one item in a station.
* You must emit a `Resumed` when you go from some items in a station to no items in a station.
* `Paused` and `Resumed` are allways directly after the leaving or entering of stations, there can be no other events in between.

complex example in multiple steps:

```
station1 = Station(name="s1", size=1)
station2 = Station(name="s2", size=2)
belt = Belt(size=4, stations=[(1, station1), (2, station2)])
item1 = Item(name="i1")
item2 = Item(name="i2")

Events: `[
  ConveyorInitialized(belt),
]`
Output: `_ S(s1) SS(s2)`
```
and then

```
Events: `[
  ConveyorInitialized(belt),
  ItemAdded(item1),
  Stepped,
  ItemEnteredStation(station1, item1),
  Paused,
]`
Output: `_ S[I(i1)](s1) SS(s2)`
```

next event:

```
Events: `[
  ConveyorInitialized(belt),
  ItemAdded(item1),
  Stepped,
  ItemEnteredStation(station1, item1),
  Paused,
  ItemAdded(item2)
]`
Output: `I(i2) S[I(i1)](s1) SS(s2)`
```
next events:

```
Events: `[
  ConveyorInitialized(belt),
  ItemAdded(item1),
  Stepped,
  ItemEnteredStation(station1, item1),
  Paused,
  ItemAdded(item2)
  ItemLeftStation(station1, item1),
  Resumed,
]`
Output: `I(i2) S(s1)I(i1) SS(s2)`
```

Notice that we could also reach the above outcome if you would move `ItemAdded` to after `Resumed`
This means that going that `visualizationToEvents(Visualization)`, so output to events is
not fully deterministic.
In the solution you can assume *left to right* parsing. That means, we first read `I(i2)` so we first have `ItemAdded(item2)`.

next events:

```
Events: `[
  ConveyorInitialized(belt),
  ItemAdded(item1),
  Stepped,
  ItemEnteredStation(station1, item1),
  Paused,
  ItemAdded(item2)
  ItemLeftStation(station1, item1),
  Resumed,
  Stepped,
  ItemEnteredStation(station1, item2),
  ItemEnteredStation(station2, item1),
  Paused
]`
Output: `_ S[I(i2)](s1) S[I(i1)]S(s2)`
```

Similarly you can also assume that if multiple items enter a station at the same step, always assume that the events are emitted from left to right.

continued:

```
Events: `[
  ConveyorInitialized(belt),
  ItemAdded(item1),
  Stepped,
  ItemEnteredStation(station1, item1),
  Paused,
  ItemAdded(item2)
  ItemLeftStation(station1, item1),
  Resumed,
  Stepped,
  ItemEnteredStation(station1, item2),
  ItemEnteredStation(station2, item1),
  Paused
  ItemLeftStation(station1, item2),
  ItemLeftStation(station2, item1),
  Resumed
]`
Output: `_ S(s1)I(i2) SS(s2)I(i1)`
```

and we can continue to the end:

```
Events: `[
  ConveyorInitialized(belt),
  ItemAdded(item1),
  Stepped,
  ItemEnteredStation(station1, item1),
  Paused,
  ItemAdded(item2)
  ItemLeftStation(station1, item1),
  Resumed,
  Stepped,
  ItemEnteredStation(station1, item2),
  ItemEnteredStation(station2, item1),
  Paused
  ItemLeftStation(station1, item2),
  ItemLeftStation(station2, item1),
  Resumed
  Stepped
  ItemEnteredStation(station2, item2),
  Paused
  ItemLeftStation(station2, item2),
  Resumed
  Stepped
]`
Output: `_ S(s1) SS(s2): I(i2) I(i1)`
```
