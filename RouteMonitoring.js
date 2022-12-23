import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import SignalPills from "./reusable/SignalPills.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import SignalTile from "./reusable/SignalTile.js"
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

const plugin = ({widgets, vehicle, simulator}) => {
    const LatitudeTile = {
        signal: "Vehicle.CurrentLocation.Latitude",
        label: "Latitude",
        icon: "satellite",
    }
    
    const LongitudeTile = {
        signal: "Vehicle.CurrentLocation.Longitude",
        label: "Longitude",
        icon: "satellite"
    }

    const ETATile = {
        signal: "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.ETA",
        label: "ETA",
        icon: "flag-checkered",
        suffix: "s"
    }
    

    widgets.register(
        "LatitudeTile",
        SignalTile(
            LatitudeTile,
            vehicle
        )
    )
    
    
    widgets.register(
        "LongitudeTile",
        SignalTile(
            LongitudeTile,
            vehicle
        )
    )

    widgets.register(
        "ETATile",
        SignalTile(
            ETATile,
            vehicle
        )
    )

    widgets.register(
        "LatLongPills",
        SignalPills(
            [
                LatitudeTile,
                LongitudeTile,
            ],
            vehicle
        )
    )

    widgets.register(
        "SignalPills",
        SignalPills(
            [
                LatitudeTile,
                LongitudeTile,
                ETATile,
            ],
            vehicle
        )
    )

    widgets.register(
        "SpeedLineChart",
        LineChart(
            [
                {
                    signal: "Vehicle.Speed",
                    suffix: " km/h"
                }
            ],
            vehicle
        )
    )
	
   
    
     widgets.register("MobileNotifications", (box) => {
        const {printNotification} = MobileNotifications({box})
        const intervalId = setInterval(async () => {
            const [Frontbrake, Rearbrake] = [
                await vehicle.Trailer.Chassis.Axle.Row1.Temperature.get(),
                await vehicle.Trailer.Chassis.Axle.Row2.Temperature.get()
            ]
            let message = ""
            if (Frontbrake > 21) {
                message += "\nTemperature of front brake exceeding threshold 21C!\n\n"
            }
            if (Rearbrake > 21) {
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
    
    let mobileNotifications = null;
	widgets.register("Mobile", (box) => {
		const {printNotification} = MobileNotifications({
			apis : null,
			vehicle: null,
			box: box,
			refresh: null,
			backgroundColor: "rgb(0 80 114)"
		})
		mobileNotifications = printNotification;
	})
}

export default plugin
