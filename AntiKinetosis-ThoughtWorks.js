import MobileNotifications from "./reusable/MobileNotifications.js";
import StatusTable from "./reusable/StatusTable.js";
import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import SimulatorPlugins from "./reusable/SimulatorPlugins.js";

// The dev version with New UI
// TBD: To use Python VSS on Playground

async function fetchRowsFromSpreadsheet(spreadsheetId, apiKey) {
    // Set the range to A1:Z1000
    const range = "A1:Z1000";

    // Fetch the rows from the Google Spreadsheet API
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${encodeURIComponent(
            apiKey,
        )}`,
    );
    const json = await response.json();
    // Get the headers from the first row
    const headers = json.values[0];
    // Convert the remaining rows to an array of objects
    const rows = json.values.slice(1).map((row) => {
        const rowObject = {};
        for (let i = 0; i < row.length; i++) {
            rowObject[headers[i]] = row[i];
        }
        return rowObject;
    });

    return rows;
}

let ANSYS_API = "https://api-proxy.digitalauto.asia/evtwin_01/";
let SimulatorStarted = false;
const PROVIDER_ID = "dev-CLIENT-SAMPLE";

const getAnsysStatus = async () => {

    const res = await fetch(`${ANSYS_API}simulations/status`);
    if (!res.ok) throw "Get ansys status failed";
    return await res.json();
};

const callAnsysAction = async (action, policy) => {
    if (!action) throw "Action is required";
    if (!["start", "stop", "resume"].includes(action)) throw "Action is invalid";
    const res = await fetch(
        `${ANSYS_API}simulations/${action}${policy ? "?level_no=" + policy : ""}`,
        {
            method: "PUT",
            mode: "cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    if (!res.ok) throw "Call start api failed";
    return await res.json();
};

const anysisSimulation = async (call, policy) => {
    try {
        switch (call) {
            case "start":
                await callAnsysAction("start");
                break;
            case "stop":
                await callAnsysAction("stop");
                break;
            case "resume":
                let resumeReturn = await callAnsysAction("resume", policy);
                return resumeReturn;
            default:
                break;
        }
    } catch (err) {
        console.error("Simulation Error", err);
    }
};

const plugin = ({ widgets, simulator, vehicle }) => {
    // Simulator section ==================================================
    const loadSpreadSheet = async () => {
        let sheetID = "1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE";
        fetchRowsFromSpreadsheet(sheetID, PLUGINS_APIKEY).then((rows) => {
            SimulatorPlugins(rows, simulator);
        });
    };
    const updateSimulation = async () => {
        let inf_light = await vehicle.Cabin.Lights.LightIntensity.get();
        let temp = await vehicle.Cabin.HVAC.Station.Row1.Left.Temperature.get();
        let fan_speed = await vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed.get();
        let media_volume = await vehicle.Cabin.Infotainment.Media.Volume.get();
        let bat_soc =
            await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get();
        let trvl_dist = await vehicle.TravelledDistance.get();
        let acceleration_limit = await vehicle.AccelerationLimit.get();
        let speed_limit = await vehicle.SpeedLimit.get();

        interiorFrame.querySelector("#speed-limit-value").innerHTML =
            `${speed_limit}`;
        interiorFrame.querySelector("#acc-limit-value").innerHTML =
            `${acceleration_limit}`;
        interiorFrame.querySelector("#interior-light-value").innerHTML =
            `${inf_light}`;
        interiorFrame.querySelector("#temperature-value").innerHTML = `${temp}`;
        interiorFrame.querySelector("#fan-speed-value").innerHTML = `${fan_speed}`;
        interiorFrame.querySelector("#volume-value").innerHTML = `${media_volume}`;
        const temperatureIndicatorImage = interiorFrame.querySelector(
            "#temperature-indicator-image",
        );

        if (temp < 20) {
            temparatureIndicator = "cold";
        } else if (temp >= 20 && temp < 22) {
            temparatureIndicator = "normal";
        } else if (temp >= 22) {
            temparatureIndicator = "hot";
        }
        temperatureIndicatorImage.setAttribute(
            "src",
            `https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/ev-power-optimization/assets/hvac-animation/${temparatureIndicator}.gif`,
        );

        // Policy 0 (No Optimization strategy applied)
        if (
            inf_light === 100 &&
            temp === 15 &&
            fan_speed === 100 &&
            media_volume === 100
        ) {
            estimatedTravelRange = bat_soc * 3.84;
        }
        //change "Level1" to desired value say 50
        //Policy 1
        else if (
            inf_light === 100 &&
            temp === 15 &&
            fan_speed === 100 &&
            media_volume === 70
        ) {
            estimatedTravelRange = bat_soc * 3.84;
        }
        //change "Level2" to desired value say 20
        //Policy 2
        else if (
            inf_light === 100 &&
            temp === 15 &&
            fan_speed === 100 &&
            media_volume === 40
        ) {
            estimatedTravelRange = bat_soc * 3.97;
        }
        //Policy 3
        else if (
            inf_light === 100 &&
            temp === 15 &&
            fan_speed === 100 &&
            media_volume === 10
        ) {
            estimatedTravelRange = bat_soc * 3.99;
        }
        //Policy 4
        else if (
            inf_light === 70 &&
            temp === 15 &&
            fan_speed === 100 &&
            media_volume === 10
        ) {
            estimatedTravelRange = bat_soc * 4.0;
        }
        //Policy 5
        else if (
            inf_light === 40 &&
            temp === 15 &&
            fan_speed === 100 &&
            media_volume === 10
        ) {
            estimatedTravelRange = bat_soc * 4.01;
        }
        //Policy 6
        else if (
            inf_light === 40 &&
            temp === 18 &&
            fan_speed === 100 &&
            media_volume === 10
        ) {
            estimatedTravelRange = bat_soc * 4.07;
        }
        //Policy 7
        else if (
            inf_light === 40 &&
            temp === 20 &&
            fan_speed === 70 &&
            media_volume === 10
        ) {
            estimatedTravelRange = bat_soc * 4.23;
        }
        //Policy 8 & 9 & 10
        else if (
            inf_light === 40 &&
            temp === 20 &&
            fan_speed === 40 &&
            media_volume === 10
        ) {
            estimatedTravelRange = bat_soc * 5.2;
        }

        distanceToTheNearestChargingStation = 450 - trvl_dist;

        let optimizationKilometer =
            distanceToTheNearestChargingStation - estimatedTravelRange;
        optimizationPotentialFrame.querySelector(
            "#estimated-travel-range",
        ).innerHTML = `${estimatedTravelRange.toFixed(2)} km`;
        optimizationPotentialFrame.querySelector(
            "#distance-to-nearest-charging-station",
        ).innerHTML = `${distanceToTheNearestChargingStation.toFixed(2)} km`;
        optimizationPotentialFrame.querySelector(
            "#optimization-kilometer",
        ).innerHTML = `${optimizationKilometer.toFixed(2)} km`;
        if (optimizationKilometer < 0) {
            optimizationPotentialFrame
                .querySelector(".distance-mask-line")
                .setAttribute("stroke", "#FF8787");
            optimizationPotentialFrame.querySelector(
                "#optimization-kilometer",
            ).style.color = "#FF8787";
        } else {
            optimizationPotentialFrame
                .querySelector(".distance-mask-line")
                .setAttribute("stroke", "#ED0007");
            optimizationPotentialFrame.querySelector(
                "#optimization-kilometer",
            ).style.color = "#ED0007";
        }

        // make some scaling for better view
        let distanceToTheNearestChargingStationGraph;
        let estimatedTravelRangeGraph;
        if (distanceToTheNearestChargingStation < estimatedTravelRange) {
            distanceToTheNearestChargingStationGraph =
                distanceToTheNearestChargingStation / 2;
            estimatedTravelRangeGraph = estimatedTravelRange;
        } else if (distanceToTheNearestChargingStation > estimatedTravelRange) {
            distanceToTheNearestChargingStationGraph =
                distanceToTheNearestChargingStation;
            estimatedTravelRangeGraph = estimatedTravelRange / 2;
        } else {
            distanceToTheNearestChargingStationGraph =
                distanceToTheNearestChargingStation;
            estimatedTravelRangeGraph = estimatedTravelRange;
        }

        if (distanceToTheNearestChargingStation < 100) {
            distanceToTheNearestChargingStationGraph = 100;
        }
        if (estimatedTravelRange < 100) {
            estimatedTravelRangeGraph = 100;
        }
        if (distanceToTheNearestChargingStation >= 950) {
            distanceToTheNearestChargingStationGraph = 950;
        }
        if (estimatedTravelRange >= 950) {
            estimatedTravelRangeGraph = 950;
        }

        optimizationPotentialFrame
            .querySelector(".charging-distance-circle")
            .setAttribute("cx", distanceToTheNearestChargingStationGraph.toFixed(2));
        optimizationPotentialFrame
            .querySelector(".estimated-travel-range-circle")
            .setAttribute("cx", estimatedTravelRangeGraph.toFixed(2));
        optimizationPotentialFrame
            .querySelector(".distance-mask-line")
            .setAttribute("x1", distanceToTheNearestChargingStationGraph.toFixed(2));
        optimizationPotentialFrame
            .querySelector(".distance-mask-line")
            .setAttribute("x2", estimatedTravelRangeGraph.toFixed(2));

        optimizationPotentialFrame
            .querySelector("#charging-station-icon")
            .setAttribute(
                "x",
                distanceToTheNearestChargingStationGraph.toFixed(2) - 50,
            );
        optimizationPotentialFrame
            .querySelector("#car-icon")
            .setAttribute("x", estimatedTravelRangeGraph.toFixed(2) - 50);

        interiorFrame.querySelector("#policy-level").innerHTML = `${policy}`;
    };

    const roundNumber = (num) => {
        if (!num) return 0;
        return Math.round(num * 100) / 100;
    };

    const updateSignals = async (signals) => {
        if (!signals) return;
        simulator("Vehicle.TravelledDistance", "get", async () => {
            return roundNumber(signals["Distance"]);
        });
        simulator(
            "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current",
            "get",
            async () => {
                return roundNumber(signals["SOC"]);
            },
        );
        simulator("Vehicle.Speed", "get", async () => {
            return roundNumber(signals["Speed_kmph"]);
        });
        simulator(
            "Vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed",
            "get",
            async () => {
                return roundNumber(signals["Fan_Speed"]);
            },
        );
        simulator("Vehicle.Cabin.Lights.LightIntensity", "get", async () => {
            return roundNumber(signals["Interior_Lighting"]);
        });
        simulator("Vehicle.Cabin.Sunroof.Position", "get", async () => {
            return roundNumber(signals["Sunroof"]);
        });
        simulator(
            "Vehicle.Cabin.HVAC.Station.Row1.Left.Temperature",
            "get",
            async () => {
                return roundNumber(signals["Temperature"]);
            },
        );
        simulator("Vehicle.Cabin.Infotainment.Media.Volume", "get", async () => {
            return roundNumber(signals["Volume"]);
        });
        simulator("Vehicle.AccelerationLimit", "get", async () => {
            return roundNumber(signals["Acceleration_Limit"]);
        });
        simulator("Vehicle.SpeedLimit", "get", async () => {
            return roundNumber(signals["Speed_Limit"]);
        });

        // update the values related to the bar here, what vss api value you want the bar for
        const score =
            await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get();
        batteryFrame.querySelector("#battery-percentage").textContent =
            parseFloat(score).toFixed(2) + " %";
        batteryFrame
            .querySelector("#score .mask")
            .setAttribute("stroke-dasharray", 200 - parseInt(score) * 2 + "," + 200);
        batteryFrame
            .querySelector("#score .needle")
            .setAttribute("y1", `${parseInt(score) * 2}`);
        batteryFrame
            .querySelector("#score .needle")
            .setAttribute("y2", `${parseInt(score) * 2}`);
    };

    let sim_intervalId = null;
    const start_sim = async (time) => {
        let res = await getAnsysStatus();
        if (res && res.Status === "IDLE") {
            alert("Simulator is busy, try again later!");
            return false;
        }

        await anysisSimulation("start", policy);
        SimulatorStarted = true;
        sim_intervalId = setInterval(async () => {
            const res = await anysisSimulation("resume", policy);
            updateSignals(res);
            updateSimulation();

            await vehicle.Next.get();
            //sim_function()
        }, time);
        return true;
    };

    const stop_sim = async () => {
        clearInterval(sim_intervalId);
        await anysisSimulation("stop", policy);
    };

    const loadScript = (boxWindow, url) => {
        return new Promise(async (resolve, reject) => {
            try {
                const script = boxWindow.document.createElement("script");
                script.defer = true;
                script.referrerPolicy = "origin";

                script.src = url;
                boxWindow.document.head.appendChild(script);
                script.addEventListener("load", () => resolve(undefined));
            } catch (e) {
                reject();
            }
        });
    };

    // End Simulator section ==============================================


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
let simulationDetails = {
	"style": "sporty",
	"gender": "male",
	"age": "young"
}
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
			<div id="red" style="width:33%;text-align:center;cursor: pointer; ">
				<img style="width:80%;" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FMicrosoftTeams-image.png?alt=media&token=0c0a3deb-dae9-4be1-b709-54f00a4187c5" />
				<div style="font-weight:bold">
					TW Demonstrator Vehicle
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

	box.injectNode(controlsFrame)
	return () => {
		//clearInterval(intervalId)
		clearInterval(sim_intervalId)
		// Deactivation function for clearing intervals or such.
	}
})


widgets.register("VideoPlay", (box) => {
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
		`
 

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
		<div id="message">Kinetosis score </div>		
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
let EmotionScore = null
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

	 ///// Cover Image //////

	 widgets.register("Poster",  box => {
		const container = document.createElement("div");
		container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);
  
		container.innerHTML = `
		<img width="100%" height="100%"  src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FTestVehicle_1264x1264px.png?alt=media&token=64c05ed4-019a-44dc-b860-04daf8007511" >
		`
		  box.injectNode(container);
	  })

	 ///// Cover Video //////

	 widgets.register("Video-Player",  box => {
		const container = document.createElement("div");
		container.setAttribute("style", `display:block; ;overflow:auto;padding: 0px;`);
  
		container.innerHTML = `
		<video  width="100%" height="100%"id="vid" style="width: 100%; height: 100%; object-fit: cover;"  autoplay muted controls loop>
		<source src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis_demo_final.mp4?alt=media&token=c1ab5c64-3703-4ad8-a3e9-2f5836626cab" : style === "optimized" ? "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FOptimizedDriver_AVC.mp4?alt=media&token=f9fc5f86-c61a-4760-ac48-4a83d135b8f3" : "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FSportyDriver_AVC.mp4?alt=media&token=2f2b664a-f682-4171-912f-0b0e3e32a5bd" type="video/mp4">
		Your browser does not support the video tag.
		</video>
	 
		`
		 

		 
		  box.injectNode(container);
	  })


widgets.register("InputImage", (box) => {
	let webcam_message = 'Webcam'

	container = document.createElement('div')
	container.innerHTML = 
	`
	<div id="image" style="display:block">
	<img id="output" width="100%" height="100%" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2Fwebcam-default.png?alt=media&token=a7407530-25ac-4143-bbb4-f0a879f5ebba"/>
	</div>
	<div id="video" style="display:none; width:100%; height:100%">
		<video id="webcam-video" playsinline autoplay width="100%" height="100%"> </video>
	</div>

	<div class="btn btn-color" style="display:flex; position:absolute; width: 100%; bottom: 15px; opacity:50%; align-items:center; align-content:center; flex-direction:row; justify-content:center">
		<button id="upload-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			Upload
		</button>
		<button id="capture-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			${webcam_message}
		</button>
		<input id="upload" type="file" accept="image/*" style="display:none">
	</div>
	<div class="btn btn-color" style="display:flex; position:absolute; width: 100%; bottom: 60px; opacity:50%; align-items:center; align-content:center; flex-direction:row; justify-content:center">
		<button id="submit-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			Submit
		</button>
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

		let mobileMessage = "";
		if ((parseFloat(score) > 80.0)||(EmotionScore==="discomfort")) {
			//message = "Warning: High kinetosis level.";
			mobileMessage = "Warning: \nPassenger's Kinetosis status: Abnormal." + "\nPlease open the window for the passenger.";
			//scoreFrame.querySelector("#sign").innerHTML = `<img src="https://193.148.162.180:8080/warning.svg" alt="warning" style="width:30%;height:30%"/>`
		}
		else if (parseFloat(score) > 60.0) {
			//message = "Kinetosis level is medium";
			mobileMessage = "Passenger's Kinetosis status: Slightly uncomfortable";
		}
		else {
			//message =  "Kinetosis level is normal";
			mobileMessage = "Passenger's Kinetosis status: Normal";
		}


		mobileNotifications(mobileMessage);

		if(setVehiclePinGlobal !== null) {
			setVehiclePinGlobal({
				lat: parseFloat(lat),
				lng: parseFloat(lng)
			})
		}
	}
	const submit_btn = container.querySelector("#submit-btn")
	const capture_btn = container.querySelector("#capture-btn")
	capture_btn.onclick = () => {
	   
		
		const video = container.querySelector("#webcam-video")
		if(webcam_message === "Webcam") {
			webcam_message = "Capture"
			container.querySelector("#capture-btn").innerText = webcam_message

			const constraints = {  
				audio: false,
				video: {  
					width: 475, height: 475  
				}
			};
			if (navigator.mediaDevices.getUserMedia) {  
				navigator.mediaDevices.getUserMedia(constraints)  
					.then(function (stream) {  
						video.srcObject = stream;  
					})  
					.catch(function (err0r) {  
						console.log("Something went wrong!");  
					});  
			}
			container.querySelector("#image").style = "display: none"
			container.querySelector("#video").style = "display: block"
		}
		else {
			const image = container.querySelector('#output');
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			canvas.width = 475
			canvas.height = 475
			context.drawImage(video, 0, 0);
	
			image.setAttribute("crossorigin", "anonymous")
			const data = canvas.toDataURL("image/jpeg");
			imageEncoded = data
			image.setAttribute("src", data);
			container.querySelector("#image").style = "display: block"
			container.querySelector("#video").style = "display: none"

			const stream = video.srcObject;  
			const tracks = stream.getTracks();  
	
			for (let i = 0; i < tracks.length; i++) {  
				const track = tracks[i];  
				track.stop();  
			}  
			video.srcObject = null;

			webcam_message = "Webcam"
			container.querySelector("#capture-btn").innerText = webcam_message

		}
	}


	submit_btn.onclick = async () => {

		const imageUrl = img_output.src;

		try {
			const response = await fetch(imageUrl);
			const blob = await response.blob();
			file = new File([blob], "uploaded_image.jpg", { type: "image/jpeg" });
		} catch (error) {
			console.error('Error:', error);
		}


		const resData = await imageUpload(imageEncoded)
		if(resultImgDiv) {
			resultImgDiv.src = imageEncoded;
			resultImgDiv.style.display='block'
		}
		 console.log(resData.predictions.labelName)
		 console.log(Emotion.innerHTML)
		 Emotion.innerHTML=resData.predictions.labelName;
		 Probability.innerHTML=resData.predictions.score.toFixed(2);
		 EmotionScore=resData.predictions.labelName;
		 updateSimulation();
	   
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

    // End Widget section =================================================

    return {
        start_simulation: start_sim,
        stop_simulation: stop_sim,
        load_signals: loadSpreadSheet,
        update_simulation: updateSimulation,
        notifyPhone: (message) => {
            if (mobileNotifications !== null) {
                mobileNotifications(message);
            }
        },
    };
 
export default plugin;