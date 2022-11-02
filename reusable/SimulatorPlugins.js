const SimulatorPlugins = (signalValues, simulator) => {
    let currentIndex = 0

    const APIs = new Set(signalValues.map(signalValueObj => Object.keys(signalValueObj)).flat())

    for (const signal of APIs) {
        simulator(signal, "get", async () => {
            return signalValues[currentIndex][signal]
        })
    }

    simulator("Vehicle.Next", "get", () => {
        if (currentIndex > signalValues.length-1) {
            throw new Error("Undefined Index: Next Simulator Data")
        }
        if (currentIndex === signalValues.length-1) {
            return false
        }
        currentIndex += 1
        return true
    })

    simulator("Vehicle.Reset", "get", () => {
        currentIndex = 0
    })

}

export default SimulatorPlugins