import StatusTable from "./reusable/StatusTable.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"

const plugin = ({simulator, widgets, modelObjectCreator}) => {
    const vehicle = modelObjectCreator("Vehicle")

    // Get the query string value of "vehicleId" with URLSearchParams
    const params = new URLSearchParams(window.location.search)
    const vehicleId = params.get('vehicleId')

    if (!vehicleId) {
        // Fetch vehicle coordinates from API and link to the first vehicle
        fetch('https://evfleetsim.onrender.com/fleet/vehicle-coordinates')
        .then(response => response.json())
        .then(vehicleCoordinates => {
            const firstVehicleId = Object.keys(vehicleCoordinates)[0]
            window.location.href = `?truckId=${firstVehicleId}`
        })
    }

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

    // Update the vehicle every 5 seconds
    
    setInterval(updateVehicle, 5000)

    updateVehicle()

	widgets.register("TruckStatus", StatusTable({
        // Filter all Latitiude and Longitude signals
        apis: Object.keys(currentSignalValues).filter(signal => !(signal.includes("Latitude") || signal.includes("Longitude")) ),
        vehicle,
        refresh: 500
    }))


    // Register a widget that renders a map with a marker with the vehicle's location
    // Use the GoogleMapsFromSignal widget, then manually change the directions of the map created by accesing the DOM from box.window
    widgets.register("TruckMap", GoogleMapsFromSignal(
        [
            {
                "lat": 47.93330662389945,
                "lng": 6.8981571326644175
            },
            {
                "lat": 53.08277351361783,
                "lng": 13.195127235586439
            },
        ],
        vehicle,
    ), null, {
        icon: {
            
        },
    })

    widgets.register("TruckImage", box => {
        box.window.document.body.innerHTML = `<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fschweres_nutzfahrzeug_schra%CC%88gansicht_(links)_iridium__kein_hintergrund.png?alt=media&token=a5a04bce-05c7-4941-9849-393c7944894c" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: block;"/>`
    })

    // LineChart widget for StateOfCharge

    const StateOfChargeTile = {
        signal: "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current",
        label: "State of Charge",
        icon: "car-battery",
    }

    widgets.register("TruckChargeLineChart", LineChart(
        [
            StateOfChargeTile
        ],
        vehicle,
        5000
    ))

}

export default plugin