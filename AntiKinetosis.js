import StatusTable from "https://cdn.jsdelivr.net/gh/digital-auto/playground-plugins/StatusTable.min.js"
import GoogleMapsPluginApi from "https://cdn.jsdelivr.net/gh/digital-auto/playground-plugins/GoogleMapsPluginApi.min.js"
import MobileNotifications from "https://cdn.jsdelivr.net/gh/digital-auto/playground-plugins/MobileNotifications.min.js"

async function fetchSimulationResults(simulationDetails) {
	const res = await fetch(
		`https://193.148.162.180:8080/kinetosis/results?style=${simulationDetails.style.trim()}&gender=${simulationDetails.gender.trim()}&age=${simulationDetails.age.trim()}`);
	// waits until the request completes...
	if (!res.ok) {
		const message = `An error has occured: ${res.status}`;
		throw new Error(message);
	}
	//conver response to json
	const response = await res.json()
	return response
}

const plugin = ({widgets, simulator, vehicle}) => {

    let controlsFrame = document.createElement("div")
    controlsFrame.style = 'display:grid;'
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
            background-color:rgb(108 122 224);
            text-align:center;            
        }
        </style>
		<div class="label" style="width:100%;position:relative;margin-top:10px;">Driving Style:</div>
		<div id="style" style="display:flex;width:100%;justify-content: center;align-items:center;position:relative;margin-top:5px">        
			<div id="red" style="width:33%;text-align:center">
			<svg style="width:60%;" id="eQMxJAybPva1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
				<ellipse rx="150" ry="150" transform="translate(150 150)" fill="#ff0000" stroke-width="0" />
			</svg>
			<div style="font-weight:bold">
				Sporty
			</div>
			</div>
			<div id="yellow" style="width:33%;text-align:center">
			<svg style="width:50%;" id="eqyhJoi98wx1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
				<ellipse rx="150" ry="150" transform="translate(150 150)" fill="#ffff00" stroke-width="0" />
			</svg>
			<div style="font-weight:unset">
				Optimized
			</div>
			</div>
			<div id="green" style="width:33%;text-align:center">
			<svg style="width:50%;" id="e0dZOJ9h5R31" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
				<ellipse rx="150" ry="150" transform="translate(150 150)" fill="#008000" stroke-width="0" />
			</svg>
			<div style="font-weight:unset">
				Relaxed
			</div>
			</div>
		</div>
		<div class="label" style="width:100%;position:relative;margin-top:10px;">Back Seat passengers: </div>
		<div id="passengers" style="position:relative;margin-top:5px;width:100%;">        
			<div class="selections" style="display:flex;position:relative;justify-content:center">
			<div class="btn-group gender" style="margin:5px;display:grid">
				<button id="gender_male" style="background-color: rgb(55 65 81);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
				Male
				</button>
				<button id="gender_female" style="background-color: rgb(156 163 175);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
				Female
				</button>
			</div>
			<div class="btn-group age" style="margin:5px;display:grid">
				<button id="age_young" style="background-color: rgb(55 65 81);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
				Young
				</button>
				<button id="age_old" style="background-color: rgb(156 163 175);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
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
			<div style="width:2em;cursor: pointer;" id="reload">
				<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Freload.svg?alt=media&token=0a2db061-8210-4c0b-bb84-0fdbf34c415e" alt="reload" style="filter: invert(100%);">
			</div>
			<div style="width:2em;cursor: pointer;" id="play">
				<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fplay.svg?alt=media&token=4f68e20d-5c11-4e2c-9ae3-7f44ebdd0416" alt="play" style="filter: invert(100%);">
			</div>
			<div style="width:2em;cursor: pointer;" id="forward">
				<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fforward.svg?alt=media&token=6e729a78-4c7b-4065-a738-b58cdbcfc3cc" alt="forward" style="filter: invert(100%);">
			</div>
			</div>
		</div>
		`
        
    let boxGlobal = null

    widgets.register("Controls", (box) => {

		let simulationDetails = {
			"style": "sporty",
			"gender": "male",
			"age": "young"
		}
	
		let sportyStyle = controlsFrame.querySelector("#red")
		sportyStyle.onclick = () => {
			simulationDetails["style"] = "sporty"
			controlsFrame.querySelector("#red svg").style.width = "60%"
			controlsFrame.querySelector("#green svg").style.width = "50%"
			controlsFrame.querySelector("#yellow svg").style.width = "50%"
			controlsFrame.querySelector("#red div").style.fontWeight = "bold"
			controlsFrame.querySelector("#green div").style.fontWeight = "unset"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"
		}
	
		let relaxedStyle = controlsFrame.querySelector("#green")
		relaxedStyle.onclick = () => {
			simulationDetails["style"] = "relaxed"
			controlsFrame.querySelector("#red svg").style.width = "50%"
			controlsFrame.querySelector("#green svg").style.width = "60%"
			controlsFrame.querySelector("#yellow svg").style.width = "50%"
			controlsFrame.querySelector("#red div").style.fontWeight = "unset"
			controlsFrame.querySelector("#green div").style.fontWeight = "bold"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"
		}
	
		let optimizedStyle = controlsFrame.querySelector("#yellow")
		optimizedStyle.onclick = () => {
			simulationDetails["style"] = "optimized"
			controlsFrame.querySelector("#red svg").style.width = "50%"
			controlsFrame.querySelector("#green svg").style.width = "50%"
			controlsFrame.querySelector("#yellow svg").style.width = "60%"
			controlsFrame.querySelector("#red div").style.fontWeight = "unset"
			controlsFrame.querySelector("#green div").style.fontWeight = "unset"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "bold"
		}
	
		let gender_male = controlsFrame.querySelector("#gender_male")
		gender_male.onclick = () => {
			simulationDetails["gender"] = "male"
			controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(55 65 81)"
			controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(156 163 175)"
		}
	
		let gender_female = controlsFrame.querySelector("#gender_female")
		gender_female.onclick = () => {
			simulationDetails["gender"] = "female"
			controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(156 163 175)"
			controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(55 65 81)"
		}
	
		let age_young = controlsFrame.querySelector("#age_young")
		age_young.onclick = () => {
			simulationDetails["age"] = "young"
			controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(55 65 81)"
			controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(156 163 175)"
		}
	
		let age_old = controlsFrame.querySelector("#age_old")
		age_old.onclick = () => {
			simulationDetails["age"] = "adult"
			controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(156 163 175)"
			controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(55 65 81)"
		}

		let video = controlsFrame.querySelector("#video")
		video.onclick = () => {			
			let videoFrame = document.createElement("div")
			videoFrame.style = "width:100%;height:100%;background-color:#e4eeff"
			videoFrame.innerHTML =
				`
				<div id="videoContainer" >
					<video id="videoPlayer" style="width:100%; height:100%; object-fit: fill" autoplay controls>
						<source
						src="https://193.148.162.180:8080/video?module=kinetosis&style=${simulationDetails.style.trim()}"
						type="video/mp4"
						/>
					</video>
				</div>
				`
			box.triggerPopup(videoFrame)
		}

		let reload = controlsFrame.querySelector("#reload")
		reload.onclick = () => {
		simulationDetails = {
			"style": "sporty",
			"gender": "male",
			"age": "young"
			}

			controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(55, 65, 81)"
			controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(156, 163, 175)"
			controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(55, 65, 81)"
			controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(156, 163, 175)"
			controlsFrame.querySelector("#red svg").style.width = "60%"
			controlsFrame.querySelector("#green svg").style.width = "50%"
			controlsFrame.querySelector("#yellow svg").style.width = "50%"
			controlsFrame.querySelector("#red div").style.fontWeight = "bold"
			controlsFrame.querySelector("#green div").style.fontWeight = "unset"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"

			index = 0;
			clearInterval(intervalId)

			scoreFrame.querySelector("#score .text").textContent = "0.0%"
			scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(0) * 2)) + "," + 200);
			scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(0) * 2)}`)
			scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(0) * 2)}`)
			scoreFrame.querySelector("#score #message").textContent = "Kinetosis level is "
			mobileNotifications("");

			animationFrame.querySelector("#animation").textContent = "Click on the Animation you want to see."
			animationControlsFrame.querySelector("#animation_window").style.backgroundColor = "rgb(156 163 175)"
			animationControlsFrame.querySelector("#animation_ac").style.backgroundColor = "rgb(156 163 175)"

		}

		let index = 0;
		let intervalId = null;

		let play = controlsFrame.querySelector("#play")
		play.onclick = () => {
			clearInterval(intervalId)
			index = 0;

			fetchSimulationResults(simulationDetails).then(data => {
				const VSSdata = data.signal_values

				intervalId = setInterval(() => {
					if (index >= VSSdata.length) {
						clearInterval(intervalId)
					}
					else {

						simulator("Vehicle.TripMeterReading", "get", async () => {
							return (parseFloat(parseFloat(VSSdata[index]["Vehicle.TripMeterReading"]) / 1000).toFixed(3) + " km");
						})
						simulator("Vehicle.Speed", "get", async () => {
							return (parseFloat(parseFloat(VSSdata[index]["Vehicle.Speed"]).toFixed() * 3.6).toFixed(2) + " km/h");
						})
						simulator("Vehicle.Acceleration.Lateral", "get", async () => {
							return (parseFloat(VSSdata[index]["Vehicle.Acceleration.Lateral"]).toFixed(3))
						})
						simulator("Vehicle.Acceleration.Longitudinal", "get", async () => {
							return (parseFloat(VSSdata[index]["Vehicle.Acceleration.Longitudinal"]).toFixed(3))
						})
						simulator("Vehicle.Acceleration.Vertical", "get", async () => {
							return (parseFloat(VSSdata[index]["Vehicle.Acceleration.Vertical"]).toFixed(3))
						})
						simulator("Vehicle.AngularVelocity.Roll", "get", async () => {
							return (parseFloat(VSSdata[index]["Vehicle.AngularVelocity.Roll"]).toFixed(3))
						})
						simulator("Vehicle.AngularVelocity.Pitch", "get", async () => {
							return (parseFloat(VSSdata[index]["Vehicle.AngularVelocity.Pitch"]).toFixed(3))
						})
						simulator("Vehicle.AngularVelocity.Yaw", "get", async () => {
							return (parseFloat(VSSdata[index]["Vehicle.AngularVelocity.Yaw"]).toFixed(3))
						})
						
						scoreFrame.querySelector("#score .text").textContent = VSSdata[index]["KinetosisScore"]
						scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(VSSdata[index]["KinetosisScore"].split("%")[0]) * 2)) + "," + 200);
						scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(VSSdata[index]["KinetosisScore"].split("%")[0]) * 2)}`)
						scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(VSSdata[index]["KinetosisScore"].split("%")[0]) * 2)}`)

						let message = "";
						if (parseFloat(VSSdata[index]["KinetosisScore"].split("%")[0]) > 80.0) {
							message = "Warning: High kinetosis level"
							//scoreFrame.querySelector("#sign").innerHTML = `<img src="https://193.148.162.180:8080/warning.svg" alt="warning" style="width:30%;height:30%"/>`
						}
						else if (parseFloat(VSSdata[index]["KinetosisScore"].split("%")[0]) > 60.0) {
							message = "Kinetosis level is medium"
						}
						else {
							message =  "Kinetosis level is normal"
						}

						scoreFrame.querySelector("#score #message").textContent = message

						mobileNotifications(message);

						index = index + 17
					}
				}, 1000)
			})
		}

		let forward = controlsFrame.querySelector("#forward")
		forward.onclick = () => {
			if (index !== 0)
				index = index + (17 * 60)
		}

        box.injectNode(controlsFrame)
        return () => {
			clearInterval(intervalId)
            boxGlobal = null
            // Deactivation function for clearing intervals or such.
        }
    })

	widgets.register("Table", StatusTable({
		apis: ["Vehicle.Speed", "Vehicle.TripMeterReading", "Vehicle.Acceleration.Lateral", "Vehicle.Acceleration.Longitudinal", "Vehicle.Acceleration.Vertical", "Vehicle.AngularVelocity.Roll", "Vehicle.AngularVelocity.Pitch", "Vehicle.AngularVelocity.Yaw"],
		vehicle: vehicle,
		refresh: 1000
	}))

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
		GoogleMapsPluginApi("AIzaSyCQd4f14bPr1ediLmgEQGK-ZrepsQKQQ6Y", box, path)
	})

	let scoreFrame = document.createElement("div")	
	scoreFrame.style = `width:100%;`
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
            background-color:rgb(108 122 224);
            text-align:center;            
        }
        </style>
		<div id="score" style="postion:relative;top:25%">
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

	widgets.register("Score", (box) => {
		boxGlobal = box
		box.injectNode(scoreFrame)
		return () => {
			boxGlobal = null
			// Deactivation function for clearing intervals or such.
		}
	})

	let mobileNotifications = null;
	widgets.register("Mobile", (box) => {
		MobileNotifications({
			apis : null,
			vehicle: null,
			box: box,
			refresh: null
		}).then(({printNotification}) => {
			mobileNotifications = printNotification;
		})
	})

	let animationControlsFrame = null;
	widgets.register("Animation Controls", (box) => {
		animationControlsFrame = document.createElement("div")
		animationControlsFrame.style = "display:grid"
		animationControlsFrame.innerHTML = `
		<style>
		@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
            color:#ffffe3;
            background-color:rgb(108 122 224);
            text-align:center;            
        }
		</style>
		<div>Please click on the button below to take action : </div>
		<div class="btn-group animation" style="margin:5px;display:grid;position:relative;top:50%">
			<button id="animation_ac" style="background-color: rgb(156 163 175);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			Turn on A/C
			</button>
			<button id="animation_window" style="background-color: rgb(156 163 175);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			Open Window
			</button>
		</div>
		`
		
		let animation_ac = animationControlsFrame.querySelector("#animation_ac")
		animation_ac.onclick = () => {
			animationControlsFrame.querySelector("#animation_ac").style.backgroundColor = "rgb(55 65 81)"
			animationControlsFrame.querySelector("#animation_window").style.backgroundColor = "rgb(156 163 175)"
			animationFrame.querySelector("#animation").textContent = "Show AC Animation"
		}
	
		let animation_window = animationControlsFrame.querySelector("#animation_window")
		animation_window.onclick = () => {
			animationControlsFrame.querySelector("#animation_ac").style.backgroundColor = "rgb(156 163 175)"
			animationControlsFrame.querySelector("#animation_window").style.backgroundColor = "rgb(55 65 81)"
			animationFrame.querySelector("#animation").textContent = "Show Window Animation"
		}

		box.injectNode(animationControlsFrame)

	})

	let animationFrame = document.createElement("div")
	animationFrame.innerHTML = `
	<div id="animation" style='display: flex; height: 100%; width: 100%; justify-content: center; align-items: center; text-align: center; font-family: sans-serif; color: #6b7280; user-select: none;'>Click on the Animation you want to see.</div>
	`
	widgets.register("Animation", (box) => {
		box.injectNode(animationFrame)
	})
	
}

export default plugin