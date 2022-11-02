const HappyDog = ({widgets}) => {
    widgets.register("DogStream", (box) => {
        const div = document.createElement("div")
        div.innerHTML = "<img></img>"
        box.injectNode(div)

        const intervalId = setInterval(async () => {
            const [username, password] = ["bcwdemo", "80jEpKYTPVPi"]
            const response = await fetch("https://bcw.chariottdemo.com:44243/chariott.runtime.v1.ChariottService/Fulfill", {
                headers: {
                    "Authorization":  'Basic ' + Buffer.from(username + ":" + password).toString('base64')
                }
            })
            const json = await response.json()
            const imageBytes = json.fulfillment.read.value.blob.bytes
            
            div.querySelector("img").src = `data:image/png;base64,${imageBytes}`
        }, 5000)

        return () => {
            clearInterval(intervalId)
        }
    })
}

export default HappyDog