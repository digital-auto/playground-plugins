import loadScript from "./loadScript.js"

// type PillType = {
//     signal: string
//     icon?: string
// }

const SignalTile = (pill, vehicle) => {
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
            <div style="display: flex; flex-direction: column; height: 100%; background-image: linear-gradient(#1d4882, #688cc3); color: white; padding: 35px 15px; border-radius: 25px 15px; user-select: none; align-items: center;" data-signal="${pill.signal}">
                <div style="margin-bottom: 10px; font-size: 0.75em;" title="${pill.signal}">${pill.signal}</div>
                <div style="font-size: 1.1em;" class="signal-value">No Value Yet</div>
                ${pill.icon && `<div style="margin-top: auto;"><i style="font-size: 3em;" class="fa-solid fa-${pill.icon}"></i></div>`}
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

export default SignalTile