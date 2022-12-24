import MobileNotifications from "./reusable/MobileNotifications.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"
import SignalPills from "./reusable/SignalPills.js"
import SignalTile from "./reusable/SignalTile.js"
import SignalWithMedia from "./reusable/SignalWithMedia.js"
import SimulatorPlugins from "./reusable/SimulatorPlugins.js"

async function fetchRowsFromSpreadsheet(spreadsheetId, apiKey) {
    // Set the range to A1:Z1000
    const range = "A1:Z1000";

    // Fetch the rows from the Google Spreadsheet API
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${encodeURIComponent(apiKey)}`
    );
    const json = await response.json();
    // Get the headers from the first row
    const headers = json.values[0];
    // Convert the remaining rows to an array of objects
    const rows = json.values.slice(1).map(row => {
        const rowObject = {};
        for (let i = 0; i < row.length; i++) {
            rowObject[headers[i]] = row[i];
        }
        return rowObject;
    });

    return rows;
}


const Driverdoormonitoring = ({widgets, vehicle, simulator}) => {
    
    fetchRowsFromSpreadsheet("1Km_SkY2WW3iiiRFnlf3xMtgs0HjKjdd3Tw6BVh0nsxA", "AIzaSyD8WaOWN38h1SynN7Ua0S9T5mSe_UDnUKo")
    .then((rows) => {
        SimulatorPlugins(rows, simulator)
        console.log(rows)
    })
 
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
    
    const CargoDoorLeft = {
        signal: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen",
        label: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen",
        icon: ""
    }
    
    widgets.register(
      "CargoDoorLeft", 
       SignalTile(
           CargoDoorLeft,
           vehicle
       )
     )
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
        }, 500)
        
        return ( ) => {
            clearInterval(intervalId)
            clearInterval(iteratorIntervalidId)
        }
    })
}

export default Driverdoormonitoring
