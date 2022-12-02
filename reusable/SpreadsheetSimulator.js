async function getRowsFromSpreadsheet(spreadsheetId, apiKey) {
    // Fetch the data from the Google Sheets API
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("A1:Z1000")}?key=${apiKey}`
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

}

const plugin = () => {
    getRowsFromSpreadsheet("1geHkSlE6e351LS_bMFGMIUBEOZO-HTb0wOS90X1jAp0", "AIzaSyA1otn2KKfYB3Svdfv30BhgJHPpWjVVrvw")
        .then((rows) => {
            console.log(rows);
        })
}

export default plugin;