import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import StatusTable from "./reusable/StatusTable.js"
import LineChart from "./reusable/LineChart.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js"
import MobileNotifications from "./reusable/MobileNotifications.js"



async function fetchRowsFromSpreadsheet(spreadsheetId, apiKey) {
    /*window.onbeforeunload = function(){
  return 'Are you sure you want to leave?';
};
*/
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

let ANSYS_API = "https://proxy.digitalauto.tech/evtwin_dev/"

let SimulatorStarted = false

const getAnsysStatus = async () => {
    console.log("getAnsysStatus " + `${ANSYS_API}simulations/status`)
    const res = await fetch(`${ANSYS_API}simulations/status`)
    if (!res.ok) throw "Get ansys status failed"
    return await res.json()
}

const callAnsysAction = async (action, policy) => {
    if (!action) throw "Action is required"
    if (!["start", "stop", "resume"].includes(action)) throw "Action is invalid"
    const res = await fetch(
        `${ANSYS_API}simulations/${action}${policy ? '?level_no=' + policy : ''}`, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) throw "Call start api failed"
    return await res.json()
}


const anysisSimulation = async (call, policy) => {
    try {
        switch (call) {
            case "start":
                await callAnsysAction("start")
                break;
            case "stop":
                await callAnsysAction("stop")
                break;
            case "resume":
                let resumeReturn = await callAnsysAction("resume", policy)
                return resumeReturn
            default:
                break;
        }
    } catch (err) {
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

const PROVIDER_ID = "dev-CLIENT-SAMPLE"

const plugin = ({ widgets, simulator, vehicle }) => {

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
     
 
    }

    const roundNumber = (num) => {
        if (!num) return 0
        return Math.round(num * 100) / 100
    }

   

    let sim_intervalId = null;
    const start_sim = async (time) => {
        let res = await getAnsysStatus()
        if (res && res.Status === "IDLE") {
            alert("Simulator is busy, try again later!")
            return false
        }

        await anysisSimulation('start', policy)
        SimulatorStarted = true
        sim_intervalId = setInterval(async () => {
            const res = await anysisSimulation('resume', policy)
           
            //updateSimulation()

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

    widgets.register("Client", async (box) => {
        await loadScript(box.window, `https://cdn.socket.io/4.6.0/socket.io.min.js`)
        const socket = box.window.io("https://bridge.digitalauto.tech");

        const container = document.createElement("div");
        container.setAttribute("style", `display:block; ;overflow:auto;padding: 20px;`);

        container.innerHTML = `
            <div style='margin-top: 10px;font-size:20px;'>
                <div style='display:inline-block;font-weight: 700' id='lblResult'></div>
            </div>
            `
        let lblResult = container.querySelector("#lblResult");
        const onProviderReply = (payload) => {
            lblResult.innerText = payload.result;
        }


        const onConnected = () => {
            //mobileNotifications("Io connected")
            socket.emit("register_client", {
                master_provider_id: PROVIDER_ID
            })
        }


        const messageFromProvider = async (payload) => {

            let inf_light = await vehicle.Cabin.Lights.LightIntensity.get()
            let temp = await vehicle.Cabin.HVAC.Station.Row1.Left.Temperature.get()
            let fan_speed = await vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed.get()
            let media_volume = await vehicle.Cabin.Infotainment.Media.Volume.get()
            let bat_soc = await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get()
            let trvl_dist = await vehicle.TravelledDistance.get()

            console.log('message_from_provider', payload)
            if (payload.cmd == 'showTest') {
                lblSpeed.innerText = payload.data
            }

            else if (payload.cmd == ('vehicle.Cabin.Lights.LightIntensity').toLowerCase()) {
                if (JSON.stringify(inf_light).length > 0)
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + "= " + inf_light
                    })
                else
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + " is Null"
                    })


            }
            else if (payload.cmd == ('vehicle.Cabin.HVAC.Station.Row1.Left.Temperature').toLowerCase()) {
                if (JSON.stringify(temp).length > 0)
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + "= " + temp
                    })
                else
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + " is Null"
                    })

            }
            else if (payload.cmd == ('vehicle.Cabin.Infotainment.Media.Volume').toLowerCase()) {
                if (JSON.stringify(media_volume).length > 0)
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + "= " + media_volume
                    })
                else
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + " is Null"
                    })


            }
            else if (payload.cmd == ('vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed').toLowerCase()) {
                if (JSON.stringify(fan_speed).length > 0)
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + "= " + fan_speed
                    })
                else
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + " is Null"
                    })

            }
            else if (payload.cmd == ('vehicle.Powertrain.TractionBattery.StateOfCharge.Current').toLowerCase()) {
                if (JSON.stringify(bat_soc).length > 0)
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + "= " + bat_soc
                    })
                else
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + " is Null"
                    })

            }
            else if (payload.cmd == ('vehicle.travelleddistance').toLowerCase()) {
                if (JSON.stringify(trvl_dist).length > 0)
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + "= " + trvl_dist
                    })
                else
                    socket.emit("request_provider", {
                        to_provider_id: PROVIDER_ID,
                        cmd: "result_from_vehicul",
                        data: payload.cmd + " is Null"
                    })

            }

        }

        socket.on("connect", onConnected);
        socket.on('message_from_provider', messageFromProvider)
        socket.on('provider_reply', onProviderReply)

        box.injectNode(container);
    })

    widgets.register("Table", 
        StatusTable({
            // apis: ["Vehicle.TravelledDistance", "Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "Vehicle.Speed", "Vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed", "Vehicle.Cabin.Lights.LightIntensity", "Vehicle.Cabin.Sunroof.Position", "Vehicle.Cabin.HVAC.Station.Row1.Left.Temperature", "Vehicle.Cabin.Infotainment.Media.Volume", "Vehicle.PowerOptimizeLevel", "Vehicle.Cabin.Infotainment.HMI.Brightness", "Vehicle.Cabin.Infotainment.HMI.DisplayOffTime", "Vehicle.Cabin.Infotainment.HMI.IsScreenAlwaysOn", "Vehicle.Cabin.Infotainment.HMI.LastActionTime", "Vehicle.Cabin.Infotainment.Media.Volume"],
	        apis: ["Vehicle.Powertrain.TractionBattery.StateOfCharge.Current","vehicle.IsMoving", "vehicle.Powertrain.CombustionEngine.IsRunning", "vehicle.Cabin.Door.Row1.Left.IsOpen"],
            vehicle: vehicle,
            refresh: 800
        })
    )

    widgets.register(
        "GoogleMapDirections",
        GoogleMapsFromSignal(
            [
                {
                    "lat": 50.96731,
                    "lng": 9.47941
                },
                {
                    "lat": 52.34655,
                    "lng": 9.79768
                },
            ],
            vehicle,
            { iterate: false }
        )
    )

    widgets.register("SOCLineCharts", LineChart(
        [
            {
                signal: "Vehicle.TravelledDistance",
                suffix: " C",
                color: "Black"
            },
        ],
        vehicle
    )
    )
    // let sim_function;
    // simulator("Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "subscribe", async ({func, args}) => {
    // 	sim_function = args[0]
    // })


    let mobileNotifications = null;
    widgets.register("Mobile", (box) => {
        ({ printNotification: mobileNotifications } = MobileNotifications({
            apis: null,
            vehicle: null,
            box: box,
            refresh: null,
            paddingTop: 70,
            paddingHorizontal: 25
        }))
    });


    let HVACAnimationFrame = null;
    widgets.register("HVAC Animation", (box) => {

        HVACAnimationFrame = document.createElement("div")
        HVACAnimationFrame.innerHTML =
            `
		<style>
        .main-class {
            width: 100%;
            height:100%
        }
        .wind {
            position: absolute;
            width: 100%;
            left: 0%;
        }
        .show {
            background-color: #3c5c7b;
            position: absolute;
            top: 45%;
            left: 31%;
            width: 40%;
            height: 15%;
            font-size: 14px;
            color: #e9e9e9;
            text-align: center;
            display:flex;
            flex-direction:column;
            justify-content: center;
        }
		</style>
        <img class="main-class" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fmain.png?alt=media&token=e4ec1915-de42-4226-8eeb-a74ab4d5f9e7">
        <img id="wind" class="wind" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368">
        <div id="show" class="show"></div>
		`

        function btnClick() {
            let wind = HVACAnimationFrame.querySelector("#wind");
            console.log(wind.getAttribute("src"));
            if (wind.getAttribute("src") == "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368") {
                wind.setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088");
                return;
            }
            if (wind.getAttribute("src") == "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fblue%20air.gif?alt=media&token=6a00f612-649e-4587-9b46-0be192588088") {
                wind.setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368");
                return;
            }

        }

        HVACAnimationFrame.querySelector("#show").innerHTML = "Current air conditioner temperature: <br>Fan speed: ";

        box.injectNode(HVACAnimationFrame)

        return () => {
            if (sim_intervalId !== null) {
                clearInterval(sim_intervalId)
            }
        }
    });

    let IVIAnimationFrame = null;
    widgets.register("IVI Animation", (box) => {
        IVIAnimationFrame = document.createElement("div")
        IVIAnimationFrame.style = "max-wisth:fit-content"
        IVIAnimationFrame.innerHTML =
            `
		<style>
        .model-img{
            left: 10%;
            position: absolute;
            width: 3%;
        }
        .main-img{
            width: 100%;
            height: 100%;
            margin-top: 2%;
            margin-left: 2%;
            margin-right: 2%;
        }
        .main-div {
            position: absolute;
            top: 15%;
            left: 20%;
            width: 60%;
            height: 70%;
            background-color: white;
        }
    
        .main-text {
            padding: 10px;
            font-size: 22px;
            font-weight: 600;
            height: 86%;
        }
    
        .song-div {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin:0% 10% 0% 10%;
            font-size: 17px;
            font-weight: 600;
            overflow: hidden;
        }
    
        .song-name {
            position: relative;
            white-space: nowrap;
            width:fit-content;
            animation-name:nameMove, nameMove2;
            animation-duration:4s, 10s;
            animation-timing-function:linear, linear;
            animation-iteration-count:1, infinite;
            animation-delay:1ms, 4s;
            animation-play-state:paused;
    
            -webkit-animation-animation-name:nameMove, nameMove2;
            -webkit-animation-animation-duration:4s, 10s;
            -webkit-animation-animation-timing-function:linear, linear;
            -webkit-animation-animation-iteration-count:1, infinite;
            -webkit-animation-animation-delay:1ms, 4s;
            -webkit-animation-animation-play-state:paused;
        }
    
        .model-img {
            animation-name:modelMove;
            animation-duration:180s;
            animation-timing-function:linear;
            animation-iteration-count:infinite;
            animation-play-state:paused;
    
            -webkit-animation-animation-name:modelMove;
            -webkit-animation-animation-duration:180s;
            -webkit-animation-animation-timing-function:linear;
            -webkit-animation-animation-iteration-count:infinite;
            -webkit-animation-animation-play-state:paused;
    
        }
    
        .process-div{
            text-align: center;
            margin-top: 8px;
            margin-bottom: -3px;
        }
        .process-img{
            width: 80%;
        }
        .btn-div{
            text-align: center;
        }
    
        #btnImg{
            cursor: pointer;
            width: 15%;
        }
    
        .btn-img{
            width: 10%;
        }
    
        @keyframes modelMove {
            0% {
                transform: translateX(0px)
            }
    
            100%{
                transform: translateX(277px)
            }
        }
    
        @keyframes nameMove {
            0% {
                transform: translateX(0px)
            }
    
            100%{
                transform: translateX(calc(50% + 138px))
            }
    
        }
    
        @-webkit-keyframes nameMove {
            0% {
                transform: translateX(0px)
            }
    
            100%{
                transform: translateX(calc(50% + 138px))
            }
    
        }
        @keyframes nameMove2 {
            0% {
                transform: translateX(calc(-50% - 138px))
            }
    
            100%{
                transform: translateX(calc(50% + 138px))
            }
    
        }
    
        @-webkit-keyframes nameMove2 {
            0% {
                transform: translateX(calc(-50% - 138px))
            }
    
            100%{
                transform: translateX(calc(50% + 138px))
            }
    
        }
        </style>
        <img class="main-img" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fmain.png?alt=media&token=02815bf3-b9c4-4e7d-8fb1-c02be00fd0a0">
        <div class="main-div">
            <div id="mainText" class="main-text">
            </div>
            <div class="song-div" style='display:none;'>
                <div id="songName" style="animation-play-state:paused;" class="song-name">
                    
                </div>
            </div>
            <div class="process-div" style='display:none;'>
                <div>
                    <img class="process-img" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fprocess.png?alt=media&token=d23481f5-b188-4bb2-8e21-d0be44a13496">
                    <img id="modelImg" class="model-img" style="animation-play-state:paused" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fmodel.png?alt=media&token=e855b64a-fcb9-4752-8434-31b4b46a7529">
                </div>
            </div>
            <div class="btn-div" style='display:none;'>
                <img align="middle" class="btn-img" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fhearts.png?alt=media&token=76b9cf8c-c056-428d-b4e1-fc123022ed0e">
                <img align="middle" class="btn-img" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Flast.png?alt=media&token=e7f2e83d-44cf-4375-b367-77b3087f401f">
                <img align="middle" id="btnImg" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fstart.png?alt=media&token=9d7cc00f-d95e-4351-9d96-a22b4d65eced">
                <img align="middle" class="btn-img" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fend.png?alt=media&token=fb6dc01d-b626-419f-b218-d164c065562d">
                <img align="middle" class="btn-img" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fmenu.png?alt=media&token=6310dad1-92fc-4cbf-856a-620317d0135b">
            </div>
        </div>
        `

        IVIAnimationFrame.querySelector("#btnImg").onclick = () => {
            const btnImg = IVIAnimationFrame.querySelector("#btnImg");
            const songName = IVIAnimationFrame.querySelector("#songName");
            const model = IVIAnimationFrame.querySelector("#modelImg");
            const status = songName.style.animationPlayState;
            if (status == "paused") {
                songName.style.animationPlayState = "running"
                model.style.animationPlayState = "running"
                btnImg.setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            }
            else {
                songName.style.animationPlayState = "paused"
                model.style.animationPlayState = "paused"
                btnImg.setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fstart.png?alt=media&token=9d7cc00f-d95e-4351-9d96-a22b4d65eced")
            }
        }

        IVIAnimationFrame.querySelector("#songName").innerText = "Shape of You一Ed Sheeran";
        IVIAnimationFrame.querySelector("#mainText").innerHTML = "Estimated travel range: <br> Distance to the nearest charging station: <br> Media volume: <br> Interior Light System:";

        box.injectNode(IVIAnimationFrame)

        return () => {
            if (sim_intervalId !== null) {
                clearInterval(sim_intervalId)
            }
        }
    });

    widgets.register("Control Frame", (box) => {
        let controlFrame = document.createElement("div")
        controlFrame.style = "height:100%;display:flex;flex-direction:column;justify-content:space-evenly;align-items:center"
        controlFrame.innerHTML =
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
        <!-- <div class="mode-select" style="display:flex;flex-direction:row;justify-content:space-evenly;align-items:center">
            <button id="optimized" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Optimized
            </button>
            <button id="non-optimized" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Non-Optimized
            </button>
        </div> -->
        <div class="simulation-start">
            <button id="start" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Start
            </button>
        </div>
        `
        let sheetID = "1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE";
  

        let start = controlFrame.querySelector("#start")
        start.onclick = () => {
            fetchRowsFromSpreadsheet(sheetID, PLUGINS_APIKEY)
                .then((rows) => {
                    SimulatorPlugins(rows, simulator)
                })

            start.style.backgroundColor = "rgb(104 130 158)";
            start_sim(800)

        }

        box.injectNode(controlFrame)

        return () => {
            if (sim_intervalId !== null) {
                clearInterval(sim_intervalId)
            }
        }
    })

    let PolicyFrame = null;
    let policy = 11;

    widgets.register("Policy Selection", async (box) => {
        PolicyFrame = document.createElement("div")
        PolicyFrame.style = "width:100%;height:100%;display:grid;align-content:center;justify-content:center;align-items:center"
        PolicyFrame.innerHTML = `
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
        <div style="display:flex;flex-wrap:wrap;flex-direction:column;align-content:space-around;jusstify-content:space-around">
            <div style="width:100%;display: flex;align-items: center;justify-content: center;cursor: pointer;margin-bottom:4px;" id="video">
                <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fvideo.svg?alt=media&token=93f6bed8-10c8-43f5-ba09-44bde5bb1797" alt="video" style="width: 48px;filter: invert(100%);">
            </div>
            <div class="btn-group" style="margin:5px;">
           
            
            <button id="pol1" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
            Policy 1
            </button>
                <button id="pol2" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 2
                </button>
                <button id="pol3" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 3
                </button>
                <button id="pol4" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 4
                </button>
                <button id="pol5" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 5
                </button>
                <button id="pol6" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 6
                </button>
                <button id="pol7" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 7
                </button>
                <button id="pol8" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 8
                </button>
                <button id="pol9" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 9
                </button>
                <button id="pol10" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 10
                </button>
                <button id="pol11" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                No Policy
                </button>
                <button id="pol12" class="pol" style="width:130px;max-width:130px;background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:1px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Auto
                </button>
               
            </div>
        </div>
		`
        await loadScript(box.window, `https://cdn.socket.io/4.6.0/socket.io.min.js`)
        const socket = box.window.io("https://bridge.digitalauto.tech");

        //Get values
        const requestDataFromAnsys = async () => {
            console.log(`requestDataFromAnsys`)
            //let mode = await vehicle.PowerOptimizationMode.get();
            let inf_light = await vehicle.Cabin.Lights.LightIntensity.get()
            let temp = await vehicle.Cabin.HVAC.Station.Row1.Left.Temperature.get()
            let fan_speed = await vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed.get()
            let media_volume = await vehicle.Cabin.Infotainment.Media.Volume.get()
            let bat_soc = await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get()
            let trvl_dist = await vehicle.TravelledDistance.get()
            socket.emit("request_provider", {
                to_provider_id: PROVIDER_ID,
                cmd: "set_data",
                data: policy,
                vss: [trvl_dist, bat_soc, fan_speed, inf_light, temp, media_volume]
            })
        }
        const set_policy = async () => {
            socket.emit("request_provider", {
                to_provider_id: PROVIDER_ID,
                cmd: "set_policy",
                data: policy,
            })
        }

        const PROVIDER_ID = "JAVASCRIPT-CLIENT-SAMPLE"
        const PROVIDER_ID_MOBIS = "Mobis-SAMPLE"
        socket.on("connect", () => {
            console.log("Io connected from Policy")
            socket.emit("register_client", {
                master_provider_id: PROVIDER_ID
            })
            socket.emit("register_provider", {
                provider_id: PROVIDER_ID_MOBIS,
                name: "Listen to ansys",
            });
        })

        socket.on("new_request", (data) => {
            console.log("on new_request from ansys");
            console.log(data)

            if (!data || !data.cmd || !data.request_from) return
            switch (data.cmd) {
                case "set_policy":
                    policy = Number(data.data)
                    break;
                default:
                    break;
            }

        })

        let pol = PolicyFrame.querySelectorAll(".pol")
        for (let i = 1; i < 13; i++) {
            pol[i-1].onclick = () => {
                console.log(`Pol ${i} clicked!`)
                policy = i
                let id = "#pol" + policy
                PolicyFrame.querySelector(id).style.backgroundColor = "rgb(104 130 158)"
                for (let j = 1; j < 13; j++) {
                    if (i !== j) {
                        id = "#pol" + j
                        PolicyFrame.querySelector(id).style.backgroundColor = "rgb(157 176 184)"
                    }
                }
                set_policy()
            };
            

        }

        const renderActivePolicy = () => {
            let policies =  PolicyFrame.querySelectorAll(".pol")
            console.log(`policy ${policy} policies`, policies)
            if(policies) {
                policies.forEach((pol) => {
                    if(pol.id == 'pol'+policy) {
                        pol.style.backgroundColor = "rgb(104 130 158)"
                    } else {
                        pol.style.backgroundColor = "rgb(157 176 184)"
                    }
                })
            }
        }
        
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function delayedGreeting() {
            while (1) {
                await requestDataFromAnsys()
                await sleep(1000);
                renderActivePolicy()
                console.log("sleep");
            }
        }

        delayedGreeting()

        socket.on("request_provider", (data) => {
            alert("Test");
            alert(data);
        });


        let video = PolicyFrame.querySelector("#video")
        video.onclick = () => {
            const videoURL = "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fpower_optimization%2FEV_Power_Optimisation.mp4?alt=media&token=6e441fbf-14e9-4567-bdf5-62f4df264a46"
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

        
        // Function to handle window close event
        const handleWindowClose = async (e) => {
            e.preventDefault();
            e.returnValue = ''; // This is required for older browsers

            // Show an alert when the user tries to close the window
            const confirmationMessage = 'Are you sure you want to leave this page? Your unsaved changes may be lost.';
            e.returnValue = confirmationMessage;
            if (e.returnValue != '') {
                clearInterval(sim_intervalId);
                await anysisSimulation('stop', policy);
            }
            return confirmationMessage;
        };

        // Attach the window close event handler
        window.addEventListener('beforeunload', handleWindowClose);

        // Function to remove the window close event handler
        const removeWindowCloseHandler = () => {
            window.removeEventListener('beforeunload', handleWindowClose);
        };

        // Example of when to remove the event handler (you can call this when needed)
        const stopAlertOnWindowClose = () => {
            removeWindowCloseHandler();
        };

        // Example of when to start showing the alert on window close (you can call this when needed)
        const startAlertOnWindowClose = () => {
            window.addEventListener('beforeunload', handleWindowClose);
        };

        box.injectNode(PolicyFrame)


    })

    let scoreFrame = null;
    widgets.register("Score Bar", (box) => {
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
				<line class="low" x1="50" y1="0" x2="50" y2="200" stroke="green" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="medium" x1="50" y1="0" x2="50" y2="200" stroke="yellow" stroke-width="50" stroke-dasharray="120,200"/>
				<line class="high" x1="50" y1="0" x2="50" y2="200" stroke="red" stroke-width="50" stroke-dasharray="60,200"/>
				<line class="mask" x1="50" y1="200" x2="50" y2="0" stroke="white" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="needle" x1="0" y1="0" x2="100" y2="0" stroke="rgb(156 163 175)" stroke-width="3" />
			</svg>
			<div id="message">Current battery SOC</div>
		</div>
		`

        box.injectNode(scoreFrame)

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

    
    //Landing IA
    let container = null
    let resultImgDiv = null
    let resultRecDiv = null
    let resultImgDivBox = null
    let resultRecDivBox = null
    let ResultOfDriver = null
    let BoxChecked = null
    let Driver = null

    let landingAiLogo = `https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FLanding_AI_Logo_RGB_600.png?alt=media&token=9f6e445d-cf6d-4556-9240-4645a804b240`

    let imgWidth = 0;
    let imgHeight = 0;

    widgets.register("Result", (box) => {
         const container = document.createElement('div');
        container.innerHTML = `
            <div style="width:100%;height:50%; position: relative; display: inline-block; vertical-align: top;">
                <div id="resultRec" 
                    style="position:absolute;border: 4px solid #AAFF00; top: 0; left: 0; width: 0; height: 0; z-index: 2;">
                </div>
                 <div id="resultRecBox" 
                    style="position:absolute;border: 2px solid #FF5F1F; top: 0; left: 0; width: 0; height: 0; z-index: 2;">
                </div>
                <img id="resultImg" 
                    style="display:none;position:absolute;top:0%;left:0%;width:100%;height:100%; z-index: 1;"
                    src=""/> 
                  <img id="logoImg" 
                    style="position:absolute;top:5%;right:5%;width:30%;padding:6px; z-index: 3;object-fit:contain;background:white;"
                    src="${landingAiLogo}"/> 
            </div>
              <div style="height: 50%; width: 50%;">
              <div style="max-width: fit-content; margin: 0 auto; position: relative;">
    <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FDashboardPhone.png?alt=media&token=d361018a-b4b3-42c0-8ef0-16c9e70fd9c7" style="height: 100%; width: 100%; object-fit: contain;">
     <div id="ResultDiv" style="position: absolute; color: white; font-family: 'Lato'; width: 100%; top: 0; height: 100%; box-sizing: border-box; padding-top: 25px; padding-right: 12px; padding-left: 12px; padding-bottom: 25px; white-space: break-spaces;" >
            <h5 id="Driver" style="color:#7CFC00"></h5>
            <h5 id="BoxChecked" style="color:#F08000"></h5>
      </div>
    </div>
    </div>
                      
        `;
        resultImgDiv = container.querySelector("#resultImg");
        resultRecDiv = container.querySelector("#resultRec");
        resultRecDivBox = container.querySelector("#resultRecBox");
        ResultOfDriver = container.querySelector("#ResultDiv");
        Driver = container.querySelector("#Driver");
        BoxChecked  = container.querySelector("#BoxChecked");
        //updateNotification("test")
 
        box.injectNode(container);

    });


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
        `
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

        function convertImageToInput() {
            // Get the image element
            const image = img_output;
          
            // Create a canvas element to draw the image
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
          
            // Convert canvas content to a Blob
            canvas.toBlob(blob => {
              // Create FormData and append the Blob as a file
              const formData = new FormData();
              formData.append('file', blob, 'image.jpg');
          
              // Use the FormData object for further processing (e.g., send it in a form or via AJAX)
              // In this example, we'll log the FormData object to the console
              file=formData;
            }, 'image/jpeg');
          }
          

        const imageUpload_authentication = async (image) => {
            if(!file) return
            const data = new FormData()
            data.append('file', file)
            const res = await fetch(
                `https://predict.app.landing.ai/inference/v1/predict?endpoint_id=e51fd3d7-c376-4fc3-b541-8df5a3fcfcb5`, {
                    method:'POST',
                    mode: 'cors',
                    headers: {
                        'apikey':'land_sk_vmrD4HgmLpTXtn7EC2HwllxUv0AFjWGwgc7t3ejqEh11tRr5Ic'
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
        
        const imageUpload_Box = async (image) => {
            
            if(!file) return
            const data = new FormData()
            data.append('file', file)
            const res = await fetch(
                `https://predict.app.landing.ai/inference/v1/predict?endpoint_id=7a970de6-61a5-4367-8c15-0dd639979210`, {
                    method:'POST',
                    mode: 'cors',
                    headers: {
                        'apikey':'land_sk_vmrD4HgmLpTXtn7EC2HwllxUv0AFjWGwgc7t3ejqEh11tRr5Ic'
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

        function NameOfDriver(name){
        console.log(name);
       
        console.log(ResultOfDriver);  // This should log the div element, not null
        console.log(Driver);  // This should log the h1 element, not null
         Driver.style.color="#7CFC00"

        Driver.innerHTML="&#9745; The driver has been identified: "+name;
        ResultOfDriver.style.display = "block";
        }

        async function CheckOfBox(box){
        if (box)
        BoxChecked.innerHTML="&#9745; Box detected";
   
        }

        async function DetectBox(){

           let resultImgDivBox=true;
           const resDataBox = await imageUpload_Box(imageEncoded)
          
          
            if(resDataBox) {
                BoxChecked.innerHTML="&#9747; No box detected";
                if(resDataBox.backbonepredictions) {
                    for(let key in resDataBox.backbonepredictions) {
                        let coordinates = resDataBox.backbonepredictions[key].coordinates
                        if(resultImgDivBox) {
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

                            resultRecDivBox.style.left = `${imgWidthDiv * leftPercent}px`
                            resultRecDivBox.style.top = `${imgHeightDiv * topPercent}px`

                            resultRecDivBox.style.width = `${imgWidthDiv * widthPercent}px`
                            resultRecDivBox.style.height = `${imgHeightDiv * heightPercent}px`
                                        
                            let labelName=resDataBox.backbonepredictions[key].labelName
                            if(labelName){
                                CheckOfBox(labelName)
                            } 
                          
                        }
                        
                        break;
                    }
                }
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
        convertImageToInput();
        



        resultRecDiv.style.left=`0px`;
        resultRecDiv.style.top=`0px`;
        resultRecDiv.style.width=`0px`;
        resultRecDiv.style.height=`0px`;
        resultRecDivBox.style.left=`0px`;
        resultRecDivBox.style.top=`0px`;
        resultRecDivBox.style.width=`0px`;
        resultRecDivBox.style.height=`0px`;
        Driver.innerHTML="";
        BoxChecked.innerHTML="";
        await vehicle.Cabin.Door.Row1.Left.IsOpen.set(false);
        if (resultImgDiv.src!='' && vehicle.Cabin.Door.Row1.Left.IsOpen.get())
        car3DViewer.contentWindow.postMessage(JSON.stringify({'cmd': 'close_driver_door'}), "*")
       
        //car3DViewer.contentWindow.postMessage(JSON.stringify({'cmd': 'close_driver_door'}), "*")
             resultImgDiv.src = "";
            resultImgDiv.style.display='none'
            //resultRecDiv.style.display='none'
            const resData = await imageUpload_authentication(imageEncoded)
            if(resultImgDiv) {
                resultImgDiv.src = imageEncoded;
                resultImgDiv.style.display='block'
                Driver.style.color="red"
                Driver.innerHTML="&#9747; Driver not detected";

            }
            
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

                            let labelName=resData.backbonepredictions[key].labelName
                            if(labelName){
                                NameOfDriver(labelName)
                                await vehicle.Cabin.Door.Row1.Left.IsOpen.set(true);
                                car3DViewer.contentWindow.postMessage(JSON.stringify({'cmd': 'open_driver_door'}), "*");
                                car3DViewer.contentWindow.postMessage(JSON.stringify({'cmd': 'expand_seats'}), "*")
                                DetectBox()    
                            }   
                        }
                        break;
                    }
                }
            }
        }
        box.injectNode(container)
        return () => { }
    });


    //3D Model
      // register the widget
    let simulatorFrame = null;
    let car3DViewer = null
    
    widgets.register("Viewer", (box) => {
        setInterval();
        simulatorFrame = document.createElement("div")
        simulatorFrame.style = "width:100%;height:100%"
        simulatorFrame.innerHTML =
            `<iframe id="car3DViewer" src="https://nhanluongbgsv.github.io/car_simulator/bmw_m4.html" frameborder="0" style="width:100%;height:100%"></iframe>`
        car3DViewer = simulatorFrame.querySelector("#car3DViewer")
        box.injectNode(simulatorFrame);


        // Function to handle window close event
        const handleWindowClose = async (e) => {
            e.preventDefault();
            e.returnValue = ''; // This is required for older browsers

            // Show an alert when the user tries to close the window
            const confirmationMessage = 'Are you sure you want to leave this page? Your unsaved changes may be lost.';
            e.returnValue = confirmationMessage;
            if (e.returnValue != '') {
                clearInterval(sim_intervalId);
                await anysisSimulation('stop', policy);
            }
            return confirmationMessage;
        };

        // Attach the window close event handler
        window.addEventListener('beforeunload', handleWindowClose);

        // Function to remove the window close event handler
        const removeWindowCloseHandler = () => {
            window.removeEventListener('beforeunload', handleWindowClose);
        };

        // Example of when to remove the event handler (you can call this when needed)
        const stopAlertOnWindowClose = () => {
            removeWindowCloseHandler();
        };

        // Example of when to start showing the alert on window close (you can call this when needed)
        const startAlertOnWindowClose = () => {
            window.addEventListener('beforeunload', handleWindowClose);
        };
    });

    let lastDoorState = null
    let lastSeatState = null

    setInterval(async () => {

        if(!simulatorFrame) return
        if(!car3DViewer) {
            car3DViewer = simulatorFrame.querySelector("#car3DViewer")
        }
 
        if(!car3DViewer || !car3DViewer.contentWindow) return
        
 
    }, 1000)


    return {
        start_simulation: start_sim,
        stop_simulation: stop_sim,
        load_signals: loadSpreadSheet,
        update_simulation: updateSimulation,
        notifyPhone: (message) => {
            if (mobileNotifications !== null) {
                mobileNotifications(message)
            }
        },call_me: (name) => {
                return "Hello " + name + ", I am plugin."
            },
            init: () => {
                if(!car3DViewer) {
                    car3DViewer = simulatorFrame.querySelector("#car3DViewer")
                }
                if(!car3DViewer || !car3DViewer.contentWindow) return
                car3DViewer.contentWindow.postMessage(JSON.stringify({'cmd': 'reset'}), "*")
                lastDoorState = null
                lastSeatState = null
            }
    }
}


export default plugin;
