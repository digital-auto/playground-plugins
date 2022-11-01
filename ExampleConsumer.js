import SignalWithMedia from "./reusable/SignalWithMedia"
import SignalPills from "./reusable/SignalPills.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import SimulatorPlugins from "./reusable/SimulatorPlugins.js"

const plugin = ({widgets, vehicle, simulator}) => {
    SimulatorPlugins([
        {
            "Vehicle.CurrentLocation.Latitude": 48.85850429451804,
            "Vehicle.CurrentLocation.Longitude": 9.125898683591739,
            "Vehicle.Speed": 80
        },
        {
            "Vehicle.CurrentLocation.Latitude": 48.969879287383634,
            "Vehicle.CurrentLocation.Longitude": 9.226323054446112,
            "Vehicle.Speed": 50
        },
        {
            "Vehicle.CurrentLocation.Latitude": 49.168188548489255,
            "Vehicle.CurrentLocation.Longitude": 9.25731322438704,
            "Vehicle.Speed": 65
        },
    ], simulator)

    widgets.register(
        "SignalWithMediaConsumer",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "image",
                url: "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FAC_Status_Asset.png?alt=media&token=d1174d6f-df5c-4cdf-b305-698b2264c847"
            },
            [false]: {
                type: "video",
                url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            },
        }, vehicle)
    )

    widgets.register(
        "SignalPillsConsumer",
        SignalPills(
            [
                {
                    signal: "Vehicle.CurrentLocation.Latitude",
                    icon: `<i class="fa-solid fa-gauge"></i>`
                },
                {
                    signal: "Vehicle.CurrentLocation.Longitude",
                    icon: `<i class="fa-solid fa-gauge"></i>`
                },
                {
                    signal: "Vehicle.Speed",
                    icon: `<i class="fa-solid fa-gauge"></i>`
                }
            ],
            vehicle
        )
    )

    widgets.register(
        "GoogleMapsSignalConsumer",
        GoogleMapsFromSignal(
            [
                {
                    "lat": 48.813254159291475,
                    "lng": 9.212379215835714
                },
                {
                    "lat": 49.20261646797924,
                    "lng": 9.189121574828052
                },
            ],
            vehicle
        )
    )

}

export default plugin