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
    let car1 = null
    let lat = path[0].lat;
    let lng = path[0].lng;
    let latCar1 = 0;
    let lngCar1 = 0;
    let intervalId;
    let count=0;
    let score=50;
    let distance=0;
    document.cookie = "score="+score;

    const apiUrl = 'http://193.148.170.44:5000/route/v1/driving/';

    const fetchPathFromApi = async() => {


        return fetch('http://193.148.170.44:9966/get_vehicle_coordinates')
            .then(response => response.json())
            .then(carsCoordinates => {
                // For each vehicle, create a marker on the map
                const vehicleId =  new URLSearchParams(window.location.search).get('vehicleId');


                for (let carId in carsCoordinates) {
                    let coordinates = carsCoordinates[carId];

                    if (vehicleId==carId){
                    
                        
                     lat = coordinates.latitude_start;
                     lng = coordinates.longitude_start;

            return fetch(apiUrl+coordinates.longitude_start+","+coordinates.latitude_start+";"+coordinates.longitude_end+","+coordinates.latitude_end+"?steps=true")
            .then(response => response.json())
            .then(data => {
           

                const stepPositions = data.routes[0].legs.flatMap(leg =>
                    leg.steps.map(step => ({
                        lat: step.maneuver.location[1],
                        lng: step.maneuver.location[0]
                    }))
                );
                
                

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

        /*        
            // Create an object to store the markers by CarId
            let carsMarkers = {}

            // Fetch cars coordinates and add markers to map
            fetch('https://fleetsim.onrender.com/vehicle/all/coordinates')
            .then(response => response.json())
            .then(carsCoordinates => {
                // For each vehicle, create a marker on the map
                for (let carId in carsCoordinates) {
                    let coordinates = carsCoordinates[carId];
                    console.log(pos);

                    // Store market in markers object
                    carsMarkers[carId] = new box.window.google.maps.Marker({
                        position: { lat: coordinates.latitude, lng: coordinates.longitude },
                        map: map,
                        icon: icon === null ? {
                            path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                            fillColor: '#FF5733',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(12,-290),
                            strokeWeight: 0,
                            scale: .07,
                            rotation: 0
                        } : icon,
                        clickable: true
                    });
                    
                
                }
            });
            */

    // Use stepPositions to render or perform any other actions
    let stepPositions =  await fetchPathFromApi();
    
  
    path=  stepPositions;
    let intervalId2;

    let charger=false;
    
     
     intervalId2 = setInterval(async () => {
        if (path)
        if (path.length>count){
            score--;
        
    
        count++;}
    }, 2000); 
    
 

    

    return {
        setVehiclePin: (coordinates) => {
            
 
            if (coordinates === null) {
                if (marker !== null) {
                    marker.setMap(null)
                    marker = null    
                }
             } else {
                /*
                const position = new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
                }) ;
               
                let  lat = position.coords.latitude;
                let  lng = position.coords.longitude;
                 */
       
                if (marker === null) {
                    marker = new box.window.google.maps.Marker({
                        position: {lat, lng},
                        map,
                        icon: {
                            path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                            fillColor: '#eb2533',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(20,-200),
                            strokeWeight: 0,
                            scale: .1,
                            rotation: 0
                        }  
                    })
             
                }  
                
                  // Create an object to store the markers by chargestationId
                  const chargestationMarkers = {}

                  // Fetch chargestation coordinates and add markers to map
                  fetch('http://193.148.170.44:9966/get_chargestation_data')
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
               

                
                      /* */
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
                 // Fetch chargestation coordinates and add markers to map
                  fetch('http://193.148.170.44:9966/get_chargestation_data')
                  .then(response => response.json())
                  .then(chargestationCoordinates => {
                      // For each charger, create a marker on the map
                      let min=null;
                      let minIdCharger=null;
                   
                      for (let chargestationId in chargestationCoordinates) {
                          let coordinates = chargestationCoordinates[chargestationId];

                          if (coordinates.availability)                 
                          if (min==null){
                            min=coordinates
                            minIdCharger=chargestationId                            
                          }
                          else if (distance(min.latitude,min.longitude,path[count].lat,path[count].lng)>distance(coordinates.latitude,coordinates.longitude,path[count].lat,path[count].lng)){
                            min=coordinates
                            minIdCharger=chargestationId
                          }
                      }
                    

                      lat = min.latitude;
                      lng = min.longitude;

                    

                      marker.setPosition({ lat, lng });
 
                      
                      intervalId = setInterval(async () => {
                          if (charger&&score<100) {
                              score=score+1;
                              document.cookie = "score="+score;
                          }  
                          else if(score==100){
                            charger=false;
                          }
                      }, 200);

                  });
                        


                    }
                 
               
                  intervalId = setInterval(async () => {
                    if (path)
                      if ((path.length > count) && (score>20) && !charger) {
                          lat = path[count].lat;
                          lng = path[count].lng;
                          marker.setPosition({ lat, lng });
                          count++;
                          console.log("count= "+count);
                          score=score-2;
                          document.cookie = "score="+score;
                         
                      } else  if((score<22)&&(!charger)&&(count<(path.length-2))){
                        charger=true;                     

                        Near_Charger()
                      }
                    /*  if (intervalId2) {
                        console.log("Clearing existing interval:", intervalId2);
                        clearInterval(intervalId2);
                    }
                    */

                  }, 2000);
                 
                             
         

            }
        }
        
    }
};

export default GoogleMapsPluginApi;