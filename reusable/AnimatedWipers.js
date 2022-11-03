const AnimatedWipers = () => {
    let iframe = null
    const onActivate = (box) => {
        iframe = document.createElement("iframe")
        iframe.src = "https://aiotapp.net/wiper/simulator"
        iframe.setAttribute("frameborder", "0")
        iframe.style = "width:100%; height:100%;"
        box.injectNode(iframe)

        return () => {
            iframe = null
        }
    }

    const setWiperSpeed = (speed) => {
        if (!["OFF", "LO", "HI"].includes(speed)) {
            throw new Error(`Wiper Speed must be one of "OFF", "LO", or "HI"`)
        }
        if (iframe === null) {
            throw new Error(`AnimatedWipers widget is not mounted.`)
        }
    }

    return [onActivate, setWiperSpeed]
}

export default AnimatedWipers