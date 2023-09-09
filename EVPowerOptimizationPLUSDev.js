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
            console.log('message_from_provider', payload)
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
            <div style="margin: 8px 4px;">
                <input id="number_input"/>
            </div>
            <div style='margin-top: 10px;'>
                <div style='display:inline-block;font-weight: 700;padding: 8px 12px;background-color:#ABABAB;cursor:pointer;border-radius:4px;'
                    id='btnStart'> Set Policy</div>
            </div>
        `
        let lblSpeed = container.querySelector("#lblSpeed")
        let btnStart = container.querySelector("#btnStart")
        let input = container.querySelector("#number_input")
        btnStart.onclick = () => {
            // socket.emit("request_provider", {
            //     to_provider_id: PROVIDER_ID,
            //     cmd: "Start",
            //     data: 1
            // })
            let value = input.value
            console.log("value", value)
            socket.emit("request_provider", {
                to_provider_id: PROVIDER_ID,
                cmd: "set_policy",
                data: Number(value)
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
export default plugin