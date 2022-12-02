async function getRowsFromSpreadsheet(spreadsheetId, apiKey) {
    // Fetch the data from the Google Sheets API
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?key=${apiKey}`
    );

    // Convert the response to JSON
    const json = await response.json();

    // Get the headers from the first row of the spreadsheet
    const headers = json.valueRanges[0].values[0];

    // Get the rows from the remaining values in the value range
    const rows = json.valueRanges[0].values.slice(1);

    // Convert the rows into an array of objects, using the headers as keys
    return rows.map((row) =>
        row.reduce((obj, cell, i) => {
            obj[headers[i]] = cell;
            return obj;
        }, {})
    );
}

const plugin = () => {
    getRowsFromSpreadsheet("1geHkSlE6e351LS_bMFGMIUBEOZO-HTb0wOS90X1jAp0", "AIzaSyA1otn2KKfYB3Svdfv30BhgJHPpWjVVrvw")
    .then((rows) => {
        console.log(rows);
    })
}

export default plugin;