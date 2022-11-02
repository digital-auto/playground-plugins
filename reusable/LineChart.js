// type SignalsType = {
//     signal: string
//     color?: string
// }[]

import loadScript from "./loadScript.js";

const LineChart = (signals, vehicle) => {
    return (box) => {
        const container = document.createElement("div")
        container.innerHTML = (`
        <canvas width="100%" height="100%"></canvas>
        `)

        const ctx = container.querySelector('canvas').getContext('2d');
        loadScript(box.window, "https://cdn.jsdelivr.net/npm/chart.js").then(() => {
            new box.window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })

        box.injectNode(container)
    }
}

export default LineChart