import loadScript from "./reusable/loadScript.js"
import StatusTable from "./reusable/StatusTable.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"

const plugin = ({simulator, widgets, modelObjectCreator}) => {
    const vehicle = modelObjectCreator("Vehicle")

    // Get the query string value of "vehicleId" with URLSearchParams
    const params = new URLSearchParams(window.location.search)
    const vehicleId = params.get('vehicleId') ?? 1

    const currentSignalValues = {
        "Vehicle.VehicleIdentification.VIN": 0,
        "Vehicle.Speed": 0,
        "Vehicle.CurrentLocation.Latitude": 0,
        "Vehicle.CurrentLocation.Longitude": 0,
        "Vehicle.Powertrain.TractionBattery.NetCapacity": 0,
        "Vehicle.Powertrain.TractionBattery.Charging.ChargeLimit": 0,
        "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current": 0,
        "Vehicle.Powertrain.TractionBattery.Range": 0,
        "Vehicle.Powertrain.TractionBattery.Charging.IsCharging": false,
        "Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete": 0,
        "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Latitude": 0,
        "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Longitude": 0

    }

    // Simulators for each signal, that return the current value of the signal
    for (const signal in currentSignalValues) {
        simulator(signal, "get", async () => {
            return currentSignalValues[signal]
        })
    }
    
    

    const updateVehicle = async () => {
        if (!vehicleId) {
            return
        }
        const response = await fetch(`https://evfleetsim.onrender.com/vehicle/${vehicleId}`)
        const fleetJson = await response.json()
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal]
        }
    }

    const firstLoadVehicle = updateVehicle()
    firstLoadVehicle.then(() => {
        GoogleMapsFromSignal([
            
        ], vehicle)    
    })

    // Register a widget that renders a map with a marker with the chargestation's location

	widgets.register("VehicleStatus", (box) => {
        StatusTable({
            apis: [
                "Chargestation.ID",
                "Chargestation.MaxCurrent",
                "Chargestation.MaxVoltage",
                "Chargestation.ChargingVehicleID",
            ],
            vehicle: chargestation,
            refresh: 4000
        })
    })


}

export default plugin