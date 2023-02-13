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

    const container = document.createElement('div')
    container.innerHTML = 
    `
    <div class="image">
        <img id="output" width="100%"/>
    </div>
    <div class="btn btn-color" style="display:flex; position:absolute; opacity:50%; align-items:center; align-content:center; flex-direction:row; justify-content:center">
        <button id="upload" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
            Upload
        </button>
        <button id="capture" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
            Capture
        </button>
        <input id="upload" type="file" accept="image/*">
    </div>
    `

    const upload = container.querySelector("#upload")
    upload.onchange = (event) => {
        const image = container.querySelector('#output');
        image.src=URL.createObjectURL(event.target.files[0]);
    }

    widgets.register("Webcam Block", (box) => {
        box.injectNode(container)
    })
}

export default plugin