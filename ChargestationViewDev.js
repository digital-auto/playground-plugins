import loadScript from "./reusable/loadScript.js"
import StatusTable from "./reusable/StatusTable.js"

const plugin = ({simulator, widgets, modelObjectCreator}) => {
    const chargestation = modelObjectCreator("Chargestation")

    // Get the query string value of "chargestationId" with URLSearchParams
    const params = new URLSearchParams(window.location.search)
    const chargestationId = params.get('chargestationId') ?? 1

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
        const response = await fetch(`https://fleetsim.onrender.com/chargestation/${chargestationId}`)
        const fleetJson = await response.json()
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal].value
        }
    }

    const firstLoadChargestation = updateChargestation()

    // Register a widget that renders a map with a marker with the chargestation's location
    widgets.register("ChargestationMap", (box) => {
        loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=AIzaSyC3LEcjTvyxYu1urM8qrGtZc_a5eNlPdW0`).then(async () => {
            await firstLoadChargestation
            const container = document.createElement("div")
            container.setAttribute("style", `display:flex; height: 100%; width: 100%;`)
            box.injectNode(container)
    
            const map = new box.window.google.maps.Map(container, {
                zoom: 15,
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

	widgets.register("ChargestationStatus", StatusTable({
		apis: [
            "Chargestation.ID",
            "Chargestation.MaxCurrent",
            "Chargestation.MaxVoltage",
            "Chargestation.ChargingVehicleID",
        ],
		vehicle: chargestation,
		refresh: 500
	}))

    widgets.register("ChargestationImage", box => {
        box.window.document.body.innerHTML = `<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FChargestation.png?alt=media&token=8e3f6cb4-d327-466c-94b0-7fdd450e3a4f" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: block;"/>`

        const div = document.createElement("div")
        div.style = "display: flex;height: 100%; position: absolute; top: 10px; right: 10px;"

        const a0 = document.createElement("a")
        a0.target = "_blank"
        a0.href = "/model/CDLEDoVfJpzfw8jOJQUu/library/prototype/52MsI5jc0V1Mt4ogd9ab/view/run"
        a0.style.textDecoration = "none"
        a0.innerHTML = `<div style="margin-left: 10px; display: flex;color: #718096;background-color: #fff;z-index: 10;border-radius: 0.25rem;padding: 0.375rem 0.75rem;user-select: none;align-items: center;cursor: pointer;box-shadow: rgb(0 0 0 / 16%) 0px 1px 4px;width: fit-content;font-family: sans-serif;letter-spacing: 0.5px;">
        <div style="font-size: 0.875rem; font-weight: 500;">Truck Fleet View</div>
        </div>`
        div.appendChild(a0)

        const a1 = document.createElement("a")
        a1.target = "_blank"
        a1.href = "/model/goWywBM5VPnC3voJycT7/library/prototype/PYFCFEWOELGHMjgGq5Wb/view/run"
        a1.style.textDecoration = "none"
        a1.innerHTML = `<div style="margin-left: 10px; display: flex;color: #718096;background-color: #fff;z-index: 10;border-radius: 0.25rem;padding: 0.375rem 0.75rem;user-select: none;align-items: center;cursor: pointer;box-shadow: rgb(0 0 0 / 16%) 0px 1px 4px;width: fit-content;font-family: sans-serif;letter-spacing: 0.5px;">
        <div style="font-size: 0.875rem; font-weight: 500;">Vehicle Fleet View</div>
        </div>`
        div.appendChild(a1)

        box.window.document.body.appendChild(div)
    })

    widgets.register("ConnectedStatus", (box) => {
        const div = document.createElement("div")
        div.style = "display: flex;height: 100%;width: 100%;"

        div.innerHTML = `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
        }    
        </style>
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 30px 40px; justify-content: center; color: #808080; user-select: none; background-color: #f7f7f7;">
            <div style="display: flex; align-items:center; justify-content: center; margin-bottom: 30px;">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="5em" width="5em" xmlns="http://www.w3.org/2000/svg"><path d="M336 448H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h320c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm208-320V80c0-8.84-7.16-16-16-16s-16 7.16-16 16v48h-32V80c0-8.84-7.16-16-16-16s-16 7.16-16 16v48h-16c-8.84 0-16 7.16-16 16v32c0 35.76 23.62 65.69 56 75.93v118.49c0 13.95-9.5 26.92-23.26 29.19C431.22 402.5 416 388.99 416 372v-28c0-48.6-39.4-88-88-88h-8V64c0-35.35-28.65-64-64-64H96C60.65 0 32 28.65 32 64v352h288V304h8c22.09 0 40 17.91 40 40v24.61c0 39.67 28.92 75.16 68.41 79.01C481.71 452.05 520 416.41 520 372V251.93c32.38-10.24 56-40.17 56-75.93v-32c0-8.84-7.16-16-16-16h-16zm-283.91 47.76l-93.7 139c-2.2 3.33-6.21 5.24-10.39 5.24-7.67 0-13.47-6.28-11.67-12.92L167.35 224H108c-7.25 0-12.85-5.59-11.89-11.89l16-107C112.9 99.9 117.98 96 124 96h68c7.88 0 13.62 6.54 11.6 13.21L192 160h57.7c9.24 0 15.01 8.78 10.39 15.76z"></path></svg>
            </div>
            <div style="font-size: .8em; line-height: 1.5em;">
                <div data-cell="Status"><strong>Status: </strong><span>Not connected</span></div>
            </div>
        </div>
        `

        box.injectNode(div)
    })


}

export default plugin