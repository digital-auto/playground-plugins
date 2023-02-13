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
    <div class="btn btn-color" style="">
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