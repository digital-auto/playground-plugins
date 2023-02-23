import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import StatusTable from "./reusable/StatusTable.js"
import LineChart from "./reusable/LineChart.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js"

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

    const loadSpreadSheet = async () => {
        let sheetID = "1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE";
        fetchRowsFromSpreadsheet(sheetID, PLUGINS_APIKEY)
        .then((rows) => {
            SimulatorPlugins(rows, simulator)
        })
    }

    widgets.register("Table",
    StatusTable({
        apis:["Vehicle.PowerOptimizationMode","Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "Vehicle.Powertrain.TractionBattery.AccumulatedConsumedEnergy", "Vehicle.Cabin.Infotainment.Media.Action", "Vehicle.Cabin.Lights.LightIntensity",	"Vehicle.TravelledDistance", "Vehicle.CurrentLocation.Longitude","Vehicle.CurrentLocation.Latitude"],
        vehicle: vehicle,
        refresh: 800         
    })
)

}

export default plugin;