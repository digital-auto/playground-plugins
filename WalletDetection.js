import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import StatusTable from "./reusable/StatusTable.js"
import MobileNotifications from "./reusable/MobileNotifications.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js"
import GoogleMapsLocation from "./reusable/GoogleMapsLocation.js"

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

const plugin = ({widgets, simulator, vehicle}) => {

    let simInterval = null

    const loadSpreadSheet = async () => {
        let sheetID = "1KopET4hpEUQqswqvBP1Nx2xljYE7Ws-6kRqH1rxGJv4";
        fetchRowsFromSpreadsheet(sheetID, PLUGINS_APIKEY)
        .then((rows) => {
            SimulatorPlugins(rows, simulator)
        })
    }

    widgets.register("Table",
    StatusTable({
        apis:["Vehicle.Connectivity.IsConnectivityAvailable","Vehicle.IsMoving", "Vehicle.Cabin.Seat.Row1.Pos1.IsOccupied", "Vehicle.CurrentLocation.Latitude", "Vehicle.CurrentLocation.Longitude"],
        vehicle: vehicle,
        refresh: 800         
    }))

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

    let setLocationGlobal = null;
	widgets.register("Map", (box) => {
		const initialLocation = {
            "lat": 46.477127,
            "lng": 10.367829
		}
        GoogleMapsLocation(PLUGINS_APIKEY, box, initialLocation).then(({setLocation}) => {
			setLocationGlobal = setLocation
		})
	})

    widgets.register("Video Panel", (box) => {
        const container = document.createElement('div')
        container.innerHTML = 
        `
        <!-- <div id="image" style="display:none">
            <img id="output" width="100%" height="100%"/>
        </div> -->
        <div id="video" style="display:none; width:100%; height:100%">
            <video id="raw-video" width="100%" height="100%">
            </video>
            <div style="width:3em;cursor: pointer;position:absolute;bottom:45%;left:45%"" id="play-btn">
				<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fplay.svg?alt=media&token=4f68e20d-5c11-4e2c-9ae3-7f44ebdd0416" alt="play" style="filter: invert(100%);">
			</div>
        </div>
        <div class="btn btn-color" style="display:flex; position:absolute; width: 100%; bottom: 10px; opacity:50%; align-items:center; align-content:center; flex-direction:row; justify-content:center">
            <button id="upload-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Upload
            </button>
            <button id="submit-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Submit
            </button>
            <input id="upload" type="file" accept="video/*" style="display:none">
        </div>
        `
        const upload_btn = container.querySelector("#upload-btn")
        upload_btn.onclick = () => {
            container.querySelector("#upload").click()
        }

        const upload = container.querySelector("#upload")
        upload.onchange = (event) => {
            // const image = container.querySelector('#output');
            // image.src = URL.createObjectURL(event.target.files[0]);
            // container.querySelector("#image").style = "display: block"
            const video = container.querySelector("#raw-video");
            video.innerHTML = `<source src=${URL.createObjectURL(event.target.files[0])} type="video/mp4"></source>`
            container.querySelector("#video").style = "display: block"
        }

        const imageUpload = async () => {
            const data = new FormData()
            data.append('file', upload.files[0])
            console.log(data)

            const res = await fetch(
                `https://predict.app.landing.ai/inference/v1/predict?endpoint_id=582a8a02-0357-412f-a31d-865549855e43`, {
                    method:'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'apikey':'h644blf0bp1g3k4d8ffkazchyfb412e',
                        'apisecret':'yswm5qiyg0lhf45fo3pn1epsv5m01li03094wgwf7hgactxlq76kdd55whymfx'
                    },
                    body: data
                });
            // waits until the request completes...
            if (!res.ok) {
                const message = `An error has occured: ${res.status}`;
                throw new Error(message);
            }
            //convert response to json
            const response = await res.json()
            return response
        }

        const submit_btn = container.querySelector("#submit-btn")
        submit_btn.onclick = async () => {
            console.log(setLocationGlobal)
            const res = await imageUpload()
            console.log(res)
        }

        const play_btn = container.querySelector("#play-btn")
        play_btn.onclick = () => {
            container.querySelector("#raw-video").play();            
        }

        box.injectNode(container)

        return () => {
            clearInterval(simInterval)
        }

    })

    return {
        load_data: async () => {
            loadSpreadSheet()
        },
        mobile_notification: (message) => {
            mobileNotifications(message)
        },
        start_simulation: (time) => {
            simInterval = setInterval(async () => {
                const lat = parseFloat(await vehicle.CurrentLocation.Latitude.get())
                const lng = parseFloat(await vehicle.CurrentLocation.Longitude.get())
                setLocationGlobal({lat, lng})
                container.querySelector("#raw-video").play();
                await vehicle.Next.get()
            }, time)
        }
    }

}

export default plugin;