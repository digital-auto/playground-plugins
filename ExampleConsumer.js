import SignalWithMedia from "./reusable/SignalWithMedia.js"
import SignalPills from "./reusable/SignalPills.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import SignalSquare from "./reusable/SignalSquare.js"

const plugin = ({widgets, vehicle, simulator}) => {
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
                    icon: `location-dot`
                },
                {
                    signal: "Vehicle.CurrentLocation.Longitude",
                    icon: `location-dot`
                },
                {
                    signal: "Vehicle.Speed",
                    icon: `gauge`
                }
            ],
            vehicle
        )
    )

    widgets.register(
        "SignalSquareConsumer",
        SignalSquare(
            {
                signal: "Vehicle.Speed",
                icon: `gauge`
            },
            vehicle
        )
    )

    widgets.register(
        "GoogleMapsSignalConsumer",
        GoogleMapsFromSignal(
            [
                {
                    "lat": 48.149497,
                    "lng": 11.523194
                },
                {
                    "lat": 50.445168,
                    "lng": 11.020569
                },
            ],
            vehicle
        )
    )

}

export default plugin