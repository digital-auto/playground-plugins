import SignalTile from "../reusable/SignalTile.js";

const ETAPlugin = ({widgets, vehicle}) => {
    const ETATile = {
        signal: "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.ETA",
        label: "ETA",
        icon: "flag-checkered",
        suffix: "s"
    }

    widgets.register(
        "ETATile",
        SignalTile(
            ETATile,
            vehicle
        )
    )
}

export default ETAPlugin;
