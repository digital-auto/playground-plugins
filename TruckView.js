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

    // Get the query string value of "truckId" with URLSearchParams
    const params = new URLSearchParams(window.location.search)
    const truckId = params.get('truckId')

    if (!truckId) {
        // Fetch vehicle coordinates from API and link to the first vehicle
        fetch('https://fleetsim.onrender.com/vehicle/all/coordinates')
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
        if (!truckId) {
            return
        }
        const response = await fetch(`https://fleetsim.onrender.com/vehicle/${truckId}`)
        const fleetJson = await response.json()
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal].value
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
    widgets.register("TruckMap", (box) => {
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
            {
                icon: "https://maps.google.com/mapfiles/ms/icons/truck.png"
            }
        )(box)
    })

    widgets.register("TruckImage", box => {
        box.window.document.body.innerHTML = `<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fschweres_nutzfahrzeug_schra%CC%88gansicht_(links)_iridium__kein_hintergrund.png?alt=media&token=a5a04bce-05c7-4941-9849-393c7944894c" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: block;"/>`
        
        const a = document.createElement("a")
        a.target = "_blank"
        a.href = "/model/CDLEDoVfJpzfw8jOJQUu/library/prototype/52MsI5jc0V1Mt4ogd9ab/view/run"
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
        5000
    ))

}

export default plugin