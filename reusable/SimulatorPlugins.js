const SimulatorPlugins = (signalValues, simulator) => {
    let currentIndex = 0

    const APIs = new Set(signalValues.map(signalValueObj => Object.keys(signalValueObj)).flat())

    for (const signal of APIs) {
        simulator(signal, "get", async () => {
            return signalValues[currentIndex][signal]
        })
    }

    simulator("Vehicle.Next", "get", () => {
        currentIndex += 1
        if (currentIndex >= signalValues.length) {
            currentIndex = 0
        }
    })

    simulator("Vehicle.Reset", "get", () => {
        currentIndex = 0
    })

}

export default SimulatorPlugins