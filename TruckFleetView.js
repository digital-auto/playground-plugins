import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import loadScript from "./reusable/loadScript.js";

const plugin = ({ box, widgets }) => {
    widgets.register("Map", (box) => {
        loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${PLUGINS_APIKEY}`)
            .then(() => {
                const rectangleCoordinates = [
                    {
                        "lat": 47.93330662389945,
                        "lng": 6.8981571326644175
                    },
                    {
                        "lat": 53.08277351361783,
                        "lng": 13.195127235586439
                    },
                ]

                const container = document.createElement("div")
                container.setAttribute("style", `display:flex; height: 100%; width: 100%;`)
                box.injectNode(container)

                const rectCenter = new box.window.google.maps.LatLngBounds(rectangleCoordinates[0], rectangleCoordinates[1]).getCenter()

                const map = new box.window.google.maps.Map(container, {
                    zoom: 6.3,
                    center: rectCenter,
                    mapTypeId: 'terrain'
                });

                new box.window.google.maps.Rectangle({
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.3,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.05,
                    map,
                    bounds: {
                        north: rectangleCoordinates[1].lat,
                        south: rectangleCoordinates[0].lat,
                        east: rectangleCoordinates[1].lng,
                        west: rectangleCoordinates[0].lng,
                    },
                });

                // Create an object to store the markers by vehicleId
                const vehicleMarkers = {}

                // Fetch vehicle coordinates and add markers to map
                fetch('https://evfleetsim.onrender.com/fleet/vehicle-coordinates')
                .then(response => response.json())
                .then(vehicleCoordinates => {
                    // For each vehicle, create a marker on the map
                    for (let vehicleId in vehicleCoordinates) {
                        let coordinates = vehicleCoordinates[vehicleId];
                        // Store market in markers object
                        vehicleMarkers[vehicleId] = new box.window.google.maps.Marker({
                            position: { lat: coordinates.latitude, lng: coordinates.longitude },
                            map: map,
                            icon: {
                                path: "M21.474,377.522V117.138c0-14.469,11.729-26.199,26.199-26.199h260.25c14.469,0,26.198,11.73,26.198,26.199v260.385   c0,4.823-3.909,8.733-8.733,8.733H30.207C25.383,386.256,21.474,382.346,21.474,377.522z M231.634,466.724   c0,30.01-24.329,54.338-54.338,54.338c-30.009,0-54.338-24.328-54.338-54.338c0-30.011,24.329-54.338,54.338-54.338   C207.305,412.386,231.634,436.713,231.634,466.724z M204.464,466.724c0-15.005-12.164-27.169-27.169-27.169   s-27.17,12.164-27.17,27.169s12.165,27.17,27.17,27.17S204.464,481.729,204.464,466.724z M130.495,412.385H8.733   c-4.823,0-8.733,3.91-8.733,8.733v26.495c0,4.823,3.91,8.733,8.733,8.733h97.598C108.879,438.862,117.704,423.418,130.495,412.385z    M515.938,466.724c0,30.01-24.329,54.338-54.338,54.338c-30.01,0-54.338-24.328-54.338-54.338   c0-30.011,24.328-54.338,54.338-54.338C491.609,412.385,515.938,436.713,515.938,466.724z M488.77,466.724   c0-15.005-12.165-27.169-27.17-27.169c-15.006,0-27.169,12.164-27.169,27.169s12.164,27.17,27.169,27.17   S488.77,481.729,488.77,466.724z M612,421.118v26.495c0,4.823-3.91,8.733-8.733,8.733h-70.704   c-5.057-34.683-34.906-61.427-70.961-61.427c-36.062,0-65.912,26.745-70.969,61.427H248.261   c-2.549-17.483-11.373-32.928-24.164-43.961h134.994V162.594c0-9.646,7.82-17.466,17.466-17.466h82.445   c23.214,0,44.911,11.531,57.9,30.77l53.15,78.721c7.796,11.547,11.962,25.161,11.962,39.094v118.672h21.253   C608.09,412.385,612,416.295,612,421.118z M523.408,256.635l-42.501-60.393c-1.636-2.324-4.3-3.707-7.142-3.707H407.47   c-4.822,0-8.733,3.91-8.733,8.733v60.393c0,4.824,3.91,8.733,8.733,8.733h108.798C523.342,270.394,527.48,262.421,523.408,256.635z",
                                fillColor: '#2563eb',
                                fillOpacity: 1,
                                anchor: new box.window.google.maps.Point(12, -290),
                                strokeWeight: 0,
                                scale: .1,
                                rotation: 0
                            },
                            clickable: true
                        });
                        vehicleMarkers[vehicleId].addListener('click', () => {
                            window.location.href = `/model/kuAlpF1nRy65u3dzl9YQ/library/prototype/Aj66iZqab1YIw5dHaaGr/view/run?truckId=${vehicleId}`
                        })
                    }
                });

                // Create an object to store the markers by chargestationId
                const chargestationMarkers = {}

                // Fetch chargestation coordinates and add markers to map
                fetch('https://evfleetsim.onrender.com/fleet/chargestation-coordinates')
                .then(response => response.json())
                .then(chargestationCoordinates => {
                    // For each vehicle, create a marker on the map
                    for (let chargestationId in chargestationCoordinates) {
                        let coordinates = chargestationCoordinates[chargestationId];
                        console.log(coordinates)
                        // Store market in markers object
                        chargestationMarkers[chargestationId] = new box.window.google.maps.Marker({
                            position: { lat: coordinates.latitude, lng: coordinates.longitude },
                            map: map,
                            clickable: true
                        });
                        chargestationMarkers[chargestationId].addListener('click', () => {
                            window.location.href = `/model/JUczdpLduBR24kMeMpyC/library/prototype/TX73uJZmwGVy3a4M3jaY/view/run?chargestationId=${chargestationId}`
                        })
                    }
                });

                // Every 5 seconds, fetch the new coordinates and update the vehicle markers
                setInterval(async () => {
                    const response = await fetch("https://evfleetsim.onrender.com/fleet/vehicle-coordinates")
                    const vehicleCoordinates = await response.json();
                    Object.keys(vehicleCoordinates).forEach(vehicleId => {
                        const coordinates = vehicleCoordinates[vehicleId];
                        vehicleMarkers[vehicleId].setPosition({ lat: coordinates.latitude, lng: coordinates.longitude });
                    })
                }, 5000);

               // Every 5 seconds, fetch the new coordinates and update the chargestation markers
               setInterval(async () => {
                    const response = await fetch("https://evfleetsim.onrender.com/fleet/chargestation-coordinates")
                    const chargestationCoordinates = await response.json();
                    Object.keys(chargestationCoordinates).forEach(chargestationId => {
                        const coordinates = chargestationCoordinates[chargestationId];
                        chargestationMarkers[chargestationId].setPosition({ lat: coordinates.latitude, lng: coordinates.longitude });
                    })
                }, 5000);

            })
    })
}

export default plugin