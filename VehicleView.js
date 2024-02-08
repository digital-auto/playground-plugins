import StatusTable from "./reusable/StatusTable.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal_Dev.js"
import LineChart from "./reusable/LineChart.js"
 
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const condBecomesTrue = async (cond, sleep_ms = 1000) => {
    while(!cond()) {
        await sleep(sleep_ms)
    }
}

const plugin = ({simulator, widgets, modelObjectCreator}) => {
    const vehicle = modelObjectCreator("Vehicle")

    // Get the query string value of "vehicleId" with URLSearchParams
    const params = new URLSearchParams(window.location.search)
    const vehicleId = params.get('vehicleId')

    if (!vehicleId) {
        // Fetch vehicle coordinates from API and link to the first vehicle
        fetch('https://proxy.digitalauto.tech/fleet-simulate/get_vehicle_coordinates')
        .then(response => response.json())
        .then(vehicleCoordinates => {
            const firstVehicleId = Object.keys(vehicleCoordinates)[0]
            window.location.href = `?vehicleId=${firstVehicleId}`
        })
    }

    const currentSignalValues = {
        "Vehicle.VehicleIdentification.VIN": 0,
        "Vehicle.Speed": 0,
        "Vehicle.CurrentLocation.Latitude": 0,
        "Vehicle.CurrentLocation.Longitude": 0,
        "Vehicle.Powertrain.TractionBattery.NetCapacity": 0,
        "Vehicle.Powertrain.TractionBattery.Charging.ChargeLimit": 0,
        "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current": 0,
        "Vehicle.Powertrain.TractionBattery.Range": 0,
        "Vehicle.Powertrain.TractionBattery.Charging.IsCharging": false,
        "Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete": 0,
        "Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude": 0,
        "Vehicle.Cabin.Infotainment.Navigation.OriginSet.Longitude": 0,
        "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Latitude": 0,
        "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Longitude": 0

    }

    // Simulators for each signal, that return the current value of the signal
    for (const signal in currentSignalValues) {
        simulator(signal, "get", async () => {
            return currentSignalValues[signal]
        })
    }

    const updateVehicle = async () => {
        if (!vehicleId) {
            return
        }
        const response = await fetch(`https://fleetsim.onrender.com/vehicle/${vehicleId}`)
        const fleetJson = await response.json()
        for (const signal in currentSignalValues) {
            currentSignalValues[signal] = fleetJson[signal].value
        }
    }

    // Update the vehicle every 5 seconds
    
    setInterval(updateVehicle, 1000)

    updateVehicle()

	widgets.register("VehicleStatus", StatusTable({


        // Filter all Latitiude and Longitude signals
        apis: Object.keys(currentSignalValues).filter(signal => !(signal.includes("Latitude") || signal.includes("Longitude")) ),
        vehicle,
        refresh: 500
    }))

 
    //////////// Test Maps ///////////////

  widgets.register("VehicleMapDev", async (box) => {
    

    const fetchPathFromApi = async() => {

      fetch('https://proxy.digitalauto.tech/fleet-simulate/get_vehicle_coordinates')
          .then(response => response.json())
          .then(carsCoordinates => {
              // For each vehicle, create a marker on the map
              const vehicleId =  new URLSearchParams(window.location.search).get('vehicleId');
 
              for (let carId in carsCoordinates) {
                  let coordinates = carsCoordinates[carId];

                  if (vehicleId==carId){
                    let retu=[
                      { lat: coordinates.latitude_start, lng: coordinates.longitude_start },
                      { lat: coordinates.latitude_end, lng: coordinates.longitude_end }
                  ]
                    return retu;
              } 
          }
          }).catch(error => {
              console.error('Error fetching data from the API:', error);
              // Return a default path or handle the error as needed
              return [
                  { lat: 49.116911, lng: 9.176294 },
              
                  { lat: 49.0688, lng: 9.2887 }
              ];
          });
              };


        // Use stepPositions to render or perform any other actions
        const stepPositions = fetchPathFromApi();

        const filteredPath = [stepPositions[0], stepPositions[1]];

        return GoogleMapsFromSignal(
            filteredPath,
            vehicle
        )(box);
    });

  
    //////////////// End test Maps ////////////
    //Maps with markets/////
    let container = null

    widgets.register("VehicleMap_Markets", (box) => {
        container = document.createElement('div')
        container.innerHTML = 
        `<div class="cell-xs-12 mobw100 npr">
        <div id="mode-selector" class="controls">Driving Mode selector
          <input type="radio" name="type" id="changemode-driving" checked="checked" />
        </div>
        <div class="form-group text-right">
          <label for="departure_address" class="form-label">From</label>
          <input maxlength="100" id="departure_address" placeholder="From address" type="text" name="departure_address" class="controls form-control form-control-gray-base dybck" value="" style="background: rgb(255, 236, 236) none repeat scroll 0% 0%;" autocomplete="off">
          <small id="clear_dep" onclick="clear_dep();" class="ib w100 tar clear" style="display: inline;">Clear address</small>
          <input type="hidden" name="dep_lat" id="dep_lat" value="">
          <input type="hidden" name="dep_lng" id="dep_lng" value="">
        </div>
      </div>
      
      <div class="cell-xs-12 offset-top-20 mobw100 npr he arrival_address">
        <div class="form-group text-right">
          <label for="arrival_address" class="form-label">To</label>
          <input maxlength="100" id="arrival_address" placeholder="To address" type="text" name="arrival_address" class="controls form-control form-control-gray-base" value="" autocomplete="off">
          <small id="clear_arr" onclick="clear_arr();" class="ib w100 tar clear" style="display: inline;">Clear address</small>
          <input type="hidden" name="arr_lat" id="arr_lat" value="">
          <input type="hidden" name="arr_lng" id="arr_lng" value="">
        </div>
      
        <div class="cell-xs-12 offset-top-20 mobw100 npr he tal date date_hide">
          <div class="form-group ib w50 vat">
            <label for="date" class="form-label">Date</label>
            <input readonly id="date" data-time-picker="date" type="text" name="travel_date" class="form-control form-control-gray-base dates" value="2019-09-10" />
          </div>
          <div class="cell-xs-12 offset-top-20 mobw100 npr he tal pax_adults mt10" style="display: block;">
            <div class="form-group ib w50 ">
              <label for="pax_adults" class="form-label fs11">Pax N</label>
              <input min="1" id="pax_adults" type="number" name="pax_adults" class="p5 form-control form-control-gray-base" value="" style="background: rgb(255, 255, 255) none repeat scroll 0% 0%;">
            </div>
          </div>
      
          <div class="cell-xs-12 offset-top-20 npr he hm tal colback mt10" style="display: block;">
            <div class="form-group nmb ib w100 tac">
              <h6 id="show_more" class="option-heading">Travel info</h6>
              <hr>
            </div>
      
            <div class="form-group nmb ib w100 tac mtb10 option-content is-hidden">
              <div class="form-group nmb ib w100 tac mtb10">
                <div class="form-group nmb ib w50 tac">
                  <label for="travel_distance" class="form-label">Distance</label>
                  <input readonly="" type="text" name="travel_distance" id="travel_distance" value="">
                </div>
                <div class="form-group nmb ib w50 tac">
                  <label for="travel_time" class="form-label">Travel duration</label>
                  <input readonly="" type="hidden" name="normal_travel_time" id="normal_travel_time" value="">
                  <input readonly="" type="text" name="travel_time" id="travel_time" value="">
                </div>
              </div>
      
              <div class="form-group nmb ib w100 tac mtb10">
                <label for="travel_price" class="form-label">Travel price USD</label>
                <input readonly="" class="ib" type="text" name="travel_price" id="travel_price" value="">
              </div>
              <hr>
            </div>
      
          </div>
        </div>
        <div id="mobilemap"></div>
        `
    var marker; // move marker definition into the global scope
var infowindow;
var uniqueId = 1;
var infoWindowcontent;
var markers = [];

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  directionsService.route({
      origin: {
        query: document.getElementById('departure_address').value
      },
      destination: {
        query: document.getElementById('arrival_address').value
      },
      travelMode: 'DRIVING'
    },
    function(response, status) {
      if (status === 'OK') {
        var point = response.routes[0].legs[0];
        directionsRenderer.setDirections(response);

        createMarker(response.routes[0].legs[0].start_location, "A", "start marker", directionsRenderer.getMap(), infowindow);
        var lastLeg = response.routes[0].legs.length - 1;
        createMarker(response.routes[0].legs[lastLeg].end_location, "B", "end marker", directionsRenderer.getMap(), infowindow);
        if (marker && marker.setMap) // hide click marker when directions displayed
          marker.setMap(null);
      } else {
        alert('Directions request failed due to ' + status);
      }
    });
}

function initMap_mobile() {
   const directionsService = new box.window.google.maps.DirectionsService();
   const directionsRenderer = new box.window.google.maps.DirectionsRenderer({
    suppressMarkers: true
  });
  map = new box.window.google.maps.Map(document.getElementById('mobilemap'), {
    mapTypeControl: false,
    center: {
      lat: 42.700000762939,
      lng: 23.333299636841
    },
    zoom: 18
  });
  directionsRenderer.setMap(map);

  box.window.google.maps.event.addListener(map, 'click', function(event) {
    var geocoder = new box.window.google.maps.Geocoder();
    geocoder.geocode({
      'latLng': new box.window.google.maps.LatLng(event.latLng.lat(), event.latLng.lng())
    }, function(results, status) {
      //otherwise clicks twice
      set_lat_long(event.latLng.lat(), event.latLng.lng(), results[0].formatted_address, directionsService, directionsRenderer);

      if (uniqueId == 1) {
        label = 'From Address';
        infoWindowcontent = '<div class="ib infobox"><label style="font-weight:bold;text-transform: uppercase;">From Address:</label><hr><br/>' + results[0].formatted_address + '<br /><br /><button class="btn btn-block btn-primary btn-sm" onclick = "clear_dep();" value = "delete">Delete</button><br/></div>';
      }
      if (uniqueId == 2) {
        label = 'To Address';
        infoWindowcontent = '<div class="ib infobox"><label style="font-weight:bold;text-transform: uppercase;">To Address:</label><hr><br/>' + results[0].formatted_address + '<br /><br /><button class="btn btn-block btn-primary btn-sm" onclick = "clear_arr();" value = "delete">Delete</button><br/></div>';
      }
      if (marker == null) {
        marker = new box.window.google.maps.Marker({
          position: event.latLng,
          draggable: true,
          label: {
            text: label,
            color: '#a2003b'
          },

          animation: box.window.google.maps.Animation.DROP,
          map: map
        });
        marker.id = uniqueId;
      } else {
        marker.setPosition(event.latLng);
      }
      infowindow = new box.window.google.maps.InfoWindow({
        content: infoWindowcontent
      });
      infowindow.open(map, marker);
      uniqueId++;

      //Add marker to the array.
      markers.push(marker);
    });
  });
}

function createMarker(location, label, content, map, id) {
  var marker = new box.window.google.maps.Marker({
    position: location,
    title: label,
    id: id,
    icon: {
      url: 'https://maps.google.com/mapfiles/kml/pal4/icon31.png',
      // This marker is 20 pixels wide by 32 pixels high.
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new box.window.google.maps.Point(0, 0)
    },
    map: map
  });
  infowindow = new box.window.google.maps.InfoWindow({
    content: content,
    maxWidth: 350
  });
  infowindow.setContent(content);
  infowindow.open(map, marker);
  markers.push(marker);
}

function set_lat_long(lat, lng, address, directionsService, directionsRenderer) {
  var dep_lat = $('#dep_lat').val();
  var dep_lng = $('#dep_lng').val();
  var arr_lat = $('#arr_lat').val();
  var arr_lng = $('#arr_lng').val();

  if (isEmpty(dep_lat) || isEmpty(dep_lng)) {
    //alert(dep_lat);
    $('#dep_lat').val(lat);
    $('#dep_lng').val(lng);
    $('#departure_address').val(address);
    $('#clear_dep').show();
  } else {
    if (isEmpty(arr_lat) || isEmpty(arr_lng)) {
      $('#arr_lat').val(lat);
      $('#arr_lng').val(lng);
      $('#arrival_address').val(address);
      $('#clear_arr,.arrival_address').show();
    }
  }

  if (!isEmpty($('#dep_lat').val()) && !isEmpty($('#dep_lng').val()) && !isEmpty($('#arr_lat').val()) && !isEmpty($('#arr_lng').val())) calculateAndDisplayRoute(directionsService, directionsRenderer);
}

function isEmpty(value) {
  return (value == null || value.length === 0);
}

initMap_mobile();


box.injectNode(container)
return () => { }
})

    //// End maps with markets////

    // Register a widget that renders a map with a marker with the vehicle's location
    // Use the GoogleMapsFromSignal widget, then manually change the directions of the map created by accesing the DOM from box.window
    widgets.register("VehicleMap", (box) => {
        condBecomesTrue(() => currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"] !== 0, 1000)
        .then(() => {
          let path = [
            {
                lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"],
                lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Longitude"]
            },
            {
                lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Latitude"],
                lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Longitude"]
            }
        ]
          fetch('https://proxy.digitalauto.tech/fleet-simulate/get_vehicle_coordinates')
          .then(response => response.json())
          .then(carsCoordinates => {
              // For each vehicle, create a marker on the map
              const vehicleId =  new URLSearchParams(window.location.search).get('vehicleId');

              for (let carId in carsCoordinates) {
                let coordinates = carsCoordinates[carId];

                if (vehicleId==carId){
                  let retu=[
                    { lat: coordinates.latitude_start, lng: coordinates.longitude_start },
                    { lat: coordinates.latitude_end, lng: coordinates.longitude_end }
                ]
                  path= retu;
            } 
        }       

            const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
            const end = new box.window.google.maps.LatLng(path[1].lat, path[1].lng);        

            setTimeout(() => {
                const directionsService = new box.window.google.maps.DirectionsService();
                directionsService
                .route({
                    origin: start,
                    destination: end,
                    travelMode: "DRIVING"
                })
                .then((response) => {
                   // console.log("directionsRenderer", box.window.directionsRenderer.setDirections, response)
                    box.window.directionsRenderer.setDirections(response);
                })
                .catch((e) => console.log("Directions request failed due to " + e));    
            }, 0)
        })
         })

        return GoogleMapsFromSignal(
            [
                {
                    "lat": 47.93330662389945,
                    "lng": 6.8981571326644175
                },
                {
                    "lat": 53.08277351361783,
                    "lng": 13.195127235586439
                },
            ],
            vehicle,
        )(box)
    })
 
    let score =100
    let scoreCar2 =100
    const updateSignals = async () => {
       
      
      score = getCookie("score")
      scoreCar2 = getCookie("scoreCar2")
     
      
      scoreFrame.querySelector("#score .text").textContent = parseFloat(score).toFixed(2) + "%"
      scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(score) * 2)) + "," + 200);
      scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(score) * 2)}`)
      scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(score) * 2)}`)
      //message you want to write with the bar
      scoreFrame.querySelector("#score #message").textContent = "Current battery SOC Car 1"

      scoreFrame.querySelector("#scoreCar2 .text").textContent = parseFloat(scoreCar2).toFixed(2) + "%"
      scoreFrame.querySelector("#scoreCar2 .mask").setAttribute("stroke-dasharray", (200 - (parseInt(scoreCar2) * 2)) + "," + 200);
      scoreFrame.querySelector("#scoreCar2 .needle").setAttribute("y1", `${(parseInt(scoreCar2) * 2)}`)
      scoreFrame.querySelector("#scoreCar2 .needle").setAttribute("y2", `${(parseInt(scoreCar2) * 2)}`)
      //message you want to write with the bar
      scoreFrame.querySelector("#scoreCar2 #message").textContent = "Current battery SOC Car 2"
 
  }
  function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    let cookieArr = document.cookie.split(";");
    
    // Loop through the array elements
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    
    // Return null if not found
    return null;
}

    
      
let Charged=false;
  const updateImagePlayed = async (charger,Drive,Defect,Parking) => {
    score = getCookie("score") // document.cookie.substring(6, document.cookie.length)
    let Status= getCookie("Charger") //document.cookie.substring(8, document.cookie.length)
    let routeToCharger= getCookie("routeToCharger") //document.cookie.substring(8, document.cookie.length)
    InStation= getCookie("InStation") //document.cookie.substring(8, document.cookie.length)
    let InRoute= getCookie("InRoute") //document.cookie.substring(8, document.cookie.length)


    function delayedFunction() { 
    if(!Charged){
    console.log("delayed")
    }
      }  

      if (InStation=="true"){
        charger.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:block";
        Drive.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        Defect.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        Parking.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
      }
      else if (Status=="defectYes"){
        Defect.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:block";
        charger.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        Drive.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        Parking.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        const delayInMilliseconds = 1000;  
        setTimeout(delayedFunction, 
          delayInMilliseconds
        );
      }
      else if (InRoute=="Yes"){
        Drive.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:block";
        Defect.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        charger.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        Parking.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
      }
      else {
        Drive.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        Defect.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        charger.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:none";
        Parking.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:block";
      }
}

    let sim_intervalId = null;
    let SimulatorStarted = false
    let intervalId2;
    let intervalId3;
    let scoreFrame = null;

    widgets.register("Score Bar", async (box) => {
        scoreFrame = document.createElement("div")
        scoreFrame.style = `width:100%;height:100%;display:flex;align-content:center;justify-content:center;align-items:center`
        scoreFrame.innerHTML =
            `
		<style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
            color:#ffffe3;
            background-color:rgb(0 80 114);
            text-align:center;            
        }
        </style>
		<div id="score" style="">
			<div class="text">0.00%</div>
			<svg width="100" height="200" style="transform: rotateX(180deg)">
				<rect class="outline" x="25" y="0" rx="2" ry="2" stroke="black" stroke-width="3" width="50" height="200" fill="none" />
				<line class="low" x1="50" y1="0" x2="50" y2="200" stroke="green" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="medium" x1="50" y1="0" x2="50" y2="200" stroke="yellow" stroke-width="50" stroke-dasharray="120,200"/>
				<line class="high" x1="50" y1="0" x2="50" y2="200" stroke="red" stroke-width="50" stroke-dasharray="60,200"/>
				<line class="mask" x1="50" y1="200" x2="50" y2="0" stroke="white" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="needle" x1="0" y1="0" x2="100" y2="0" stroke="rgb(156 163 175)" stroke-width="3" />
			</svg>
			<div id="message">Current battery SOC Car 1</div>
		</div>
    		<div id="scoreCar2" style="">
			<div class="text">0.00%</div>
			<svg width="100" height="200" style="transform: rotateX(180deg)">
				<rect class="outline" x="25" y="0" rx="2" ry="2" stroke="black" stroke-width="3" width="50" height="200" fill="none" />
				<line class="low" x1="50" y1="0" x2="50" y2="200" stroke="green" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="medium" x1="50" y1="0" x2="50" y2="200" stroke="yellow" stroke-width="50" stroke-dasharray="120,200"/>
				<line class="high" x1="50" y1="0" x2="50" y2="200" stroke="red" stroke-width="50" stroke-dasharray="60,200"/>
				<line class="mask" x1="50" y1="200" x2="50" y2="0" stroke="white" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="needle" x1="0" y1="0" x2="100" y2="0" stroke="rgb(156 163 175)" stroke-width="3" />
			</svg>
			<div id="message">Current battery SOC Car 2</div>
		</div>
		`

        box.injectNode(scoreFrame)
        
        intervalId2 = setInterval(async () => {
          await updateSignals();
        }, 500);
        
  
        box.window.addEventListener("unload", async () => {
            console.log("on widget unload")
            clearInterval(sim_intervalId)

            if (SimulatorStarted) {
                console.log("Stop  simulator")
                await anysisSimulation('stop', policy)
            }
        })

        return async () => {

            if (sim_intervalId !== null) {
                clearInterval(sim_intervalId)
            }
            if (SimulatorStarted) {
                await anysisSimulation('stop', policy)
            }
        }
    })

 
    let charger=null;
    let Drive=null;
    let Defect=null;
    let Parking=null;
    let InStation=false;
    widgets.register("ImageCharger",  box => {
      const container = document.createElement("div");
      container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);

      container.innerHTML = `
      <img id="Drive" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2F2a290a67d3bb877ef3038ad698790fd9.gif?alt=media&token=b48d7ec7-da39-411e-a5c4-0404ba718895" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: none;"/>
      <img  id="charger" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FMobile_Right.gif?alt=media&token=1535ab5b-b44c-4eee-a1eb-7f784a95a8c7" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: none;"/>
      <img id="Defect" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fchargestation_defect_warning.png?alt=media&token=7628516f-a112-4f09-b266-7e0bc46540d8" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: none;"/>
      <img id="Parking" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fcar-parking.png?alt=media&token=71dbe3a8-ca16-4cfa-9f27-5204f9b927a9" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: block;"/>
      `
        charger = container.querySelector("#charger");
        Drive = container.querySelector("#Drive");
        Defect = container.querySelector("#Defect");
        Parking = container.querySelector("#Parking");
        intervalId3 = setInterval(async () => {
          await updateImagePlayed(charger,Drive,Defect,Parking);
          if (getCookie("InRoute") == "No")
          clearInterval(intervalId3);
        }, 200);
        box.injectNode(container);
 
    })
    /////Time Watch///////
    widgets.register("Watch",  box => {
      const container = document.createElement("div");
      container.innerHTML = `
          <div id="stopwatch-container" class="stopwatch-container">
          <div id="stopwatch-frame" class="stopwatch-frame color-zone">
              <div id="stopwatch" class="stopwatch">00:00:00:00:000</div>
          </div>            
          </div>
          <div id="stopwatch2-container"  class="stopwatch-container">
          <div id="stopwatch2-frame"  class="stopwatch-frame color-zone">
              <div id="stopwatch2"  class="stopwatch">00:00:00:00:000</div>
          </div>            
          </div>

          <style>

              
          .stopwatch-container {
              text-align: center;
              max-width: 40%;
              margin: auto;
              position: relative;
          }

          .stopwatch-frame {
              width: 300px;
              height: 300px;
              border-radius: 50%;
              background-color: #2C3E50;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
              margin: 20px auto;
              transition: background-color 0.3s ease;
          }

          .stopwatch {
              font-size: 2em;
              color: #ECF0F1;
          }
          </style>
       `
      
let totalElapsedTime = 0;
let startTime;
let stopwatchInterval;
let isRunning = false;
let lapTimes = [];
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

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    totalElapsedTime = 0;
    isRunning = false;
    lapTimes = [];
    lastUpdateTime = 0;
    updateStopwatch();
    updateLapList();
    updateLapCounter();
    updateLapTime(0); // Reset lap time
}

function recordLap() {
    if (isRunning) {
        const lapTime = performance.now() - startTime + totalElapsedTime;
        lapTimes.unshift(lapTime);
        updateLapList();
        updateLapCounter();
        updateLapTime(lapTime);
    }
}

function updateStopwatch() {
    const currentTime = performance.now();
    const elapsed = isRunning ? totalElapsedTime + currentTime - startTime : totalElapsedTime;
    const deltaTime = currentTime - lastUpdateTime;
    lastUpdateTime = currentTime;

    const milliseconds = Math.floor(elapsed % 1000);
    const seconds = Math.floor((elapsed / 1000) % 60);
    const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);

    const formattedTime = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + ':' + padMilliseconds(milliseconds);
    document.getElementById('stopwatch').innerText = formattedTime;
}

function updateLapList() {
    const lapList = document.getElementById('lap-list');
    lapList.innerHTML = "";
    lapTimes.forEach((lapTime, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Lap ${index + 1}: ${formatLapTime(lapTime)}`;
        lapList.appendChild(listItem);

        // Change the background color of the lap entry based on index
        listItem.style.backgroundColor = index % 2 === 0 ? '#3498DB' : '#E74C3C';
    });
}

function updateLapCounter() {
    document.getElementById('lap-counter').innerText = `Laps: ${lapTimes.length}`;
}

function updateLapTime(lapTime) {
    const formattedTime = formatLapTime(lapTime);
    document.getElementById('lap-time').innerText = `Lap Time: ${formattedTime}`;
}

function changeColorZone(color) {
    const frame = document.getElementById('stopwatch-frame');
    frame.style.backgroundColor = color;

    const colorPickerFrame = document.querySelector('.color-picker-frame');
    colorPickerFrame.style.backgroundColor = color;
}

function pad(value) {
    return value < 10 ? '0' + value : value;
}

function padMilliseconds(value) {
    return value < 10 ? '00' + value : (value < 100 ? '0' + value : value);
}

function formatLapTime(lapTime) {
    const milliseconds = Math.floor(lapTime % 1000);
    const seconds = Math.floor((lapTime / 1000) % 60);
    const minutes = Math.floor((lapTime / (1000 * 60)) % 60);
    const hours = Math.floor((lapTime / (1000 * 60 * 60)) % 24);
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + ':' + padMilliseconds(milliseconds);
}
startStopwatch();

        box.injectNode(container);
 
    })
    /////End Of Time Watch/////


  /////Table for test //////
  let VIN=null;
  let IsCharging=null;
  let TimeToComplete=null;
  let Current=null;

  widgets.register("TableVSS",  box => {
    const container = document.createElement("div");
    container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);

    container.innerHTML = `
    <div style="display: flex; height: 100%; width: 100%;">
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    * {
        box-sizing: border-box;
    }
    body {
        font-family: 'Lato', sans-serif;
    }
    table {
        display: grid;
        height: fit-content;
        min-height: 100%;
        border-collapse: collapse;
        min-width: 100%;
        grid-template-columns: 
            minmax(80px, 1fr)
            minmax(80px, 1fr)
        ;
        grid-template-rows: min-content auto;
        font-size: inherit;
    }
      
    thead,
    tbody,
    tr {
        display: contents;
    }
      
    th,
    td {
        padding: 1em;
        min-height: fit-content;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: max-content;
    }
      
    th {
        position: sticky;
        top: 0;
        background: #6c7ae0;
        user-select: none;
        text-align: left;
        font-weight: normal;
        font-size: 1.1em;
        color: white;
        font-weight: bold;
    }
      
    th:last-child {
        border: 0;
    }
    
    td:first-child {
        font-weight: bold;
    }

    td {
        padding-top: .66em;
        padding-bottom: .66em;
        background: transparent;
        color: #808080;
        height: 100%;
    }
      
    tr:nth-child(even) td {
        background: #f8f6ff;
        color: #808080;
    }

    </style>
        <div style="display: flex !important; height: 100%; width: 100%;">
            <table>
                <thead>
                    <tr>
                        <th>VSS API</th><th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    
                        <tr data-api="Vehicle.VehicleIdentification.VIN">
                            <td title="Vehicle.VehicleIdentification.VIN">Vehicle.VehicleIdentification.VIN</td><td id="VIN"> </td>
                        </tr>
                     
                    
                     
                    
                        <tr data-api="Vehicle.Powertrain.TractionBattery.StateOfCharge.Current">
                            <td title="Vehicle.Powertrain.TractionBattery.StateOfCharge.Current">Vehicle.Powertrain.TractionBattery.StateOfCharge.Current</td><td  id="Current"></td>
                        </tr>
                     
                    
                        <tr data-api="Vehicle.Powertrain.TractionBattery.Charging.IsCharging">
                            <td title="Vehicle.Powertrain.TractionBattery.Charging.IsCharging">Vehicle.Powertrain.TractionBattery.Charging.IsCharging</td><td id="IsCharging"></td>
                        </tr>
                    
                        <tr data-api="Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete">
                            <td title="Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete">Vehicle.Powertrain.TractionBattery.Charging.TimeToComplete</td><td  id="TimeToComplete"></td>
                        </tr>
                    
                </tbody>
        </table>
    </div>
    </div>
    `
      VIN=container.querySelector("#VIN");
      IsCharging=container.querySelector("#IsCharging");
      Current=container.querySelector("#Current");
      TimeToComplete=container.querySelector("#TimeToComplete");
      intervalId3 = setInterval(async () => {
        VIN.textContent= new URLSearchParams(window.location.search).get('vehicleId');
        Current.textContent  = getCookie("score");
        IsCharging.textContent = InStation;
        TimeToComplete.textContent = (100-parseFloat(getCookie("score")))*60 ;  
      }, 1000);

 
      box.injectNode(container);

  })

    ///// End Table Test//////
 
    let Volkswagen=null;
    let Mercedes=null;
    let Hyundai=null;
  
    widgets.register("ImageType",  box => {
      const container = document.createElement("div");
      container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);

      container.innerHTML = `
         <img id="Volkswagen" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FVolkswagen-ID3-Pro-S-77kWh-white-2023%5E1024x768%5E.jpg?alt=media&token=97002866-6a6a-4c7c-82f3-038f199a83e5" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: none;"/>
         <img id="Mercedes" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fd7b373568add71640cc2782105d2429c.png?alt=media&token=d2109cec-f1e7-40f9-8b78-51f7fdfd6d20" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: none;"/>
         <img id="Hyundai" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2F2022-ioniq-5-atlas-white_o-1024x576.png?alt=media&token=daf8aa49-f0c2-4ae9-81b0-0e72df0f3507" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: none;"/>
         `
         Volkswagen = container.querySelector("#Volkswagen");
         Mercedes = container.querySelector("#Mercedes");
         Hyundai = container.querySelector("#Hyundai");
        

        fetch('https://proxy.digitalauto.tech/fleet-simulate/get_vehicle_coordinates')
        .then(response => response.json())
        .then(carsCoordinates => {
            // For each vehicle, create a marker on the map
            const vehicleId =  new URLSearchParams(window.location.search).get('vehicleId');
            for (let carId in carsCoordinates) {
                let coordinates = carsCoordinates[carId];
                if (vehicleId==carId){
                 if(coordinates.vehicle_type=="Mercedes-Benz EQS"){
                  Mercedes.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:block";

                 }
                 else if(coordinates.vehicle_type=="Volkswagen ID.3"){
                  Volkswagen.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:block";

                 }
                 else {
                  Hyundai.style="width: 100%; height: 100%; object-fit: contain; margin: auto; display:block";

                 }
                }
              }
            })
 
        

        box.injectNode(container);
 
    })
    

 

    const StateOfChargeTile = {
        signal: "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current",
        label: "State of Charge",
        icon: "car-battery",
    }

    widgets.register("StateOfChargeLineChart", LineChart(
        [
            StateOfChargeTile
        ],
        vehicle,
        500
    ))

}

export default plugin