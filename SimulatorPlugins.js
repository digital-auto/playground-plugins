const SimulatorPlugins = (signalValues, simulator) => {
    let currentIndex = 0

    for (const signal of ["Vehicle.CurrentLocation.Longitude", "Vehicle.Speed", "Vehicle.CurrentLocation.Latitude"]) {
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