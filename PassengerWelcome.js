import SignalWithMedia from "./reusable/SignalWithMedia.js"
import SignalPills from "./reusable/SignalPills.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"

const plugin = ({widgets, vehicle, simulator}) => {
    widgets.register(
        "LightDome",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/BatrayDomeLightOn720x360.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/BatrayDomeLightOff720x360.mp4"
            },
        }, vehicle)
    )

    widgets.register(
        "SeatUpDown",
        SignalWithMedia("Vehicle.Cabin.Seat.Row1.Pos1.Height", {
            [0]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatGoDown720x360.mp4"
            },
            [100]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatGoUp720x360.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "LeftDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row2.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen720x360.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose720x360.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "MirrorTilt",
        SignalWithMedia("Vehicle.Body.Mirrors.Left.Tilt", {
            [0]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/MirrorsOpening720x360.mp4"
            },
            [100]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/MirrorsClose720x360.mp4"
            },
        }, vehicle)
    )

    widgets.register(
        "SeatEngaged",
        SignalWithMedia("Vehicle.Cabin.Seat.Row2.Pos1.Switch.Seating.IsForwardEngaged", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatGoToFront720x360.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatGoToRear720x360.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "Tilt",
        SignalWithMedia("Vehicle.Cabin.Seat.Row2.Pos1.Tilt", {
            [0]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatRotationFront720x360.mp4"
            },
            [100]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatRotationBack720x360.mp44"
            },
        }, vehicle)
    )
    
    widgets.register(
        "AmbientLight",
        SignalWithMedia("Vehicle.Cabin.Lights.AmbientLight", {
            [0]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/Ambience720x360.mp4"
            },
            [100]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/Ambience720x360.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "SignalPillsConsumer",
        SignalPills(
            [
                {
                    signal: "Vehicle.CurrentLocation.Latitude",
                    icon: `fa-gauge`
                },
                {
                    signal: "Vehicle.CurrentLocation.Longitude",
                    icon: `fa-gauge`
                },
                {
                    signal: "Vehicle.Speed",
                    icon: `fa-gauge`
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
            vehicle,
            { iterate: true }
        )
    )

}

export default plugin
