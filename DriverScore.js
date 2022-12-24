import MobileNotifications from "./reusable/MobileNotifications.js"
import SignalTile from "./reusable/SignalTile.js"
import SignalPills from "./reusable/SignalPills.js"
import LineChart from "./reusable/LineChart.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import SimulatorPlugins from "./reusable/SimulatorPlugins.js"


async function fetchRowsFromSpreadsheet(spreadsheetId) {
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

const DriveScore = ({widgets, vehicle, simulator}) => {
	
    fetchRowsFromSpreadsheet("1Iy5a86yfHYhB9YnZfpvmCDnk_Dl9s8X1MSARn0z_KSg", "AIzaSyCLK8gHYnwpeZy1HA-1hoWZ7LubajwXrmg")
    .then((rows) => {
        SimulatorPlugins(rows, simulator)
        console.log(rows)
    });{
        
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

    widgets.register("DriveTimeExceededTile", SignalTile({
        signal: "Vehicle.Driver.DriveTimeExceeded"
    }, vehicle))

    widgets.register("AccumulatedConsumptionLineChart", LineChart([
        {
            signal: "Vehicle.Driver.DriveTimeExceeded"
        }
    ], vehicle))
    
    widgets.register("AccumulatedDriveTime", LineChart([
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime"
        }
    ], vehicle))
    
    widgets.register("AllowedDriveTime", LineChart([
        {
            signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime"
        }
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
    
    
    
    
    widgets.register(
        "driverscoreLineCharts",
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

    widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const [timeExceeded, currentFuelEconomy] = [
                await vehicle.Driver.DriveTimeExceeded.get(),
                await vehicle.Powertrain.FuelSystem.CurrentFuelEconomy.get()
            ]
            let message = ""
            if (timeExceeded) {
                message += "\nDrive Time Exceeded!\n\n"
            }
            if (currentFuelEconomy < 50) {
                message += "WARNING: CurrentFuelEconomy below 50%!"
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
        return {
        notifyPhone: (message) => {
            if (mobileNotifications !== null) {
                mobileNotifications(message)
            }
        },
    }
        
        
}
}
export default DriveScore
