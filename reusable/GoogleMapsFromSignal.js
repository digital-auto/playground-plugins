import GoogleMapsPluginApi from "./GoogleMapsPluginApi.js"

const supportsPins = (vehicle) => {
    try {
        vehicle.Next.get()
        vehicle.Reset.get()
        return true
    } catch (error) {
        console.log("supportsPin Error:", error)
        return false
    }
}

const GoogleMapsFromSignal = (directions, vehicle, {
    iterate = false,
    autoNext = 800,
} = {}) => {
    return (box) => {
        let setVehiclePinGlobal = null
        GoogleMapsPluginApi("AIzaSyCQd4f14bPr1ediLmgEQGK-ZrepsQKQQ6Y", box, directions).then(({setVehiclePin}) => {
            setVehiclePinGlobal = setVehiclePin
        })

        if (!supportsPins(vehicle) && iterate) {
            alert("GoogleMapsFromSignal plugin doesn't support 'iterate' parameter without Wishlist sensors 'Vehicle.Next' and 'Vehicle.Reset'.")
        }

        const intervalId = setInterval(async () => {
            if (setVehiclePinGlobal !== null) {
                setVehiclePinGlobal({
                    lat: await vehicle.CurrentLocation.Latitude.get(),
                    lng: await vehicle.CurrentLocation.Longitude.get()
                })
                if (iterate) {
                    await vehicle.Next.get()
                }
            }
        }, autoNext)


        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId)
            }
        }
    }
}

export default GoogleMapsFromSignal