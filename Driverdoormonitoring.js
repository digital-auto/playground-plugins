import MobileNotifications from "./reusable/MobileNotifications.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"
import SignalPills from "./reusable/SignalPills.js"
import SignalTile from "./reusable/SignalTile.js"
const Driverdoormonitoring = ({widgets, vehicle}) => {
 
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
            vehicle,
            { iterate: true }
        )
    )

 
  
  widgets.register("Doorleftopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen"
    }, vehicle))
  widgets.register("Doorrightopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Right.IsOpenn"
    }, vehicle))
  
  widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const [LeftDoor, RightDoor] = [
                await vehicle.Trailer.CargoSpace.Door.Left.isOpen.get(),
                await vehicle.Trailer.CargoSpace.Door.Right.IsOpenn.get()
            ]
            let message = ""
            if (LeftDoor = "false") {
                message += "\nThe CargoSpace Left Door is open\n\n"
            }
            if (RightDoor = "true") {
                message += "The CargoSpace Left Door is open"
            }
            printNotification(message)
        }, 300)

        const iteratorIntervalidId = setInterval(async () => {
            await vehicle.Next.get()
        }, 300)
        
        return ( ) => {
            clearInterval(intervalId)
            clearInterval(iteratorIntervalidId)
        }
    })
}

export default Driverdoormonitoring
