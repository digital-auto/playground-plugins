// type SignalsType = {
//     signal: string
//     color?: string
// }[]

import loadScript from "./loadScript.js";

const LineChart = (signals, vehicle) => {
    return (box) => {
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
                        borderColor: 'rgb(75, 192, 192)',
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

        const intervalId = setInterval(async () => {
            if (chart === null) {
                throw new Error("Chart.js hasn't been loaded yet.")
            }

            const getDataset = (signalName) => {
                return chart.data.datasets.find(dataset => dataset.label === signalName)
            }

            const entries = (await Promise.all(signals.map(async signal => {
                const prevValue = getDataset(signal.signal)[0]

                const stripped = signal.signal.split(".").slice(1).join(".")
                const newValue = await vehicle[stripped].get()

                if (typeof prevValue !== "undefined" && prevValue === newValue) {
                    return [signal.signal, null]
                } else {
                    return [signal.signal, newValue]
                }
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
        }, 300)

        return () => {
            clearInterval(intervalId)
        }
    }
}

export default LineChart