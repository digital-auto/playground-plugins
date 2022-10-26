const appendMapScript = (window, apikey) => {
    return new Promise(async (resolve, reject) => {
        try {
            const GOOGLE_MAPS_API = `https://maps.googleapis.com/maps/api/js?key=${apikey}`;

            const script = window.document.createElement("script");
            script.defer = true;

            script.src = GOOGLE_MAPS_API;
            await window.document.head.appendChild(script);
            script.addEventListener("load", () => resolve());
        } catch (e) {
            reject();
        }
    });
}

function calculateAndDisplayRoute(box, path, directionsRenderer) {
    const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
    const end = new box.window.google.maps.LatLng(path[1].lat, path[1].lng);

    const directionsService = new box.window.google.maps.DirectionsService();
    directionsService
    .route({
        origin: start,
        destination: end,
        travelMode: box.window.google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
        directionsRenderer.setDirections(response);
    })
    .catch((e) => console.log("Directions request failed due to " + e));
}

const GoogleMapsPluginApi = async (apikey, box, path) => {
    await appendMapScript(box.window, apikey)

    const container = document.createElement("div");
    container.setAttribute("style", `display:flex; height: 100%; width: 100%;`);
    
    const directionsRenderer = new box.window.google.maps.DirectionsRenderer();
    const map = new box.window.google.maps.Map(container, {
        zoom: 7,
        center: path[0],
    });
    directionsRenderer.setMap(map);

    calculateAndDisplayRoute(box, path, directionsRenderer);
    
    box.injectNode(container);

    let marker = null

    return {
        setVehiclePin: (coordinates) => {
            if (coordinates === null) {
                if (marker !== null) {
                    marker.setMap(null)
                    marker = null    
                }
            } else {
                const {lat, lng} = coordinates
                if (marker === null) {
                    marker = new box.window.google.maps.Marker({
                        position: {lat, lng},
                        map,
                    })
                } else {
                    marker.setPosition({lat, lng})
                }    
            }
        }
    }
};

export default GoogleMapsPluginApi;