import SimulatorPlugins from "./reusable/SimulatorPlugins.js"
import StatusTable from "./reusable/StatusTable.js"
import LineChart from "./reusable/LineChart.js"
import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js"
import MobileNotifications from "./reusable/MobileNotifications.js"
 
 


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
// const PROVIDER_ID = "PYTHON-CLIENT-SAMPLE"
const PROVIDER_ID = "JAVASCRIPT-CLIENT-SAMPLE"
const plugin = ({widgets, simulator, vehicle}) => {

    widgets.register("Client", async (box) => {
        await loadScript(box.window, `https://cdn.socket.io/4.6.0/socket.io.min.js`)
        const socket = box.window.io("https://bridge.digitalauto.tech");

        const onConnected = () => {
            console.log("Io connected")
            socket.emit("register_client", {
                master_provider_id: PROVIDER_ID
            })
        }
        const messageFromProvider = (payload) => {
            if(payload.cmd == 'showSpeed') {
                lblSpeed.innerText = payload.data
            }
        }
        const onProviderReply = (payload) => {
            lblSpeed.innerText = payload.result
        }

        socket.on("connect", onConnected);
        socket.on('message_from_provider', messageFromProvider)
        socket.on('provider_reply', onProviderReply)

        const container = document.createElement("div");
        container.setAttribute("style", `display:block; ;overflow:auto;padding: 20px;`);
        container.innerHTML = `
            <div style='margin-top: 10px;font-size:20px;'>
                <div style='display:inline-block;width: 100px;'>Speed</div>
                <div style='display:inline-block;font-weight: 700' id='lblSpeed'></div>
            </div>
            <div style='margin-top: 10px;'>
                <div style='display:inline-block;font-weight: 700;padding: 8px 12px;background-color:#ABABAB;cursor:pointer;border-radius:4px;'
                    id='btnStart'> Start</div>
            </div>
        `
        let lblSpeed = container.querySelector("#lblSpeed")
        let btnStart = container.querySelector("#btnStart")
        btnStart.onclick = () => {
            socket.emit("request_provider", {
                to_provider_id: PROVIDER_ID,
                cmd: "Start",
                data: 1
            })
        }
        box.injectNode(container);
    })
    return {
        call_me: (name) => { 
            return "Hello " + name + ", I am plugin."
        }
    }
}
 

export default plugin;
