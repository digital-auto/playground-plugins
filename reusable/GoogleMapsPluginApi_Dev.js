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

const GoogleMapsPluginApi = async (apikey, box, path, travelMode = null, {icon = null} = {}) => {
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
        setVehiclePin: (coordinates) => {
            if (coordinates === null) {
                if (marker !== null) {
                    marker.setMap(null)
                    marker = null    
                }
            } else {

                
                    const {lat, lng} = { } ;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    //alert( + "|" + position.coords.longitude);
                    lat= position.coords.latitude ;
                    lng= position.coords.longitude ;
                    });
            } else { 
                alert("Geolocation is not supported by this browser.");
            }
                if (marker === null) {
                    marker = new box.window.google.maps.Marker({
                        position: {lat, lng},
                        map,
                        icon: icon === null ? {
                            path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                            fillColor: '#009B1A',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(12,-290),
                            strokeWeight: 0,
                            scale: .1,
                            rotation: 0
                        } : icon
                    })
                } else {
                    marker.setPosition({lat, lng})
                }    
            }
        }
    }
};

export default GoogleMapsPluginApi;