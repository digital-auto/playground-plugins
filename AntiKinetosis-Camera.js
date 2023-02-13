async function imageUpload(image) {
	const res = await fetch(
		`http://127.0.0.1:5000`, {
            method:'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image
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

    let webcam_message = 'Turn on Webcam'

    const container = document.createElement('div')
    container.innerHTML = 
    `
    <div id="image" style="display:none">
        <img id="output" width="100%"/>
    </div>
    <div id="video" style="display:none">
        <video id="webcam-video" playsinline autoplay> </video>
    </div>
    <div class="btn btn-color" style="display:flex; position:absolute; width: 100%; bottom: 10px; opacity:50%; align-items:center; align-content:center; flex-direction:row; justify-content:center">
        <button id="upload-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
            Upload
        </button>
        <button id="capture-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
            ${webcam_message}
        </button>
        <input id="upload" type="file" accept="image/*" style="display:none">
    </div>
    `

    const upload_btn = container.querySelector("#upload-btn")
    upload_btn.onclick = () => {
        container.querySelector("#upload").click()
    }

    const capture_btn = container.querySelector("#capture-btn")
    capture_btn.onclick = () => {
        if(webcam_message === "Turn on Webcam") {
            console.log('turn on webcam')
            webcam_message = "Capture"
        }
        else {
            // const image = container.querySelector('#output');
            // image.src = URL.createObjectURL(event.target.files[0]);
            console.log("capture image")
        }
    }

    const upload = container.querySelector("#upload")
    upload.onchange = (event) => {
        const image = container.querySelector('#output');
        image.src = URL.createObjectURL(event.target.files[0]);
    }

    widgets.register("Webcam Block", (box) => {
        box.injectNode(container)
    })
}

export default plugin