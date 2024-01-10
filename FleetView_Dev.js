import SignalPills from "./reusable/SignalPills.js"

const loadScript = (boxWindow, url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const script = boxWindow.document.createElement("script");
            script.defer = true;
            script.referrerPolicy = "origin"

            script.src = url;
            boxWindow.document.head.appendChild(script);
            script.addEventListener("load", () => resolve(undefined));
        } catch (e) {
            reject();
        }
    });
}


const plugin = ({ box, widgets }) => {
    widgets.register("Map", (box) => {
        loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=AIzaSyC3LEcjTvyxYu1urM8qrGtZc_a5eNlPdW0`)
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

                const rectCenter = new box.window.google.maps.LatLngBounds(rectangleCoordinates[0], rectangleCoordinates[1]).getSouthWest()

                const map = new box.window.google.maps.Map(container, {
                    zoom: 8, // 6.3
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
                fetch('http://193.148.170.44:9966/get_vehicle_coordinates')
                .then(response => response.json())
                .then(vehicleCoordinates => {

                    // For each vehicle, create a marker on the map
                    for (let vehicleId in vehicleCoordinates) {
                        let coordinates = vehicleCoordinates[vehicleId];
                        // Store market in markers object
                        vehicleMarkers[vehicleId] = new box.window.google.maps.Marker({
                            position: { lat: coordinates.latitude_start, lng: coordinates.longitude_start },
                            map: map,
                            icon: {
                                path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                                fillColor: '#eb2533',
                                fillOpacity: 1,
                                anchor: new box.window.google.maps.Point(12, -290),
                                strokeWeight: 0,
                                scale: .1,
                                rotation: 0
                            },
                            clickable: true
                        });
                        vehicleMarkers[vehicleId].addListener('click', () => {
                            window.location.href = `/model/RBWCkwGkZqqfh6Dv3gMf/library/prototype/uPoDFuXSWxXPgKm4SuXE/view/run?vehicleId=${vehicleId}`
                        })
                    }
                });

                // Every 5 seconds, fetch the new coordinates and update the vehicle markers
                setInterval(async () => {
                    const response = await fetch("http://193.148.170.44:9966/get_vehicle_coordinates")
                    const vehicleCoordinates = await response.json();
                    Object.keys(vehicleCoordinates).forEach(vehicleId => {
                        const coordinates = vehicleCoordinates[vehicleId];
                        vehicleMarkers[vehicleId].setPosition({ lat: coordinates.latitude_start + (Math.random()-0.5)*0.008, lng: coordinates.longitude_start + (Math.random()-0.5)*0.008 });
                    })
                }, 1000);

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
                            icon:  {
                                path: "M161 214.667H7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 4.236 3.431 7.667 7.667 7.667h153.333c4.236 0 7.667 -3.431 7.667 -7.667v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667zm99.667 -153.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-15.333V38.333c0 -4.236 -3.431 -7.667 -7.667 -7.667s-7.667 3.431 -7.667 7.667v23h-7.667c-4.236 0 -7.667 3.431 -7.667 7.667v15.333c0 17.135 11.318 31.476 26.833 36.383v56.776c0 6.684 -4.552 12.899 -11.145 13.987C206.626 192.865 199.333 186.391 199.333 178.25v-13.417c0 -23.288 -18.879 -42.167 -42.167 -42.167h-3.833V30.667c0 -16.939 -13.728 -30.667 -30.667 -30.667H46C29.061 0 15.333 13.728 15.333 30.667v168.667h138V145.667h3.833c10.585 0 19.167 8.582 19.167 19.167v11.792c0 19.009 13.858 36.014 32.78 37.859C230.819 216.607 249.167 199.53 249.167 178.25V120.716c15.515 -4.907 26.833 -19.248 26.833 -36.383v-15.333c0 -4.236 -3.431 -7.667 -7.667 -7.667h-7.667zm-136.04 22.885 -44.898 66.604c-1.054 1.596 -2.976 2.511 -4.979 2.511 -3.675 0 -6.454 -3.009 -5.592 -6.191L80.189 107.333H51.75c-3.474 0 -6.157 -2.679 -5.697 -5.697l7.667 -51.271C54.098 47.869 56.532 46 59.417 46h32.583c3.776 0 6.526 3.134 5.558 6.33L92 76.667h27.648c4.428 0 7.192 4.207 4.979 7.552z",
                                fillColor: color,
                                fillOpacity: 1,
                                anchor: new box.window.google.maps.Point(12,-290),
                                strokeWeight: 0,
                                scale: .1,
                                rotation: 0
                            } ,
                            clickable: true
                        });
                        chargestationMarkers[chargestationId].addListener('click', () => {
                            window.location.href = `/model/JUczdpLduBR24kMeMpyC/library/prototype/TX73uJZmwGVy3a4M3jaY/view/run?chargestationId=${chargestationId}`
                        })
                    
                    }
                });

             

            })
    })

 

    ////////Action Widget////
    let AvStations=null;
    let numStations=null;

    widgets.register("VehicleActions_Dev_Part2",  box => {
        const container = document.createElement("div");
        container.setAttribute("style", `height: 100%; display: flex; flex-direction: column;padding-left: 10px;padding-right: 10px;`);
  
        container.innerHTML = `
                 
     
            
        <div style="display: flex; height: 100%; background-image: linear-gradient(to right, #f95850, #ff836f); color: white; padding: 15px; border-radius: 15px; user-select: none; align-items: center;margin-bottom: 7px;" data-signal="Fleet.NumberOfMovingVehicles">
            <div style="display: flex; flex-direction: column; overflow: hidden; width: 100%;">
                <div style="margin-bottom: 10px; overflow: hidden;text-overflow: ellipsis; font-size: 0.75em;" title="NumberOfMovingVehicles">Number Of Charges Stations</div>
                <div style="font-size: 1.1em;" class="signal-value"><span id="numStations">0</span></div>
            </div>
            <div style="margin-left: auto;height: 100%;margin-left: 10px;margin-right: 4px;margin-top: 4px;"><i style="font-size: 1.3em;" class="fa-solid fa-route" aria-hidden="true"></i></div>
        </div>
    
        <div style="display: flex; height: 100%; background-image: linear-gradient(to right, #f95850, #ff836f); color: white; padding: 15px; border-radius: 15px; user-select: none; align-items: center;false" data-signal="Fleet.NumberOfChargingVehicles">
            <div style="display: flex; flex-direction: column; overflow: hidden; width: 100%;">
                <div style="margin-bottom: 10px; overflow: hidden;text-overflow: ellipsis; font-size: 0.75em;" title="NumberOfChargingVehicles">Number Of Availables Charges Stations</div>
                <div style="font-size: 1.1em;" class="signal-value"><span id="AvStations">0 </span></div>
            </div>
            <div style="margin-left: auto;height: 100%;margin-left: 10px;margin-right: 4px;margin-top: 4px;"><i style="font-size: 1.3em;" class="fa-solid fa-charging-station" aria-hidden="true"></i></div>
        </div>        
         `
         AvStations = container.querySelector("#AvStations");
         numStations = container.querySelector("#numStations");
         let count=0;
         let availables=0;

           // Fetch chargestation coordinates and add markers to map
           fetch('https://proxy.digitalauto.tech/fleet-simulate/get_chargestation_data')
           .then(response => response.json())
           .then(chargestationCoordinates => {
               // For each charger, create a marker on the map
               for (let chargestationId in chargestationCoordinates) {
                   let coordinates = chargestationCoordinates[chargestationId];
                   count++;     

                   if (coordinates.availability){
                    availables++
                   }

               }
           });
           numStations.textContent= count.toString ;
           AvStations.textContent= availables.toString;
           
          box.injectNode(container);
   
      })
      
    //////End Actions//////
}

export default plugin