const HappyDog = ({widgets}) => {
    widgets.register("DogStream", (box) => {
        const div = document.createElement("div")
        div.innerHTML = "<img></img>"
        box.injectNode(div)

        const updateImage = async () => {
            const [username, password] = ["bcwdemo", "80jEpKYTPVPi"]
            const response = await fetch("https://bcw.chariottdemo.com:44243/chariott.runtime.v1.ChariottService/Fulfill", {
                method: "POST",
                body: JSON.stringify({
                    "namespace": "sdv.camera.simulated",
                    "intent": {
                        "read": {
                            "key": "camera.12fpm"
                        }
                    }
                }),
                headers: {
                    "Authorization":  'Basic ' + btoa(username + ":" + password)
                }
            })
            const json = await response.json()
            const imageBytes = json.fulfillment.read.value.blob.bytes
            
            div.querySelector("img").src = `data:image/png;base64,${imageBytes}`
        }

        const intervalId = setInterval(updateImage, 5000)
        updateImage()

        return () => {
            clearInterval(intervalId)
        }
    })
}

export default HappyDog