# playground-plugins

All the reusable plugins that can be used right now:

## [**TitleWidget**](https://playground-plugins.netlify.app/reusable/TitleWidget.js) (WidgetActivation)

Displays the text passed in a widget, centered.

```
TitleWidget(title: string, size: number = 1) => WidgetActivateFunction
```

## [**Terminal**](https://playground-plugins.netlify.app/reusable/Terminal.js) (Plugin)

Acts as an almost-complete drop-in replacement of the Control Center Terminal. Exposes the two functions `print` and `reset` for the prototype to use.

```
Terminal(props: PluginProps) => {
    print(text: string) => void
    reset() => void
}
```

### `VehicleObject`

This is the `vehicle` parameter passed to the plugin definition. Needs to passed forward for some widgets.

### `TileType`

```
type TileType = {
    signal: string
    icon?: string
    label?: string
    suffix?: string
}
```

`signal`: Name of the VSS signal to be shown, for example: "Vehicle.Speed"

`icon`: Optional Font Awesome icon name, for example: `satellite`

`label`: Label to display in the title, defaults to `signal`.

`suffix`: Suffix to add after the value, useful for adding units like ` km/h` or `h`

## [**SignalTile**](https://playground-plugins.netlify.app/reusable/SignalTile.js) (WidgetActivation)

Displays the current value of a single VSS API in a tile.

```
SignalTile(pill: TileType, vehicle: VehicleObject) => WidgetActivateFunction
```

## [**SignalBlackTile**](https://playground-plugins.netlify.app/reusable/SignalBlackTile.js) (WidgetActivation)

Alternate design of **SignalTile**.

```
SignalBlackTile(pill: TileType, vehicle: VehicleObject) => WidgetActivateFunction
```

## [**SignalPills**](https://playground-plugins.netlify.app/reusable/SignalPills.js) (WidgetActivation)

Shows the current value of multiple VSS APIs as stacked pills. Up to 3 APIs work best.

```
SignalPills(pills: TileType[], vehicle: VehicleObject) => WidgetActivateFunction
```

## [**StatusTable**](https://playground-plugins.netlify.app/reusable/StatusTable.js) (WidgetActivation)

Shows the current value of multiple VSS APIs in a table. This table can fit any number of APIs.

```
StatusTable({
    apis: string[],
    vehicle: VehicleObject,
    refresh = 5 * 1000
}) => WidgetActivateFunction
```

## [**SignalWithMedia**](https://playground-plugins.netlify.app/reusable/SignalWithMedia.js) (WidgetActivation)

Shows the associated media for a VSS APIs value in a widget. For example:

```
SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
    [true]: {
        type: "video",
        url: "https://digitalauto-media-data.netlify.app/DoorOpen720x360.mp4"
    },
    [false]: {
        type: "image",
        url: "https://digitalauto-media-data.netlify.app/WhiteHoodClosed1080x540.png"
    },
}, vehicle)
```

This widget will switch to the first video when the value of `Vehicle.Cabin.Door.Row1.Left.IsOpen` is `true`, and the second image when it's `false`.

Values can be of any type, and you can add any number of values.

```
type SignalValueImages = {
    [value: string]: {
        type: "image" | "video",
        url: string
    }
}

SignalWithMedia(
    vssSignal: string,
    valueMedia: SignalValueImages,
    vehicle: VehicleObject
) => WidgetActivateFunction
```

## [**LineChart**](https://playground-plugins.netlify.app/reusable/LineChart.js) (WidgetActivation)

Shows a line chart with the current values of one or more VSS signals (each with their own line), along with their trend as the value changes.

You can use the optional color key to set a different color for each line.

```
type SignalsType = {
    signal: string
    color?: string
}[]

LineChart(signals: SignalsType, vehicle: VehicleObject, refreshTime = 800) => WidgetActivateFunction
```

## [**loadScript**](https://playground-plugins.netlify.app/reusable/loadScript.js) (Function)

Loads a JS script in a window, returns a promise that resolves once the script has finished loading.

To use this plugin, `box.window` needs to be passed as the first parameter.

Like:

```
(box) => {
    loadScript(box.window, "https://domain.com/js_file.js")
}
```

```
loadScript(boxWindow: Window, url: string) => Promise<void>
```

## [**GoogleMapsFromSignal**](https://playground-plugins.netlify.app/reusable/GoogleMapsFromSignal.js) (WidgetActivation) 

```
type Coordinate = {
    lat: number
    lng: number
}

GoogleMapsFromSignal(
    directions: [Coordinate, Coordinate],
    vehicle: VehicleObject,
    options?: {
        iterate: boolean = false,
        autoNext: number = 800,
    }
)
```