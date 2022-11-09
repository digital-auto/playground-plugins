import MobileNotifications from "./reusable/MobileNotifications.js"

const DriveScore = ({widgets, vehicle}) => {
    widgets.register("MobileNotifications", (box) => {
        const {printNotifications} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            console.log(await vehicle.Driver.DriveTimeExceeded())
            if (await vehicle.Driver.DriveTimeExceeded()) {
                printNotifications("Drive Time Exceeded!")
            }
        }, 300)
        
        return ( ) => {
            clearInterval(intervalId)
        }
    })
}

export default DriveScore