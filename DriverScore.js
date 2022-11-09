import MobileNotifications from "./reusable/MobileNotifications.js"
import SignalTile from "./reusable/SignalTile.js"

const DriveScore = ({widgets, vehicle}) => {
    widgets.register("DriveTimeExceededTile", SignalTile("Driver.DriveTimeExceeded", vehicle))

    widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const [timeExceeded, currentFuelEconomy] = [
                await vehicle.Driver.DriveTimeExceeded.get(),
                await vehicle.Powertrain.FuelSystem.CurrentFuelEconomy.get()
            ]
            let message = ""
            if (timeExceeded) {
                message += "Drive Time Exceeded!\n"
            }
            if (currentFuelEconomy < 50) {
                message += "WARNING: CurrentFuelEconomy below 50%!\nEF"
            }
            printNotification(message)
        }, 300)
        
        return ( ) => {
            clearInterval(intervalId)
        }
    })
}

export default DriveScore