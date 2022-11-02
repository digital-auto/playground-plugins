const DataTableHTML = ({
    headers,
    rows,
    colorTheme = {}
}) => {
    colorTheme = Object.assign({
        headerBackground: "#6c7ae0",
        headerText: "white",
        oddCellBackground: "transparent",
        oddCellText: "#808080",
        evenCellBackground: "#f8f6ff",
        evenCellText: "#808080",
    }, colorTheme)
    return `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    * {
        box-sizing: border-box;
    }
    body {
        font-family: 'Lato', sans-serif;
    }
    table {
        display: grid;
        height: fit-content;
        min-height: 100%;
        border-collapse: collapse;
        min-width: 100%;
        grid-template-columns: 
            minmax(80px, 1fr)
            minmax(80px, 1fr)
        ;
        grid-template-rows: min-content auto;
        font-size: inherit;
    }
      
    thead,
    tbody,
    tr {
        display: contents;
    }
      
    th,
    td {
        padding: 1em;
        min-height: fit-content;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: max-content;
    }
      
    th {
        position: sticky;
        top: 0;
        background: ${colorTheme.headerBackground};
        user-select: none;
        text-align: left;
        font-weight: normal;
        font-size: 1.1em;
        color: ${colorTheme.headerText};
        font-weight: bold;
    }
      
    th:last-child {
        border: 0;
    }
    
    td:first-child {
        font-weight: bold;
    }

    td {
        padding-top: .66em;
        padding-bottom: .66em;
        background: ${colorTheme.oddCellBackground};
        color: ${colorTheme.oddCellText};
        height: 100%;
    }
      
    tr:nth-child(even) td {
        background: ${colorTheme.evenCellBackground};
        color: ${colorTheme.evenCellText};
    }

    </style>
        <div style="display: flex !important; height: 100%; width: 100%;">
            <table>
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(({htmlAttributes, cells}) => (`
                        <tr ${htmlAttributes ?? ""}>
                            ${headers.map(header => `<td title="${cells[header]}">${cells[header]}</td>`).join("")}
                        </tr>
                    `)).join("")}
                </tbody>
        </table>
    </div>
    `
}

export default DataTableHTML