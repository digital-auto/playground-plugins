import StatusTable from "./reusable/StatusTable.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import LineChart from "./reusable/LineChart.js"

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const condBecomesTrue = async (cond, sleep_ms = 1000) => {
    while(!cond()) {
        await sleep(sleep_ms)
    }
}

const plugin = ({simulator, widgets, modelObjectCreator}) => {
    const vehicle = modelObjectCreator("Vehicle")

    // Get the query string value of "vehicleId" with URLSearchParams
    const params = new URLSearchParams(window.location.search)
    const vehicleId = params.get('vehicleId')

    if (!vehicleId) {
        // Fetch vehicle coordinates from API and link to the first vehicle
        fetch('https://fleetsim.onrender.com/vehicle/all/coordinates')
        .then(response => response.json())
        .then(vehicleCoordinates => {
            const firstVehicleId = Object.keys(vehicleCoordinates)[0]
            window.location.href = `?vehicleId=${firstVehicleId}`
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
        "Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude": 0,
        "Vehicle.Cabin.Infotainment.Navigation.OriginSet.Longitude": 0,
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
        const response = await fetch(`https://fleetsim.onrender.com/vehicle/${vehicleId}`)
        const fleetJson = await response.json()
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal].value
        }
    }

    // Update the vehicle every 5 seconds
    
    setInterval(updateVehicle, 1000)

    updateVehicle()

	widgets.register("VehicleStatus", StatusTable({
        // Filter all Latitiude and Longitude signals
        apis: Object.keys(currentSignalValues).filter(signal => !(signal.includes("Latitude") || signal.includes("Longitude")) ),
        vehicle,
        refresh: 500
    }))

    //////////// Test Maps ///////////////
    widgets.register("VehicleMapDev", (box) => {
        condBecomesTrue(() => currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"] !== 0, 1000)
        .then(() => {
            const path = [
                {
                    lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"],
                    lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Longitude"]
                },
                {
                    lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Latitude"],
                    lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Longitude"]
                }
            ]
            const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
            const end = new box.window.google.maps.LatLng(path[1].lat, path[1].lng);        

            setTimeout(() => {
                const directionsService = new box.window.google.maps.DirectionsService();
                directionsService
                .route({
                    origin: start,
                    destination: end,
                    travelMode: "DRIVING"
                })
                .then((response) => {
                    console.log("directionsRenderer", box.window.directionsRenderer.setDirections, response)
                    box.window.directionsRenderer.setDirections(response);
                })
                .catch((e) => console.log("Directions request failed due to " + e));    
            }, 0)
        })

        return GoogleMapsFromSignal(
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
        )(box)
    })
    //////////////// End test Maps ////////////

    // Register a widget that renders a map with a marker with the vehicle's location
    // Use the GoogleMapsFromSignal widget, then manually change the directions of the map created by accesing the DOM from box.window
    widgets.register("VehicleMap", (box) => {
        condBecomesTrue(() => currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"] !== 0, 1000)
        .then(() => {
            const path = [
                {
                    lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"],
                    lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Longitude"]
                },
                {
                    lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Latitude"],
                    lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Longitude"]
                }
            ]
            const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
            const end = new box.window.google.maps.LatLng(path[1].lat, path[1].lng);        

            setTimeout(() => {
                const directionsService = new box.window.google.maps.DirectionsService();
                directionsService
                .route({
                    origin: start,
                    destination: end,
                    travelMode: "DRIVING"
                })
                .then((response) => {
                    console.log("directionsRenderer", box.window.directionsRenderer.setDirections, response)
                    box.window.directionsRenderer.setDirections(response);
                })
                .catch((e) => console.log("Directions request failed due to " + e));    
            }, 0)
        })

        return GoogleMapsFromSignal(
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
        )(box)
    })

    widgets.register("VehicleImage", box => {
        box.window.document.body.innerHTML = `<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FGenericWhiteCar.png?alt=media&token=31babbcd-3920-4044-a1a4-58a07a8df0b1" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: block;"/>`
        
        const a = document.createElement("a")
        a.target = "_blank"
        a.href = "/model/goWywBM5VPnC3voJycT7/library/prototype/PYFCFEWOELGHMjgGq5Wb/view/run"
        a.innerHTML = `<div style="display: flex;color: #718096;background-color: #fff;z-index: 10;border-radius: 0.25rem;padding: 0.375rem 0.75rem;user-select: none;align-items: center;cursor: pointer;box-shadow: rgb(0 0 0 / 16%) 0px 1px 4px;width: fit-content;position: absolute;top: 10px;right: 10px;font-family: sans-serif;letter-spacing: 0.5px;">
        <div style="font-size: 0.875rem; font-weight: 500;">Fleet View</div>
        </div>`
        box.window.document.body.appendChild(a)
    })

    // LineChart widget for StateOfCharge

    const StateOfChargeTile = {
        signal: "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current",
        label: "State of Charge",
        icon: "car-battery",
    }

    widgets.register("StateOfChargeLineChart", LineChart(
        [
            StateOfChargeTile
        ],
        vehicle,
        1000
    ))

}

export default plugin