import SignalWithMedia from "./reusable/SignalWithMedia.js"
import SignalPills from "./reusable/SignalPills.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"

const plugin = ({widgets, vehicle, simulator}) => {
    widgets.register(
        "LightDome",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/BatrayDomeLightOn1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/BatrayDomeLightOff1800x900.mp4"
            },
        }, vehicle)
    )

    widgets.register(
        "SeatUpDown",
        SignalWithMedia("Vehicle.Cabin.Seat.Row1.Pos1.Height", {
            [0]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatGoDown1800x900.mp4"
            },
            [100]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/SeatGoUp1800x900.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row2.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
            },
        }, vehicle)
    )
    
    widgets.register(
        "RightDoorOpen",
        SignalWithMedia("Vehicle.Cabin.Door.Row1.Left.IsOpen", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorOpen1800x900.mp4"
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/DoorClose1800x900.mp4"
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
            vehicle,
            { iterate: true }
        )
    )

}

export default plugin
