import loadScript from "./loadScript.js";

const GoogleMapsPluginApi = async (apikey, box, path, travelMode = null, { icon = null } = {}) => {
    console.log("GoogleMapsPluginApi icon", icon);
    
    if (!box.window) {
        console.error("Window object is undefined.");
        return;
    }

    await loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${apikey}`);

    const container = document.createElement("div");
    container.setAttribute("style", `display:flex; height: 100%; width: 100%;`);

    const directionsRenderer = new box.window.google.maps.DirectionsRenderer();
    const map = new box.window.google.maps.Map(container, {
        zoom: 7,
        center: path[0],
    });

    box.window.directionsRenderer = directionsRenderer;
    directionsRenderer.setMap(map);

    if (path.length < 2) {
        console.error("Path array must have at least two points.");
        return;
    }

    calculateAndDisplayRoute(box, path, directionsRenderer, travelMode);

    box.injectNode(container);

    let marker = null;

    return {
        setVehiclePin: async (coordinates) => {
            if (coordinates === null) {
                if (marker !== null) {
                    marker.setMap(null);
                    marker = null;
                }
            } else {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                console.log(lat + "|" + lng);

                if (marker === null) {
                    marker = new box.window.google.maps.Marker({
                        position: { lat, lng },
                        map,
                        icon: icon === null ? {
                            path: "your_icon_path_here",  // Replace with your icon path
                            fillColor: '#eb2533',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(12, -290),
                            strokeWeight: 0,
                            scale: 0.1,
                            rotation: 0
                        } : icon
                    });
                } else {
                    marker.setPosition({ lat, lng });
                }
            }
        }
    };
};

export default GoogleMapsPluginApi;