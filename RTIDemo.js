import AnimatedWipers from "./reusable/AnimatedWipers.js"
import StatusTable from "./reusable/StatusTable.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import TitleWidget from "./reusable/TitleWidget.js"

const getRTIData = async (title) => {
    const response = await fetch(`https://rti.ngrok.io/dds/rest1/applications/CovesaDemoApp/domain_participants/MyParticipant/subscribers/MySubscriber/data_readers/${title}`)
    return new DOMParser().parseFromString(await response.text(), "text/xml")
}

const RTIDemo = ({widgets, vehicle, simulator}) => {
    widgets.register("AnimatedWipers", AnimatedWipers("Vehicle.Body.Windshield.Front.Wiping.Mode", vehicle))

    const SIGNALS = [
        "Vehicle.CurrentLocation.Latitude",
        "Vehicle.CurrentLocation.Longitude",
        "Vehicle.CurrentLocation.Heading",
        "Vehicle.CurrentLocation.HorizontalAccuracy",
        "Vehicle.CurrentLocation.Altitude",
        "Vehicle.CurrentLocation.VerticalAccuracy",
        "Vehicle.CurrentLocation.GNSSReceiver.FixType",
        "Vehicle.Speed",
        "Vehicle.AverageSpeed",
        "Vehicle.TripMeterReading",
        "Vehicle.IsBrokenDown",
        "Vehicle.IsMoving",
        "Vehicle.Body.Windshield.Front.Wiping.System.Mode",
        "Vehicle.Body.Windshield.Front.Wiping.System.Frequency",
        "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition",
        "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition",
        "Vehicle.Body.Windshield.Front.Wiping.System.DriveCurrent",
        "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping",
        "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle",
        "Vehicle.Body.Windshield.Front.Wiping.System.IsWiperError",
        "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached",
        "Vehicle.Body.Windshield.Front.Wiping.System.IsOverheated",
        "Vehicle.Body.Windshield.Front.Wiping.System.IsBlocked",
        "Vehicle.Body.Windshield.Front.Wiping.WiperWear",
        "Vehicle.Body.Windshield.Front.Wiping.IsWipersWorn",
        "Vehicle.Body.Windshield.Front.Wiping.Mode"
    ]

    widgets.register("SignalTable", StatusTable({
        apis: SIGNALS,
        vehicle,
        refresh: 1000
    }))

    widgets.register("Directions", GoogleMapsFromSignal([
        {
            lat: 39.36440665494062,
            lng: -85.62349717186248
        },
        {
            lat: 40.05174288244341,
            lng: -86.4531371326884
        }
    ], vehicle))

    const STATE = {}

    const refresh = () => {
        getRTIData("MyVehicleLocationReader").then(data => {
            for (const parameter of ["Latitude", "Longitude", "Heading", "HorizontalAccuracy", "Altitude", "VerticalAccuracy"]) {
                STATE[`Vehicle.CurrentLocation.${parameter}`] = data.querySelector(`data > ${parameter}`).textContent
            }
            STATE[`Vehicle.CurrentLocation.GNSSReceiver.FixType`] = data.querySelector(`data > FixType`).textContent
        })

        getRTIData("MyVehicleMotionReader").then(data => {
            for (const parameter of ["Speed", "AverageSpeed", "TripMeterReading", "IsBrokenDown", "IsMoving"]) {
                STATE[`Vehicle.${parameter}`] = data.querySelector(`data > ${parameter}`).textContent
            }
            // Acceleration, AngularVelocity
        })

        getRTIData("MyWiperStatusReader").then(data => {
            for (const parameter of ["Mode", "Frequency", "TargetPosition", "ActualPosition", "DriveCurrent", "IsWiping", "IsEndingWipeCycle", "IsWiperError", "IsPositionReached", "IsOverheated", "IsBlocked"]) {
                STATE[`Vehicle.Body.Windshield.Front.Wiping.System.${parameter}`] = data.querySelector(`data > ${parameter}`).textContent
            }
            for (const parameter of ["WiperWear", "IsWipersWorn"]) {
                STATE[`Vehicle.Body.Windshield.Front.Wiping.${parameter}`] = data.querySelector(`data > ${parameter}`).textContent
            }
            STATE[`Vehicle.Body.Windshield.Front.Wiping.Mode`] = STATE["Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition"] === 0 ? "OFF" : "MEDIUM"
        })
    }

    refresh()
    setInterval(refresh, 5 * 1000)

    for (const signal of SIGNALS) {
        simulator(signal, "get", () => {
            return STATE[signal]
        })
    }

    widgets.register("Title", TitleWidget("RTIDemo"))
}

export default RTIDemo