// Define a promisify function
function promisify(fn) {
    return function () {
        const args = Array.prototype.slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            fn.apply(null, args);
        });
    };
}

// Replace with the ID of your Google Sheets document
const DOCUMENT_ID = 'your-document-id';

async function getRowsAsObjects() {
    // Create a new instance of the Google Spreadsheet client
    const doc = new GoogleSpreadsheet(DOCUMENT_ID);

    // Authenticate with the Google Sheets API
    try {
        await promisify(doc.useServiceAccountAuth)();

        // Get the first sheet in the document
        const sheets = await promisify(doc.getSheets)(1);

        // Get the names of the columns in the sheet
        const headers = await promisify(sheets.getCells)({
            'min-row': 1,
            'max-row': 1,
            'min-col': 1,
            'max-col': sheets.colCount,
        });

        // Get all cells in the sheet, excluding the header row
        const cells = await promisify(sheets.getCells)({
            'min-row': 2,
            'max-row': sheets.rowCount,
            'min-col': 1,
            'max-col': sheets.colCount,
        });

        // Create an array to hold the rows of data
        const rows = [];

        // Iterate over the cells in the sheet and create an object for each row
        let currentRow = 0;
        cells.forEach(cell => {
            // If we have reached a new row, create a new object to hold the data for that row
            if (cell.row !== currentRow) {
                currentRow = cell.row;
                rows.push({});
            }

            // Add the cell value to the object for the current row
            rows[rows.length - 1][headers[cell.col - 1].value] = cell.value;
        });

        return {headers, rows};
    } catch (err) {
        // Handle any errors that occurred
        console.error(err);
    }
}

const plugin = () => {
    getRowsAsObjects()
    .then(r => {
        console.log(r);
    })
}

export default plugin
