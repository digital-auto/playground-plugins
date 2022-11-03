import SignalPills from "./reusable/SignalPills.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import SignalTile from "./reusable/SignalTile.js"
import LineChart from "./reusable/LineChart.js"

const plugin = ({widgets, vehicle, simulator}) => {
    const LatitudeTile = {
        signal: "Vehicle.CurrentLocation.Latitude",
        label: "Latitude",
        icon: "satellite",
    }
    
    const LongitudeTile = {
        signal: "Vehicle.CurrentLocation.Longitude",
        label: "Longitude",
        icon: "satellite"
    }

    const ETATile = {
        signal: "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.ETA",
        label: "ETA",
        icon: "flag-checkered",
        suffix: "s"
    }

    widgets.register(
        "LatitudeTile",
        SignalTile(
            LatitudeTile,
            vehicle
        )
    )

    widgets.register(
        "LongitudeTile",
        SignalTile(
            LongitudeTile,
            vehicle
        )
    )

    widgets.register(
        "ETATile",
        SignalTile(
            ETATile,
            vehicle
        )
    )

    widgets.register(
        "LatLongPills",
        SignalPills(
            [
                LatitudeTile,
                LongitudeTile,
            ],
            vehicle
        )
    )

    widgets.register(
        "SignalPills",
        SignalPills(
            [
                LatitudeTile,
                LongitudeTile,
                ETATile,
            ],
            vehicle
        )
    )

    widgets.register(
        "SpeedLineChart",
        LineChart(
            [
                {
                    signal: "Vehicle.Speed",
                    suffix: " km/h"
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
                    signal: "Vehicle.Trailer.Chassis.Axle.Row1.Temperature",
                    suffix: " C"
                },
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row2.Temperature",
                    suffix: " C"
                },
                
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row2.Wheel.Left.Brake.Temperature",
                    suffix: " C"
                },
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row2.Wheel.Right.Brake.Temperature",
                    suffix: " C"
                },
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row1.Wheel.Left.Brake.Temperature",
                    suffix: " C"
                },
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row1.Wheel.Right.Brake.Temperature",
                    suffix: " C"
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
