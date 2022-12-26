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
	
    fetchRowsFromSpreadsheet("1Km_SkY2WW3iiiRFnlf3xMtgs0HjKjdd3Tw6BVh0nsxA", "AIzaSyD8WaOWN38h1SynN7Ua0S9T5mSe_UDnUKo")
    .then((rows) => {
        SimulatorPlugins(rows, simulator)
        console.log(rows)
    })
    
    widgets.register("Doorleftopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Left.isOpen"
    }, vehicle))
    
    widgets.register("Doorrightopen", SignalTile({
        signal: "Vehicle.Trailer.CargoSpace.Door.Right.IsOpenn"
    }, vehicle))

    widgets.register(
        "Doorleftopen1",
        SignalPills(
            [
                Doorleftopen
            ],
            vehicle
        )
    )	
    
	
    widgets.register(
        "leftdooropen",
        SignalWithMedia("Vehicle.Trailer.CargoSpace.Door.Left.isOpen", {
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
    	

}

export default plugin
