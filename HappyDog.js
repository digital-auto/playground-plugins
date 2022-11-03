import SignalPills from "./reusable/SignalPills.js"
import SignalBlackTile from "./reusable/SignalBlackTile.js"
import loadScript from "./reusable/loadScript.js"

const fulfillChariottService = async (body) => {
    const [username, password] = ["bcwdemo", "80jEpKYTPVPi"]
    const response = await fetch("https://bcw.chariottdemo.com:44243/chariott.runtime.v1.ChariottService/Fulfill", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Authorization": 'Basic ' + btoa(username + ":" + password)
        }
    })

    return await response.json()
}

const HappyDog = ({ simulator, widgets, vehicle }) => {
    const IconDiv = document.createElement("div")
    IconDiv.style = "display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #9ca3af;"
    IconDiv.innerHTML = `<i class="fa-solid fa-dog" style="font-size: 6em;  "></i>`

    widgets.register("DogStatus", (box) => {
        loadScript(box.window, "https://kit.fontawesome.com/c37d34b852.js")
        
        box.injectNode(IconDiv)
    })

    widgets.register("DogStream", (box) => {
        const div = document.createElement("div")
        div.style = "width: 100%; height: 100%;"
        div.innerHTML = `<img onerror="this.style.visibility = 'hidden'" onload="this.style.visibility = 'visible'" style='width: 100%; height: 100%; object-fit: cover;'></img>`
        box.injectNode(div)

        const SIGNALS = ["Vehicle.Cabin.HVAC.AmbientAirTemperature", "Vehicle.OBD.HybridBatteryRemaining", "Vehicle.Cabin.HVAC.IsAirConditioningActive"]

        const STATE = {
            status: false,
            signals: Object.fromEntries(SIGNALS.map(signal => ({
                [signal]: null
            })))
        }

        const updateImage = async () => {
            const json = await fulfillChariottService({
                "namespace": "sdv.camera.simulated",
                "intent": {
                    "read": {
                        "key": "camera.12fpm"
                    }
                }
            })
            const imageBytes = json.fulfillment.read.value.blob.bytes

            div.querySelector("img").src = `data:image/png;base64,${imageBytes}`
        }

        const updateCurrentStatus = async () => {
            const json = await fulfillChariottService({
                "namespace": "sdv.kvs",
                "intent": {
                    "read": {
                        "key": "Feature.DogMode.Status"
                    }
                }
            })
            STATE.status = json.fulfillment.read.value.bool
            console.log(STATE.status, STATE.status ? "#059669" : "#ef4444")
            IconDiv.style.color = STATE.status ? "#059669" : "#ef4444"
        }

        const updateAPIs = async () => {
            for (const api of SIGNALS) {
                fulfillChariottService({
                    "namespace": "sdv.vdt",
                    "intent": {
                        "read": {
                            "key": api
                        }
                    }
                }).then(json => {
                    const value = Object.values(json.fulfillment.read.value)[0]
                    STATE.signals[api] = value
                })
            }
        }

        for (const api of SIGNALS) {
            simulator(api, "get", () => {
                return STATE.signals[api]
            })
        }

        const intervalId = setInterval(async () => {
            updateCurrentStatus()
            updateImage()
            updateAPIs()
        }, 5000)

        updateCurrentStatus()
        updateImage()
        updateAPIs()

        return () => {
            clearInterval(intervalId)
        }
    })


    const TemperatureTile = {
        signal: "Vehicle.Cabin.HVAC.AmbientAirTemperature",
        label: "AirTemperature",
        icon: "temperature-half",
        suffix: " °C"
    }

    const BatteryTile = {
        signal: "Vehicle.OBD.HybridBatteryRemaining",
        label: "BatteryRemaining",
        icon: "battery-half",
        suffix: "%"
    }

    const AirConditioningTile = {
        signal: "Vehicle.Cabin.HVAC.IsAirConditioningActive",
        label: "IsAirConditioningActive",
        icon: "wind"
    }

    widgets.register("TemperatureTile", SignalBlackTile(TemperatureTile, vehicle))
    widgets.register("BatteryTile", SignalBlackTile(BatteryTile, vehicle))
    widgets.register("AirConditioningTile", SignalBlackTile(AirConditioningTile, vehicle))

    widgets.register("SensorPills", SignalPills([
        TemperatureTile,
        BatteryTile,
        AirConditioningTile,
    ], vehicle))
}

export default HappyDog