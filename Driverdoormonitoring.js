import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import SignalTile from "./reusable/SignalTile.js"
import LineChart from "./reusable/LineChart.js"
import SignalWithMedia from "./reusable/SignalWithMedia.js"
import MobileNotifications from "./reusable/MobileNotifications.js"
import SignalPills from "./reusable/SignalPills.js"

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

const plugin = ({widgets, vehicle, simulator}) => {
	
    fetchRowsFromSpreadsheet("1Rbal-uM_L3XHsv12QD6u-QwfiQfVNnTIhKTDznE9vnE", "AIzaSyD8WaOWN38h1SynN7Ua0S9T5mSe_UDnUKo")
    .then((rows) => {
        SimulatorPlugins(rows, simulator)
        console.log(rows)
    })
/*    
    widgets.register("Doorleftopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen"
    }, vehicle))
    
    widgets.register("Doorrightopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Right.IsOpenn"
    }, vehicle))
*/	
	
widgets.register(
        "SignalPillsDoor",
        SignalPills(
            [
                {
                    signal: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen",
                    icon: `fa-gauge`
                },
                {
                    signal: "Vehicle.Trailer.CargoSpace.Door.Right.IsOpenn",
                    icon: `fa-gauge`
                }
            ],
            vehicle
        )
    )	
	
 widgets.register("SpeedProximity", LineChart([
       {
                    signal: "Vehicle.Speed",
                    suffix: " Km/hr",
                    color: "yellow"
                },
	 {
                    signal: "Vehicle.Driver.ProximityToVehicle",
                    suffix: " m",
                    color: "#a21caf"
                }
    ], vehicle))	 

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
        SignalWithMedia("Vehicle.Trailer.CargoSpace.Door.Left.isOpen", {
            [true]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerleftdooropen360x360.png"
            },
            [false]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerleftdoorclosed360x360.png"
            },
        }, vehicle, { iterate: true })
    )
  widgets.register(
        "rightdooropen",
        SignalWithMedia("Vehicle.Trailer.CargoSpace.Door.Right.IsOpenn", {
            [true]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerrightdooropen360x360.png"
            },
            [false]: {
                type: "image",
                url: "https://digitalauto-media-data.netlify.app/SmartTrailerrightdoorclosed360x360.png"
            },
        }, vehicle)
     )
  	
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
  let sim_function;
       simulator("Vehicle.Speed", "subscribe", async ({func, args}) => {
		sim_function = args[0]
		console.log("print func", args[0])
	})

   return {
		start_simulation : (time) => {
			sim_intervalId = setInterval(async () => {
				await vehicle.Next.get()
				sim_function()
			}, time)
		}
	}	

}

export default plugin
