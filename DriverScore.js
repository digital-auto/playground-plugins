import MobileNotifications from "./reusable/MobileNotifications.js"
import SignalTile from "./reusable/SignalTile.js"
import SignalPills from "./reusable/SignalPills.js"
import LineChart from "./reusable/LineChart.js"

const DriveScore = ({widgets, vehicle}) => {
    widgets.register("DriveTimeExceededTile", SignalTile({
        signal: "Vehicle.Driver.DriveTimeExceeded"
    }, vehicle))

    widgets.register("AccumulatedConsumptionLineChart", LineChart([
        {
            signal: "Vehicle.Driver.DriveTimeExceeded"
        }
    ], vehicle))
    
    widgets.register("AccumulatedDriveTime", LineChart([
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime"
        }
    ], vehicle))
    
    widgets.register("AllowedDriveTime", LineChart([
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime"
        }
    ], vehicle))

    widgets.register("CurrentFuelEconomyLineChart", LineChart([
        {
            signal: "Vehicle.Powertrain.FuelSystem.CurrentFuelEconomy"
        }
    ], vehicle))

    widgets.register("AccumulatedConsumptionLineChart", LineChart([
        {
            signal: "Vehicle.Powertrain.FuelSystem.AccumulatedConsumption"
        }
    ], vehicle))
    
    widgets.register(
        "driverscoreLineCharts",
        LineChart(
            [
                {
                    signal: "Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime",
                    suffix: " C",
                    color: "yellow"
                },
                {
                    signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime",
                    suffix: " C",
                    color: "#a21caf"
                }
            ],
            vehicle
        )
    )

    widgets.register("DriverCard", SignalPills([
        {
            signal: "Vehicle.Driver.DriverCard.ID",
            label: "ID",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Driver.DriverCard.Name",
            label: "Name",
            icon: "id-card"
        },
    ], vehicle))

    widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const [timeExceeded, currentFuelEconomy] = [
                await vehicle.Driver.DriveTimeExceeded.get(),
                await vehicle.Powertrain.FuelSystem.CurrentFuelEconomy.get()
            ]
            let message = ""
            if (timeExceeded) {
                message += "\nDrive Time Exceeded!\n\n"
            }
            if (currentFuelEconomy < 50) {
                message += "WARNING: CurrentFuelEconomy below 50%!"
            }
            printNotification(message)
        }, 300)

        const iteratorIntervalidId = setInterval(async () => {
            await vehicle.Next.get()
        }, 3000)
        
        return ( ) => {
            clearInterval(intervalId)
            clearInterval(iteratorIntervalidId)
        }
    })
}

export default DriveScore
