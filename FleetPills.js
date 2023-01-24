import SignalPills from "./reusable/SignalPills.js"
import SignalTile from "./reusable/SignalTile.js"
import LineChart from "./reusable/LineChart.js"

const plugin = ({ widgets, simulator, modelObjectCreator }) => {
    const fleet = modelObjectCreator("Fleet")

    const NumberOfMovingVehiclesTile = {
        signal: "Fleet.NumberOfMovingVehicles",
        label: "NumberOfMovingVehicles",
        icon: "route",
    }

    const NumberOfChargingVehiclesTile = {
        signal: "Fleet.NumberOfChargingVehicles",
        label: "NumberOfChargingVehicles",
        icon: "charging-station",
    }

    widgets.register(
        "VehicleActions",
        SignalPills(
            [
                NumberOfMovingVehiclesTile,
                NumberOfChargingVehiclesTile,
            ],
            fleet
        )
    )

    const AverageSpeedTile = {
        signal: "Fleet.AverageSpeed",
        label: "AverageSpeed",
        icon: "gauge-high",
    }

    widgets.register(
        "AverageSpeed",
        SignalTile(
            AverageSpeedTile,
            fleet
        )
    )

    widgets.register(
        "AverageSpeedChart",
        LineChart(
            [
                AverageSpeedTile
            ],
            fleet,
            5000
        ),
    )

    widgets.register(
        "NumberOfVehiclesChart",
        LineChart(
            [
                NumberOfMovingVehiclesTile,
                NumberOfChargingVehiclesTile
            ],
            fleet,
            5000
        )
    )
    
    // Here's an object that stores the current value of each signal (initialized with the value of 0)
    
    const currentSignalValues = {
        "Fleet.NumberOfMovingVehicles": 0,
        "Fleet.NumberOfChargingVehicles": 0,
        "Fleet.NumberOfParkingVehicles": 0,
        "Fleet.NumberOfQueuedVehicles": 0,
        "Fleet.AverageSpeed": 0,
    }

    // Simulators for each signal, that return the current value of the signal
    for (const signal in currentSignalValues) {
		simulator(signal, "get", async () => {
			return currentSignalValues[signal]
		})
    }
    

    const updateFleet = async () => {
        const response = await fetch("https://fleetsim.onrender.com/fleet")
        const fleetJson = await response.json()
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal].value
        }
    }

    // Every 5 sec, Fetch from https://evfleetsim.onrender.com/fleet a json object (has the same keys as currentSignalValues), and update currentSignalValues
    setInterval(() => {
        updateFleet()
    }, 5000)

    updateFleet()
}

export default plugin