import StatusTable from "./StatusTable.js"

const plugin = ({widgets, simulator, vehicle}) => {
    widgets.register("Table", StatusTable({
        apis: ["Vehicle.Speed", "Vehicle.Cabin.InstrumentPanel.Status"],
        vehicle,
        refresh: 300
    }))
}

export default plugin