const AnimatedWipers = (signal, vehicle) => {
    let setWiperSpeed = null

    setInterval(async () => {
        const stripped = signal.split(".").slice(1).join(".")
        const value = await vehicle[stripped].get()
        console
        if (setWiperSpeed !== null) {
            setWiperSpeed(["FAST", "MEDIUM"].includes(value) ? "HI" : (["INTERVAL", "SLOW"].includes(value) ? "LO" : "OFF"))
        }
    }, 300)

    return (box) => {
        const iframe = document.createElement("iframe")
        // iframe.src = "https://aiotapp.net/wiper/simulator"
        iframe.src="https://playground-plugins.netlify.app/simulator/wiper-iframe/"
        iframe.setAttribute("frameborder", "0")
        iframe.style = "width:100%; height:100%;"
        box.injectNode(iframe)

        setWiperSpeed = (speed) => {
            if (!["OFF", "LO", "HI"].includes(speed)) {
                throw new Error(`Wiper Speed must be one of "OFF", "LO", or "HI"`)
            }
            if (iframe === null) {
                throw new Error(`AnimatedWipers widget is not mounted.`)
            }
            if (iframe.contentWindow !== null) {
                iframe.contentWindow.postMessage(speed, "*")
            }
        }

        return () => {
            setWiperSpeed = null
        }
    }

}

export default AnimatedWipers