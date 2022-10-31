// type signal_value_images = {
//     [value: string]: {
//         type: "image" | "video",
//         url: string
//     }
// }

const SignalWithMedia = (
    vssSignal, //: string
    valueMedia, //: signal_value_images
    vehicle
) => {
    return (box) => {
        const div = document.createElement("div")
        div.style = "height: 100%; width: 100%;"
        box.injectNode(div)
        
        const intervalId = setInterval(async () => {
            const strippedApi = vssSignal.split(".").slice(1).join(".")
            const media = valueMedia[await vehicle[strippedApi].get()]
            if (typeof media === "undefined") {
                div.innerHTML = ""
            } else if (media.type === "video") {
                // Using extra clauses to do minimum changes to DOM
                if (div.querySelector("video") !== null) {
                    if (div.querySelector("video").src !== media.url) {
                        div.querySelector("video").src = media.url
                    }
                } else {
                    div.innerHTML = `
                    <video
                    playsinline autoplay muted
                    src='${media.url}'
                    style="height: 100%; width: 100%; object-fit: contain;"
                    />
                    `        
                }
            } else {
                // Using extra clauses to do minimum changes to DOM
                if (div.querySelector("img") !== null) {
                    if (div.querySelector("img").src !== media.url) {
                        div.querySelector("img").src = media.url
                    }
                } else {
                    div.innerHTML = `
                    <img
                    src='${media.url}'
                    style="height: 100%; width: 100%; object-fit: contain;"
                    onerror="this.style.visibility='hidden'"
                    onload="this.style.visibility='visible'"
                    />
                    `        
                }
            }
        }, 300)
        
        return () => {
            clearInterval(intervalId)
        }
    }
}

export default SignalWithMedia