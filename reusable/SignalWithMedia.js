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

        const buildMediaHtmlText = (valueMedia, value) => {
            let innerHTML = ''
            for (let key in valueMedia) {
                let media = valueMedia[key]
                if (typeof media === "undefined") {
                    continue
                }
                if (media.type === "video") {
                    innerHTML += `
                        <video id='${key}'
                        playsinline autoplay muted
                        src='${media.url}'
                        style="display:${String(key)==String(value)?'block':'none'};height: 100%; width: 100%; object-fit: contain;"
                        ></video>
                        `
                } else {
                    innerHTML += `
                        <img id='${key}'
                        src='${media.url}'
                        style="display:${key==value?'block':'none'};height: 100%; width: 100%; object-fit: contain;"
                        onerror="this.style.visibility='hidden'"
                        onload="this.style.visibility='visible'"
                        ></video>
                        `
                }
            }
            return innerHTML
        }
        
        const intervalId = setInterval(async () => {
            const strippedApi = vssSignal.split(".").slice(1).join(".")
            const value = await vehicle[strippedApi].get()
            if(!div.innerHTML) {
                div.innerHTML = buildMediaHtmlText(valueMedia, value)
            } else {
                for (let key in valueMedia) {
                    let media = valueMedia[key]
                    if (typeof media === "undefined") {
                        continue
                    }
                    let mediaTag = div.querySelector(`[id='${key}']`)
                    if (mediaTag) {
                        mediaTag.style.display = String(key)==String(value)?'block':'none'
                    }
                    
                }
            }
        }, 300)
        
        return () => {
            clearInterval(intervalId)
        }
    }
}

export default SignalWithMedia