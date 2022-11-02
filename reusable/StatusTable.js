import DataTableHTML from "./DataTableHTML.js"

const StatusTable = ({apis, vehicle, refresh = 5 * 1000}) => {
    return (box) => {
        const div = document.createElement("div")
        div.style = "display: flex;height: 100%;width: 100%;"
        div.innerHTML = DataTableHTML({
            headers: ["VSS API", "Value"],
            rows: apis.map(api => ({
                htmlAttributes: `data-api="${api}"`,
                cells: {
                    "VSS API": api,
                    "Value": ""
                }
            }))
        })
        box.injectNode(div)
        
        const updateTable = async () => {
            for (const api of apis) {
                const stripped = api.split(".").slice(1).join(".")
                const val = await vehicle[stripped].get()
                div.querySelector(`tbody > [data-api="${api}"] > td:nth-child(2)`).textContent = val
            }
        }

        updateTable()

        if (refresh !== null) {
            if (typeof refresh !== "number") {
                throw new Error("parameter 'refresh' must be an error")
            }
            const intervalId = setInterval(updateTable, refresh)
            return () => clearInterval(intervalId)
        }

    }

};
  
export default StatusTable
