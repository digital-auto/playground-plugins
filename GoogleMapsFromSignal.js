import GoogleMapsPluginApi from "/GoogleMapsPluginApi.js"

const supportsPins = (vehicle) => {
    try {
        vehicle.Next.get()
        vehicle.Reset.get()
        return true
    } catch (error) {
        return false
    }
}

const GoogleMapsFromSignal = (directions, vehicle, {
    autoNext = 800,
} = {}) => {
    return (box) => {
        let setVehiclePinGlobal = null
        GoogleMapsPluginApi("AIzaSyCQd4f14bPr1ediLmgEQGK-ZrepsQKQQ6Y", box, directions).then(({setVehiclePin}) => {
            setVehiclePinGlobal = setVehiclePin
        })

        let intervalId = null

        if (supportsPins(vehicle)) {
            intervalId = setInterval(async () => {
                if (setVehiclePinGlobal !== null) {
                    setVehiclePinGlobal({
                        lat: await vehicle.CurrentLocation.Latitude.get(),
                        lng: await vehicle.CurrentLocation.Longitude.get()
                    })
                    await vehicle.Next.get()
                }
            }, autoNext)
        } else {
            alert("GoogleMapsFromSignal plugin doesn't support vehicle pin without Wishlist sensors 'Vehicle.Next' and 'Vehicle.Reset'.")
        }

        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId)
            }
        }
    }
}

export default GoogleMapsFromSignal