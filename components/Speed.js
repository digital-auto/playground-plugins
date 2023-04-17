import LineChart from "../reusable/LineChart.js"

const SpeedPlugin = ({widgets, vehicle}) => {
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
    )}

export default SpeedPlugin
