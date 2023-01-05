import SimulatorPlugins from "./SimulatorPlugins.js"
import { PLUGINS_APIKEY } from "./apikey.js"

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


const plugin = ({simulator, vehicle}) => {
    fetchRowsFromSpreadsheet("1geHkSlE6e351LS_bMFGMIUBEOZO-HTb0wOS90X1jAp0", PLUGINS_APIKEY)
    .then((rows) => {
        SimulatorPlugins(rows, simulator)
    })
}

export default plugin;