import GoogleMapsFromSignal from "../reusable/GoogleMapsFromSignal.js"

const GoogleMapsPlugin = ({widgets, vehicle}) => {
    widgets.register(
        "GoogleMapDirections",
        GoogleMapsFromSignal(
            [
                {
                    "lat": 48.149497,
                    "lng": 11.523194
                },
                {
                    "lat": 50.445168,
                    "lng": 11.020569
                },
            ],
            vehicle,
            { iterate: true }
        )
    )
}

export default GoogleMapsPlugin
