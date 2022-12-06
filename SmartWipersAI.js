import StatusTable from "./reusable/StatusTable.js"
// import SpeedOMeter from "./Speedometer.js"
//import "./assets/js/opencv.js"

async function fetchIntensity(weather) {
    const res = await fetch(
        `https://aiotapp.net/video/inference/percentage?weather=${weather}`);
    // waits until the request completes...
    if (!res.ok) {
        const message = `An error has occured: ${res.status}`;
        throw new Error(message);
    }
    //conver response to json
    const response = await res.json()
    return response
}

const plugin = ({ widgets, simulator, vehicle }) => {

    let weather = "heavy";
    let intensity = null;
    let index = 0;
    let intervalId = null;
    let indexSignals = 0;
    let intervalId2 = null;
    let manualOverride = false;
    let percent = 0;

    fetchIntensity(weather).then((percentages) => {
        index = 0;
        intensity = percentages.percentages;
    });

    let WiperSignalsRunning = [
        {
            "Vehicle.Body.Windshield.Front.Wiping.System.Mode": "Wipe",
            "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition": 90,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached": 0,
            "Vehicle.Body.Raindetection.Intensity": percent
        },
        {
            "Vehicle.Body.Windshield.Front.Wiping.System.Mode": "Wipe",
            "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition": 75,
            "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached": 0,
            "Vehicle.Body.Raindetection.Intensity": percent
        },
        {
            "Vehicle.Body.Windshield.Front.Wiping.System.Mode": "Wipe",
            "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition": 90,
            "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached": 0,
            "Vehicle.Body.Raindetection.Intensity": percent
        },
        {
            "Vehicle.Body.Windshield.Front.Wiping.System.Mode": "Wipe",
            "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition": 75,
            "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached": 0,
            "Vehicle.Body.Raindetection.Intensity": percent
        },
        {
            "Vehicle.Body.Windshield.Front.Wiping.System.Mode": "Wipe",
            "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition": 15,
            "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached": 0,
            "Vehicle.Body.Raindetection.Intensity": percent
        },
        {
            "Vehicle.Body.Windshield.Front.Wiping.System.Mode": "Wipe",
            "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached": 1,
            "Vehicle.Body.Raindetection.Intensity": percent
        }
    ]

    let WipersSignalStopped = [
        {
            "Vehicle.Body.Windshield.Front.Wiping.System.Mode": "Stop",
            "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping": 0,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle": 1,
            "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached": 1,
            "Vehicle.Body.Raindetection.Intensity": percent
        }
    ]

    function setSignals(speed) {
        if(speed === "stop") {
            simulator("Vehicle.Body.Windshield.Front.Wiping.System.Mode", "get", () => {
                return WipersSignalStopped[0]["Vehicle.Body.Windshield.Front.Wiping.System.Mode"]
            });
            simulator("Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition", "get", () => {
                return WipersSignalStopped[0]["Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition"]
            });
            simulator("Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition", "get", () => {
                return WipersSignalStopped[0]["Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition"]
            });
            simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsWiping", "get", () => {
                return WipersSignalStopped[0]["Vehicle.Body.Windshield.Front.Wiping.System.IsWiping"]
            });
            simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle", "get", () => {
                return WipersSignalStopped[0]["Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle"]
            });
            simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached", "get", () => {
                return WipersSignalStopped[0]["Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached"]
            });
            simulator("Vehicle.Body.Raindetection.Intensity", "get", () => {
                return percent
            });
        }
        else if(speed === "medium") {
            intervalId2 = setInterval(() => {
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.Mode", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.Mode"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsWiping", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.IsWiping"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached"]
                });
                simulator("Vehicle.Body.Raindetection.Intensity", "get", () => {
                    return percent
                });
                indexSignals++;
            }, 500)
        }
        else {
            intervalId2 = setInterval(() => {
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.Mode", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.Mode"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsWiping", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.IsWiping"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle"]
                });
                simulator("Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached", "get", () => {
                    return WiperSignalsRunning[indexSignals % 6]["Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached"]
                });
                simulator("Vehicle.Body.Raindetection.Intensity", "get", () => {
                    return percent
                });
                indexSignals++;
            }, 334)
        }
        
    }

    let dashcamFrame = null;
    widgets.register("Dashcam", (box) => {
        dashcamFrame = document.createElement("div")
        dashcamFrame.innerHTML =
            `
        <div id="videoContainer" style="height:100%">
            <video id="videoPlayer" style="width:100%; height:100%; object-fit: fill" preload="auto" muted title="Data source: Soboleva, Vera, and Oleg Shipitko. 'Raindrops on windshield: Dataset and lightweight gradient-based detection algorithm.' 2021 IEEE Symposium Series on Computational Intelligence (SSCI). IEEE, 2021.">
                <source
                src="https://aiotapp.net/video/raw?weather=${weather}"
                type="video/mp4"
                />
            </video>
            <div style="width:3em;cursor: pointer;position:absolute;bottom:5%;left:5%"" id="play">
				<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fplay.svg?alt=media&token=4f68e20d-5c11-4e2c-9ae3-7f44ebdd0416" alt="play" style="filter: invert(100%);">
			</div>
            <div style="width:3em;cursor: pointer;position:absolute;bottom:5%;right:5%" id="forward">
				<img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2Fforward.svg?alt=media&token=6e729a78-4c7b-4065-a738-b58cdbcfc3cc" alt="change_condition" style="filter: invert(100%);">
			</div>
        </div>
        `

        dashcamFrame.querySelector("#forward").onclick = () => {
            clearInterval(intervalId)
            clearInterval(intervalId2)
            setSignals("stop");
            manualOverride = false;
            
            WipersControlFrame.querySelector("#stop").style.backgroundColor = "rgb(157 176 184)"
            WipersControlFrame.querySelector("#medium").style.backgroundColor = "rgb(157 176 184)"
            WipersControlFrame.querySelector("#fast").style.backgroundColor = "rgb(157 176 184)"            
            simulatorFrame.querySelector("#wiper").contentWindow.postMessage("OFF", "*")

            if (weather === "heavy")
                weather = "medium";
            else if (weather === "medium")
                weather = "no";
            else
                weather = "heavy";

            dashcamFrame.querySelector("#videoPlayer source").setAttribute("src", `https://aiotapp.net/video/raw?weather=${weather}`)
            dashcamInferenceFrame.querySelector("#videoPlayer source").setAttribute("src", `https://aiotapp.net/video/inference?weather=${weather}`)
            dashcamFrame.querySelector("#videoPlayer").load();
            dashcamInferenceFrame.querySelector("#videoPlayer").load();

            fetchIntensity(weather).then((percentages) => {
                index = 0;
                percent = 0;
                intensity = percentages.percentages;
            });

        }

        dashcamFrame.querySelector("#play").onclick = () => {
            clearInterval(intervalId)
            clearInterval(intervalId2)
            setSignals("stop");
            manualOverride = false;
            index = 0;
            percent = 0;
            const increment = weather === "heavy" ? 15 : weather === "medium" ? 16 : 27;
            const signal = weather === "heavy" ? "fast" : weather === "medium" ? "medium" : "stop";

            WipersControlFrame.querySelector("#stop").style.backgroundColor = "rgb(157 176 184)"
            WipersControlFrame.querySelector("#medium").style.backgroundColor = "rgb(157 176 184)"
            WipersControlFrame.querySelector("#fast").style.backgroundColor = "rgb(157 176 184)"            
            simulatorFrame.querySelector("#wiper").contentWindow.postMessage("OFF", "*")

            intervalId = setInterval(() => {
                if (index < intensity.length) {
                    const per = intensity[index];
                    percent = per;
                    scoreFrame.querySelector("#score .text").textContent = intensity[index] + "%";
                    scoreFrame.querySelector("#score .mask").setAttribute("stroke-dasharray", (200 - (parseInt(intensity[index]) * 2)) + "," + 200);
                    scoreFrame.querySelector("#score .needle").setAttribute("y1", `${(parseInt(intensity[index]) * 2)}`)
                    scoreFrame.querySelector("#score .needle").setAttribute("y2", `${(parseInt(intensity[index]) * 2)}`)
                    index += increment;
                    if(manualOverride === false) {
                        const message = per > 35 ? "HI" : per > 10 ? "LO" : "OFF"
                        simulatorFrame.querySelector("#wiper").contentWindow.postMessage(message, "*");
                    }
                }
                else {
                    clearInterval(intervalId);
                    clearInterval(intervalId2);
                    setSignals("stop")
                    simulatorFrame.querySelector("#wiper").contentWindow.postMessage("OFF", "*");
                }
            }, 1000)

            dashcamFrame.querySelector("#videoPlayer").play();
            dashcamInferenceFrame.querySelector("#videoPlayer").play();

            setSignals(signal)

        }

        box.injectNode(dashcamFrame)
        return () => {
            clearInterval(intervalId)
            // Deactivation function for clearing intervals or such.
        }
    });

    let dashcamInferenceFrame = null;
    widgets.register("Dashcam Inference", (box) => {
        dashcamInferenceFrame = document.createElement("div")
        dashcamInferenceFrame.style = `width:100%;height:100%;color:#ffffe3;background-color:rgb(31 41 55);font-size:1em;text-align:center;font-family: 'Lato';-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;text-align:center;`
        dashcamInferenceFrame.innerHTML =
            `
        <div id="videoContainer" style="height:100%" >
            <video id="videoPlayer" style="width:100%; height:100%; object-fit: fill" preload="auto" muted title="The pink curve outlines the location of raindrops on the windshield as detected by the AI model. Grad-CAM is a technique that can generate the heatmap denoting the focus area of the AI model. The redder the area in the heatmap, the higher the attention of the AI model.">
                <source
                src="https://aiotapp.net/video/inference?weather=${weather}"
                type="video/mp4"
                />
            </video>
        </div>
        `

        box.injectNode(dashcamInferenceFrame)
        return () => {
            // Deactivation function for clearing intervals or such.
        }
    })

    widgets.register("Signals", StatusTable({
        apis: ["Vehicle.Body.Windshield.Front.Wiping.System.Mode", "Vehicle.Body.Windshield.Front.Wiping.System.ActualPosition", "Vehicle.Body.Windshield.Front.Wiping.System.TargetPosition", "Vehicle.Body.Windshield.Front.Wiping.System.IsWiping", "Vehicle.Body.Windshield.Front.Wiping.System.IsEndingWipeCycle", "Vehicle.Body.Windshield.Front.Wiping.System.IsPositionReached", "Vehicle.Body.Raindetection.Intensity"],
        vehicle: vehicle,
        refresh: 1000
    }))

    let WipersControlFrame = null;

    widgets.register("Wiper Control", (box) => {
        WipersControlFrame = document.createElement("div")
        WipersControlFrame.style = "width:100%;height:100%;display:grid;align-content:center;justify-content:center;align-items:center"
        WipersControlFrame.innerHTML = `
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
        <div style="">
            <div class="btn-group wiper-controls" style="margin:5px;display:grid;">
                <button id="stop" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Stop
                </button>
                <button id="medium" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Medium
                </button>
                <button id="fast" style="background-color: rgb(157 176 184);padding: 10px 24px;cursor: pointer;margin:2px;border-radius:5px;font-size:1em;font-family:Lato;color: rgb(255, 255, 227);border:0px">
                Fast
                </button>
            </div>
            <div>Steering Column</div>
            <div>Wiper Switch</div>
        </div>
		`

        let bigloopFrame = document.createElement("div")
        bigloopFrame.innerHTML = 
        `
            <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
            * {
                box-sizing: border-box;
            }
            #big-loop {
                font-family: 'Lato', sans-serif;
                color:#ffffe3;
                background-color:rgb(0 80 114);
                text-align:center;            
            }
            </style>
            <div id="big-loop">
                <div class="output">
                    <img id="photo" alt="The screen capture will appear in this box." />
                </div>
                <div>This is the current rain situation and the resulting AI inference. Since there was a manual override from the driver, this scene will be sent to the backend for re-evaluation and potential re-training of Smart Wiper AI.</div>
            </div>
        `

        let stop = WipersControlFrame.querySelector("#stop")
        stop.onclick = () => {
            clearInterval(intervalId2);
            setSignals("stop");
            WipersControlFrame.querySelector("#stop").style.backgroundColor = "rgb(104 130 158)"
            WipersControlFrame.querySelector("#medium").style.backgroundColor = "rgb(157 176 184)"
            WipersControlFrame.querySelector("#fast").style.backgroundColor = "rgb(157 176 184)"            
            simulatorFrame.querySelector("#wiper").contentWindow.postMessage("OFF", "*")
            // fillPercent(0)
            manualOverride = true;
            //pause the video and get current details
            //dashcamFrame.querySelector("#videoPlayer").pause();
            //dashcamInferenceFrame.querySelector("#videoPlayer").pause();
            const videoTime = dashcamFrame.querySelector("#videoPlayer").currentTime;
            const videoSrc = dashcamFrame.querySelector("#videoPlayer").currentSrc;
            
            const videoFrame = dashcamFrame.querySelector("#videoPlayer");
            let canvas = document.createElement('canvas')
            canvas.width = videoFrame.videoWidth;
            canvas.height = videoFrame.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoFrame, 0, 0, videoFrame.videoWidth, videoFrame.videoHeight);
            const photo = bigloopFrame.querySelector("#photo");
            photo.setAttribute("crossorigin", "anonymous")
            const data = canvas.toDataURL("image/png");
            
            photo.setAttribute("src", data);
            // const video = new cv.VideoCapture(videoSrc)
            // const t_msec = 1000*(videoTime)
            // video.set(cv.CAP_PROP_POS_MSEC, t_msec)
            // ret, frame = video.read()
            box.triggerPopup(bigloopFrame);
        }

        let medium = WipersControlFrame.querySelector("#medium")
        medium.onclick = () => {
            clearInterval(intervalId2);
            setSignals("medium");
            WipersControlFrame.querySelector("#medium").style.backgroundColor = "rgb(104 130 158)"
            WipersControlFrame.querySelector("#stop").style.backgroundColor = "rgb(157 176 184)"
            WipersControlFrame.querySelector("#fast").style.backgroundColor = "rgb(157 176 184)"            
            simulatorFrame.querySelector("#wiper").contentWindow.postMessage("LO", "*")
            // fillPercent(50)
            manualOverride = true;
            //pause the video and get current details
            dashcamFrame.querySelector("#videoPlayer").pause();
            dashcamInferenceFrame.querySelector("#videoPlayer").pause();
            const videoTime = dashcamFrame.querySelector("#videoPlayer").currentTime;
            const videoSrc = dashcamFrame.querySelector("#videoPlayer").currentSrc;
            // const video = new cv.VideoCapture(videoSrc)
            // const t_msec = 1000*(videoTime)
            // video.set(cv.CAP_PROP_POS_MSEC, t_msec)
            // ret, frame = video.read()            
            box.triggerPopup(bigloopFrame);            
        }

        let fast = WipersControlFrame.querySelector("#fast")
        fast.onclick = () => {
            clearInterval(intervalId2);
            setSignals("fast");
            WipersControlFrame.querySelector("#fast").style.backgroundColor = "rgb(104 130 158)"
            WipersControlFrame.querySelector("#medium").style.backgroundColor = "rgb(157 176 184)"
            WipersControlFrame.querySelector("#stop").style.backgroundColor = "rgb(157 176 184)"            
            simulatorFrame.querySelector("#wiper").contentWindow.postMessage("HI", "*")
            // fillPercent(100)
            manualOverride = true;
            //pause the video and get current details
            dashcamFrame.querySelector("#videoPlayer").pause();
            dashcamInferenceFrame.querySelector("#videoPlayer").pause();
            const videoTime = dashcamFrame.querySelector("#videoPlayer").currentTime;
            const videoSrc = dashcamFrame.querySelector("#videoPlayer").currentSrc;
            // const video = new cv.VideoCapture(videoSrc)
            // const t_msec = 1000*(videoTime)
            // video.set(cv.CAP_PROP_POS_MSEC, t_msec)
            // ret, frame = video.read()            
            box.triggerPopup(bigloopFrame);
        }

        box.injectNode(WipersControlFrame)

    })

    let simulatorFrame = null;
    widgets.register("Wiper Simulator", (box) => {
        simulatorFrame = document.createElement("div")
        simulatorFrame.style = "width:100%;height:100%"
        simulatorFrame.innerHTML =
            `<iframe id="wiper" src="https://aiotapp.net/wiper/simulator" frameborder="0" style="width:100%;height:100%"></iframe>`
        // simulatorFrame.querySelector("#wiper").onload = () => {
        //     dashcamFrame.querySelector("#videoPlayer").play();
        //     dashcamInferenceFrame.querySelector("#videoPlayer").play();
        //     simulatorFrame.querySelector("#wiper").contentWindow.postMessage("HI", "*")
        // }
        box.injectNode(simulatorFrame)
    })

    let fillPercent = 0;
    // widgets.register("SpeedOMeter", (box) => {
    //     SpeedOMeter({
    //         box: box
    //     }).then(({ updatePercentage }) => {
    //         fillPercent = updatePercentage
    //     })
    // })

    let scoreFrame = null;
    widgets.register("Score", (box) => {
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
            <div id="score">
                <div class="text">0.0%</div>
                <svg width="100" height="200" style="transform: rotateX(180deg)">
                    <rect class="outline" x="25" y="0" rx="2" ry="2" stroke="black" stroke-width="3" width="50" height="200" fill="none" />
                    <line class="low" x1="50" y1="0" x2="50" y2="200" stroke="red" stroke-width="50" stroke-dasharray="200,200"/>
                    <line class="medium" x1="50" y1="0" x2="50" y2="200" stroke="yellow" stroke-width="50" stroke-dasharray="160,200"/>
                    <line class="high" x1="50" y1="0" x2="50" y2="200" stroke="green" stroke-width="50" stroke-dasharray="120,200"/>
                    <line class="mask" x1="50" y1="200" x2="50" y2="0" stroke="white" stroke-width="50" stroke-dasharray="200,200"/>
                    <line class="needle" x1="0" y1="0" x2="100" y2="0" stroke="rgb(156 163 175)" stroke-width="3" />
                </svg>
                <div id="message">Rain Intensity</div>		
            </div>		
            `
        box.injectNode(scoreFrame)
    })

}

export default plugin