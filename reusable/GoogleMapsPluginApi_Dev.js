import loadScript from "./loadScript.js";

function calculateAndDisplayRoute(box, path, directionsRenderer, tmode = null) {
    const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
    const end = new box.window.google.maps.LatLng(path[path.length - 1].lat, path[path.length - 1].lng);

    const waypoints = [];
    for (let i = 1; i < path.length - 1; i++) {
        waypoints.push({
            location: new box.window.google.maps.LatLng(path[i].lat, path[i].lng),
            stopover: true
        });
    }

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
    let getScore = async () => {
        return score
    }

    calculateAndDisplayRoute(box, path, directionsRenderer, travelMode);
    
    box.injectNode(container);

    let marker = null
    let markerCar2 = null
    let lat = path[0].lat;
    let lng = path[0].lng;
    let latCar2 = path[0].lat;
    let lngCar2 = path[0].lng;
    let intervalId;
    let intervalIdCar2;
    let count=0;
    let countCar2=0;
    let score=100;
    let scoreCar2=100;
    document.cookie = "score="+score;
    document.cookie = "scoreCar2="+scoreCar2;

    const apiUrl = 'https://api-proxy.digitalauto.asia/osrm_backend/route/v1/driving/';
    
    const fetchPathFromApi = async() => {


        return fetch('https://proxy.digitalauto.tech/fleet-simulate/get_vehicle_coordinates')
            .then(response => response.json())
            .then(carsCoordinates => {
                // For each vehicle, create a marker on the map
                const vehicleId =  new URLSearchParams(window.location.search).get('vehicleId');

                for (let carId in carsCoordinates) {
                    let coordinates = carsCoordinates[carId];

                    if (vehicleId==carId){
                     lat = coordinates.latitude_start;
                     lng = coordinates.longitude_start;

            return fetch(apiUrl+coordinates.longitude_start+","+coordinates.latitude_start+";"+coordinates.longitude_end+","+coordinates.latitude_end+"?steps=true&geometries=geojson")
            .then(response => response.json())
            .then(data => {
                const stepPositions = data.routes[0].legs[0].steps.flatMap(step => {
                    // Check if 'geometry' property exists and has 'coordinates' property
                    if (step.geometry && step.geometry.coordinates) {
                        return step.geometry.coordinates.map(coordinate => ({
                            lat: coordinate[1],
                            lng: coordinate[0]
                        }));
                    }  
                });
                return stepPositions;
            }).catch(error => {
                console.error('Error fetching data from the API:', error);
                // Return a default path or handle the error as needed
                return [
                    { lat: 49.116911, lng: 9.176294 },
                    { lat: 48.7758, lng: 9.1829 },
                    { lat: 48.9471, lng: 9.4342 },
                    { lat: 49.0688, lng: 9.2887 }
                ];
            });
        } 
    }
    })
        };

         

    // Use stepPositions to render or perform any other actions
    let stepPositions =  await fetchPathFromApi();
    path=  stepPositions;
    let intervalId3;
    let intervalId4;
    let intervalId4Car2;
    let intervalId6;
    let intervalId6Car2;
    let routeToCharger=false;
    let routeToChargerCar2=false;
    document.cookie = "routeToCharger=" + false;
    document.cookie = "InRoute=Yes";
    document.cookie = "routeToChargerCar2=" + false;
    document.cookie = "InRouteCar2=Yes";    

    let charger=false;
    let chargerCar2=false;
    return {
        setVehiclePin: (coordinates) => {
            if (coordinates === null) {
                if (marker !== null) {
                    marker.setMap(null)
                    marker = null   
                    markerCar2.setMap(null)
                    markerCar2 = null     
                }
             } else {
                if (marker === null) {
                    marker = new box.window.google.maps.Marker({
                        position: {lat, lng},
                        map,
                        icon: {
                            path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                            fillColor: '#eb2533',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(-20,-150),
                            strokeWeight: 0,
                            scale: .1,
                            rotation: 0
                        }  
                    })
                    markerCar2 = new box.window.google.maps.Marker({
                        position: {lat, lng},
                        map,
                        icon: {
                            path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                            fillColor: '#2EFF00',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(-100,-300),
                            strokeWeight: 1,
                            scale: .1,
                            rotation: 0
                        }  
                    })
                }  
                
                  // Create an object to store the markers by chargestationId
                  const chargestationMarkers = {}
                  // Fetch chargestation coordinates and add markers to map
                  fetch('https://proxy.digitalauto.tech/fleet-simulate/get_chargestation_data')
                  .then(response => response.json())
                  .then(chargestationCoordinates => {
                      // For each charger, create a marker on the map
                      for (let chargestationId in chargestationCoordinates) {
                          let coordinates = chargestationCoordinates[chargestationId];
                          // Store market in markers object
                          let color=null;
                          if (coordinates.availability){
                            color="#2563eb" ;
                          }
                          else{
                            color="#FF5D00" ;
                          }
                          chargestationMarkers[chargestationId] = new box.window.google.maps.Marker({
                              position: { lat: coordinates.latitude, lng: coordinates.longitude },
                              map: map,
                              icon: {
                                  path: "M161 214.667H7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 4.236 3.431 7.667 7.667 7.667h153.333c4.236 0 7.667 -3.431 7.667 -7.667v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667zm99.667 -153.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-15.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 17.135 11.318 31.476 26.833 36.383v56.776c0 6.684 -4.552 12.899 -11.145 13.987C206.626 192.865 199.333 186.391 199.333 178.25v-13.417c0 -23.288 -18.879 -42.167 -42.167 -42.167h-3.833V30.667c0 -16.939 -13.728 -30.667 -30.667 -30.667H46C29.061 0 15.333 13.728 15.333 30.667v168.667h138V145.667h3.833c10.585 0 19.167 8.582 19.167 19.167v11.792c0 19.009 13.858 36.014 32.78 37.859C230.819 216.607 249.167 199.53 249.167 178.25V120.716c15.515 -4.907 26.833 -19.248 26.833 -36.383v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667h-7.667zm-136.04 22.885 -44.898 66.604c-1.054 1.596 -2.976 2.511 -4.979 2.511 -3.675 0 -6.454 -3.009 -5.592 -6.191L80.189 107.333H51.75c-3.474 0 -6.157 -2.679 -5.697 -5.697l7.667 -51.271C54.098 47.869 56.532 46 59.417 46h32.583c3.776 0 6.526 3.134 5.558 6.33L92 76.667h27.648c4.428 0 7.192 4.207 4.979 7.552z",
                                  fillColor: color,
                                  fillOpacity: 1,
                                  scale: .1,
                              }  ,
                              clickable: true
                          });
                      }
                  });
                      function distance(lat1, lon1, lat2, lon2) {
                        var radlat1 = Math.PI * lat1/180
                        var radlat2 = Math.PI * lat2/180
                        var theta = lon1-lon2
                        var radtheta = Math.PI * theta/180
                        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                        if (dist > 1) {
                            dist = 1;
                        }
                        dist = Math.acos(dist)
                        dist = dist * 180/Math.PI
                        dist = dist * 60 * 1.1515
                        dist = dist * 1.609344
                        return dist
                    }

                    function Near_Charger(){
                   let defect=false;
                   
                 // Fetch chargestation coordinates and add markers to map
                  fetch('https://proxy.digitalauto.tech/fleet-simulate/get_chargestation_data')
                  .then(response => response.json())
                  .then( async chargestationCoordinates => {
                      // For each charger, create a marker on the map
                      let min=null;
                      let minIdCharger=null;
                   
                      for (let chargestationId in chargestationCoordinates) {
                          let coordinates = chargestationCoordinates[chargestationId];

                          if (coordinates.availability)    
                          if (min==null){
                            minIdCharger=chargestationId
                            min=coordinates
                            minIdCharger=chargestationId  
                                                     
                          }
                          else if (distance(min.latitude,min.longitude,path[count].lat,path[count].lng)>distance(coordinates.latitude,coordinates.longitude,path[count].lat,path[count].lng)){
                            minIdCharger=chargestationId
                            min=coordinates
                            minIdCharger=chargestationId
                          }
                      }

                      

                      ////////Change route to the charger station
 
                    let countToCharger=0;
                    const stepPositionsToCharger= await fetch(apiUrl+lng+","+lat+";"+min.longitude+","+min.latitude+"?steps=true")
                    .then(response => response.json())
                    .then(data => {
                        const stepPositionsToChargerStation = data.routes[0].legs.flatMap(leg =>
                            leg.steps.map(step => ({
                                lat: step.maneuver.location[1],
                                lng: step.maneuver.location[0]
                            }))
                        );
                        routeToCharger=true;
                        document.cookie = "routeToCharger=" + true;
                        return stepPositionsToChargerStation;
                    })
                
                    intervalId6 = setInterval(async () => {
                        console.log(countToCharger);
                        if (routeToCharger) {
                            lat = stepPositionsToCharger[countToCharger].lat;
                            lng = stepPositionsToCharger[countToCharger].lng;
                            marker.setPosition({ lat, lng });
                            countToCharger ++;
                            score = score - 0.5;
                            
                            document.cookie = "score=" + score;                        
                        }
                        if (stepPositionsToCharger.length <= countToCharger){
                            lat = stepPositionsToCharger[stepPositionsToCharger.length-1].lat;
                            lng = stepPositionsToCharger[stepPositionsToCharger.length-1].lng;
                            marker.setPosition({ lat, lng });
                            clearInterval(intervalId6);
                            routeToCharger=false;
                            document.cookie = "routeToCharger=" + false;
                           
   
                            if (!routeToCharger){
                                 new box.window.google.maps.Marker({
                                    position: { lat: min.latitude, lng: min.longitude },
                                    map: map,
                                    icon: {
                                        path: "M161 214.667H7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 4.236 3.431 7.667 7.667 7.667h153.333c4.236 0 7.667 -3.431 7.667 -7.667v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667zm99.667 -153.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-15.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 17.135 11.318 31.476 26.833 36.383v56.776c0 6.684 -4.552 12.899 -11.145 13.987C206.626 192.865 199.333 186.391 199.333 178.25v-13.417c0 -23.288 -18.879 -42.167 -42.167 -42.167h-3.833V30.667c0 -16.939 -13.728 -30.667 -30.667 -30.667H46C29.061 0 15.333 13.728 15.333 30.667v168.667h138V145.667h3.833c10.585 0 19.167 8.582 19.167 19.167v11.792c0 19.009 13.858 36.014 32.78 37.859C230.819 216.607 249.167 199.53 249.167 178.25V120.716c15.515 -4.907 26.833 -19.248 26.833 -36.383v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667h-7.667zm-136.04 22.885 -44.898 66.604c-1.054 1.596 -2.976 2.511 -4.979 2.511 -3.675 0 -6.454 -3.009 -5.592 -6.191L80.189 107.333H51.75c-3.474 0 -6.157 -2.679 -5.697 -5.697l7.667 -51.271C54.098 47.869 56.532 46 59.417 46h32.583c3.776 0 6.526 3.134 5.558 6.33L92 76.667h27.648c4.428 0 7.192 4.207 4.979 7.552z",
                                        fillColor: "#000",
                                        fillOpacity: 1,
                                        scale: .1,
                                    }  ,
                                    zIndex: 999,
                                    clickable: true
                                });
                                console.log(minIdCharger +" -- "+min.latitude )
                           
                            defect=min.defect;
                              marker.setPosition({ lat, lng });
                              if(defect){
                                  Near_Charger2();
                                }
                                else 
                            intervalId4 = setInterval(async () => {
                                if (charger&&score<97) {
                                    charger=true;
                                    score=score+3;
                                    document.cookie = "InStation=true";
                                    document.cookie = "score="+score;
                                }  
                                else if(score>=97){
                                  score=100
                                  document.cookie = "InStation=false";
                                  charger=false;
                                }
                            if (path.length <= count){
            
                            clearInterval(intervalId4);}
                            }, 200);
                          }
                        }
                    }, 200);
                     
                      console.log("End of route change")
                      ////////End of route change

                     
                  });
               
                    }
                    function Near_ChargerCar2(){
                        let defect=false;
                        
                      // Fetch chargestation coordinates and add markers to map
                       fetch('https://proxy.digitalauto.tech/fleet-simulate/get_chargestation_data')
                       .then(response => response.json())
                       .then( async chargestationCoordinates => {
                           // For each charger, create a marker on the map
                           let min=null;
                           let minIdCharger=null;
                        
                           for (let chargestationId in chargestationCoordinates) {
                               let coordinates = chargestationCoordinates[chargestationId];
     
                               if (coordinates.availability &&!coordinates.defect)    
                               if (min==null){
                                 minIdCharger=chargestationId
                                 min=coordinates
                                 minIdCharger=chargestationId  
                                                          
                               }
                               else if (distance(min.latitude,min.longitude,path[countCar2].lat,path[countCar2].lng)>distance(coordinates.latitude,coordinates.longitude,path[countCar2].lat,path[countCar2].lng)){
                                 minIdCharger=chargestationId
                                 min=coordinates
                                 minIdCharger=chargestationId
                               }
                           }
     
                           
     
                           ////////Change route to the charger station
      
                         let countToCharger=0;
                         const stepPositionsToCharger= await fetch(apiUrl+lngCar2+","+latCar2+";"+min.longitude+","+min.latitude+"?steps=true")
                         .then(response => response.json())
                         .then(data => {
                             const stepPositionsToChargerStation = data.routes[0].legs.flatMap(leg =>
                                 leg.steps.map(step => ({
                                     lat: step.maneuver.location[1],
                                     lng: step.maneuver.location[0]
                                 }))
                             );
                             routeToChargerCar2=true;
                             document.cookie = "routeToChargerCar2=" + true;
                             return stepPositionsToChargerStation;
                         })
                     
                         intervalId6Car2 = setInterval(async () => {
                             if (routeToChargerCar2) {
                               let  lat = stepPositionsToCharger[countToCharger].lat;
                               let  lng = stepPositionsToCharger[countToCharger].lng;
                                 markerCar2.setPosition({ lat, lng });
                                 countToCharger ++;
                                 scoreCar2 = scoreCar2 - 0.5;
                                 document.cookie = "scoreCar2=" + scoreCar2;                        
                             }
                             if (stepPositionsToCharger.length <= countToCharger){
                                let  lat = stepPositionsToCharger[stepPositionsToCharger.length-1].lat;
                                let  lng = stepPositionsToCharger[stepPositionsToCharger.length-1].lng;
                                 markerCar2.setPosition({ lat, lng });
                                 clearInterval(intervalId6Car2);
                                 routeToChargerCar2=false;
                                 document.cookie = "routeToChargerCar2=" + false;
                                
                                 if (!routeToChargerCar2){
                                      new box.window.google.maps.Marker({
                                         position: { lat: min.latitude, lng: min.longitude },
                                         map: map,
                                         icon: {
                                             path: "M161 214.667H7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 4.236 3.431 7.667 7.667 7.667h153.333c4.236 0 7.667 -3.431 7.667 -7.667v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667zm99.667 -153.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-15.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 17.135 11.318 31.476 26.833 36.383v56.776c0 6.684 -4.552 12.899 -11.145 13.987C206.626 192.865 199.333 186.391 199.333 178.25v-13.417c0 -23.288 -18.879 -42.167 -42.167 -42.167h-3.833V30.667c0 -16.939 -13.728 -30.667 -30.667 -30.667H46C29.061 0 15.333 13.728 15.333 30.667v168.667h138V145.667h3.833c10.585 0 19.167 8.582 19.167 19.167v11.792c0 19.009 13.858 36.014 32.78 37.859C230.819 216.607 249.167 199.53 249.167 178.25V120.716c15.515 -4.907 26.833 -19.248 26.833 -36.383v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667h-7.667zm-136.04 22.885 -44.898 66.604c-1.054 1.596 -2.976 2.511 -4.979 2.511 -3.675 0 -6.454 -3.009 -5.592 -6.191L80.189 107.333H51.75c-3.474 0 -6.157 -2.679 -5.697 -5.697l7.667 -51.271C54.098 47.869 56.532 46 59.417 46h32.583c3.776 0 6.526 3.134 5.558 6.33L92 76.667h27.648c4.428 0 7.192 4.207 4.979 7.552z",
                                             fillColor: "#000",
                                             fillOpacity: 1,
                                             scale: .1,
                                         }  ,
                                         zIndex: 999,
                                         clickable: true
                                     });
                                     console.log(minIdCharger +" -- "+min.latitude )
                                
                                 defect=min.defect;
                                   marker.setPosition({ lat, lng });
                                   
                                 intervalId4Car2 = setInterval(async () => {
                                     if (charger&&scoreCar2<97) {
                                         charger=true;
                                         scoreCar2=scoreCar2+3;
                                         document.cookie = "InStation=true";
                                         document.cookie = "score="+score;
                                     }  
                                     else if(scoreCar2>=97){
                                        scoreCar2=100
                                       document.cookie = "InStation=false";
                                       charger=false;
                                     }
                                 if (path.length <= countCar2){
                 
                                 clearInterval(intervalId4Car2);}
                                 }, 200);
                               }
                             }
                         }, 200);
                          
                           console.log("End of route change")
                           ////////End of route change
     
                          
                       });
                    
                         }
                   function Near_Charger2(){
                    document.cookie = "Charger=defectYes";
                 // Fetch chargestation coordinates and add markers to map
                  fetch('https://proxy.digitalauto.tech/fleet-simulate/get_chargestation_data')
                  .then(response => response.json())
                  .then(async chargestationCoordinates => {
                      // For each charger, create a marker on the map
                      let min=null;
                      let minIdCharger=null;
                   
                      for (let chargestationId in chargestationCoordinates) {
                          let coordinates = chargestationCoordinates[chargestationId];

                          if (coordinates.availability && !coordinates.defect)    
                          if (min==null){
                            min=coordinates
                            minIdCharger=chargestationId  
                          }
                          else if (distance(min.latitude,min.longitude,path[count].lat,path[count].lng)>distance(coordinates.latitude,coordinates.longitude,path[count].lat,path[count].lng)){
                            min=coordinates
                            minIdCharger=chargestationId
                          }
                      }



                    ////////Change route to the charger station
 
                    let countToCharger=0;
                    const stepPositionsToCharger= await fetch(apiUrl+lng+","+lat+";"+min.longitude+","+min.latitude+"?steps=true")
                    .then(response => response.json())
                    .then(data => {
                        const stepPositionsToChargerStation = data.routes[0].legs.flatMap(leg =>
                            leg.steps.map(step => ({
                                lat: step.maneuver.location[1],
                                lng: step.maneuver.location[0]
                            }))
                        );
                        routeToCharger=true;
                        document.cookie = "routeToCharger=" + true;
                        return stepPositionsToChargerStation;
                    })
                    intervalId6 = setInterval(async () => {
                        console.log(countToCharger);
                        if (routeToCharger) {
                            lat = stepPositionsToCharger[countToCharger].lat;
                            lng = stepPositionsToCharger[countToCharger].lng;
                            marker.setPosition({ lat, lng });
                            countToCharger ++;
                            score = score - 0.5;
                           
                            document.cookie = "score=" + score;
                        
                        }
                        if (stepPositionsToCharger.length <= countToCharger){
                            lat = stepPositionsToCharger[stepPositionsToCharger.length-1].lat;
                            lng = stepPositionsToCharger[stepPositionsToCharger.length-1].lng;
                            marker.setPosition({ lat, lng });
                            clearInterval(intervalId6);
                            routeToCharger=false;
                            document.cookie = "routeToCharger=" + false;
                            document.cookie = "Charger=defectNo";
                         
                            intervalId4 = setInterval(async () => {
                                if (charger&&score<97) {
                                    score=score+3;
                                    document.cookie = "InStation=true";
                                    document.cookie = "score="+score;
                                }  
                                else if(score>=97){
                                  document.cookie = "InStation=false";
                                  score=100
                                  charger=false;
                                }
                                if (path.length <= count)
                            clearInterval(intervalId4);
                            }, 100);
                          
                        }
                    }, 200);
                       console.log("End of route change 2")
                      ////////End of route change
                  });
                    }

                  intervalId = setInterval(async () => {
                    if (path)
                      if (!routeToCharger && (path.length-1 > count) && ( ((score>40) && !charger) || (!routeToCharger && (count>((path.length*0.65)))&&score>0) ) ) {
                        lat = path[count].lat;
                          lng = path[count].lng;
                          marker.setPosition({ lat, lng });
                          if(count<path.length*0.5)
                          count+=7;
                        else  if(count<path.length*0.7)
                        count+=5;
                        else
                        count+=3;
                          score=score-0.2;
                          document.cookie = "score="+score;
                      } else  if((score<40)&&(!charger)&&(score>0)&&(count<((path.length*0.65)))){
                        charger=true;  
                        Near_Charger()
                      }
                      if ((path.length <= count) || score<1 ){
                        document.cookie = "InRoute=No";
                        document.cookie = "Parking=Yes";
                      clearInterval(intervalId);}
                  }, 1000);

                  intervalIdCar2 = setInterval(async () => {
                    if (path)
                      if (!routeToChargerCar2 && (path.length-1 > countCar2) && ( ((scoreCar2>40) && !chargerCar2) || (!routeToChargerCar2 && (countCar2>((path.length*0.65)))&&scoreCar2>0) ) ) {
                         latCar2  = path[countCar2].lat;
                         lngCar2  = path[countCar2].lng;                         
                          let lat  = path[countCar2].lat;
                          let lng  = path[countCar2].lng;
                          markerCar2.setPosition({ lat , lng  });
                          if(countCar2<path.length*0.5)
                          countCar2+=7;
                        else  if(countCar2<path.length*0.7)
                        countCar2+=5;
                        else
                        countCar2+=3;
                          scoreCar2=scoreCar2-0.2;
                          document.cookie = "scoreCar2="+scoreCar2;
                      } else  if((scoreCar2<40)&&(!chargerCar2)&&(scoreCar2>0)&&(countCar2<((path.length*0.65)))){
                        chargerCar2=true;  
                        Near_ChargerCar2()
                      }
                      if ((path.length <= countCar2) || scoreCar2<1 ){
                        document.cookie = "InRouteCar2=No";
                        document.cookie = "ParkingCar2=Yes";
                      clearInterval(intervalIdCar2);}
                  }, 1000);
            }
        }
        
    }
};

export default GoogleMapsPluginApi;