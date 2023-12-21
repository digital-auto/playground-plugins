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
        fetch('https://fleetsim.onrender.com/vehicle/all/coordinates')
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
    let path = [
      { lat: 49.116911, lng: 9.176294 },
      { lat: 48.7758, lng: 9.1829 },
      { lat: 48.9471, lng: 9.4342 },
      { lat: 49.0688, lng: 9.2887 }
  ]
    widgets.register("VehicleMapDev", (box) => {
      const apiUrl = 'http://193.148.170.44:5000/route/v1/driving/13.388860,52.517037;13.385983,52.496891?steps=true';
  
      const fetchPathFromApi = () => {
          return fetch(apiUrl)
              .then(response => response.json())
              .then(data => {
                  console.log(data);
  
                  const stepPositions = data.routes[0].legs.flatMap(leg =>
                      leg.steps.map(step => ({
                          lat: step.maneuver.location[1],
                          lng: step.maneuver.location[0]
                      }))
                     
                  );
                  console.log(stepPositions)
  
                  return stepPositions;
              })
              .catch(error => {
                  console.error('Error fetching data from the API:', error);
                  // Return a default path or handle the error as needed
                  return [
                      { lat: 49.116911, lng: 9.176294 },
                      { lat: 48.7758, lng: 9.1829 },
                      { lat: 48.9471, lng: 9.4342 },
                      { lat: 49.0688, lng: 9.2887 }
                  ];
              });
      };
  
      condBecomesTrue(() => currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"] !== 0, 1000)
          .then(async () => {
              const stepPositions = await fetchPathFromApi();
  
              // Use stepPositions to render or perform any other actions
              path = await stepPositions ;
          });
          console.log(path);
  
      return GoogleMapsFromSignal(
        path,
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
    zoom: 13
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
        console.log(event.latLng);
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
            const path = [
                {
                    lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Latitude"],
                    lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.OriginSet.Longitude"]
                },
                {
                    lat: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Latitude"],
                    lng: currentSignalValues["Vehicle.Cabin.Infotainment.Navigation.DestinationSet.Longitude"]
                }
            ]
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

    widgets.register("VehicleImage", box => {
        box.window.document.body.innerHTML = `<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FGenericWhiteCar.png?alt=media&token=31babbcd-3920-4044-a1a4-58a07a8df0b1" style="width: 100%; height: 100%; object-fit: contain; margin: auto; display: block;"/>`
        
        const a = document.createElement("a")
        a.target = "_blank"
        a.href = "/model/goWywBM5VPnC3voJycT7/library/prototype/PYFCFEWOELGHMjgGq5Wb/view/run"
        a.innerHTML = `<div style="display: flex;color: #718096;background-color: #fff;z-index: 10;border-radius: 0.25rem;padding: 0.375rem 0.75rem;user-select: none;align-items: center;cursor: pointer;box-shadow: rgb(0 0 0 / 16%) 0px 1px 4px;width: fit-content;position: absolute;top: 10px;right: 10px;font-family: sans-serif;letter-spacing: 0.5px;">
        <div style="font-size: 0.875rem; font-weight: 500;">Fleet View</div>
        </div>`
        box.window.document.body.appendChild(a)
    })

    // LineChart widget for StateOfCharge

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
        1000
    ))

}

export default plugin