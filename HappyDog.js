import SignalPills from "./reusable/SignalPills.js"
import SignalTile from "./reusable/SignalTile"

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
    widgets.register("DogStream", (box) => {
        const div = document.createElement("div")
        div.style = "width: 100%; height: 100%;"
        div.innerHTML = "<img style='width: 100%; height: 100%; object-fit: cover;'></img>"
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

        const TemperatureTile = {
            signal: "Vehicle.Cabin.HVAC.AmbientAirTemperature",
            icon: "temperature-half",
            suffix: " °C"
        }

        const BatteryTile = {
            signal: "Vehicle.OBD.HybridBatteryRemaining",
            icon: "battery-half",
            suffix: "%"
        }

        const AirConditioningTile = {
            signal: "Vehicle.Cabin.HVAC.IsAirConditioningActive",
            icon: "wind"
        }

        widgets.register("TemperatureTile", SignalTile(TemperatureTile, vehicle))
        widgets.register("BatteryTile", SignalTile(BatteryTile, vehicle))
        widgets.register("AirConditioningTile", SignalTile(AirConditioningTile, vehicle))

        widgets.register("SensorPills", SignalPills([
            TemperatureTile,
            BatteryTile,
            AirConditioningTile,
        ], vehicle))

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
}

export default HappyDog