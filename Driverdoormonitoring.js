import MobileNotifications from "./reusable/MobileNotifications.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"
import SignalPills from "./reusable/SignalPills.js"
import SignalTile from "./reusable/SignalTile.js"
import SignalWithMedia from "./reusable/SignalWithMedia.js"

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

 

 widgets.register(
        "leftdooropen",
        SignalWithMedia("Vehicle.Trailer.CargoSpace.Door.Left.IsOpen", {
            [true]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerleftdooropen.jpg"
            },
            [false]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerleftdoorclosed.jpg"
            },
        }, vehicle)
    )
 widgets.register(
        "rightdooropen",
        SignalWithMedia("Vehicle.Trailer.CargoSpace.Door.Right.IsOpenn", {
            [true]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerrightdooropen.jpg"
            },
            [false]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerrightdoorclosed.jpg"
            },
        }, vehicle)
    )
  
  widgets.register("Doorleftopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen"
    }, vehicle))
  widgets.register("Doorrightopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Right.IsOpenn"
    }, vehicle))
 
let mobileNotifications = null;
      widgets.register("Mobile", (box) => {
            ({printNotification: mobileNotifications} = MobileNotifications({
                  apis : null,
                  vehicle: null,
                  box: box,
                  refresh: null,
            paddingTop: 70,
            paddingHorizontal: 25
            }))
      });
return {
        notifyPhone: (message) => {
            if (mobileNotifications !== null) {
                mobileNotifications(message)
            }
        },
    }
  
  widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const [LeftDoor, RightDoor] = [
                await vehicle.Trailer.CargoSpace.Door.Left.isOpen.get(),
                await vehicle.Trailer.CargoSpace.Door.Right.IsOpenn.get()
            ]
            let message = ""
            if (LeftDoor == true) {
                message += "\nThe CargoSpace Left Door is open\n\n"
            }
            if (RightDoor == true) {
                message += "The CargoSpace Right Door is open"
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
