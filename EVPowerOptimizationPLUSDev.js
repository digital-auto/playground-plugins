import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import StatusTable from "./reusable/StatusTable.js"
import LineChart from "./reusable/LineChart.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js"
import MobileNotifications from "./reusable/MobileNotifications.js"

async function fetchRowsFromSpreadsheet(spreadsheetId, apiKey) {
    // Set the range to A1:Z1000
    const range = "A1:Z1000";

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

let ANSYS_API = "https://evoptimize01.digitalauto.tech/"
let SimulatorStarted = false

const getAnsysStatus = async () => {
    console.log("getAnsysStatus " + `${ANSYS_API}simulations/status`)
    const res = await fetch(`${ANSYS_API}simulations/status`)
    if(!res.ok) throw "Get ansys status failed"
    return await res.json()
}

const callAnsysAction = async (action, policy) => {
    if(!action) throw "Action is required"
    if(!["start","stop","resume"].includes(action)) throw "Action is invalid"
    const res = await fetch(
        `${ANSYS_API}simulations/${action}${policy?'?level_no='+policy:''}`, {
            method:'PUT',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    if(!res.ok) throw "Call start api failed"
    return await res.json()
}


const anysisSimulation = async (call, policy) => {
    try {
        switch(call) {
            case "start":
                await callAnsysAction("start")
                break;
            case "stop":
                await callAnsysAction("stop")
                break;
            case "resume":
                let resumeReturn =  await callAnsysAction("resume", policy)
                return resumeReturn
            default:
                break;
        }
    } catch(err) {
        console.log(err)
    }
    
    // const res = await fetch(
    //     // `https://app.digitalauto.tech/evpoweroptimization`, {
    //     `https://aiotapp.net/evpoweroptimization`, {
    //         method:'POST',
    //         mode: 'cors',
    //         cache: 'no-cache',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             call,
    //             policy
    //         })
    //     });
    // // waits until the request completes...
    // if (!res.ok) {
    //     const message = `An error has occured: ${res.status}`;
    //     throw new Error(message);
    // }
    //conver response to json
    // const response = await res.json()
    
    // return response
}


const plugin = ({widgets, simulator, vehicle}) => {

    const loadSpreadSheet = async () => {
        let sheetID = "1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE";
        fetchRowsFromSpreadsheet(sheetID, PLUGINS_APIKEY)
        .then((rows) => {
            SimulatorPlugins(rows, simulator)
        })
    }

    const updateSimulation = async () => {
        //let mode = await vehicle.PowerOptimizationMode.get();
        let inf_light = await vehicle.Cabin.Lights.LightIntensity.get()
        let temp = await vehicle.Cabin.HVAC.Station.Row1.Left.Temperature.get()
        let fan_speed = await vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed.get()
        let media_volume = await vehicle.Cabin.Infotainment.Media.Volume.get()
        let bat_soc = await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get()
        let trvl_dist = await vehicle.TravelledDistance.get()

        //convert to int
        // media_volume = parseInt(media_volume)
        // Policy 11
        if( inf_light === 100 && temp === 15 && fan_speed === 100 && media_volume === 100) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.03).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 100 <br> Interior Light System: Maximum light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 15<br>Fan speed: 100";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //change "Level1" to desired value say 50
        //Policy 1
        else if(inf_light === 100 && temp === 15 && fan_speed === 100 && media_volume === 70) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.20).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 70 <br> Interior Light System: Maximum light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 15<br>Fan speed: 100";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //change "Level2" to desired value say 20
        //Policy 2
        else if(inf_light === 100 && temp === 15 && fan_speed === 100 && media_volume === 40) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.23).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 40 <br> Interior Light System: Maximum light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 15<br>Fan speed: 100";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //Policy 3
        else if(inf_light === 100 && temp === 15 && fan_speed === 100 && media_volume === 10) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.26).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 10 <br> Interior Light System: Maximum light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 15<br>Fan speed: 100";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //Policy 4
        else if(inf_light === 70 && temp === 15 && fan_speed === 100 && media_volume === 10) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.26).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 10 <br> Interior Light System: Medium light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 15<br>Fan speed: 100";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //Policy 5
        else if(inf_light === 40 && temp === 15 && fan_speed === 100 && media_volume === 10) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.27).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 10 <br> Interior Light System: Weak light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 15<br>Fan speed: 100";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //Policy 6
        else if(inf_light === 40 && temp === 18 && fan_speed === 100 && media_volume === 10) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.31).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 10 <br> Interior Light System: Weak light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 18<br>Fan speed: 100";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //Policy 7
        else if(inf_light === 40 && temp === 20 && fan_speed === 70 && media_volume === 10) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*4.52).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 10 <br> Interior Light System: Weak light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 20<br>Fan speed: 70";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        //Policy 8 & 9 & 10
        else if(inf_light === 40 && temp === 20 && fan_speed === 40 && media_volume === 10) {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = `Estimated travel range: ${(bat_soc*5.50).toFixed(2)} km <br> Distance to the nearest charging station: ${(450 - trvl_dist).toFixed(2)} km <br> Media volume: 10 <br> Interior Light System: Weak light`;
            HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: 20<br>Fan speed: 40";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }

        //else {
            //IVIAnimationFrame.querySelector("#mainText").innerHTML = "Power Optimization Mode ：Level 3 (IVI  & HVAC & Light)<br>IVI System ：OFF<br>Interior Light System Weak Light";
           // HVACAnimationFrame.querySelector("#show").innerHTML = "HVAC degradation system state: 1";
           // HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368");
            //IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fstart.png?alt=media&token=9d7cc00f-d95e-4351-9d96-a22b4d65eced")
            //IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "paused";
            //IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "paused";
        //}
    }

    const roundNumber = (num) => {
        if(!num) return 0
        return Math.round(num*100)/100
    }

    const updateSignals = async(signals) => {
        if(!signals) return

        simulator("Vehicle.TravelledDistance", "get", async () => {
            return roundNumber(signals["Distance"])
        })
        simulator("Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "get", async () => {
            return roundNumber(signals["SOC"])
        })
        simulator("Vehicle.Speed", "get", async () => {
            return roundNumber(signals["Speed_kmph"])
        })
        // simulator("Vehicle.Acceleration.Longitudinal", "get", async () => {
        //     return roundNumber(signals["Acceleration_Limit"])
        // })
        simulator("Vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed", "get", async () => {
            return roundNumber(signals["Fan_Speed"])
        })
        simulator("Vehicle.Cabin.Lights.LightIntensity", "get", async () => {
            return roundNumber(signals["Interior_Lighting"])
        })
        simulator("Vehicle.Cabin.Sunroof.Position", "get", async () => {
            return roundNumber(signals["Sunroof"])
        })
        simulator("Vehicle.Cabin.HVAC.Station.Row1.Left.Temperature", "get", async () => {
            // const signalValue = signals["Temperature"];
            // const result = 45 - signalValue;
            // return roundNumber(result);
            return roundNumber(signals["Temperature"]);
        })
        simulator("Vehicle.Cabin.Infotainment.Media.Volume", "get", async () => {
            return roundNumber(signals["Volume"])
        })


        // update the values related to the bar here, what vss api value you want the bar for
        // const score = await vehicle.Passenger.KinetosisScore.get()
        // const score = "20"
        const score = await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get()
        scoreFrame.querySelector("#score .text").textContent = parseFloat(score).toFixed(2) + "%"
		scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(score) * 2)) + "," + 200);
		scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(score) * 2)}`)
		scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(score) * 2)}`)
        //message you want to write with the bar
        scoreFrame.querySelector("#score #message").textContent = "Current Battery SOC"
    }

    let sim_intervalId = null;
    const start_sim = async (time) => {
        let res  = await getAnsysStatus()
        if(res && res.Status === "IDLE") {
            alert("Simulator is busy, try again later!")
            return false
        }

        await anysisSimulation('start', policy)
        SimulatorStarted = true
        sim_intervalId = setInterval(async () => {
            const res = await anysisSimulation('resume', policy)
            updateSignals(res)
            updateSimulation()

            await vehicle.Next.get()
            // sim_function()
        }, time)
        return true
    }

    const stop_sim = async () => {
        clearInterval(sim_intervalId)
        await anysisSimulation('stop', policy)
    }

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
    const PROVIDER_ID = "client123";

    widgets.register("Client", async (box) => {
        await loadScript(box.window, `https://cdn.socket.io/4.6.0/socket.io.min.js`);
        
        const container = document.createElement("div");
        container.setAttribute("style", `display:block; ;overflow:auto;padding: 20px;`);
        container.innerHTML = `
            <div style='margin-top: 10px;'>
            <input type='text' id='inputValue' placeholder='Value' />
            <div style='display:inline-block;font-weight: 700;padding: 8px 12px;background-color:#ABABAB;cursor:pointer;border-radius:4px;' id='btnSendValue'> Send Value</div>
        </div>
    `;

        const socket = io("https://bridge.digitalauto.tech");

        socket.on("connect", () => {
            console.log("Connected to the bridge server.");
            socket.emit("register_client", {
                master_provider_id: PROVIDER_ID
            });
        });

        const btnSendValue = container.querySelector("#btnSendValue");
        const inputValue = container.querySelector("#inputValue");

        btnSendValue.addEventListener("click", () => {
            const valueToSend = inputValue.value;
            if(valueToSend.trim() !== "") {
                console.log("Sending value to the server:", valueToSend);
                socket.emit("test_message", { 
                    to_provider_id: PROVIDER_ID,
                    msg: valueToSend
                });
            } else {
                console.log("Please input a value before sending.");
            }
        });

        socket.on("response", (data) => {
            console.log("Received response:", data.msg);
        });

        box.injectNode(container);
    });

	return {
		start_simulation : start_sim,
        stop_simulation : stop_sim,
        load_signals : loadSpreadSheet,
        update_simulation: updateSimulation,
        notifyPhone: (message) => {
            if (mobileNotifications !== null) {
                mobileNotifications(message)
            }
        },
	}  
}

export default plugin;
