import GoogleMapsPluginApi from "./GoogleMapsPluginApi.js"
import StatusTable from "./StatusTable.js"
import DataTableHTML from "./DataTableHTML.js"

const plugin = ({widgets, simulator, vehicle}) => {
    let setVehiclePinGlobal = null
    widgets.register("Maps", (box) => {
        GoogleMapsPluginApi("AIzaSyCQd4f14bPr1ediLmgEQGK-ZrepsQKQQ6Y", box, [
            {
                "lat": 48.813254159291475,
                "lng": 9.212379215835714
            },
            {
                "lat": 49.20261646797924,
                "lng": 9.189121574828052
            },
        ]).then(({setVehiclePin}) => {
            setVehiclePinGlobal = setVehiclePin
        })
    })

    const vehicles = [
        {
            "Vehicle.CurrentLocation.Latitude": 48.85850429451804,
            "Vehicle.CurrentLocation.Longitude": 9.125898683591739,
            "Vehicle.VehicleIdentification.VIN": "4Y1SL65848Z411439",
            "Vehicle.Speed": "80 km/h",
            "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current": "56%",
            "Vehicle.Powertrain.TractionBattery.NetCapacity": "80 kwH",
            "Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete": "9112s",
            "Vehicle.Powertrain.TractionBattery.Charging.ChargeLimit": "80%",
            "Vehicle.Powertrain.TractionBattery.Range": "123km",
            nextChargestation: {
                "ID": 4711,
                "Max Current": "32A",
                "Max Voltage": "208V",
                "Average Power": "7.68kW",
            },
            status: {
                Status: "Not connected",
                Distance: "98km",
                ETA: "1hr12m",
            },
        },
        {
            "Vehicle.CurrentLocation.Latitude": 48.969879287383634,
            "Vehicle.CurrentLocation.Longitude": 9.226323054446112,
            "Vehicle.VehicleIdentification.VIN": "WBAVH31008A056053",
            "Vehicle.Speed": "62 km/h",
            "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current": "83%",
            "Vehicle.Powertrain.TractionBattery.NetCapacity": "120 kWH",
            "Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete": "12381s",
            "Vehicle.Powertrain.TractionBattery.Charging.ChargeLimit": "90%",
            "Vehicle.Powertrain.TractionBattery.Range": "156km",
            nextChargestation: {
                "ID": 3211,
                "Max Current": "64A",
                "Max Voltage": "184V",
                "Average Power": "9.84kW",
            },
            status: {
                Status: "Not connected",
                Distance: "276km",
                ETA: "4hr42m",
            },
        },
        {
            "Vehicle.CurrentLocation.Latitude": 49.168188548489255,
            "Vehicle.CurrentLocation.Longitude": 9.25731322438704,
            "Vehicle.VehicleIdentification.VIN": "JTEHY05J080010242",
            "Vehicle.Speed": "96 km/h",
            "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current": "72%",
            "Vehicle.Powertrain.TractionBattery.NetCapacity": "110 kWH",
            "Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete": "11462s",
            "Vehicle.Powertrain.TractionBattery.Charging.ChargeLimit": "95%",
            "Vehicle.Powertrain.TractionBattery.Range": "137km",
            nextChargestation: {
                "ID": 674,
                "Max Current": "48A",
                "Max Voltage": "340V",
                "Average Power": "11.56kW",
            },
            status: {
                Status: "Not connected",
                Distance: "12km",
                ETA: "0hr18m",
            },
        },
    ]


    const apis = [
        "Vehicle.CurrentLocation.Latitude",
        "Vehicle.CurrentLocation.Longitude",
        "Vehicle.VehicleIdentification.VIN",
        "Vehicle.Speed",
        "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current",
        "Vehicle.Powertrain.TractionBattery.NetCapacity",
        "Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete",
        "Vehicle.Powertrain.TractionBattery.Charging.ChargeLimit",
        "Vehicle.Powertrain.TractionBattery.Range",
    ]

    let currentVehicle = null

    for (const api of apis) {
        // eslint-disable-next-line no-loop-func
        simulator(api, "get", async () => {
            if (currentVehicle === null) {
                return ""
            }
            return currentVehicle[api]
        })
        // eslint-disable-next-line no-loop-func
        simulator(api, "set", async ({args}) => {
            const [newValue] = args
            if (currentVehicle === null) {
                return ""
            }
            return currentVehicle[api] = newValue
        })
    }

    widgets.register("VehicleDetails", StatusTable({
        apis,
        vehicle,
        refresh: 300
    }))

    let nextChargeStationDiv = null

    widgets.register("NextChargestation", (box) => {
        const div = document.createElement("div")
        div.style = "display: flex;width: 100%; height: 100%;"

        nextChargeStationDiv = div
        
        div.innerHTML = DataTableHTML({
            headers: ["Chargestation", "Current Value"],
            rows: ["ID", "Max Current", "Max Voltage", "Average Power"].map(firstCol => ({
                htmlAttributes: `data-row="${firstCol}"`,
                cells: {
                    "Chargestation": firstCol,
                    "Current Value": ""
                }
            })),
            colorTheme: {
                headerBackground: "#fbbf24",
                evenCellBackground: "#fffbeb"
            }
        })

        box.injectNode(div)
    })

    let statusDiv = null

    widgets.register("ChargestationStatus", (box) => {
        const div = document.createElement("div")
        div.style = "display: flex;height: 100%;width: 100%;"

        statusDiv = div

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
                <div data-cell="Status"><strong>Status: </strong><span></span></div>
                <div data-cell="Distance"><strong>Distance: </strong><span></span></div>
                <div data-cell="ETA"><strong>ETA: </strong><span></span></div>
            </div>
        </div>
        `

        box.injectNode(div)
    })

    widgets.register("CarImage", (box) => {
        box.injectHTML(`
        <div style="max-width: fit-content; margin: 0 auto; position: relative;">
        <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FE-Car_Full_Vehicle.png?alt=media&token=9c9d4cb4-fee0-42e3-bbb1-7feaa407cc8e" style="height: 100%; width: 100%; object-fit: cover;">
            <div class="smartphone-text" style="position: absolute; color: white; font-family: 'Lato'; width: 100%; top: 0; height: 100%; box-sizing: border-box; padding-top: 25px; padding-right: 12px; padding-left: 12px; padding-bottom: 25px;"></div>
        </div>
        `)
    })

    return {
        set_vehicle: (vehicleIndex) => {
            const vehicle = vehicleIndex === null ? null : vehicles[vehicleIndex]
            currentVehicle = vehicle

            if (nextChargeStationDiv !== null) {
                ["ID", "Max Current", "Max Voltage", "Average Power"].forEach((key) => {
                    const value = vehicle === null ? "" : vehicle.nextChargestation[key]
                    nextChargeStationDiv.querySelector(`[data-row="${key}"] td:nth-child(2)`).textContent = value
                })
            }

            if (statusDiv !== null) {
                ["Status", "Distance", "ETA"].forEach((key) => {
                    const value = vehicle === null ? "" : vehicle.status[key]
                    statusDiv.querySelector(`[data-cell="${key}"] span`).textContent = value
                })
            }
            
            if (setVehiclePinGlobal !== null) {
                if (vehicle === null) {
                    setVehiclePinGlobal(null)
                } else {
                    setVehiclePinGlobal({
                        lat: vehicle["Vehicle.CurrentLocation.Latitude"],
                        lng: vehicle["Vehicle.CurrentLocation.Longitude"],
                    })    
                }
            }
        }
    }
}

export default plugin