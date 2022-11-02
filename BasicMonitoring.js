import SignalWithMedia from "./reusable/SignalWithMedia.js"
import SignalPills from "./reusable/SignalPills.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import SignalTile from "./reusable/SignalTile.js"
import LineChart from "./reusable/LineChart.js"

const plugin = ({widgets, vehicle, simulator}) => {
    widgets.register(
        "LatitudeTile",
        SignalTile(
            {
                signal: "Vehicle.CurrentLocation.Latitude",
                label: "Latitude",
                icon: "satellite"
            },
            vehicle
        )
    )

    widgets.register(
        "LongitudeTile",
        SignalTile(
            {
                signal: "Vehicle.CurrentLocation.Longitude",
                label: "Longitude",
                icon: "satellite"
            },
            vehicle
        )
    )

    widgets.register(
        "ETATile",
        SignalTile(
            {
                signal: "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.ETA",
                label: "ETA",
                icon: "flag-checkered"
            },
            vehicle
        )
    )

    widgets.register(
        "SpeedLineChart",
        LineChart(
            [
                {
                    signal: "Vehicle.Speed"
                }
            ],
            vehicle
        )
    )

    widgets.register(
        "TemperatureLineCharts",
        LineChart(
            [
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row1.Temperature"
                },
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row2.Temperature"
                },
            ],
            vehicle
        )
    )

    widgets.register(
        "GoogleMapDirections",
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