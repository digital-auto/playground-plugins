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

    let webcam_message = 'Webcam'

    const container = document.createElement('div')
    container.innerHTML = 
    `
    <div id="image" style="display:none">
        <img id="output" width="100%"/>
    </div>
    <div id="video" style="display:none; width:100%; height:100%">
        <video id="webcam-video" playsinline autoplay width="100%" height="100%"> </video>
    </div>
    <div id="video_canvas" style="display:none; width:100%; height: 100%">
        <canvas style="border:solid 1px #ddd;background-color:white;" id="canvas" width="475" height="475"></canvas>    
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
            context.drawImage(video, 0, 0);
    
            image.setAttribute("crossorigin", "anonymous")
            const data = canvas.toDataURL("image/png");
            image.setAttribute("src", data);
            container.querySelector("#image").style = "display: block"
            container.querySelector("#video").style = "display: none"

        }
    }

    // function stop() {  
    //     var stream = video.srcObject;  
    //     var tracks = stream.getTracks();  
  
    //     for (var i = 0; i < tracks.length; i++) {  
    //         var track = tracks[i];  
    //         track.stop();  
    //     }  
    //     video.srcObject = null;  
    // }

    const upload = container.querySelector("#upload")
    upload.onchange = (event) => {
        const image = container.querySelector('#output');
        image.src = URL.createObjectURL(event.target.files[0]);
        container.querySelector("#image").style = "display: block"
        container.querySelector("#video").style = "display: none"
    }

    widgets.register("Webcam Block", (box) => {
        box.injectNode(container)
    })
}

export default plugin