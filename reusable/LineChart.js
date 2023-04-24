// type SignalsType = {
//     signal: string
//     color?: string
// }[]

import loadScript from "./loadScript.js";

const supportsIteratorApis = (vehicle) => {
    try {
        vehicle.IteratorEnded.get()
        return true
    } catch (error) {
        console.log("supportsIteratorApis Error:", error)
        return false
    }
}

const LineChart = (signals, vehicle, refreshTime = 800) => {

    return (box) => {
        let isRunning = false;
        box.window.addEventListener("message", function(e){
            if(!e.data) return
            if(e.data == 'startRun') isRunning = true
            if(e.data == 'stopRun') isRunning = false
        }, false);

        const container = document.createElement("div")
        container.style = "width: 100%; height: 100%; padding: 5px;"
        container.innerHTML = (`
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
        }
        </style>
        <canvas width="100%" height="100%"></canvas>
        `)

        let intervalId = null

        if (supportsIteratorApis(vehicle)) {
            let chart = null

            loadScript(box.window, "https://cdn.jsdelivr.net/npm/chart.js").then(() => {
                const ctx = container.querySelector('canvas').getContext('2d');
    
                chart = new box.window.Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: signals.map(signal => ({
                            label: signal.signal,
                            data: [],
                            fill: false,
                            borderColor: signal.color || 'rgb(0, 80, 114)',
                            tension: 0.1
                        }))
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false                  
                    }
                });
            })
    
            box.injectNode(container)
    
            intervalId = setInterval(async () => {
                try {
                    if(!isRunning) return false
                    if (chart === null) {
                        throw new Error("Chart.js hasn't been loaded yet.")
                    }
        
                    const getDataset = (signalName) => {
                        return chart.data.datasets.find(dataset => dataset.label === signalName)
                    }
        
                    const entries = (await Promise.all(signals.map(async signal => {
                        const iteratorEnded = await vehicle.IteratorEnded.get()
        
                        const stripped = signal.signal.split(".").slice(1).join(".")
                        const newValue = await vehicle[stripped].get()
                        
        
                        if (newValue === null && iteratorEnded) {
                            //console.log(`iteratorEnded ================================`)
                            return [signal.signal, null]
                        }
        
                        return [signal.signal, newValue]
                    })))
        
                    const shouldPushData = entries.find(([signal, value]) => value !== null)
        
                    if (!shouldPushData) {
                        return false
                    }
        
                    for (const [signalName, value] of entries) {
                        const dataset = getDataset(signalName)
                        dataset.data.push(value)
                    }
        
                    chart.data.labels.push(chart.data.labels.length + 1)
                    chart.update()

                } catch(e) {
                    console.log("err inside chart interval")
                    console.log(e)
                }
            }, refreshTime)
        } else {
            alert("LineChart plugin doesn't support vehicle pin without Wishlist sensor 'Vehicle.IteratorEnded'.")
        }

        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId)
            }
        }
    }
}

export default LineChart