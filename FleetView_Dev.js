import SignalPills from "./reusable/SignalPills.js"
import SignalTile from "./reusable/SignalTile.js"
import LineChart from "./reusable/LineChart.js"


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


const plugin = ({ widgets,  simulator,  modelObjectCreator}) => {
    const fleet = modelObjectCreator("Fleet")

    const NumberOfMovingVehiclesTile = {
        signal: "Fleet.NumberOfMovingVehicles",
        label: "NumberOfMovingVehicles",
        icon: "route",
        color: "blue",
    }

    const NumberOfChargingVehiclesTile = {
        signal: "Fleet.NumberOfChargingVehicles",
        label: "NumberOfChargingVehicles",
        icon: "charging-station",
        color: "brown",
    }

    const NumberOfStuckVehicles = {
        signal: "Fleet.NumberOfStuckVehicles",
        label: "NumberOfStuckVehicles",
        icon: "car-burst",
        color: "green",
    }

    const NumberOfQueuedVehicles = {
        signal: "Fleet.NumberOfQueuedVehicles",
        label: "NumberOfQueuedVehicles",
        icon: "car-side",
    }

    widgets.register(
        "VehicleActions",
        SignalPills(
            [
                NumberOfMovingVehiclesTile,
                NumberOfChargingVehiclesTile,
                NumberOfStuckVehicles,
                NumberOfQueuedVehicles
            ],
            fleet
        )
    )

    const AverageSpeedTile = {
        signal: "Fleet.AverageSpeed",
        label: "AverageSpeed",
        icon: "gauge-high",
    }

    widgets.register(
        "AverageSpeed",
        SignalTile(
            AverageSpeedTile,
            fleet
        )
    )

    widgets.register(
        "AverageSpeedChart",
        LineChart(
            [
                AverageSpeedTile
            ],
            fleet,
            1000
        ),
    )

    widgets.register(
        "NumberOfVehiclesChart",
        LineChart(
            [
                NumberOfMovingVehiclesTile,
                NumberOfChargingVehiclesTile,
                NumberOfStuckVehicles,
                NumberOfQueuedVehicles
            ],
            fleet,
            1000
        )
    )
    
    // Here's an object that stores the current value of each signal (initialized with the value of 0)
    
    const currentSignalValues = {
        "Fleet.NumberOfMovingVehicles": 0,
        "Fleet.NumberOfChargingVehicles": 0,
        "Fleet.NumberOfQueuedVehicles": 0,
        "Fleet.NumberOfStuckVehicles": 0,
        "Fleet.AverageSpeed": 0,
    }

    // Simulators for each signal, that return the current value of the signal
    for (const signal in currentSignalValues) {
		simulator(signal, "get", async () => {
			return currentSignalValues[signal]
		})
    }
    

    const updateFleet = async () => {
        const response = await fetch("https://fleetsim.onrender.com/fleet")
        const fleetJson = await response.json()
        // console.log(`fleetJson`)
        // console.log(fleetJson)
        fleetJson['Fleet.AverageSpeed'].value += Math.random()
        fleetJson['Fleet.NumberOfMovingVehicles'].value += Math.round(Math.random()*6)-3
        fleetJson['Fleet.NumberOfStuckVehicles'].value += Math.round(Math.random()*8)-4
        fleetJson['Fleet.NumberOfChargingVehicles'].value += Math.round(Math.random()*3)
        fleetJson['Fleet.NumberOfQueuedVehicles'].value += Math.round(Math.random()*2)
        
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal].value
        }
    }

    // Every 5 sec, Fetch from https://evfleetsim.onrender.com/fleet a json object (has the same keys as currentSignalValues), and update currentSignalValues
    setInterval(() => {
        updateFleet()
    }, 1000)

    updateFleet()

    ////Map Widget///////
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
                fetch('https://proxy.digitalauto.tech/fleet-simulate/get_vehicle_coordinates')
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
                    const response = await fetch("https://proxy.digitalauto.tech/fleet-simulate/get_vehicle_coordinates")
                    const vehicleCoordinates = await response.json();
                    Object.keys(vehicleCoordinates).forEach(vehicleId => {
                        const coordinates = vehicleCoordinates[vehicleId];
                        vehicleMarkers[vehicleId].setPosition({ lat: coordinates.latitude_start + (Math.random()-0.5)*0.008, lng: coordinates.longitude_start + (Math.random()-0.5)*0.008 });
                    })
                }, 1000);

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
                        const carIcon;

                        if (coordinates.availability){
                            carIcon="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Favailablecaricon.png?alt=media&token=8028bf73-5775-46e6-9e92-ef29a587598e";
                           
                        }
                        else if (coordinates.defect){
                            carIcon =  "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fnotavailablecaricon.png?alt=media&token=d213e5b1-f7a4-44a8-96e5-485db6303a91";
                          }
                          else {
                            carIcon=  "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fnotavailablecaricon2.png?alt=media&token=d063eeb9-ecec-4f38-a3ba-3eb08cc49880";
                          }
                         
                         chargestationMarkers[chargestationId] = new box.window.google.maps.Marker({
                            position: { lat: coordinates.latitude, lng: coordinates.longitude },
                            map: map,
                            icon:  {
                                url:carIcon,
                                fillOpacity: 1,
                                anchor: new box.window.google.maps.Point(12,-290),
                                strokeWeight: 0,
                                scale: .1,
                                rotation: 0,

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
    ///////End Map Widget/////

    widgets.register(
        "VehicleActions_Dev",
        SignalPills(
            [
                NumberOfMovingVehiclesTile,
                NumberOfChargingVehiclesTile,
            ],
            fleet
        )
    )

    
     ///// Cover Image //////
 
     widgets.register("Cover",  box => {
        const container = document.createElement("div");
        container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);
  
        container.innerHTML = `
        <img width="100%" height="100%"  src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FChargingFunCover.png?alt=media&token=e217d0e6-1444-48db-b794-4650392f41ac" >
 
        `
       
  
          box.injectNode(container);
   
      })
   ///// MapsLegend //////
 
   widgets.register("MapsLegend",  box => {
    const container = document.createElement("div");
    container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);

    container.innerHTML = `
    <img width="100%" height="100%"  src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FinfoMap.png?alt=media&token=7a60aade-c61f-4a56-a61b-2eecd33e1479" >

    `
   

      box.injectNode(container);

  })
  
  widgets.register("ChartGraph",  box => {
    const container = document.createElement("div");
    container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;background-color: #00001e; `);

    container.innerHTML = `
    <img width="60%" height="100%"  src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FChartStatic.png?alt=media&token=ada31d8f-7ba2-43cf-a5bd-1ab3a3e9c308" >
    <div style="width:40%;height="100%";background-color: #00001e;"></div>
    `
   

      box.injectNode(container);

  })
 
     ///// Updated data //////
     let intervalId5;
     let intervalId6;
     let intervalId7;
     let intervalId8;
     let stopwatchValue=null;
     let stopwatchValueCar2=null;
     let timingToBeInCar1=true;
     widgets.register("UpdatedInfo",  box => {
      const container = document.createElement("div");
      container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);

      container.innerHTML = `
      <table style="border: none; border-collapse: collapse;height: 100%; width:100%" >
<colgroup>
  <col style="background-color:#00001e; " >
  <col style="background-color:#40001c; ">
  <col style="background-color:#003740; ">
</colgroup>
<tr >
  <td style="color:white; width:20%">Average Ev route time</td>
  <td style="color:#ff006e; width:40%;  font-size: x-large;" >&nbsp;&nbsp;<span id="stopwatch">00:00</span><span>&nbsp; h</span></td>
  <td style="color:#00ffff; width:40%;  font-size: x-large;" >&nbsp;&nbsp;<span id="stopwatch2">00:00</span><span>&nbsp; h</span></td>

</tr>
<tr>
  <td style="color:white;  ">Average route distance </td>
  <td style="color:#ff006e;"></td>
  <td style="color:#00ffff;"></td>
  
</tr>
<tr>
    <td style="color:white; ">Reroutes because of non-functioning charging station</td>
    <td style="color:#ff006e;font-size: x-large;"></td>
    <td style="color:#00ffff;font-size: x-large;"></td>
     
  </tr>    
  <tr>
    <td style="color:white;">Updated charging stations</td>
    <td style="color:#ff006e;"><span style="width:70%">
    <img width="50px" height="50px"  src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Ficon1.png?alt=media&token=e3daae9a-b2cf-445a-804b-31ddee038655" >
    </span>
    <span style="width:100px"> &nbsp;</span>
    <span style="width:30% ;margin-left:100px">
    <img width="50px" height="50px"  src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Ficon002.png?alt=media&token=d3a69c0d-67b2-44b2-8698-917e27f5d947" >
    </span>
    </td>

    <td style="color:#00ffff;">
    <span style="width:70%; font-size: xx-large;">
    X
    </span>
    <span style="width:100px"> &nbsp;</span>
    <span style="width:30%; margin-left:100px">
    <img width="50px" height="65px"  src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Ficon003.png?alt=media&token=c5a2f484-319e-41cb-be24-663779acdd5b" >
    </span>
    </td>
    
  </tr>
</table>
<style>
td{
    padding: 1%;
}
</style>   
      `
     


      stopwatchValue = container.querySelector("#stopwatch");
      stopwatchValueCar2 = container.querySelector("#stopwatch2");
     
      let totalElapsedTime = 0;
      let startTime;
      let stopwatchInterval;
      let isRunning = false;
      let lastUpdateTime = 0;


         function startStopwatch() {
             if (!isRunning) {
                 startTime = performance.now();
                 lastUpdateTime = startTime;
                 stopwatchInterval = setInterval(updateStopwatch, 1); // Update every 1 millisecond
                 isRunning = true;
                 
             }
         }


         function stopStopwatch() {
             if (isRunning) {
                 clearInterval(stopwatchInterval);
                 totalElapsedTime += performance.now() - startTime;
                 isRunning = false;
             }
         }


         function updateStopwatch() {
          console.log("updateStopwatch")

             const currentTime = performance.now();
             const elapsed = isRunning ? totalElapsedTime + currentTime - startTime : totalElapsedTime;
             lastUpdateTime = currentTime;

             const seconds = Math.floor((elapsed / 1000) % 60);
             const minutes = Math.floor((elapsed / (1000 * 60)) % 60);

             const formattedTime = pad(minutes) + ':' + pad(seconds);
             stopwatchValue.innerText  = formattedTime;
             console.log(formattedTime)
         }

 

         function pad(value) {
             return value < 10 ? '0' + value : value;
         }


         intervalId7 = setInterval(async () => {
           if (timingToBeInCar1){
           clearInterval(intervalId7);
           startStopwatch();
         }
         }, 1000);
         intervalId8 = setInterval(async () => {
           if (startTime && !timingToBeInCar1){
           clearInterval(intervalId8);
           stopStopwatch();
         }
         }, 1000);

         let totalElapsedTimeCar2 = 0;
         let startTimeCar2;
         let stopwatchIntervalCar2;
         let isRunningCar2 = false;
         let lastUpdateTimeCar2 = 0;
  
            function startStopwatchCar2() {
                if (!isRunningCar2) {
                    startTimeCar2 = performance.now();
                    lastUpdateTimeCar2 = startTimeCar2;
                    stopwatchIntervalCar2 = setInterval(updateStopwatchCar2, 1); // Update every 1 millisecond
                    isRunningCar2 = true;
                }
            }
  
  
            function stopStopwatchCar2() {
                if (isRunningCar2) {
                    clearInterval(stopwatchIntervalCar2);
                    totalElapsedTimeCar2 += performance.now() - startTimeCar2;
                    isRunningCar2 = false;
                }
            }
   
  
            function updateStopwatchCar2() {
                const currentTime = performance.now();
                const elapsed = isRunning ? totalElapsedTime + currentTime - startTime : totalElapsedTime;
                lastUpdateTimeCar2 = currentTime;
  
                const seconds = Math.floor((elapsed / 1000) % 60);
                const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
  
                const formattedTime = pad(minutes) + ':' + pad(seconds);
                stopwatchValueCar2.innerText  = formattedTime;
            }
  
            intervalId5 = setInterval(async () => {
             if (getCookie("InRouteCar2") == "Yes"){
             clearInterval(intervalId5);
             startStopwatchCar2();
             console.log("Start Car 2")
           }
           }, 200);
           intervalId6 = setInterval(async () => {
             if (startTimeCar2 && getCookie("InRouteCar2") == "No"){
             clearInterval(intervalId6);
             stopStopwatchCar2();
             console.log("Stop Car 2")
           }
           }, 200);             

       box.injectNode(container);
 
    })



    ////////Action Widget////
    let AvStations=null;
    let numStations=null;
    let intervalId3;
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
           
           intervalId3 = setInterval(async () => {
            numStations.textContent=   count ;
           AvStations.textContent=   availables ;
          }, 1000);
           
          box.injectNode(container);
   
      })
    //////End Actions//////
}

export default plugin