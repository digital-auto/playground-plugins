import loadScript from "./loadScript.js";

function calculateAndDisplayRoute(box, path, directionsRenderer, tmode = null) {
    const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
    const end = new box.window.google.maps.LatLng(path[1].lat, path[1].lng);
     const mode = tmode === "BICYCLING" ? box.window.google.maps.TravelMode.BICYCLING : tmode === "TRANSIT" ? box.window.google.maps.TravelMode.TRANSIT : tmode === "WALKING" ? box.window.google.maps.TravelMode.WALKING : "DRIVING";

    const directionsService = new box.window.google.maps.DirectionsService();
    directionsService
    .route({
        origin: start,
        destination: end,
        travelMode: mode
    })
    .then((response) => {
        directionsRenderer.setDirections(response);
    })
    .catch((e) => console.log("Directions request failed due to " + e));
}


async function calculateAndDisplayRoute(box, path, directionsRenderer, tmode = null) {
    const waypoints = path.slice(1, -1).map(point => ({
        location: new box.window.google.maps.LatLng(point.lat, point.lng),
        stopover: true
    }));

    const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
    const end = new box.window.google.maps.LatLng(path[path.length - 1].lat, path[path.length - 1].lng);
    const mode = tmode === "BICYCLING" ? box.window.google.maps.TravelMode.BICYCLING : tmode === "TRANSIT" ? box.window.google.maps.TravelMode.TRANSIT : tmode === "WALKING" ? box.window.google.maps.TravelMode.WALKING : "DRIVING";

    const directionsService = new box.window.google.maps.DirectionsService();
    directionsService
        .route({
            origin: start,
            destination: end,
            waypoints: waypoints,
            travelMode: mode
        })
        .then((response) => {
            directionsRenderer.setDirections(response);
        })
        .catch((e) => console.log("Directions request failed due to " + e));
}

const GoogleMapsPluginApi = async (apikey, box, path, travelMode = null, { icon = null } = {}) => {
    console.log("GoogleMapsPluginApi icon", icon)
    await loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${apikey}`)

    const container = document.createElement("div");
    container.setAttribute("style", `display:flex; height: 100%; width: 100%;`);

    const directionsRenderer = new box.window.google.maps.DirectionsRenderer();
    const map = new box.window.google.maps.Map(container, {
        zoom: 7,
        center: path[0],
    });
    box.window.directionsRenderer = directionsRenderer
    directionsRenderer.setMap(map);

    calculateAndDisplayRoute(box, path, directionsRenderer, travelMode);

    box.injectNode(container);

    let marker = null

    return {
        setVehiclePin: async (coordinates) => {
            if (coordinates === null) {
                if (marker !== null) {
                    marker.setMap(null)
                    marker = null
                }
            } else {

                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                console.log(lat + "|" + lng)

                if (marker === null) {
                    marker = new box.window.google.maps.Marker({
                        position: { lat, lng },
                        map,
                        icon: icon === null ? {
                            path: "M -53.582954, -389.01277 z",
                            fillColor: '#eb2533',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(12, -290),
                            strokeWeight: 0,
                            scale: .1,
                            rotation: 0
                        } : icon
                    })
                } else {
                    marker.setPosition({ lat, lng })
                }
            }
        }
    }
};


export default GoogleMapsPluginApi;