import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import MobileNotifications from "./reusable/MobileNotifications.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"

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


const plugin = ({widgets, simulator, vehicle}) => {
  
    fetchRowsFromSpreadsheet("1vcrl5yRyMiAdsH1eIakfuHxocnYu6rgs5O-QHxnznj4", "AIzaSyBpMUJezbwUYARDHxFIR0a7h4yxh2v1dwI")
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
	
let index = 0;
let intervalId = null;
fetchRowsFromSpreadsheet("1vcrl5yRyMiAdsH1eIakfuHxocnYu6rgs5O-QHxnznj4", "AIzaSyBpMUJezbwUYARDHxFIR0a7h4yxh2v1dwI")
	.then((data) => {
const VSSdata = data.signal_values;
intervalId = setInterval(() => {
	if (index >= VSSdata.length) {
		clearInterval(intervalId)
	}
	else {
		simulator("Vehicle.CurrentLocation.Latitude", "get", async () => {
			return parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Latitude"] * (180 / Math.PI))
		})
		simulator("Vehicle.CurrentLocation.Longitude", "get", async () => {
			return parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Longitude"] * (180 / Math.PI))
		})
		simulator("Vehicle.Trailer.Chassis.Axle.Row1.Temperature", "get", async () => {
			return parseFloat(VSSdata[index]["Vehicle.Trailer.Chassis.Axle.Row1.Temperature"])
		})
		simulator("Vehicle.Trailer.Chassis.Axle.Row2.Temperature", "get", async () => {
			return parseFloat(VSSdata[index]["Vehicle.Trailer.Chassis.Axle.Row2.Temperature"])
		})
		if(setVehiclePinGlobal !== null) {
			setVehiclePinGlobal({
				lat: parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Latitude"] * (180 / Math.PI)),
				lng: parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Longitude"] * (180 / Math.PI))
			})
						}
		let message = "", mobileMessage = "";
		if (parseFloat(VSSdata[index]["Vehicle.Trailer.Chassis.Axle.Row1.Temperature"]) > 20) {
			message = "Warning: Temperature of front brake exceeding threshold 20C!";
			mobileMessage = message;
		}
		else if (parseFloat(VSSdata[index]["Vehicle.Trailer.Chassis.Axle.Row2.Temperature"]) > 20) {
			message = "Warning: Temperature of Rear brake exceeding threshold 20C!";
			mobileMessage = message;
		}
		else {
			message =  "Temperature for front and rear break is normal";
			mobileMessage = message;
		}
		mobileNotifications(mobileMessage);
		}
}, 1000)
	})
				
	
	
	
  
   let mobileNotifications = null;
	widgets.register("TemperatureWarning", (box) => {
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
		console.log("message",message)
            if (mobileNotifications !== null) {
                mobileNotifications(message)
            }
        },
    }
  
  
}

export default plugin
