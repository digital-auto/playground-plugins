import MobileNotifications from "./reusable/MobileNotifications.js"

const DriveScore = ({widgets, vehicle}) => {
    let printNotifications = null
    widgets.register("MobileNotifications", (box) => {
        ({printNotifications} = MobileNotifications({box}))
    })
    useInterval(async () => {
        if (printNotifications === null) {
            return
        }
        if (await vehicle.Driver.DriveTimeExceeded()) {
            printNotifications("Drive Time Exceeded!")
        }
    }, 4000)
}

export default DriveScore