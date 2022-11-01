import loadScript from "./loadScript.js"

// type PillType = {
//     signal: string
//     icon?: string
// }

const SignalSquare = (pill, vehicle) => {
    return (box) => {
        const div = document.createElement("div")
        div.innerHTML = (`
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
        }
        </style>
        <div style="height: 100%; padding: 10px; display: flex; flex-direction: column;">
            <div style="display: flex; height: 100%; background-image: linear-gradient(#ff836f, #f95850); color: white; padding: 15px; border-radius: 15px; user-select: none; align-items: center;" data-signal="${pill.signal}">
                <div style="display: flex; flex-direction: column; overflow: hidden; width: 100%;">
                    <div style="margin-bottom: 10px; overflow: hidden;text-overflow: ellipsis; font-size: 0.75em;" title="${pill.signal}">${pill.signal}</div>
                    <div style="font-size: 1.1em;" class="signal-value">No Value Yet</div>
                </div>
                ${pill.icon && `<div style="margin-left: auto;height: 100%;margin-left: 10px;margin-right: 4px;margin-top: 4px;"><i style="font-size: 1.3em;" class="fa-solid fa-${pill.icon}"></i></div>`}
            </div>
        </div>
        `)

        const intervalId = setInterval(async () => {
            for (const {signal} of pills) {
                const strippedApi = signal.split(".").slice(1).join(".")
                const signalValueEl = div.querySelector(`[data-signal="${signal}"] .signal-value`)
                if (signalValueEl !== null) {
                    signalValueEl.textContent = await vehicle[strippedApi].get()
                } else {
                    throw new Error(`Signal Pill ${signal} div couldn't be found.`)
                }
            }
        }, 300)

        box.injectNode(div)

        loadScript(box.window, "https://kit.fontawesome.com/c37d34b852.js")

        return () => {
            clearInterval(intervalId)
        }
    }
}

export default SignalSquare