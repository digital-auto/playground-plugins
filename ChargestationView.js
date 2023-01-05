import loadScript from "./reusable/loadScript.js"

const plugin = ({simulator, widgets}) => {
    // Get the query string value of "chargestationId" with URLSearchParams
    const params = new URLSearchParams(window.location.search)
    const chargestationId = params.get('chargestationId')

    const currentSignalValues = {
        "Chargestation.ID": chargestationId,
        "Chargestation.MaxCurrent": 0,
        "Chargestation.MaxVoltage": 0,
        "Chargestation.ChargingVehicleID": 0,
        "Chargestation.Location.Latitude": 0,
        "Chargestation.Location.Longitude": 0
    }

    // Simulators for each signal, that return the current value of the signal
    for (const signal in currentSignalValues) {
        simulator(signal, "get", async () => {
            return currentSignalValues[signal]
        })
    }
    

    const updateChargestation = async () => {
        if (!chargestationId) {
            return
        }
        const response = await fetch(`https://evfleetsim.onrender.com/chargestation/${chargestationId}`)
        const fleetJson = await response.json()
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal]
        }
    }

    const firstLoadChargestation = updateChargestation()

    // Register a widget that renders a map with a marker with the chargestation's location
    widgets.register("ChargestationMap", (box) => {
        loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=AIzaSyC3LEcjTvyxYu1urM8qrGtZc_a5eNlPdW0`).then(async () => {
            await firstLoadChargestation
            console.log(currentSignalValues)
            const container = document.createElement("div")
            container.setAttribute("style", `display:flex; height: 100%; width: 100%;`)
            box.injectNode(container)
    
            const map = new box.window.google.maps.Map(container, {
                zoom: 6.3,
                center: {
                    lat: currentSignalValues["Chargestation.Location.Latitude"],
                    lng: currentSignalValues["Chargestation.Location.Longitude"]
                }
            });
    
            const marker = new box.window.google.maps.Marker({
                position: {
                    lat: currentSignalValues["Chargestation.Location.Latitude"],
                    lng: currentSignalValues["Chargestation.Location.Longitude"]
                },
                map: map
            })
        })
        
    })

}

export default plugin