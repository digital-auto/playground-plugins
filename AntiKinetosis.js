import StatusTable from "./reusable/StatusTable.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import MobileNotifications from "./reusable/MobileNotifications.js"
import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js";

// const API_HOST = "https://aiotapp.net"
const API_HOST = "https://app.digitalauto.tech"

async function fetchSimulationResults(simulationDetails) {
	const res = await fetch(
		`${API_HOST}/kinetosis/results?style=${simulationDetails.style.trim()}&gender=${simulationDetails.gender.trim()}&age=${simulationDetails.age.trim()}`);
	// waits until the request completes...
	if (!res.ok) {
		const message = `An error has occured: ${res.status}`;
		throw new Error(message);
	}
	//conver response to json
	const response = await res.json()
	return response
}

async function fetchRowsFromSpreadsheet(spreadsheetId, apiKey) {
    // Set the range to A1:Z1000
    const range = "A1:Z2000";

    // Fetch the rows from the Google Spreadsheet API
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${encodeURIComponent(apiKey)}`
    );
    const json = await response.json();
    // Get the headers from the first row
    const headers = json.values[0];
    // Convert the remaining rows to an array of objects
    const rows = json.values.slice(1).map(row => {
        const rowObject = {};
        for (let i = 0; i < row.length; i++) {
            rowObject[headers[i]] = row[i];
        }
        return rowObject;
    });

    return rows;
}

const plugin = ({widgets, simulator, vehicle}) => {

	const loadSpreadSheet = async () => {
		const style = await vehicle.DrivingStyle.get()
		const spreadsheetId = style === "sporty" ? "1fDkYtcpYkBfxlH5BjmhAUs0eqnSZKEJ1w7p0uuEtnQs" : style === "relaxed" ? "1ibr2IGHh6vjuOcb-3u5qjVrQtig4wvMNOSjtCp0vyo4" : "19yh1r-CL3CSy7eiLLDm6ART6VgMNqNd1KxY7Rrygfyw";

		fetchRowsFromSpreadsheet(spreadsheetId, PLUGINS_APIKEY)
		.then((rows) => {
			SimulatorPlugins(rows, simulator)
		})
	}

	const updateSimulation = async () => {
		const score = await vehicle.Passenger.KinetosisScore.get()
		const lat = await vehicle.CurrentLocation.Latitude.get()
		const lng = await vehicle.CurrentLocation.Longitude.get()

		scoreFrame.querySelector("#score .text").textContent = parseFloat(score).toFixed(2) + "%"
		scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(score) * 2)) + "," + 200);
		scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(score) * 2)}`)
		scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(score) * 2)}`)

		let message = "", mobileMessage = "";
		if (parseFloat(score) > 80.0) {
			message = "Warning: High kinetosis level.";
			mobileMessage = message + "\nPlease open the window for the passenger.";
			//scoreFrame.querySelector("#sign").innerHTML = `<img src="https://193.148.162.180:8080/warning.svg" alt="warning" style="width:30%;height:30%"/>`
		}
		else if (parseFloat(score) > 60.0) {
			message = "Kinetosis level is medium";
			mobileMessage = message;
		}
		else {
			message =  "Kinetosis level is normal";
			mobileMessage = message;
		}

		scoreFrame.querySelector("#score #message").textContent = message

		mobileNotifications(mobileMessage);

		if(setVehiclePinGlobal !== null) {
			setVehiclePinGlobal({
				lat: parseFloat(lat),
				lng: parseFloat(lng)
			})
		}
	}
	
	let sim_intervalId = null;
	

    let controlsFrame = null;
    widgets.register("Controls", (box) => {
	controlsFrame = document.createElement("div")
    controlsFrame.style = 'width:100%;height:100%;display:grid;align-content:center;justify-content:center;align-items:center'
	controlsFrame.innerHTML = 
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
			display:flex;          
        }
        </style>
		<div class="label" style="width:100%;position:relative;margin-top:10px;">Driving Style:</div>
		<div id="style" style="display:flex;width:100%;justify-content: center;align-items:center;position:relative;margin-top:5px">        
			<div id="red" style="width:33%;text-align:center">
				<img style="width:80%;" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FSporty.png?alt=media&token=e318b297-d41e-4e6a-9a41-8b7fbbf2602d" />
				<div style="font-weight:bold">
					Sporty
				</div>
			</div>
			<div id="yellow" style="width:33%;text-align:center">
				<img style="width:50%;" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FOptimized.png?alt=media&token=dff86e6b-ee69-4daf-b213-abc38da273ef" />
				<div style="font-weight:unset">
					Optimized
				</div>
			</div>
			<div id="green" style="width:33%;text-align:center">
				<img style="width:50%;" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FRelaxed.png?alt=media&token=86901115-a104-4f48-b09b-6b4e44a7e8bd" />
				<div style="font-weight:unset">
					Relaxed
				</div>
			</div>
		</div>
		<div class="label" style="width:100%;position:relative;margin-top:10px;">Back Seat passengers: </div>
		<div id="passengers" style="position:relative;margin-top:5px;width:100%;">        
			<div class="selections" style="display:flex;position:relative;justify-content:center">
			<div class="btn-group gender" style="margin:5px;display:grid">
				<button id="gender_male" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
				Male
				</button>
				<button id="gender_female" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
				Female
				</button>
			</div>
			<div class="btn-group age" style="margin:5px;display:grid">
				<button id="age_young" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
				Young
				</button>
				<button id="age_old" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
				Adult
				</button>
			</div>
			</div>
		</div>
		<div id="controls" style="position:relative;bottom:0%;display:grid;width:100%;align-items:center">
			<div id="icons" style="margin:5px;display:flex;justify-content:space-around">
				<div style="width:2em;cursor: pointer;" id="video">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fvideo.svg?alt=media&token=93f6bed8-10c8-43f5-ba09-44bde5bb1797" alt="video" style="filter: invert(100%);">
				</div>
				<!-- <div style="width:2em;cursor: pointer;" id="reload">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Freload.svg?alt=media&token=0a2db061-8210-4c0b-bb84-0fdbf34c415e" alt="reload" style="filter: invert(100%);">
				</div>
				<div style="width:2em;cursor: pointer;" id="play">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fplay.svg?alt=media&token=4f68e20d-5c11-4e2c-9ae3-7f44ebdd0416" alt="play" style="filter: invert(100%);">
				</div>
				<div style="width:2em;cursor: pointer;" id="forward">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fforward.svg?alt=media&token=6e729a78-4c7b-4065-a738-b58cdbcfc3cc" alt="forward" style="filter: invert(100%);">
				</div> -->
			</div>
		</div>
		<div id="controls_intro" style="position:relative;bottom:0%;display:grid;width:100%;align-items:center">
			<div style="margin:5px;display:flex;justify-content:space-around">
				<div style="cursor: pointer;" id="intro">
					<button id="intro_btn" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
					Intro
					</button>
				</div>
			</div>
		</div>
		`

		simulator("Vehicle.Passenger.Age", "get", async () => {
			return parseInt("15");
		})
		simulator("Vehicle.Passenger.Gender", "get", async () => {
			return "male";
		})
		simulator("Vehicle.DrivingStyle", "get", async () => {
			return "sporty";
		})

		let simulationDetails = {
			"style": "sporty",
			"gender": "male",
			"age": "young"
		}
	
		let sportyStyle = controlsFrame.querySelector("#red")
		sportyStyle.onclick = () => {
			simulationDetails["style"] = "sporty"
			controlsFrame.querySelector("#red img").style.width = "80%"
			controlsFrame.querySelector("#green img").style.width = "50%"
			controlsFrame.querySelector("#yellow img").style.width = "50%"
			controlsFrame.querySelector("#red div").style.fontWeight = "bold"
			controlsFrame.querySelector("#green div").style.fontWeight = "unset"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"
			simulator("Vehicle.DrivingStyle", "get", async () => {
				return "sporty";
			})
		}
	
		let relaxedStyle = controlsFrame.querySelector("#green")
		relaxedStyle.onclick = () => {
			simulationDetails["style"] = "relaxed"
			controlsFrame.querySelector("#red img").style.width = "50%"
			controlsFrame.querySelector("#green img").style.width = "80%"
			controlsFrame.querySelector("#yellow img").style.width = "50%"
			controlsFrame.querySelector("#red div").style.fontWeight = "unset"
			controlsFrame.querySelector("#green div").style.fontWeight = "bold"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"
			simulator("Vehicle.DrivingStyle", "get", async () => {
				return "relaxed";
			})
		}
	
		let optimizedStyle = controlsFrame.querySelector("#yellow")
		optimizedStyle.onclick = () => {
			simulationDetails["style"] = "optimized"
			controlsFrame.querySelector("#red img").style.width = "50%"
			controlsFrame.querySelector("#green img").style.width = "50%"
			controlsFrame.querySelector("#yellow img").style.width = "80%"
			controlsFrame.querySelector("#red div").style.fontWeight = "unset"
			controlsFrame.querySelector("#green div").style.fontWeight = "unset"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "bold"
			simulator("Vehicle.DrivingStyle", "get", async () => {
				return "optimized";
			})
		}
	
		let gender_male = controlsFrame.querySelector("#gender_male")
		gender_male.onclick = () => {
			simulationDetails["gender"] = "male"
			controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(104 130 158)"
			controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(157 176 184)"
			simulator("Vehicle.Passenger.Gender", "get", async () => {
				return "male";
			})
		}
	
		let gender_female = controlsFrame.querySelector("#gender_female")
		gender_female.onclick = () => {
			simulationDetails["gender"] = "female"
			controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(157 176 184)"
			controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(104 130 158)"
			simulator("Vehicle.Passenger.Gender", "get", async () => {
				return "female";
			})
		}
	
		let age_young = controlsFrame.querySelector("#age_young")
		age_young.onclick = () => {
			simulationDetails["age"] = "young"
			controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(104 130 158)"
			controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(157 176 184)"
			simulator("Vehicle.Passenger.Age", "get", async () => {
				return parseInt("15");
			})
		}
	
		let age_old = controlsFrame.querySelector("#age_old")
		age_old.onclick = () => {
			simulationDetails["age"] = "adult"
			controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(157 176 184)"
			controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(104 130 158)"
			simulator("Vehicle.Passenger.Age", "get", async () => {
				return parseInt("60");
			})
		}

		let video = controlsFrame.querySelector("#video")
		video.onclick = () => {
			const style = simulationDetails.style.trim();
			const videoURL = style === "relaxed" ? "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FRelaxedDriver_AVC.mp4?alt=media&token=ea69aa02-828b-4a66-af0b-5b5abc257d5c" : style === "optimized" ? "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FOptimizedDriver_AVC.mp4?alt=media&token=f9fc5f86-c61a-4760-ac48-4a83d135b8f3" : "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FSportyDriver_AVC.mp4?alt=media&token=2f2b664a-f682-4171-912f-0b0e3e32a5bd"
			let videoFrame = document.createElement("div")
			videoFrame.style = "width:100%;height:100%;background-color:rgb(0 80 114)"
			videoFrame.innerHTML =
				`
				<div id="videoContainer" >
					<video id="videoPlayer" style="width:100%; height:100%; object-fit: fill" autoplay controls>
						<source
						src=${videoURL}
						type="video/mp4"
						/>
					</video>
				</div>
				`
			box.triggerPopup(videoFrame)
		}

		let intro_video = controlsFrame.querySelector("#intro_btn")
		intro_video.onclick = () => {
			const videoURL = "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FKinetosis%20final%20kompr.mp4?alt=media&token=3b58ba7f-3a62-4357-9475-ea986e407d75"
			let videoFrame = document.createElement("div")
			videoFrame.style = "width:100%;height:100%;background-color:rgb(0 80 114)"
			videoFrame.innerHTML =
				`
				<div id="videoContainer" >
					<video id="videoPlayer" style="width:100%; height:100%; object-fit: fill" autoplay controls>
						<source
						src=${videoURL}
						type="video/mp4"
						/>
					</video>
				</div>
				`
			box.triggerPopup(videoFrame)
		}

		// let reload = controlsFrame.querySelector("#reload")
		// reload.onclick = () => {
		// simulationDetails = {
		// 	"style": "sporty",
		// 	"gender": "male",
		// 	"age": "young"
		// 	}

		// 	controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(104 130 158)"
		// 	controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(157 176 184)"
		// 	controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(104 130 158)"
		// 	controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(157 176 184)"
		// 	controlsFrame.querySelector("#red img").style.width = "80%"
		// 	controlsFrame.querySelector("#green img").style.width = "50%"
		// 	controlsFrame.querySelector("#yellow img").style.width = "50%"
		// 	controlsFrame.querySelector("#red div").style.fontWeight = "bold"
		// 	controlsFrame.querySelector("#green div").style.fontWeight = "unset"
		// 	controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"

		// 	index = 0;
		// 	clearInterval(intervalId)

		// 	scoreFrame.querySelector("#score .text").textContent = "0.0%"
		// 	scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(0) * 2)) + "," + 200);
		// 	scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(0) * 2)}`)
		// 	scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(0) * 2)}`)
		// 	scoreFrame.querySelector("#score #message").textContent = "Kinetosis level is "
		// 	mobileNotifications("");

		// 	animationFrame.querySelector("#animation").textContent = "Click on the Animation you want to see."
		// 	animationControlsFrame.querySelector("#animation_window").style.backgroundColor = "rgb(157 176 184)"
		// 	animationControlsFrame.querySelector("#animation_ac").style.backgroundColor = "rgb(157 176 184)"
		// 	setVehiclePinGlobal(null);

		// }

		// let index = 0;
		// let intervalId = null;

		// let play = controlsFrame.querySelector("#play")
		// play.onclick = () => {
		// 	clearInterval(intervalId)
		// 	index = 0;

		// 	fetchSimulationResults(simulationDetails).then(data => {
		// 		const VSSdata = data.signal_values

		// 		intervalId = setInterval(() => {
		// 			if (index >= VSSdata.length) {
		// 				clearInterval(intervalId)
		// 			}
		// 			else {

		// 				simulator("Vehicle.TripMeterReading", "get", async () => {
		// 					return (parseFloat(parseFloat(VSSdata[index]["Vehicle.TripMeterReading"]) / 1000).toFixed(3) + " km");
		// 				})
		// 				simulator("Vehicle.Speed", "get", async () => {
		// 					return (parseFloat(parseFloat(VSSdata[index]["Vehicle.Speed"]).toFixed() * 3.6).toFixed(2) + " km/h");
		// 				})
		// 				simulator("Vehicle.Acceleration.Lateral", "get", async () => {
		// 					return (parseFloat(VSSdata[index]["Vehicle.Acceleration.Lateral"]).toFixed(3))
		// 				})
		// 				simulator("Vehicle.Acceleration.Longitudinal", "get", async () => {
		// 					return (parseFloat(VSSdata[index]["Vehicle.Acceleration.Longitudinal"]).toFixed(3))
		// 				})
		// 				simulator("Vehicle.Acceleration.Vertical", "get", async () => {
		// 					return (parseFloat(VSSdata[index]["Vehicle.Acceleration.Vertical"]).toFixed(3))
		// 				})
		// 				simulator("Vehicle.AngularVelocity.Roll", "get", async () => {
		// 					return (parseFloat(VSSdata[index]["Vehicle.AngularVelocity.Roll"]).toFixed(3))
		// 				})
		// 				simulator("Vehicle.AngularVelocity.Pitch", "get", async () => {
		// 					return (parseFloat(VSSdata[index]["Vehicle.AngularVelocity.Pitch"]).toFixed(3))
		// 				})
		// 				simulator("Vehicle.AngularVelocity.Yaw", "get", async () => {
		// 					return (parseFloat(VSSdata[index]["Vehicle.AngularVelocity.Yaw"]).toFixed(3))
		// 				})
		// 				simulator("Vehicle.CurrentLocation.Latitude", "get", async () => {
		// 					return parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Latitude"] * (180 / Math.PI))
		// 				})
		// 				simulator("Vehicle.CurrentLocation.Longitude", "get", async () => {
		// 					return parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Longitude"] * (180 / Math.PI))
		// 				})

		// 				if(setVehiclePinGlobal !== null) {
		// 					setVehiclePinGlobal({
		// 						lat: parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Latitude"] * (180 / Math.PI)),
		// 						lng: parseFloat(VSSdata[index]["Vehicle.CurrentLocation.Longitude"] * (180 / Math.PI))
		// 					})
		// 				}
						
		// 				scoreFrame.querySelector("#score .text").textContent = parseFloat(VSSdata[index]["KinetosisScore"]).toFixed(2) + "%"
		// 				scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(VSSdata[index]["KinetosisScore"].split("%")[0]) * 2)) + "," + 200);
		// 				scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(VSSdata[index]["KinetosisScore"].split("%")[0]) * 2)}`)
		// 				scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(VSSdata[index]["KinetosisScore"].split("%")[0]) * 2)}`)

		// 				let message = "", mobileMessage = "";
		// 				if (parseFloat(VSSdata[index]["KinetosisScore"].split("%")[0]) > 80.0) {
		// 					message = "Warning: High kinetosis level.";
		// 					mobileMessage = message + "\nPlease open the window for the passenger.";
		// 					//scoreFrame.querySelector("#sign").innerHTML = `<img src="https://193.148.162.180:8080/warning.svg" alt="warning" style="width:30%;height:30%"/>`
		// 				}
		// 				else if (parseFloat(VSSdata[index]["KinetosisScore"].split("%")[0]) > 60.0) {
		// 					message = "Kinetosis level is medium";
		// 					mobileMessage = message;
		// 				}
		// 				else {
		// 					message =  "Kinetosis level is normal";
		// 					mobileMessage = message;
		// 				}

		// 				scoreFrame.querySelector("#score #message").textContent = message

		// 				mobileNotifications(mobileMessage);

		// 				index = index + 17
		// 			}
		// 		}, 1000)
		// 	})
		// }

		// let forward = controlsFrame.querySelector("#forward")
		// forward.onclick = () => {
		// 	if (index !== 0)
		// 		index = index + (17 * 60)
		// }

        box.injectNode(controlsFrame)
        return () => {
			//clearInterval(intervalId)
			clearInterval(sim_intervalId)
            // Deactivation function for clearing intervals or such.
        }
    })

	widgets.register("Table", StatusTable({
		apis: ["Vehicle.Speed", "Vehicle.TripMeterReading", "Vehicle.Acceleration.Lateral", "Vehicle.Acceleration.Longitudinal", "Vehicle.Acceleration.Vertical", "Vehicle.AngularVelocity.Roll", "Vehicle.AngularVelocity.Pitch", "Vehicle.AngularVelocity.Yaw", "Vehicle.CurrentLocation.Latitude", "Vehicle.CurrentLocation.Longitude"],
		vehicle: vehicle,
		refresh: 1000
	}))

	let setVehiclePinGlobal = null;
	widgets.register("Map", (box) => {
		let path = [
			{
				"lat": 46.477127,
				"lng": 10.367829
			},
			{
				"lat": 46.600816,
				"lng": 10.425532
			},
		]
		GoogleMapsPluginApi(PLUGINS_APIKEY, box, path, "BICYCLING").then(({setVehiclePin}) => {
			setVehiclePinGlobal = setVehiclePin
		})
	})

	let scoreFrame = null;
	widgets.register("Score", (box) => {
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
			<div class="text">0.0%</div>
			<svg width="100" height="200" style="transform: rotateX(180deg)">
				<rect class="outline" x="25" y="0" rx="2" ry="2" stroke="black" stroke-width="3" width="50" height="200" fill="none" />
				<line class="low" x1="50" y1="0" x2="50" y2="200" stroke="red" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="medium" x1="50" y1="0" x2="50" y2="200" stroke="yellow" stroke-width="50" stroke-dasharray="160,200"/>
				<line class="high" x1="50" y1="0" x2="50" y2="200" stroke="green" stroke-width="50" stroke-dasharray="120,200"/>
				<line class="mask" x1="50" y1="200" x2="50" y2="0" stroke="white" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="needle" x1="0" y1="0" x2="100" y2="0" stroke="rgb(156 163 175)" stroke-width="3" />
			</svg>
			<div id="message">Kinetosis Level is </div>		
		</div>
		`

		box.injectNode(scoreFrame)
	})

	let mobileNotifications = null;
	widgets.register("Mobile", (box) => {
		const {printNotification} = MobileNotifications({
			apis : null,
			vehicle: null,
			box: box,
			refresh: null,
			backgroundColor: "rgb(0 80 114)"
		})
		mobileNotifications = printNotification;
	})

	let animationControlsFrame = null;
	widgets.register("Animation Controls", (box) => {
		animationControlsFrame = document.createElement("div")
		animationControlsFrame.style = "height:100%;display:grid;align-content:center;justify-content:center;align-items:center"
		animationControlsFrame.innerHTML = `
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
		<div>Please click on the button below to take action : </div>
		<div class="btn-group animation" style="margin:5px;display:grid">
			<button id="animation_window_open" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			Open Window
			</button>
			<button id="animation_window_close" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			Close Window
			</button>
		</div>
		`
		let timer;
    	let top1 = 2.6;

		let animation_open = animationControlsFrame.querySelector("#animation_window_open")
		animation_open.onclick = () => {
			animationControlsFrame.querySelector("#animation_window_open").style.backgroundColor = "rgb(104 130 158)"
			animationControlsFrame.querySelector("#animation_window_close").style.backgroundColor = "rgb(157 176 184)"
			clearInterval(timer)
		    timer = setInterval(function(){
				top1<42.6 ? top1 = top1 + 0.1 : clearInterval(timer)
				animationFrame.querySelector("#glass").style.top = top1+"%"
			},10)
		}
	
		let animation_close = animationControlsFrame.querySelector("#animation_window_close")
		animation_close.onclick = () => {
			animationControlsFrame.querySelector("#animation_window_open").style.backgroundColor = "rgb(157 176 184)"
			animationControlsFrame.querySelector("#animation_window_close").style.backgroundColor = "rgb(104 130 158)"
			clearInterval(timer)
			timer = setInterval(function(){
				top1>2.6 ? top1 = top1 - 0.1 : clearInterval(timer)
				animationFrame.querySelector("#glass").style.top = top1+"%"
			},10)
		}

		box.injectNode(animationControlsFrame)

	})

	let animationFrame = null;
	
	widgets.register("Animation", (box) => {
		animationFrame = document.createElement("div")
		animationFrame.innerHTML = 
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
		<div class="car" style="max-width: 849px; margin: 30px auto 0; position: relative;">
			<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fsmart-wipers%2Fimg1.png?alt=media&token=99945f0a-7ef4-4049-a830-f73a2e7b678d" alt="" style="width: 100%;">
			<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fsmart-wipers%2Fimg2.png?alt=media&token=052bfcb8-1dfe-4f9a-8984-6446421efe72" alt="" id="glass" style="width: 76%; position: absolute; top: 2.6%; left: 18.3%; z-index: -1;">
		</div>
		`
		box.injectNode(animationFrame)
	})


	////////////
	let container = null

    let resultImgDiv = null
    let resultRecDiv = null
    let restext = null
    let Emotion = null
    let Probability = null

    let landingAiLogo = `https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FLanding_AI_Logo_RGB_600.png?alt=media&token=9f6e445d-cf6d-4556-9240-4645a804b240`

    let imgWidth = 0;
    let imgHeight = 0;

    widgets.register("Result", (box) => {
        const container = document.createElement('div');
        container.innerHTML = `
            <div style="width:100%;height:100%; position: relative;">
                <div id="resultRec" 
                    style="position:absolute;border: 2px solid red; top: 0; left: 0; width: 0; height: 0; z-index: 2;">
                </div>
                <img id="resultImg" 
                    style="display:none;position:absolute;top:0%;left:0%;width:100%;height:100%; z-index: 1;"
                    src=""/> 
                <img id="logoImg" 
                    style="position:absolute;top:5%;right:5%;width:30%;padding:6px; z-index: 3;object-fit:contain;background:white;"
                    src="${landingAiLogo}"/> 
                    <h4 id="restext" style="background:white;position:absolute;top:55%;right:55%;width:30%; z-index: 4;color:red"></h4>
            </div>
        `;
        resultImgDiv = container.querySelector("#resultImg");
        resultRecDiv = container.querySelector("#resultRec");
        restext = container.querySelector("#restext");

        box.injectNode(container);
    });

    widgets.register("InputImage", (box) => {
        container = document.createElement('div')
        container.innerHTML = 
        `
        <div id="image" style="display:block;z-index:1;">
            <img id="output" width="100%" height="100%" 
                src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2Fwebcam-default.png?alt=media&token=a7407530-25ac-4143-bbb4-f0a879f5ebba"/>
        </div>
        <div class="btn btn-color" 
            style="display:flex;z-index:2; position:absolute; width: 100%; bottom: 10px; opacity:85%; align-items:center; align-content:center; flex-direction:row; justify-content:center">
            <button id="upload-btn" 
                style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:5px;border-radius:10px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Upload
            </button>
            <button id="submit-btn" 
                style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:5px;border-radius:10px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Submit
            </button>
            <input id="upload" type="file" accept="image/*" style="display:none">
        </div>
		<div class="btn btn-color" style="display:flex; position:absolute; width: 100%; bottom: 0px; opacity:100%; align-items:center; align-content:center; flex-direction:row; justify-content:space-around; background: #FFF">
		<div> <span></span><span id="Emotion"></span></div>
		<div><span>Probability : </span><span id="Probability"></span></div>
	</div>
        `
		Emotion = container.querySelector("#Emotion");
        Probability = container.querySelector("#Probability");

        const upload_btn = container.querySelector("#upload-btn")
        const upload = container.querySelector("#upload")
        upload_btn.onclick = () => {
            if(upload) upload.click()
        }

        let imageEncoded = null
        let file = null
        const img_output = container.querySelector('#output');
        const img = container.querySelector("#image")
        upload.onchange = (event) => {
            file = event.target.files[0]
            img_output.src = URL.createObjectURL(event.target.files[0]);
            img.style = "display: block"

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
        
            var base_image = new Image();
            base_image.src = img_output.src;
            base_image.onload = function() {
                canvas.width = base_image.width;
                canvas.height = base_image.height;

                imgWidth = base_image.width;
                imgHeight = base_image.height;
        
                ctx.drawImage(base_image, 0, 0);
                imageEncoded = canvas.toDataURL('image/jpeg')
                canvas.remove();
            }
        }

        const imageUpload = async (image) => {
            if(!file) return
            const data = new FormData()
            data.append('file', file)
            const res = await fetch(
                `https://predict.app.landing.ai/inference/v1/predict?endpoint_id=bf6be489-eaf7-4c2f-81ff-3866e040dd11`, {
                    method:'POST',
                    mode: 'cors',
                    headers: {
                        'apikey':'land_sk_0sIzpR0dno01dqFeIe5Ln4SKcuMhJp1HZB7Q4bLhQUo14ihdee'
                    },
                    body: data
            });
            if (!res.ok) {
                const message = `An error has occured: ${res.status}`;
                throw new Error(message);
            }
            const response = await res.json()
            return response
        }
		const updateSimulation = async () => {
			const score = await vehicle.Passenger.KinetosisScore.get()
			const lat = await vehicle.CurrentLocation.Latitude.get()
			const lng = await vehicle.CurrentLocation.Longitude.get()
	
			scoreFrame.querySelector("#score .text").textContent = parseFloat(score).toFixed(2) + "%"
			scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(score) * 2)) + "," + 200);
			scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(score) * 2)}`)
			scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(score) * 2)}`)
	
			let message = "", mobileMessage = "";
			alert(parseFloat(score));
			if (parseFloat(score) > 80.0) {
				message = "Warning: High kinetosis level.";
				mobileMessage = message + "\nPlease open the window for the passenger.";
				//scoreFrame.querySelector("#sign").innerHTML = `<img src="https://193.148.162.180:8080/warning.svg" alt="warning" style="width:30%;height:30%"/>`
			}
			else if (parseFloat(score) > 60.0) {
				message = "Kinetosis level is medium";
				mobileMessage = message;
			}
			else {
				message =  "Kinetosis level is normal";
				mobileMessage = message;
			}
	
			scoreFrame.querySelector("#score #message").textContent = message
	
			mobileNotifications(mobileMessage);
	
			if(setVehiclePinGlobal !== null) {
				setVehiclePinGlobal({
					lat: parseFloat(lat),
					lng: parseFloat(lng)
				})
			}
		}
        const submit_btn = container.querySelector("#submit-btn")
        submit_btn.onclick = async () => {
            const resData = await imageUpload(imageEncoded)
            if(resultImgDiv) {
                resultImgDiv.src = imageEncoded;
                resultImgDiv.style.display='block'
            }
             console.log(resData.predictions.labelName)
             console.log(Emotion.innerHTML)
             Emotion.innerHTML=resData.predictions.labelName;
             Probability.innerHTML=resData.predictions.score.toFixed(2);
           
             console.log()
            if(resData) {
                if(resData.backbonepredictions) {
                    for(let key in resData.backbonepredictions) {
                        let coordinates = resData.backbonepredictions[key].coordinates
                        if(resultImgDiv) {
                            resultImgDiv.src = imageEncoded;
                            let imgWidthDiv =  resultImgDiv.width
                            let imgHeightDiv =  resultImgDiv.height
                            let xmax = coordinates.xmax
                            let xmin = coordinates.xmin
                            let ymax = coordinates.ymax
                            let ymin = coordinates.ymin
                           

                            let leftPercent = (1.0*xmin)/(imgWidth*1.0)
                            let topPercent = (1.0*ymin)/(imgHeight*1.0)

                            let widthPercent = (xmax-xmin)/(imgWidth*1.0)
                            let heightPercent = (ymax-ymin)/(imgHeight*1.0)

                            resultRecDiv.style.left = `${imgWidthDiv * leftPercent}px`
                            resultRecDiv.style.top = `${imgHeightDiv * topPercent}px`

                            resultRecDiv.style.width = `${imgWidthDiv * widthPercent}px`
                            resultRecDiv.style.height = `${imgHeightDiv * heightPercent}px`
                        }
                        break;
                    }
                }
            }
        }
        box.injectNode(container)
        return () => { }
    })
	////////////

	let sim_function;
	simulator("Vehicle.Speed", "subscribe", async ({func, args}) => {
		sim_function = args[0]
	})

	return {
		start_simulation : (time, skip=1) => {
			sim_intervalId = setInterval(async () => {
				for(let i=0;i<skip;i++) {
					await vehicle.Next.get()
				}
				sim_function()
				updateSimulation()
			}, time)
		},
		load_signals : loadSpreadSheet,
		update_simulation : updateSimulation
	}
	
}

export default plugin
