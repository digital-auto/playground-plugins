import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import StatusTable from "./reusable/StatusTable.js"
import LineChart from "./reusable/LineChart.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js"

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

const anysisSimulation = async (call, policy) => {
    const res = await fetch(
        `https://aiotapp.net/evpoweroptimization`, {
            method:'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                call,
                policy
            })
        });
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

    const loadSpreadSheet = async () => {
        let sheetID = "1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE";
        fetchRowsFromSpreadsheet(sheetID, PLUGINS_APIKEY)
        .then((rows) => {
            SimulatorPlugins(rows, simulator)
        })
    }

    const updateSimulation = async () => {
        let mode = await vehicle.PowerOptimizationMode.get();

        if(mode === "OFF") {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = "Power Optimization Mode ：OFF <br>IVI System ：ON<br>Interior Light System ：Medium Light";
            HVACAnimationFrame.querySelector("#show").innerHTML = "HVAC degradation system state: 10";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fbig.gif?alt=media&token=4587f1ef-a9e5-45f5-b3cd-c5a617a65811");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "running";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "running";
        }
        else if(mode === "Level 1") {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = "Power Optimization Mode ：Level 1 (IVI Only)<br>IVI System ：OFF<br>Interior Light System ：Medium Light";
            HVACAnimationFrame.querySelector("#show").innerHTML = "HVAC degradation system state: 10";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fbig.gif?alt=media&token=4587f1ef-a9e5-45f5-b3cd-c5a617a65811");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fstart.png?alt=media&token=9d7cc00f-d95e-4351-9d96-a22b4d65eced")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "paused";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "paused";
        }
        else if(mode === "Level 2") {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = "Power Optimization Mode ：Level 2 (IVI  & HVAC)<br>IVI System ：OFF<br>Interior Light System ：Medium Light";
            HVACAnimationFrame.querySelector("#show").innerHTML = "HVAC degradation system state: 1";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fstart.png?alt=media&token=9d7cc00f-d95e-4351-9d96-a22b4d65eced")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "paused";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "paused";
        }
        else {
            IVIAnimationFrame.querySelector("#mainText").innerHTML = "Power Optimization Mode ：Level 3 (IVI  & HVAC & Light)<br>IVI System ：OFF<br>Interior Light System Weak Light";
            HVACAnimationFrame.querySelector("#show").innerHTML = "HVAC degradation system state: 1";
            HVACAnimationFrame.querySelector("#wind").setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368");
            IVIAnimationFrame.querySelector("#btnImg").setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fstart.png?alt=media&token=9d7cc00f-d95e-4351-9d96-a22b4d65eced")
            IVIAnimationFrame.querySelector("#songName").style.animationPlayState = "paused";
            IVIAnimationFrame.querySelector("#modelImg").style.animationPlayState = "paused";
        }
    }

    const updateSignals = async(signals) => {

        simulator("Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "get", async () => {
            return signals["SOC"]
        })
        simulator("Vehicle.Speed", "get", async () => {
            return signals["Speed_kmph"]
        })
        simulator("Vehicle.Cabin.HVAC.AmbientAirTemperature", "get", async () => {
            return signals["Temperature"]
        })
        simulator("Vehicle.Cabin.Sunroof.Position", "get", async () => {
            return signals["Sunroof"]
        })
        simulator("Vehicle.Cabin.Infotainment.Media.Volume", "get", async () => {
            return signals["Volume"]
        })
        simulator("Vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed", "get", async () => {
            return signals["Fan_Speed"]
        })

        // update the values related to the bar here, what vss api value you want the bar for
        // const score = await vehicle.Passenger.KinetosisScore.get()
        const score = "20"
        scoreFrame.querySelector("#score .text").textContent = parseFloat(score).toFixed(2) + "%"
		scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(score) * 2)) + "," + 200);
		scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(score) * 2)}`)
		scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(score) * 2)}`)
        //message you want to write with the bar
        scoreFrame.querySelector("#score #message").textContent = "message"
    }

    let sim_intervalId = null;
    const start_sim = async (time) => {
        await anysisSimulation('start', policy)
        sim_intervalId = setInterval(async () => {
            res = await anysisSimulation('resume', policy)
            updateSignals(res)
            // updateSimulation()

            await vehicle.Next.get()
            // sim_function()
        }, time)
    }

    const stop_sim = async () => {
        clearInterval(sim_intervalId)
        await anysisSimulation('stop', policy)
        // sim_intervalId = setInterval(async () => {
        //     await anysisSimulation('resume', policy)
        //     // updateSimulation()

        //     await vehicle.Next.get()
        //     // sim_function()
        // }, time)
    }

    widgets.register("Table",
        StatusTable({
            apis:["Vehicle.PowerOptimizationMode","Vehicle.Powertrain.TractionBattery.StateOfCharge.Current", "Vehicle.Speed", "Vehicle.Acceleration.Longitudinal", "Vehicle.Cabin.Lights.LightIntensity",	"Vehicle.Cabin.HVAC.AmbientAirTemperature", "Vehicle.Cabin.HVAC.Station.Row1.Left.FanSpeed","Vehicle.Cabin.Infotainment.Media.Volume","Vehicle.Cabin.Sunroof.Position"],
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
            font-size: 12px;
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
                wind.setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fbig.gif?alt=media&token=4587f1ef-a9e5-45f5-b3cd-c5a617a65811");
                return;
            }
            if (wind.getAttribute("src") == "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fbig.gif?alt=media&token=4587f1ef-a9e5-45f5-b3cd-c5a617a65811") {
                wind.setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fhvac%2Fsmall.gif?alt=media&token=a46d0186-80d0-4540-bf23-e94b0cd18368");
                return;
            }
    
        }

        HVACAnimationFrame.querySelector("#show").innerHTML = "HVAC degradation system state: 10";
        
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
            top: 16%;
            left: 24.5%;
            width: 55%;
            height: 55%;
            background-color: white;
        }
    
        .main-text {
            padding: 10px;
            font-size: 12px;
            font-weight: 600;
            height: 45%;
        }
    
        .song-div {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin:0% 10% 0% 10%;
            font-size: 15px;
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
            <div class="song-div">
                <div id="songName" style="animation-play-state:paused;" class="song-name">
                    
                </div>
            </div>
            <div class="process-div">
                <div>
                    <img class="process-img" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fprocess.png?alt=media&token=d23481f5-b188-4bb2-8e21-d0be44a13496">
                    <img id="modelImg" class="model-img" style="animation-play-state:paused" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fmodel.png?alt=media&token=e855b64a-fcb9-4752-8434-31b4b46a7529">
                </div>
            </div>
            <div class="btn-div">
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
            if(status == "paused"){
                songName.style.animationPlayState = "running"
                model.style.animationPlayState = "running"
                btnImg.setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fpause.png?alt=media&token=8d615884-44aa-4bcb-93bc-49a0c3bb7958")
            }
            else{
                songName.style.animationPlayState = "paused"
                model.style.animationPlayState = "paused"
                btnImg.setAttribute("src","https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fevpoweroptimization%2Fivi%2Fstart.png?alt=media&token=9d7cc00f-d95e-4351-9d96-a22b4d65eced")
            }
        }

        IVIAnimationFrame.querySelector("#songName").innerText = "Shape of You一Ed Sheeran";
        IVIAnimationFrame.querySelector("#mainText").innerHTML = "Power Optimization Mode ：Level 1 (IVI Only)<br>IVI System ：OFF<br>Interior Light System ：Medium Light";

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
            <button id="optimized" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Optimized
            </button>
            <button id="non-optimized" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Non-Optimized
            </button>
        </div> -->
        <div class="simulation-start">
            <button id="start" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Start
            </button>
        </div>
        `
        let sheetID = "1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE";
        // let optimized = controlFrame.querySelector("#optimized")
        // optimized.onclick = () => {
        //     sheetID = "1WA6iySLIZngtqZYBr3MPUg-XulkmrMJ_l0MAgGwNyXE"
        //     optimized.style.backgroundColor = "rgb(104 130 158)";
        //     non_optimized.style.backgroundColor = "rgb(157 176 184)";
        // }

        // let non_optimized = controlFrame.querySelector("#non-optimized")
        // non_optimized.onclick = () => {
        //     sheetID = "13ix5z-_Oa_tB5v11XJqnST0SiCBmPraZVUBbB5QzK9c"
        //     optimized.style.backgroundColor = "rgb(157 176 184)";
        //     non_optimized.style.backgroundColor = "rgb(104 130 158)";
        // }

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
    let policy = 0;

    widgets.register("Policy Selection", (box) => {
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
            <div class="btn-group" style="margin:5px;">
                <button id="pol1" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 1
                </button>
                <button id="pol2" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 2
                </button>
                <button id="pol3" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 3
                </button>
                <button id="pol4" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 4
                </button>
                <button id="pol5" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 5
                </button>
                <button id="pol6" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 6
                </button>
                <button id="pol7" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 7
                </button>
                <button id="pol8" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 8
                </button>
                <button id="pol9" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 9
                </button>
                <button id="pol10" class="pol" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Policy 10
                </button>
            </div>
        </div>
		`

        let pol = PolicyFrame.querySelectorAll(".pol")
        for (let i = 0; i < 10; i++) {
            pol[i].onclick = () => {
                policy = i + 1
                let id = "#pol" + policy
                PolicyFrame.querySelector(id).style.backgroundColor = "rgb(104 130 158)"
                for (let j = 0; j < 10; j++) {
                    if (i !== j) {
                        id = "#pol" + (j + 1)
                        PolicyFrame.querySelector(id).style.backgroundColor = "rgb(157 176 184)"
                    }       
                }
            };
        }

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
				<line class="low" x1="50" y1="0" x2="50" y2="200" stroke="red" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="medium" x1="50" y1="0" x2="50" y2="200" stroke="yellow" stroke-width="50" stroke-dasharray="160,200"/>
				<line class="high" x1="50" y1="0" x2="50" y2="200" stroke="green" stroke-width="50" stroke-dasharray="120,200"/>
				<line class="mask" x1="50" y1="200" x2="50" y2="0" stroke="white" stroke-width="50" stroke-dasharray="200,200"/>
				<line class="needle" x1="0" y1="0" x2="100" y2="0" stroke="rgb(156 163 175)" stroke-width="3" />
			</svg>
			<div id="message">Current battery SOC is </div>		
		</div>
		`

		box.injectNode(scoreFrame)
	})

	return {
		start_simulation : start_sim,
        stop_simulation : stop_sim,
        load_signals : loadSpreadSheet,
        update_simulation: updateSimulation
	}  
}

export default plugin;

