import SignalTile from "./reusable/SignalTile.js"
import MobileNotifications from "./reusable/MobileNotifications.js"
import StatusTable from "./reusable/StatusTable.js"

const plugin = ({widgets, simulator, vehicle}) => {

    widgets.register("Signals", StatusTable({
        apis: ["Vehicle.Body.Windshield.Front.Wiping.System.Mode", "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition", "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition", "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping", "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle", "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached", "Vehicle.Body.Raindetection.Intensity"],
        vehicle: vehicle,
        refresh: 1000
    }));

    let mobileNotifications = null;
	widgets.register("Mobile", (box) => {
		MobileNotifications({
			apis : null,
			vehicle: null,
			box: box,
			refresh: null,
			backgroundColor: "rgb(0 80 114)"
		}).then(({printNotification}) => {
			mobileNotifications = printNotification;
		})
	});

    widgets.register("CarImage", (box) => {
        box.injectHTML(`
        <div style="max-width: fit-content; margin: 0 auto; position: relative;">
        <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FE-Car_Full_Vehicle.png?alt=media&token=9c9d4cb4-fee0-42e3-bbb1-7feaa407cc8e" style="height: 100%; width: 100%; object-fit: cover;">
            <div class="smartphone-text" style="position: absolute; color: white; font-family: 'Lato'; width: 100%; top: 0; height: 100%; box-sizing: border-box; padding-top: 25px; padding-right: 12px; padding-left: 12px; padding-bottom: 25px;"></div>
        </div>
        `)
    });

    let simulatorFrame = null;
    widgets.register("Wiper Simulator", (box) => {
        simulatorFrame = document.createElement("div")
        simulatorFrame.style = "width:100%;height:100%"
        simulatorFrame.innerHTML =
            `<iframe id="wiper" src="https://aiotapp.net/wiper/simulator" frameborder="0" style="width:100%;height:100%"></iframe>`
        box.injectNode(simulatorFrame)
    });

    //simulatorFrame.querySelector("#wiper").contentWindow.postMessage("LO", "*")

    const ETATile = {
        signal: "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.ETA",
        label: "ETA",
        icon: "flag-checkered",
        suffix: "s"
    }

    widgets.register(
        "LatitudeTile",
        SignalTile(
            ETATile,
            vehicle
        )
    )

    widgets.register(
        "LatitudeTile",
        SignalTile(
            ETATile,
            vehicle
        )
    )

    widgets.register(
        "LatitudeTile",
        SignalTile(
            ETATile,
            vehicle
        )
    )

}

export default plugin