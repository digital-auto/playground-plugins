const plugin = ({widgets, simulator}) => {
    let currentSpeed = 0
    const listeners = []

    const intervalId = setInterval(async () => {
        const response = await fetch("https://vgd7t3zat5.execute-api.ap-south-1.amazonaws.com/V1/bcw/veh/status")
        const responseJson = await response.json()
        for (const listener of listeners) {
            currentSpeed = responseJson.speed
            await listener(responseJson.speed)
        }
    }, 5000)

    simulator("Vehicle.Speed", "subscribe", async ({args}) => {
        listeners[0] = args[0]
    })

    simulator("Vehicle.Speed", "get", async ({args}) => {
        return currentSpeed
    })
}

export default plugin