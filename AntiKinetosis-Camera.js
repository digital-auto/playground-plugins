async function imageUpload(image) {
    image = image.replace('data:image/jpeg;base64,', '')
	const res = await fetch(
		`https://aiotapp.net/kinetosis/detectImage`, {
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
	let age_old = null, age_young = null, gender_male = null, gender_female = null

    const container = document.createElement('div')
    container.innerHTML = 
    `
    <div id="image" style="display:none">
        <img id="output" width="100%" height=100%/>
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
    <div class="btn btn-color" style="display:flex; position:absolute; width: 100%; bottom: 60px; opacity:50%; align-items:center; align-content:center; flex-direction:row; justify-content:center">
		<button id="submit-btn" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
			Submit
		</button>
	</div>
    `

    let imageEncoded = null;
    const upload_btn = container.querySelector("#upload-btn")
    upload_btn.onclick = () => {
        container.querySelector("#upload").click()
    }

    let age, gender = null
    const submit_btn = container.querySelector("#submit-btn")
    submit_btn.onclick = async () => {
        const res = await imageUpload(imageEncoded)
        age = res.age 
        gender = res.gender

		if (parseInt(age) > 40) {
			age_old.click()
		}
		else {
			age_young.click()
		}

		if(gender === "M"){
			gender_male.click()
		}
		else {
			gender_female.click()
		}
    }

    const getUserDetails = () => {
        container.querySelector("#submit-btn").click()
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

    let controlsFrame = null;
    widgets.register("Controls", (box) => {
	controlsFrame = document.createElement("div")
    controlsFrame.style = 'width:100%;height:100%;display:grid;align-content:center;justify-content:center;align-items:center'
	controlsFrame.innerHTML = 
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
			display:flex;          
        }
        </style>
		<div class="label" style="width:100%;position:relative;margin-top:10px;">Driving Style:</div>
		<div id="style" style="display:flex;width:100%;justify-content: center;align-items:center;position:relative;margin-top:5px">        
			<div id="red" style="width:33%;text-align:center">
				<img style="width:80%;" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FSporty.png?alt=media&token=e318b297-d41e-4e6a-9a41-8b7fbbf2602d" />
				<div style="font-weight:bold">
					Sporty
				</div>
			</div>
			<div id="yellow" style="width:33%;text-align:center">
				<img style="width:50%;" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FOptimized.png?alt=media&token=dff86e6b-ee69-4daf-b213-abc38da273ef" />
				<div style="font-weight:unset">
					Optimized
				</div>
			</div>
			<div id="green" style="width:33%;text-align:center">
				<img style="width:50%;" src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FRelaxed.png?alt=media&token=86901115-a104-4f48-b09b-6b4e44a7e8bd" />
				<div style="font-weight:unset">
					Relaxed
				</div>
			</div>
		</div>
		<div class="label" style="width:100%;position:relative;margin-top:10px;">Back Seat passengers: </div>
		<div id="passengers" style="position:relative;margin-top:5px;width:100%;">        
			<div class="selections" style="display:flex;position:relative;justify-content:center">
				<div class="btn-group gender" style="margin:5px;display:grid">
					<button id="gender_male" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
					Male
					</button>
					<button id="gender_female" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
					Female
					</button>
				</div>
				<div class="btn-group age" style="margin:5px;display:grid">
					<button id="age_young" style="background-color: rgb(104 130 158);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
					Young
					</button>
					<button id="age_old" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
					Adult
					</button>
				</div>
			</div>
		</div>
		<div id="controls" style="position:relative;bottom:0%;display:grid;width:100%;align-items:center">
			<div id="icons" style="margin:5px;display:flex;justify-content:space-around">
				<div style="width:2em;cursor: pointer;" id="video">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fvideo.svg?alt=media&token=93f6bed8-10c8-43f5-ba09-44bde5bb1797" alt="video" style="filter: invert(100%);">
				</div>
				<!-- <div style="width:2em;cursor: pointer;" id="reload">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Freload.svg?alt=media&token=0a2db061-8210-4c0b-bb84-0fdbf34c415e" alt="reload" style="filter: invert(100%);">
				</div>
				<div style="width:2em;cursor: pointer;" id="play">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fplay.svg?alt=media&token=4f68e20d-5c11-4e2c-9ae3-7f44ebdd0416" alt="play" style="filter: invert(100%);">
				</div>
				<div style="width:2em;cursor: pointer;" id="forward">
					<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fforward.svg?alt=media&token=6e729a78-4c7b-4065-a738-b58cdbcfc3cc" alt="forward" style="filter: invert(100%);">
				</div> -->
			</div>
		</div>
		<div id="controls_intro" style="position:relative;bottom:0%;display:grid;width:100%;align-items:center">
			<div style="margin:5px;display:flex;justify-content:space-around">
				<div style="cursor: pointer;" id="intro">
					<button id="intro_btn" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;float: left;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
					Intro
					</button>
				</div>
			</div>
		</div>
		`

		simulator("Vehicle.Passenger.Age", "get", async () => {
			return parseInt("15");
		})
		simulator("Vehicle.Passenger.Gender", "get", async () => {
			return "male";
		})
		simulator("Vehicle.DrivingStyle", "get", async () => {
			return "sporty";
		})

		let simulationDetails = {
			"style": "sporty",
			"gender": "male",
			"age": "young"
		}
	
		let sportyStyle = controlsFrame.querySelector("#red")
		sportyStyle.onclick = () => {
			simulationDetails["style"] = "sporty"
			controlsFrame.querySelector("#red img").style.width = "80%"
			controlsFrame.querySelector("#green img").style.width = "50%"
			controlsFrame.querySelector("#yellow img").style.width = "50%"
			controlsFrame.querySelector("#red div").style.fontWeight = "bold"
			controlsFrame.querySelector("#green div").style.fontWeight = "unset"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"
			simulator("Vehicle.DrivingStyle", "get", async () => {
				return "sporty";
			})
		}
	
		let relaxedStyle = controlsFrame.querySelector("#green")
		relaxedStyle.onclick = () => {
			simulationDetails["style"] = "relaxed"
			controlsFrame.querySelector("#red img").style.width = "50%"
			controlsFrame.querySelector("#green img").style.width = "80%"
			controlsFrame.querySelector("#yellow img").style.width = "50%"
			controlsFrame.querySelector("#red div").style.fontWeight = "unset"
			controlsFrame.querySelector("#green div").style.fontWeight = "bold"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "unset"
			simulator("Vehicle.DrivingStyle", "get", async () => {
				return "relaxed";
			})
		}
	
		let optimizedStyle = controlsFrame.querySelector("#yellow")
		optimizedStyle.onclick = () => {
			simulationDetails["style"] = "optimized"
			controlsFrame.querySelector("#red img").style.width = "50%"
			controlsFrame.querySelector("#green img").style.width = "50%"
			controlsFrame.querySelector("#yellow img").style.width = "80%"
			controlsFrame.querySelector("#red div").style.fontWeight = "unset"
			controlsFrame.querySelector("#green div").style.fontWeight = "unset"
			controlsFrame.querySelector("#yellow div").style.fontWeight = "bold"
			simulator("Vehicle.DrivingStyle", "get", async () => {
				return "optimized";
			})
		}
	
		gender_male = controlsFrame.querySelector("#gender_male")
		gender_male.onclick = () => {
			simulationDetails["gender"] = "male"
			controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(104 130 158)"
			controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(157 176 184)"
			simulator("Vehicle.Passenger.Gender", "get", async () => {
				return "male";
			})
		}
	
		gender_female = controlsFrame.querySelector("#gender_female")
		gender_female.onclick = () => {
			simulationDetails["gender"] = "female"
			controlsFrame.querySelector("#gender_male").style.backgroundColor = "rgb(157 176 184)"
			controlsFrame.querySelector("#gender_female").style.backgroundColor = "rgb(104 130 158)"
			simulator("Vehicle.Passenger.Gender", "get", async () => {
				return "female";
			})
		}
	
		age_young = controlsFrame.querySelector("#age_young")
		age_young.onclick = () => {
			simulationDetails["age"] = "young"
			controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(104 130 158)"
			controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(157 176 184)"
			simulator("Vehicle.Passenger.Age", "get", async () => {
				return parseInt("15");
			})
		}
	
		age_old = controlsFrame.querySelector("#age_old")
		age_old.onclick = () => {
			simulationDetails["age"] = "adult"
			controlsFrame.querySelector("#age_young").style.backgroundColor = "rgb(157 176 184)"
			controlsFrame.querySelector("#age_old").style.backgroundColor = "rgb(104 130 158)"
			simulator("Vehicle.Passenger.Age", "get", async () => {
				return parseInt("60");
			})
		}

		let video = controlsFrame.querySelector("#video")
		video.onclick = () => {
			const style = simulationDetails.style.trim();
			const videoURL = style === "relaxed" ? "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FRelaxedDriver_AVC.mp4?alt=media&token=ea69aa02-828b-4a66-af0b-5b5abc257d5c" : style === "optimized" ? "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FOptimizedDriver_AVC.mp4?alt=media&token=f9fc5f86-c61a-4760-ac48-4a83d135b8f3" : "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FSportyDriver_AVC.mp4?alt=media&token=2f2b664a-f682-4171-912f-0b0e3e32a5bd"
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

		let intro_video = controlsFrame.querySelector("#intro_btn")
		intro_video.onclick = () => {
			const videoURL = "https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fkinetosis%2FKinetosis%20final%20kompr.mp4?alt=media&token=3b58ba7f-3a62-4357-9475-ea986e407d75"
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
        box.injectNode(controlsFrame)
        return () => {
			//clearInterval(intervalId)
			clearInterval(sim_intervalId)
            // Deactivation function for clearing intervals or such.
        }
    })

    return {
        user_details: () => {
            getUserDetails()
            return { age, gender}
        }        
    }
}

export default plugin