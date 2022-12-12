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

  widgets.register("DriverProximityToVehicle", LineChart([
       {
                    signal: "Vehicle.Driver.ProximityToVehicle",
                    suffix: " C",
                    color: "yellow"
                }
    ], vehicle))
  
  widgets.register("Doorleftopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen"
    }, vehicle))
 widgets.register("Doorrightopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Right.isOpen"
    }, vehicle))
  
  widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const drivervehicledistance = await vehicle.Vehicle.Driver.ProximityToVehicle.get()
            let message = ""
            if (drivervehicledistance < 2) {
                message += "\nSafe driver vehicle distance\n\n"
            }
            if (drivervehicledistance > 2) {
                message += "Driver vehicle distance exceed the safe distance"
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

export default Driverdoormonitoring
