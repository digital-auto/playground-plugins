import SignalWithMedia from "./reusable/SignalWithMediaDev.js"
import SignalPills from "./reusable/SignalPills.js"

const plugin = ({widgets, vehicle, simulator}) => {
    widgets.register(
        "LightDome",
        SignalWithMedia("Vehicle.Cabin.Lights.IsDomeOn", {
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
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
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
        SignalWithMedia("Vehicle.Cabin.Seat.Row1.Pos1.Switch.Seating.IsForwardEngaged", {
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
        SignalWithMedia("Vehicle.Cabin.Seat.Row1.Pos1.Tilt", {
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
                    signal: "Vehicle.Cabin.Door.Row1.Left.IsOpen",
                    icon: `fa-gauge`
                },
                {
                    signal: "Vehicle.Cabin.Seat.Row1.Pos1.Height",
                    icon: `fa-gauge`
                }
            ],
            vehicle
        )
    )
}

export default plugin
