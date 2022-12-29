
import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import MobileNotifications from "./reusable/MobileNotifications.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"
import SignalTile from "./reusable/SignalTile.js"
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


const plugin = ({widgets, simulator, vehicle}) => {
  
    fetchRowsFromSpreadsheet("1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE", "AIzaSyA1otn2KKfYB3Svdfv30BhgJHPpWjVVrvw")
    .then((rows) => {
        SimulatorPlugins(rows, simulator)
        console.log(rows)
    })
  
   widgets.register(
        "GoogleMapDirectionsy",
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

	    widgets.register("driveallowedtimee", SignalPills([
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime",
            label: "Accumulated Drive Time",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime",
            label: "Allowed Drive Time",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime",
            label: "Breaks Remaining",
            icon: "fingerprint"
        }
    ], vehicle))
	
    widgets.register("DriverCard", SignalPills([
        {
            signal: "Vehicle.Driver.DriverCard.ID",
            label: "ID",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Driver.DriverCard.Name",
            label: "Name",
            icon: "id-card"
        },
    ], vehicle))
    
	
    widgets.register("CurrentFuelEconomyLineChart", LineChart([
{
    signal: "Vehicle.Chassis.Brake.PedalPosition"
}
], vehicle))

    widgets.register("AccumulatedConsumptionLineChart", LineChart([
        {
            signal: "Vehicle.Powertrain.FuelSystem.AccumulatedConsumption"
        }
    ], vehicle))
    widgets.register("fuelscorebrakescore", SignalPills([
        {
            signal: "Vehicle.Powertrain.FuelSystem.AccumulatedConsumption",
            label: "Fuel Consumption score",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Chassis.Brake.PedalPosition",
            label: "Brake Score",
            icon: "fingerprint"
        },
    ], vehicle))
	
widgets.register("DriverCard", SignalPills([
        {
            signal: "Vehicle.Driver.DriverCard.ID",
            label: "ID",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Driver.DriverCard.Name",
            label: "Name",
            icon: "id-card"
        },
    ], vehicle))
	
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

	
    widgets.register("driveallowedtime", SignalPills([
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime",
            label: "driverscore",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime",
            label: "weeklydriverscore",
            icon: "fingerprint"
        },
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime",
            label: "monthlydriverscore",
            icon: "fingerprint"
        }
    ], vehicle))
	
	
    widgets.register(
        "driverscoreLineChartss",
        LineChart(
            [
                {
                    signal: "Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime",
                    suffix: " C",
                    color: "yellow"
                },
                {
                    signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime",
                    suffix: " C",
                    color: "#a21caf"
                }
            ],
            vehicle
        )
    )
  
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
	
	    simulator("Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime", "get", ({args}) => {
        const [value] = args
        if (value === "greater") {
            simulatorFrame.querySelector("#wiper").contentWindow.postMessage("LO", "*")
        } else if (value === "lesser") {
            simulatorFrame.querySelector("#wiper").contentWindow.postMessage("OFF", "*")
        }
    })

	
	
return {
        notifyPhone: (message) => {
            if (mobileNotifications !== null) {
                mobileNotifications(message)
            }
        },
    }
}

export default plugin
