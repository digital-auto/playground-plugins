import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js";
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
  
    fetchRowsFromSpreadsheet("1vcrl5yRyMiAdsH1eIakfuHxocnYu6rgs5O-QHxnznj4", PLUGINS_APIKEY)
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
            { iterate: false }
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
	
    let message = "", mobileMessage = "";		
    let sim_intervalId = null;
    const start_sim = (time) => {
        sim_intervalId = setInterval(async () => {
            // let Row1 = await vehicle.Trailer.Chassis.Axle.Row1.Temperature.get();
            // let Row2 = await vehicle.Trailer.Chassis.Axle.Row2.Temperature.get();	

            // if(Row1 > 10) {
            //     message = "Temperature of front brake exceeding threshold 10C!";
            //     mobileMessage = message;
            // }
            // else if (Row2 >10){
            //     message = "Temperature of rear brake exceeding threshold 10C!";
            //     mobileMessage = message;
            // }	
            // else {
            //     message = "";
            //     mobileMessage = message;
            // }
            // mobileNotifications(mobileMessage);
            await vehicle.Next.get()
            sim_function()
        }, time)

        return () => {
            if (sim_intervalId !== null) {
                clearInterval(sim_intervalId)
            }
        } 		

    }
    // start_sim(3000)
  
   let mobileNotifications = null;
	widgets.register("Mobile", (box) => {
		const {printNotification} = MobileNotifications({
			apis : null,
			vehicle: null,
			box: box,
			refresh: null,
			paddingTop: 70,
                	paddingHorizontal: 25
		})
		mobileNotifications = printNotification;
	})
    
    let sim_function;
	simulator("Vehicle.Trailer.Chassis.Axle.Row1.Temperature", "subscribe", async ({func, args}) => {
		sim_function = args[0]
		console.log("print func", args[0])
	})
	
	simulator("Vehicle.Trailer.Chassis.Axle.Row2.Temperature", "subscribe", async ({func, args}) => {
		sim_function = args[0]
		console.log("print func", args[0])
	})

    return {
		start_simulation : start_sim
	}
}

export default plugin
