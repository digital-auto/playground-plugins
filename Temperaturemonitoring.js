import MobileNotifications from "./reusable/MobileNotifications.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"
const Temperaturemonitoring = ({widgets, vehicle}) => {
  
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

  widgets.register("TemperatureMonitoringRow1", LineChart([
       {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row1.Temperature",
                    suffix: " C",
                    color: "yellow"
                },
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row1.Wheel.Left.Brake.Temperature",
                    suffix: " C",
                    color: "#a21caf"
                },
                
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row1.Wheel.Right.Brake.Temperature",
                    suffix: " C",
                    color: "#14b8a6"
                }
    ], vehicle))
  
  widgets.register("TemperatureMonitoringRow2", LineChart([
        {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row2.Temperature",
                    suffix: " C",
                    color: "yellow"
                },
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row2.Wheel.Left.Brake.Temperature",
                    suffix: " C",
                    color: "#a21caf"
                },
                
                {
                    signal: "Vehicle.Trailer.Chassis.Axle.Row2.Wheel.Right.Brake.Temperature",
                    suffix: " C",
                    color: "#14b8a6"
                }
    ], vehicle))
  
  widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const [Frontbrake, Rearbrake] = [
              await vehicle.Trailer.Chassis.Axle.Row1.Temperature.get(),
              await vehicle.Trailer.Chassis.Axle.Row2.Temperature.get()
            ]
            let message = ""
            if (Frontbrake >=21) {
                message += "\nTemperature of front brake exceeding threshold 21C!\n\n"
            }
            if (Rearbrake >= 21) {
                message += "Temperature of rear brake exceeding threshold 21C!"
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

export default Temperaturemonitoring