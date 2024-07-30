import SignalWithMedia from "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/bcw-showcase-2024/SignalWithMedia_PW.js"
// import SignalPills from "./SignalPills_PW.js"
import StatusTable from "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/bcw-showcase-2024/StatusTable.js";

const plugin = ({widgets, vehicle, simulator}) => {
    widgets.register(
        "LightDome",
        SignalWithMedia("Vehicle.Cabin.Lights.IsDomeOn", {
            [true]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/BatrayDomeLightOn720x360.mp4",
                style: `margin: auto; transform: translate(-25%);`
            },
            [false]: {
                type: "video",
                url: "https://digitalauto-media-data.netlify.app/BatrayDomeLightOff720x360.mp4",
                style: `margin: auto; transform: translate(-25%);`
            },
        }, 
        vehicle)
    )

    widgets.register(
        "SeatUpDown",
        SignalWithMedia("Vehicle.Cabin.Seat.Row1.Pos1.Position", {
            [0]: {
                type: "video",
                url: "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FSeatGoForward720x360.mp4?alt=media&token=8ce653bc-23d9-4840-8bd6-f785de555dac"
            },
            [10]: {
                type: "video",
                url: "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FSeatGoForward720x360Reverse.mp4?alt=media&token=8ce653bc-23d9-4840-8bd6-f785de555dac"
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
        "BYODCoffee",
        SignalWithMedia("Vehicle.BYOD.CoffeeMachine.Brew", {
            [true]: {
                type: "video",
                url: "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/bcw-showcase-2024/coffee_machine_02.mp4"
            },
            [false]: {
                type: "video",
                url: "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/bcw-showcase-2024/coffee_machine_empty.mp4"
            },
        }, vehicle)
    )
    widgets.register(
        "BYODAirfreshner",
        SignalWithMedia("Vehicle.BYOD.Airfreshner.Speed", {
            [0]: {
                type: "video",
                url: "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/bcw-showcase-2024/airpurifier_off.mp4"
            },
            [100]: {
                type: "video",
                url: "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/bcw-showcase-2024/airpurifier.mp4"
            },
        }, vehicle)
    )

    
    widgets.register(
        "Table",
        StatusTable({
          apis: [
            "Vehicle.Cabin.Door.Row1.Left.IsOpen",
            "Vehicle.Cabin.Lights.IsDomeOn",
            "Vehicle.Cabin.Seat.Row1.Pos1.Position",
            "Vehicle.BYOD.CoffeeMachine.Brew",
            "Vehicle.BYOD.Airfreshner.Speed"
          ],
          vehicle,
          refresh: 300,
        })
    );
    
    // widgets.register(
    //     "SignalPillsConsumer",
    //     SignalPills(
    //         [
    //             {
    //                 signal: "Vehicle.Cabin.Door.Row1.Left.IsOpen",
    //                 icon: `fa-gauge`
    //             },
    //             {
    //                 signal: "Vehicle.Cabin.Seat.Row1.Pos1.Height",
    //                 icon: `fa-gauge`
    //             }
    //         ],
    //         vehicle
    //     )
    // )
}

export default plugin