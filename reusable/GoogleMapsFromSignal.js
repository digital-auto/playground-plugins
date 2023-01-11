import GoogleMapsPluginApi from "./GoogleMapsPluginApi.js"
import { PLUGINS_APIKEY } from "./apikey.js"

const supportsPins = (vehicle) => {
    try {
        vehicle.Next.get()
        vehicle.Reset.get()
        return true
    } catch (error) {
        return false
    }
}

const convertCoordinates = (coordinates) => {
    return {
        lat: parseFloat(coordinates.lat),
        lng: parseFloat(coordinates.lng)
    }
}

const GoogleMapsFromSignal = (directions, vehicle, {
    iterate = false,
    autoNext = 800,
    icon = null
} = {}) => {
    return (box) => {
        console.log("GoogleMapsFromSignal icon", icon, autoNext)
        let setVehiclePinGlobal = null
        GoogleMapsPluginApi(PLUGINS_APIKEY, box, directions, null, {icon} ).then(({setVehiclePin}) => {
            setVehiclePinGlobal = setVehiclePin
        })

        if (!supportsPins(vehicle) && iterate) {
            alert("GoogleMapsFromSignal plugin doesn't support 'iterate' parameter without Wishlist sensors 'Vehicle.Next' and 'Vehicle.Reset'.")
        }

        const intervalId = setInterval(async () => {
            if (setVehiclePinGlobal !== null) {
                setVehiclePinGlobal(convertCoordinates({
                    lat: await vehicle.CurrentLocation.Latitude.get(),
                    lng: await vehicle.CurrentLocation.Longitude.get()
                }))
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