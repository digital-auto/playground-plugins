import SignalWithMedia from "./SignalWithImage.js"
import SignalPills from "./SignalPills.js"
import GoogleMapsFromSignal from "./GoogleMapsFromSignal.js"
import SimulatorPlugins from "./SimulatorPlugins.js"

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
        "LightDome",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/LightDomeOn.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/LightDomeOn.mp4"
            },
        }, vehicle)
    )

    widgets.register(
        "SeatUpDown",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatUp.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatDown.mp4"
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
