import MobileNotifications from "./reusable/MobileNotifications.js";
import StatusTable from "./reusable/StatusTable.js";
import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import SimulatorPlugins from "./reusable/SimulatorPlugins.js";

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

let ANSYS_API = "https://proxy.digitalauto.tech/evtwin_dev/";
let SimulatorStarted = false;
const PROVIDER_ID = "dev-CLIENT-SAMPLE";

const getAnsysStatus = async () => {
    console.log("getAnsysStatus " + `${ANSYS_API}simulations/status`);
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

    // Widget section =====================================================
    let mobileNotifications = null;
    widgets.register("Mobile", (box) => {
        ({ printNotification: mobileNotifications } = MobileNotifications({
            box: box,
            apis: null,
            vehicle: null,
            refresh: null,
            backgroundColor: "#296096",
            textColor: "#FFF",
        }));
    });

    widgets.register(
        "Table",
        StatusTable({
            apis: [
                "Vehicle.TravelledDistance",
                "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current",
                "Vehicle.Speed",
                "Vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed",
                "Vehicle.Cabin.Lights.LightIntensity",
                "Vehicle.Cabin.Sunroof.Position",
                "Vehicle.Cabin.HVAC.Station.Row1.Left.Temperature",
                "Vehicle.Cabin.Infotainment.Media.Volume",
                "Vehicle.AccelerationLimit",
                "Vehicle.SpeedLimit",
            ],
            vehicle: vehicle,
            refresh: 800,
        }),
    );

    let policyFrame = null;
    let policy = 11;

    widgets.register("Policy Selection", async (box) => {
        policyFrame = document.createElement("div");
        policyFrame.style =
            "width:100%; display:grid; align-content:center; justify-content:center; align-items:center";
        policyFrame.innerHTML = `
		<style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: "Bosch Sans", Arial, sans-serif;
            color: #296096;
            background-color: #F1F4FA;
            text-align:center;            
        }
        .pol {
            width:130px;
            max-width:130px;
            color: #296096;
            background-color: transparent;
            padding: 16px 12px;
            cursor: pointer;
            margin: 2px;
            border-radius: 7px;
            border: 1px solid #296096;
            font-size: 1em;
        }

        .pol:hover {
            color: #FFF;
            background-color: #296096;
        }

        .pol.selected {
            color: #FFF;
            background-color: #296096;
        }
		</style>
        <div style="display:flex; flex-wrap:wrap; flex-direction:column; align-content:space-around; justify-content:space-around; align-items: center;">
            <div style="width:50%; display: flex; align-items: center; justify-content: space-evenly; cursor: pointer; margin-bottom:4px;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" id="video-play-button">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 20C4.4875 20 0 15.5125 0 10C0 4.4875 4.4875 0 10 0C15.5125 0 20 4.4875 20 10C20 15.5125 15.5125 20 10 20ZM10 1C5.0375 1 1 5.0375 1 10C1 14.9625 5.0375 19 10 19C14.9625 19 19 14.9625 19 10C19 5.0375 14.9625 1 10 1ZM7.4375 5.475L14.55 10L7.4375 14.525V5.475ZM8.5625 12.475L12.45 10L8.5625 7.525V12.475Z" fill="#296096"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" id="policy-table-button">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 20C4.486 20 0 15.514 0 10C0 4.486 4.486 0 10 0C15.514 0 20 4.486 20 10C20 15.514 15.514 20 10 20ZM10 1C5.03737 1 1 5.03737 1 10C1 14.9626 5.03737 19 10 19C14.9626 19 19 14.9626 19 10C19 5.03737 14.9626 1 10 1ZM9.1125 5.8875C9.1125 5.4 9.5125 5 10 5C10.5 5 10.8875 5.3875 10.8875 5.8875C10.8875 6.3875 10.5 6.775 10 6.775C9.5125 6.775 9.1125 6.375 9.1125 5.8875ZM9.34375 8.05H10.6562V15H9.34375V8.05Z" fill="#296096"/>
            </svg>
            </div>
            <div class="btn-group" style="margin:5px;">
                <button id="pol1" class="pol">
                Level 1
                </button>
                <button id="pol2" class="pol">
                Level 2
                </button>
                <button id="pol3" class="pol">
                Level 3
                </button>
                <button id="pol4" class="pol">
                Level 4
                </button>
                <button id="pol5" class="pol">
                Level 5
                </button>
                <button id="pol6" class="pol">
                Level 6
                </button>
                <button id="pol7" class="pol">
                Level 7
                </button>
                <button id="pol8" class="pol">
                Level 8
                </button>
                <button id="pol9" class="pol">
                Level 9
                </button>
                <button id="pol10" class="pol">
                Level 10
                </button>
                <button id="pol11" class="pol selected">
                No Limiter
                </button>
                <button id="pol12" class="pol">
                Auto
                </button>
            </div>
        </div>`;
        await loadScript(
            box.window,
            `https://cdn.socket.io/4.6.0/socket.io.min.js`,
        );
        const socket = box.window.io("https://bridge.digitalauto.tech");

        //Get values
        const requestDataFromAnsys = async () => {
            console.log(`requestDataFromAnsys`);
            //let mode = await vehicle.PowerOptimizationMode.get();
            let inf_light = await vehicle.Cabin.Lights.LightIntensity.get();
            let temp = await vehicle.Cabin.HVAC.Station.Row1.Left.Temperature.get();
            let fan_speed = await vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed.get();
            let media_volume = await vehicle.Cabin.Infotainment.Media.Volume.get();
            let bat_soc =
                await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get();
            let trvl_dist = await vehicle.TravelledDistance.get();
            socket.emit("request_provider", {
                to_provider_id: PROVIDER_ID,
                cmd: "set_data",
                data: policy,
                vss: [trvl_dist, bat_soc, fan_speed, inf_light, temp, media_volume],
            });
        };
        const set_policy = async () => {
            socket.emit("request_provider", {
                to_provider_id: PROVIDER_ID,
                cmd: "set_policy",
                data: policy,
            });
        };
        const PROVIDER_ID = "JAVASCRIPT-CLIENT-SAMPLE";
        const PROVIDER_ID_MOBIS = "Mobis-SAMPLE";
        socket.on("connect", () => {
            console.log("Io connected from Policy");
            socket.emit("register_client", {
                master_provider_id: PROVIDER_ID,
            });
            socket.emit("register_provider", {
                provider_id: PROVIDER_ID_MOBIS,
                name: "Listen to ansys",
            });
        });

        socket.on("new_request", (data) => {
            console.log("on new_request from ansys");
            console.log(data);

            if (!data || !data.cmd || !data.request_from) return;
            switch (data.cmd) {
                case "set_policy":
                    policy = Number(data.data);
                    break;
                default:
                    break;
            }
        });

        let video = policyFrame.querySelector("#video-play-button");
        video.onclick = () => {
            const videoURL =
                "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fpower_optimization%2FEV_Power_Optimisation.mp4?alt=media&token=6e441fbf-14e9-4567-bdf5-62f4df264a46";
            let videoFrame = document.createElement("div");
            videoFrame.style =
                "width:100%;height:100%;background-color:rgb(0 80 114)";
            videoFrame.innerHTML = `<div id="videoContainer" >
					<video id="videoPlayer" style="width:100%; height:100%; object-fit: fill" autoplay controls>
						<source
						src=${videoURL}
						type="video/mp4"
						/>
					</video>
				</div>`;
            box.triggerPopup(videoFrame);
        };

        let policyTable = policyFrame.querySelector("#policy-table-button");
        policyTable.onclick = () => {
            let tableFrame = document.createElement("div");
            tableFrame.style =
                "width:100%; height:100%; display:grid; align-content:center; justify-content:center; align-items:center";
            tableFrame.innerHTML = `<img src="https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/ev-power-optimization/assets/policy-table.png" width="100%" height="100%" style="object-fit: contain;" />`;
            box.triggerPopup(tableFrame);
        };

        let pol = policyFrame.querySelectorAll(".pol");
        for (let i = 1; i < 13; i++) {
            pol[i - 1].onclick = () => {
                policy = i;
                let id = "#pol" + policy;
                policyFrame.querySelector(id).classList.add("selected");
                for (let j = 1; j < 13; j++) {
                    if (i !== j) {
                        id = "#pol" + j;
                        policyFrame.querySelector(id).classList.remove("selected");
                    }
                }
                set_policy();
            };
        }

        const renderActivePolicy = () => {
            let policies = policyFrame.querySelectorAll(".pol");
            console.log(`policy ${policy} policies`, policies);
            if (policies) {
                policies.forEach((pol) => {
                    if (pol.id == "pol" + policy) {
                        pol.classList.add("selected");
                    } else {
                        pol.classList.remove("selected");
                    }
                });
            }
        };

        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async function delayedGreeting() {
            while (1) {
                await requestDataFromAnsys();
                await sleep(1000);
                renderActivePolicy();
                console.log("sleep");
            }
        }

        delayedGreeting();

        socket.on("request_provider", (data) => {
            alert("Test");
            alert(data);
        });

        // Function to handle window close event
        const handleWindowClose = async (e) => {
            e.preventDefault();
            e.returnValue = ""; // This is required for older browsers

            // Show an alert when the user tries to close the window
            const confirmationMessage =
                "Are you sure you want to leave this page? Your unsaved changes may be lost.";
            e.returnValue = confirmationMessage;
            if (e.returnValue != "") {
                clearInterval(sim_intervalId);
                await anysisSimulation("stop", policy);
            }
            return confirmationMessage;
        };

        // Attach the window close event handler
        window.addEventListener("beforeunload", handleWindowClose);

        // Function to remove the window close event handler
        const removeWindowCloseHandler = () => {
            window.removeEventListener("beforeunload", handleWindowClose);
        };

        // Example of when to remove the event handler (you can call this when needed)
        const stopAlertOnWindowClose = () => {
            removeWindowCloseHandler();
        };

        // Example of when to start showing the alert on window close (you can call this when needed)
        const startAlertOnWindowClose = () => {
            window.addEventListener("beforeunload", handleWindowClose);
        };

        box.injectNode(policyFrame);
    });

    let interiorFrame = null;
    let songCover = [
        "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/ev-power-optimization/assets/cover/magneto-igniter_autoverse.png",
        "https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/ev-power-optimization/assets/cover/digtial-auto_playground.png",
    ];
    let songTitle = [
        "Magneto Igniter &ndash; Autoverse",
        "digital.auto &ndash; Playground",
    ];
    let currentSong = 1;
    let songProgress = 10;
    let isPlaying = false;
    let changedSong = false;
    let temparatureIndicator = "normal";
    widgets.register("Interior", (box) => {
        interiorFrame = document.createElement("div");
        interiorFrame.style = "width:100%; height:100%;";
        interiorFrame.innerHTML = `
            <style>
            * {
                box-sizing: border-box;
            }
            body {
                font-family: "Bosch Sans", Arial, sans-serif;       
            }
            h2 {
                font-size: 20px;
                margin: 0;
            }
            .cockpit {
                width: 100%;
                height: 100%;
                background: url("https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/ev-power-optimization/assets/Closeup_cockpit04.png");
                background-size: contain;
                background-repeat: no-repeat;
            }
            .screen {
                color: #FFF;
                text-align: center;
                width: 60%;
                height: 42%;
                position: absolute;
                left: 22%;
                top: 15%;
                overflow: hidden;
            }
            .screen-contents {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr;
            }
            .screen-content {
                display: grid;
                justify-items: center;
                padding-top: 10px;
            }
            .screen-content .headline {
                font-size: 0.8em;
                font-weight: bold;
                text-align: center;
                padding: 5px;
            }
            .box-wrapper {
                background-color: #296096;
                border-radius: 5px;
                padding: 10px 0 0 0;
                width: 70%;
                min-heigt: 60px;
            }
            .box-value {
                font-size: 0.7em;
                margin-top: 10px;
            }
            .radio-player-screen {
                position: absolute;
                left: 27%;
                top: 65%;
                overflow: hidden;
                width: 50%;
                height: 18%;
                grid-template-columns: 1fr 3fr;
                display: flex;
                align-items: center;
                color: #FFF;
            }
            .radio-right {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .song-title {
                font-weight: bold;
                font-size 16px;
            }
            .song-progress {
                z-index: 99;
            }
            .player-controls {
                width: 100%;
                height: 20px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-end;
            }
            .player-button {
                z-index: 99;
            }
            .temperature-airflow {
                position: absolute;
                top: 50%;
                height: 50%;
                overflow: hidden;
            }
            </style>
            <div class="cockpit">
                <div class="screen">
                    <div class="headline">
                        <h2>Power Optimization Mode<br>Level <span id="policy-level">1</span></h2>
                    </div>
                    <div class="screen-contents">
                        <div class="screen-content speed-limit">
                            <div class="headline">
                                Speed Limit
                            </div>
                            <div class="box-wrapper">
                                <div class="box-icon">
                                    <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.0556641 13.25C0.0556641 6.35938 5.66504 0.75 12.5557 0.75C19.4463 0.75 25.0557 6.35938 25.0557 13.25H23.8057C23.8057 7.04688 18.7588 2 12.5557 2C6.35254 2 1.30566 7.04688 1.30566 13.25H0.0556641ZM13.1338 5.14062C14.8994 5.26562 16.5244 5.9375 17.8682 7.09375L18.6807 6.15625C17.1338 4.8125 15.2432 4.03125 13.2119 3.89062L13.1338 5.14062ZM20.6807 13.25C20.6807 11.2969 19.9775 9.40625 18.6963 7.9375L19.6494 7.10938C21.1182 8.8125 21.9307 11 21.9307 13.25H20.6807ZM11.9307 13.25C11.9307 13.1719 11.9463 13.0938 11.9775 13.0312L14.165 7.1875L15.3369 7.625L13.1338 13.4688C13.0557 13.7031 12.8213 13.875 12.5557 13.875C12.2119 13.875 11.9307 13.5938 11.9307 13.25ZM6.43066 6.15625C7.96191 4.82812 9.85254 4.04688 11.8838 3.90625L11.9775 5.15625C10.2119 5.28125 8.57129 5.95312 7.24316 7.10938L6.43066 6.15625ZM3.18066 13.25H4.43066C4.43066 11.2969 5.13379 9.40625 6.41504 7.92188L5.47754 7.10938C3.99316 8.8125 3.18066 10.9844 3.18066 13.25Z" fill="#A6C8FA"/>
                                    </svg>
                                </div>
                                <div class="box-value" id="speed-limit-value">
                                0
                                </div>
                            </div>
                        </div>
                        <div class="screen-content acc-limit">
                            <div class="headline">
                                Acc. Limit
                            </div>
                            <div class="box-wrapper">
                                <div class="box-icon">
                                    <svg width="26" height="12" viewBox="0 0 26 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M25.0557 8.75C25.0557 5.84375 23.6338 4.39062 20.165 3.76562L16.6025 3.17188C15.9307 2.51562 13.8682 0.625 12.5557 0.625C9.54004 0.625 3.35254 2.79688 2.44629 3.125H1.93066C0.899414 3.125 0.0556641 3.96875 0.0556641 5V8.57812L1.97754 9.21875C2.19629 10.375 3.21191 11.25 4.43066 11.25C5.58691 11.25 6.57129 10.4531 6.85254 9.375H17.6494C17.9307 10.4531 18.8994 11.25 20.0713 11.25C21.2432 11.25 22.2119 10.4531 22.4932 9.375H25.0557V8.75ZM4.43066 10C3.74316 10 3.18066 9.4375 3.18066 8.75C3.18066 8.0625 3.74316 7.5 4.43066 7.5C5.11816 7.5 5.68066 8.0625 5.68066 8.75C5.68066 9.4375 5.11816 10 4.43066 10ZM20.0557 10C19.3682 10 18.8057 9.4375 18.8057 8.75C18.8057 8.0625 19.3682 7.5 20.0557 7.5C20.7432 7.5 21.3057 8.0625 21.3057 8.75C21.3057 9.4375 20.7432 10 20.0557 10ZM22.4775 8.125C22.1963 7.04688 21.2275 6.25 20.0557 6.25C18.8838 6.25 17.915 7.04688 17.6338 8.125H6.85254C6.57129 7.04688 5.60254 6.25 4.43066 6.25C3.33691 6.25 2.41504 6.95312 2.07129 7.9375L1.30566 7.6875V5C1.30566 4.65625 1.58691 4.375 1.93066 4.375H2.66504L2.77441 4.34375C2.83691 4.3125 9.57129 1.875 12.5557 1.875C13.165 1.875 14.7432 3.07812 15.8682 4.1875L16.0088 4.32812L19.9463 4.98438C22.29 5.40625 23.5713 6.04688 23.7744 8.125H22.4775Z" fill="#A6C8FA"/>
                                    </svg>                                
                                </div>
                                <div class="box-value" id="acc-limit-value">
                                0
                                </div>
                            </div>
                        </div>
                        <div class="screen-content interior-light">
                            <div class="headline">
                                Interior Light
                            </div>
                            <div class="box-wrapper">
                                <div class="box-icon">
                                    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M25.0557 7.50002C25.0557 6.20315 23.9932 5.71877 23.4307 5.62502H21.1182C20.8369 4.8594 20.165 3.25002 19.3057 2.12502C18.6182 1.14065 17.2588 0.484396 15.2588 
                                    0.171896C14.0251 -0.0145868 12.9232 -0.00352627 12.6179 -0.000462101C12.5906 -0.000188649 12.5697 2.11193e-05 12.5557 2.11193e-05C12.5422 2.11193e-05 12.5225 -0.000171604 12.4971 -0.000420837C12.1987 -0.00334529 11.1064 -0.0140502 9.86816 0.187521C7.86816 0.500021 6.49316 1.15627 5.80566 2.14065C4.94629 3.25002 4.27441 4.8594 3.99316 5.62502H1.68066C1.11816 5.71877 0.0556641 6.20315 0.0556641 7.50002C0.0556641 8.28127 0.571289 9.09377 1.44629 9.31252C1.07129 9.9844 0.680664 10.9219 0.680664 11.875V16.25C0.680664 17.375 0.836914 20 2.24316 20H4.94629L4.96191 20L5.00879 19.9844L4.99289 19.9845L4.99316 19.9844C6.10254 19.7969 6.36816 17.9844 6.43066 16.875H18.6494C18.79 19.5469 19.7744 19.9375 20.0869 19.9844L20.1338 20L20.165 20L22.8682 20C24.2744 20 24.4307 17.375 24.4307 16.25V11.875C24.4307 10.9219 24.04 9.9844 23.665 9.31252C24.54 9.09377 25.0557 8.28127 25.0557 7.50002ZM12.5713 1.25002C12.9775 1.2344 13.6338 1.25002 14.3682 1.32815C14.0869 2.01565 13.3994 2.50002 12.5869 2.50002C11.7744 2.50002 11.0869 2.01565 10.8057 1.31252C11.5088 1.25002 12.1338 1.2344 12.54 1.25002H12.5713ZM21.2588 8.12502H23.1807C23.6338 8.12502 23.8057 7.75002 23.8213 7.50002C23.8213 7.0469 23.4775 6.9219 23.29 6.87502H20.2432L20.1025 6.45315C20.1007 6.45128 20.0884 6.41768 20.0665 6.35773C19.9044 5.91472 
                                    19.2159 4.03295 18.3213 2.89065L18.3057 2.8594C17.8213 2.15627 16.7432 1.75002 15.6338 1.51565C15.2432 2.81252 14.04 3.75002 12.6025 3.75002C11.165 3.75002 9.94629 2.7969 9.55566 1.51565C8.41504 1.7344 7.32129 2.14065 6.82129 2.8594L6.80566 2.89065C5.79004 4.20315 5.02441 6.43752 5.02441 6.45315L4.88379 6.87502H1.83691C1.64941 6.90627 1.30566 7.0469 1.30566 7.50002C1.30566 7.75002 1.47754 8.12502 1.93066 8.12502H3.85254L3.04004 9.14065C3.04004 9.14218 3.0293 9.15718 3.00994 9.18422C2.8325 9.43204 1.93066 10.6916 1.93066 11.875V16.25C1.93066 17.6563 2.18066 18.5156 2.33691 18.75H4.72754C4.85254 18.6094 5.21191 18.0313 5.21191 16.25V15.625H19.8994V16.25C19.8994 18.0313 20.2588 18.6094 20.3838 18.75H22.7744C22.9307 18.5156 23.1807 17.6563 23.1807 16.25V11.875C23.1807 10.5625 22.0869 9.15627 22.0713 9.14065L21.2588 8.12502ZM14.415 4.57815C14.8057 4.39065 15.165 4.15627 15.4775 3.87502L17.0244 5.50002L16.1182 6.3594L14.415 4.57815ZM5.52441 13.75H8.18066C9.13379 13.75 9.89941 12.9844 9.89941 12.0313C9.89941 11.0938 9.27441 10.4375 8.25879 10.3125C7.52441 10.2344 5.60254 10 5.60254 10H5.52441C4.57129 10 3.80566 10.7656 3.80566 11.7188V12.0313C3.80566 12.9844 4.57129 13.75 5.52441 13.75ZM5.49316 11.25C5.24316 11.2656 5.05566 11.4688 5.05566 11.7188V12.0313C5.05566 12.2969 5.25879 12.5 5.52441 
                                    12.5H8.18066C8.44629 12.5 8.64941 12.2969 8.64941 12.0313C8.64941 11.875 8.64941 11.625 8.10254 11.5625C7.87326 11.5352 7.52191 11.4927 7.14911 11.4475L7.14885 11.4475C6.4547 11.3634 5.68629 11.2704 5.49316 11.25ZM16.9307 13.75H19.5869C20.54 13.75 21.3057 12.9844 21.3057 12.0313V11.7188C21.3057 10.7656 20.54 10 19.5869 10H19.5088C19.5088 10 17.5869 10.2344 16.8525 10.3125C15.8369 10.4375 15.2119 11.0938 15.2119 12.0313C15.2119 12.9844 15.9775 13.75 16.9307 13.75ZM17.9625 11.4475L17.9622 11.4475C17.5894 11.4927 17.2381 11.5352 17.0088 11.5625C16.4619 11.625 16.4619 11.875 16.4619 12.0313C16.4619 12.2969 16.665 12.5 16.9307 12.5H19.5869C19.8525 12.5 20.0557 12.2969 20.0557 12.0313V11.7188C20.0557 11.4688 19.8682 11.2656 19.6182 11.25C19.425 11.2704 18.6566 11.3634 17.9625 11.4475ZM9.63379 3.87502L8.08691 5.4844L8.99316 6.34377L10.6963 4.56252C10.3057 4.39065 9.94629 4.15627 9.63379 3.87502ZM12.5557 5.00002C12.3369 5.00002 12.1338 4.9844 11.9307 4.95315V7.50002H13.1807V4.95315C12.9775 4.9844 12.7744 5.00002 12.5557 5.00002Z" fill="#A6C8FA"/>
                                    </svg>                                
                                </div>
                                <div class="box-value" id="interior-light-value">
                                0
                                </div>
                            </div>
                        </div>
                        <div class="screen-content volume">
                            <div class="headline">
                                Volume
                            </div>
                            <div class="box-wrapper">
                                <div class="box-icon">
                                    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.79004 14.75L11.9307 21.8906V0.109375L4.79004 7.25H0.0556641V14.75H4.79004ZM20.5088 18.9531L21.3994 19.8438C26.2744 14.9687 26.2744 7.03125 21.3994 2.15625L20.5088 3.04688C24.8994 7.42188 24.8994 14.5625 20.5088 18.9531ZM1.30566 13.5H5.32129L10.6807 18.8594V3.14062L5.32129 8.5H1.30566V13.5ZM17.415 15.8594L18.3057 16.75C19.8369 15.2031 20.6807 13.1719 20.6807 11C20.6807 8.82812 19.8369 6.79688 18.3057 5.25L17.415 6.14062C18.7119 7.4375 19.4307 9.17188 19.4307 11C19.4307 12.8281 18.7119 14.5625 17.415 15.8594Z" fill="#A6C8FA"/>
                                    </svg>
                                </div>
                                <div class="box-value" id="volume-value">
                                0
                                </div>
                            </div>
                        </div>
                        <div class="screen-content temperature">
                            <div class="headline">
                                Temperature
                            </div>
                            <div class="box-wrapper">
                                <div class="box-icon">
                                    <svg width="12" height="26" viewBox="0 0 12 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.55566 0.5C6.27441 0.5 7.68066 1.90625 7.68066 3.625V18.0625C8.47754 18.875 8.93066 19.9844 8.93066 21.125C8.93066 23.5312 6.96191 25.5 4.55566 25.5C2.14941 25.5 0.180664 23.5312 0.180664 21.125C0.180664 19.9844 0.633789 18.875 1.43066 18.0625V3.625C1.43066 1.90625 2.83691 0.5 4.55566 0.5ZM1.43066 21.125C1.43066 22.8438 2.83691 24.25 4.55566 24.25C6.27441 24.25 7.68066 22.8438 7.68066 21.125C7.68066 20.2344 7.29004 19.3906 6.63379 18.7969L6.43066 18.6094V3.625C6.43066 2.59375 5.58691 1.75 4.55566 1.75C3.52441 1.75 2.68066 2.59375 2.68066 3.625V18.6094L2.47754 18.7969C1.80566 19.3906 1.43066 20.2344 1.43066 21.125ZM8.93066 3H11.4307V4.25H8.93066V3ZM11.4307 6.125H8.93066V7.375H11.4307V6.125ZM8.93066 9.25H11.4307V10.5H8.93066V9.25ZM11.4307 12.375H8.93066V13.625H11.4307V12.375ZM8.93066 15.5H11.4307V16.75H8.93066V15.5ZM5.18066 19.3594V9.25H3.93066V19.3594C3.19629 19.625 2.68066 20.3125 2.68066 21.125C2.68066 22.1562 3.52441 23 4.55566 23C5.58691 23 6.43066 22.1562 6.43066 21.125C6.43066 20.3125 5.91504 19.625 5.18066 19.3594ZM4.55566 21.75C4.21191 21.75 3.93066 21.4688 3.93066 21.125C3.93066 20.7812 4.21191 20.5 4.55566 20.5C4.89941 20.5 5.18066 20.7812 5.18066 21.125C5.18066 21.4688 4.89941 21.75 4.55566 21.75Z" fill="#A6C8FA"/>
                                    </svg>
                                </div>
                                <div class="box-value" id="temperature-value">
                                0
                                </div>
                            </div>
                        </div>
                        <div class="screen-content fan-speed">
                            <div class="headline">
                                Fan Speed
                            </div>
                            <div class="box-wrapper">
                                <div class="box-icon">
                                    <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.44629 12.6562C6.35254 13.2031 3.41504 14.5312 0.977539 16.5625L0.633789 16.8438L0.790039 17.25C1.29004 18.625 2.02441 19.8906 2.96191 21.0312L3.24316 21.375L3.66504 21.2188C6.60254 20.1094 9.22754 18.2344 11.2432 15.8438C11.6494 16.0312 12.0869 16.1406 12.5557 16.1406C12.9932 16.1406 13.415 16.0469 13.8057 15.875C15.8213 18.2812 18.4463 20.1562 21.415 21.2656L21.8213 21.4219L22.1025 21.0938C23.0713 19.9531 23.8057 18.6719 24.3213 17.2656L24.4775 16.8594L24.1338 16.5781C21.6963 14.5469 18.7588 13.2188 15.665 12.6719C15.5713 11.7812 15.0869 11 14.3994 10.5C15.1494 8.51562 15.54 6.40625 15.54 4.28125C15.54 3.34375 15.4463 2.375 15.2275 1.21875L15.1494 0.796875L14.7275 0.71875C14.0088 0.59375 13.29 0.53125 12.5713 0.53125C11.8838 0.53125 11.165 0.59375 10.4619 0.71875L10.04 0.796875L9.96191 1.21875C9.75879 2.0625 9.58691 3.125 9.58691 4.25C9.58691 6.39062 9.96191 8.5 10.6963 10.5C10.0244 11 9.55566 11.7656 9.44629 12.6562ZM3.64941 19.8594C3.02441 19.0469 2.50879 18.1719 2.13379 17.2188C4.30566 15.5156 6.86816 14.375 9.57129 13.8906C9.71191 14.3438 9.94629 14.75 10.2432 15.0781C8.46191 17.1719 6.19629 18.8281 3.64941 19.8594ZM21.4307 19.9219C18.8682 18.8906 16.6025 17.25 14.8213 15.1562C15.1494 14.8125 15.3994 14.375 15.54 13.9062C18.2432 14.3906 20.8057 15.5312 22.9775 17.2344C22.5869 18.1875 22.0713 19.0938 21.4307 19.9219ZM10.8369 4.25C10.8369 3.40625 10.9463 2.57812 11.0869 1.84375C12.0869 1.71875 13.0713 1.71875 14.0713 1.84375C14.2119 2.73438 14.29 3.5 14.29 4.23438C14.29 6.1875 13.9463 8.10938 13.2588 9.9375C13.0244 9.90625 12.79 9.875 12.5557 9.875C12.3057 9.875 12.0713 9.90625 11.8369 9.96875C11.1807 8.14062 10.8369 6.20312 10.8369 4.25ZM12.5557 11.125C13.5869 11.125 14.4307 11.9688 14.4307 13C14.4307 14.0312 13.5869 14.875 12.5557 14.875C11.5244 14.875 10.6807 14.0312 10.6807 13C10.6807 11.9688 11.5244 11.125 12.5557 11.125Z" fill="#A6C8FA"/>
                                    </svg>                                
                                </div>
                                <div class="box-value" id="fan-speed-value">
                                0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="radio-player-screen">
                    <img class="cover-image" src="${songCover[currentSong]}" width="auto" height="60%" />
                    <div class="radio-right">
                        <span class="song-title">${songTitle[currentSong]}</span>
                        <svg class="song-progress" width="95%" height="50px" viewbox="0 0 100 10">
                            <line class="audio-line" x1="0" y1="5" x2="100" y2="5" stroke="#6D7278" stroke-width="1" />
                            <circle class="audio-progress-circle" cx="${songProgress}" cy="5" r="3" fill="#79C5C0" />
                        </svg>
                        <div class="player-controls">
                            <div class="player-button player-previous">
                                <svg width="35" height="34" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle r="14" cx="15" cy="15" fill="#007BC0"/>
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20.0562 10.7016V18.2984L13.2948 14.5L20.0562 10.7016ZM11.0552 14.9144L21.5557 20.8126V8.18609L11.0552 14.0856V8H9.55566V21H11.0552V14.9144Z" fill="white"/>
                                </svg>
                            
                            </div>
                            <div class="player-button player-play-pause" style="margin-left: 20px;">
                                <svg width="35" height="34" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle r="14" cx="15" cy="15" fill="#007BC0"/>
                                    <path id="pause-icon" style="display: none;" d="M11 21H13.777V8H11V21ZM16.223 8V20.9806H19V8H16.223Z" fill="white"/>
                                    <path id="play-icon" fill-rule="evenodd" clip-rule="evenodd" d="M13.8537 10.6843V18.3157L19.137 14.4993L13.8537 10.6843ZM12.5557 21V8L21.5557 14.4993L12.5557 21Z" fill="white"/>
                                </svg>
                            </div>
                            <div class="player-button player-next" style="margin-left: 20px;">
                                <svg width="35" height="34" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle r="14" cx="15" cy="15" fill="#007BC0"/>
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0552 18.2984V10.7016L16.8165 14.5L10.0552 18.2984ZM19.0562 14.0856L8.55566 8.18741V20.8139L19.0562 14.9157V21H20.5557V8H19.0562V14.0856Z" fill="white"/>
                                </svg>
                            </div>
                            <div class="equalizer" style="width: 100px; margin-left: 30px;">
                                <img class="equalizer-image" style="display: none;" width="100px;" src="https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/ev-power-optimization/assets/equalizer.gif" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="temperature-airflow">
                    <img id="temperature-indicator-image" src="https://edx-digitalauto-plugins.s3.eu-central-1.amazonaws.com/ev-power-optimization/assets/hvac-animation/${temparatureIndicator}.gif" width="100%" />
                </div>
            </div>
            
            `;
        box.injectNode(interiorFrame);

        const previousButton = interiorFrame.querySelector(".player-previous");
        const playPauseButton = interiorFrame.querySelector(".player-play-pause");
        const nextButton = interiorFrame.querySelector(".player-next");
        const equalizerImg = interiorFrame.querySelector(".equalizer-image");

        previousButton.addEventListener("click", () => {
            currentSong = currentSong - 1;
            if (currentSong < 0) {
                currentSong = songCover.length - 1;
            }
            songProgress = 10;
            changedSong = true;
            playSong();
        });

        playPauseButton.addEventListener("click", () => {
            if (isPlaying) {
                isPlaying = false;
                equalizerImg.style.display = "none";
                interiorFrame.querySelector("#pause-icon").style.display = "none";
                interiorFrame.querySelector("#play-icon").style.display = "block";
            } else {
                isPlaying = true;
                interiorFrame.querySelector("#pause-icon").style.display = "block";
                interiorFrame.querySelector("#play-icon").style.display = "none";
                playSong();
            }
        });

        nextButton.addEventListener("click", () => {
            currentSong = currentSong + 1;
            if (currentSong > songCover.length - 1) {
                currentSong = 0;
            }
            songProgress = 10;
            changedSong = true;
            playSong();
        });


        function playSong() {
            interiorFrame.querySelector(".cover-image").src = songCover[currentSong];
            interiorFrame.querySelector(".song-title").innerHTML =
                songTitle[currentSong];
            const interval = setInterval(() => {
                if(changedSong) {
                    changedSong = false;
                    clearInterval(interval);
                }
                if (songProgress < 90 && isPlaying) {
                    songProgress = songProgress + 1;
                    equalizerImg.style.display = "block";
                }
                interiorFrame
                    .querySelector(".audio-progress-circle")
                    .setAttribute("cx", songProgress);
                if (songProgress === 90) {
                    currentSong = currentSong + 1;
                    if (currentSong > songCover.length - 1) {
                        currentSong = 0;
                    }
                    songProgress = 10;
                    clearInterval(interval);
                    playSong();
                }
            }, 1000);
        }
    });

    let batteryFrame = null;
    widgets.register("Battery", (box) => {
        batteryFrame = document.createElement("div");
        batteryFrame.style = "width:100%; height:100%;";
        batteryFrame.innerHTML = `
            <style>
            * {
                box-sizing: border-box;
            }
            body {
                font-family: "Bosch Sans", Arial, sans-serif;
                background-color: #F1F4FA;
                font-weight: bold;
                font-size: 24px;
            }
            .wrapper {
                width: 100%;
                min-height: 100%;
                padding: 25px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-around;
            }
            </style>
            <div class="wrapper">
                <span id="battery-percentage">0 %</span>
                <div class="battery" id="score">
                    <svg width="100" height="200" style="transform: rotateX(180deg)">
                        <rect class="outline" x="25" y="0" rx="2" ry="2" stroke="transparent" stroke-width="3" width="50" height="200" fill="none" />
                        <line class="low" x1="50" y1="0" x2="50" y2="200" stroke="green" stroke-width="50" stroke-dasharray="200,200"/>
                        <line class="medium" x1="50" y1="0" x2="50" y2="200" stroke="yellow" stroke-width="50" stroke-dasharray="120,200"/>
                        <line class="high" x1="50" y1="0" x2="50" y2="200" stroke="red" stroke-width="50" stroke-dasharray="60,200"/>
                        <line class="mask" x1="50" y1="200" x2="50" y2="0" stroke="#D1D4D8" stroke-width="50" stroke-dasharray="200,200" />
                        <line class="needle" x1="0" y1="0" x2="100" y2="0" stroke="rgb(156 163 175)" stroke-width="3" />
                    </svg>
                </div>
                <span>Current Battery SOC</span>
            </div>
            `;
        box.injectNode(batteryFrame);
        box.window.addEventListener("unload", async () => {
            console.log("on widget unload");
            clearInterval(sim_intervalId);

            if (SimulatorStarted) {
                console.log("Stop  simulator");
                await anysisSimulation("stop", policy);
            }
        });

        return async () => {
            if (sim_intervalId !== null) {
                clearInterval(sim_intervalId);
            }
            if (SimulatorStarted) {
                await anysisSimulation("stop", policy);
            }
        };
    });

    let optimizationPotentialFrame = null;
    let estimatedTravelRange = 450.2;
    let distanceToTheNearestChargingStation = 600.12;
    widgets.register("OptimizationPotential", (box) => {
        optimizationPotentialFrame = document.createElement("div");
        optimizationPotentialFrame.style = "width:100%; height:100%;";
        optimizationPotentialFrame.innerHTML = `
            <style>
            * {
                box-sizing: border-box;
            }
            body {
                font-family: "Bosch Sans", Arial, sans-serif;
                background-color: #F1F4FA;    
                color: #FFF;
                font-weight: bold;
            }
            h2 {
                font-size: 20px;
            }
            .wrapper {
                background-color: #296096;
                border-radius: 25px;
                width: 100%;
                min-height: 100%;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-around;
            }
            #optimization-kilometer {
                color: #FF8787;
                font-size: 40px;
            }
            .distance-wrapper {
                width: 100%;
            }
            .distance-details {
                display: grid;
                grid-template-columns: 2fr 1fr;
                grid-gap: 10px;
            }
            .light-blue-text {
                color: #A6C8FA;
            }
            </style>
            <div class="wrapper">
                <h2>Optimization Potential</h2>
                <span id="optimization-kilometer">0 km</span>
                <div class="distance-wrapper">
                <svg width="100%" height="150px" viewbox="0 0 1000 300">
                    <line class="distance-line" x1="0" y1="75" x2="1000" y2="75" stroke="#FFFFFF" stroke-width="10" />
                    <line class="distance-mask-line" x1="150" y1="75" x2="400" y2="75" stroke="#FF8787" stroke-width="10" />
                    <circle class="charging-distance-circle" cx="150" cy="75" r="30" fill="#A6C8FA" />
                    <svg id="charging-station-icon" x="100" y="50" width="105" viewBox="0 0 21 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.6074 0.731445H10.748C9.0293 0.731445 7.62305 2.1377 7.62305 3.85645V21.9814H5.01367C4.38867 21.9814 3.87305 21.4814 3.87305 20.8564V10.6533C4.95117 10.3721 5.74805 9.40332 5.74805 8.23145H5.12305V6.0127H3.87305V8.23145H2.62305V6.0127H1.37305V8.23145H0.748047C0.748047 9.40332 1.54492 10.3721 2.62305 10.6533V20.8564C2.62305 22.1689 3.70117 23.2314 5.01367 23.2314H7.62305V25.7314H20.748V3.87207C20.748 2.1377 19.3418 0.731445 17.6074 0.731445ZM19.498 24.4814H8.87305V3.85645C8.87305 2.8252 9.7168 1.98145 10.748 1.98145H17.6074C18.6543 1.98145 19.498 2.8252 19.498 3.87207V24.4814ZM18.248 9.48145H10.123V3.85645H18.248V9.48145ZM16.998 5.10645H11.373V8.23145H16.998V5.10645ZM16.373 10.7314L11.373 16.3564H14.498L12.623 20.7314L17.623 15.1064H14.498L16.373 10.7314Z" fill="#A6C8FA"/>
                    </svg>
                    <circle class="estimated-travel-range-circle" cx="400" cy="75" r="30" fill="white" />
                    <svg id="car-icon" x="350" y="-150" width="105" viewBox="0 0 26 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M25.4041 8.46204C25.4041 5.55579 23.9822 4.10266 20.5134 3.47766L16.9509 2.88391C16.2791 2.22766 14.2166 0.337036 12.9041 0.337036C9.88843 0.337036 3.70093 2.50891 2.79468 2.83704H2.27905C1.2478 2.83704 0.404053 3.68079 0.404053 4.71204V8.29016L2.32593 8.93079C2.54468 10.087 3.5603 10.962 4.77905 10.962C5.9353 10.962 6.91968 10.1652 7.20093 9.08704H17.9978C18.2791 10.1652 19.2478 10.962 20.4197 10.962C21.5916 10.962 22.5603 10.1652 22.8416 9.08704H25.4041V8.46204ZM4.77905 9.71204C4.09155 9.71204 3.52905 9.14954 3.52905 8.46204C3.52905 7.77454 4.09155 7.21204 4.77905 7.21204C5.46655 7.21204 6.02905 7.77454 6.02905 8.46204C6.02905 9.14954 5.46655 9.71204 4.77905 9.71204ZM20.4041 9.71204C19.7166 9.71204 19.1541 9.14954 19.1541 8.46204C19.1541 7.77454 19.7166 7.21204 20.4041 7.21204C21.0916 7.21204 21.6541 7.77454 21.6541 8.46204C21.6541 9.14954 21.0916 9.71204 20.4041 9.71204ZM22.8259 7.83704C22.5447 6.75891 21.5759 5.96204 20.4041 5.96204C19.2322 5.96204 18.2634 6.75891 17.9822 7.83704H7.20093C6.91968 6.75891 5.95093 5.96204 4.77905 5.96204C3.6853 5.96204 2.76343 6.66516 2.41968 7.64954L1.65405 7.39954V4.71204C1.65405 4.36829 1.9353 4.08704 2.27905 4.08704H3.01343L3.1228 4.05579C3.1853 4.02454 9.91968 1.58704 12.9041 1.58704C13.5134 1.58704 15.0916 2.79016 16.2166 3.89954L16.3572 4.04016L20.2947 4.69641C22.6384 5.11829 23.9197 5.75891 24.1228 7.83704H22.8259Z" fill="white"/>
                    </svg>

                </svg>
                </div>
                <div class="distance-details">
                    <span>Estimated travel range</span>
                    <span id="estimated-travel-range">0 km</span>
                    <span class="light-blue-text">Distance to the nearest charging station</span>
                    <span class="light-blue-text" id="distance-to-nearest-charging-station">0 km</span>
                </div>
            </div>
            `;
        box.injectNode(optimizationPotentialFrame);
    });
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
};
export default plugin;