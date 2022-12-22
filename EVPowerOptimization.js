import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import StatusTable from "./reusable/StatusTable.js"
import LineChart from "./reusable/LineChart.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"

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
    fetchRowsFromSpreadsheet("13ix5z-_Oa_tB5v11XJqnST0SiCBmPraZVUBbB5QzK9c", "AIzaSyA1otn2KKfYB3Svdfv30BhgJHPpWjVVrvw")
    .then((rows) => {
        SimulatorPlugins(rows, simulator)
        console.log(rows)
    })

    widgets.register("Table",StatusTable({
            apis:["Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "Vehicle.Powertrain.TractionBattery.AccumulatedConsumedEnergy", "Vehicle.Cabin.Infotainment.Media.Action", "Vehicle.Cabin.Lights.LightIntensity",	"Vehicle.TravelledDistance", "Vehicle.CurrentLocation.Longitude","Vehicle.CurrentLocation.Latitude"],
            vehicle: vehicle,
		    refresh: 100         
    }))
	

	widgets.register("Map", (box) => {
		let path = [
			{
				"lat": 48.78021,
				"lng": 9.17732
			},
			{
				"lat": 52.34655,
				"lng": 9.79768
			},
		]
		GoogleMapsPluginApi("AIzaSyCQd4f14bPr1ediLmgEQGK-ZrepsQKQQ6Y", box, path, "BICYCLING").then(({setVehiclePin}) => {
			setVehiclePinGlobal = setVehiclePin
		})
	})
	
    widgets.register("SOCLineCharts", LineChart(
            [
                {
                    signal: "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current",
                    suffix: " C",
                    color: "Black"
                },
	   ],
	   vehicle
	   )
	)
    let sim_function;
       simulator("Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "subscribe", async ({func, args}) => {
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

export default plugin;

