const plugin = ({widgets, simulator}) => {
    const container = document.createElement("div")
    container.setAttribute("style", `display:flex; height: 100%; width: 100%;`)
    container.innerHTML = (`
    <div style="max-width: fit-content; margin: 0 auto; position: relative; margin: auto 0;">
        <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FDashboardSpeed.jpg?alt=media&token=44b42de9-12a7-4cb1-b525-94e8fc077141" style="height: fit-content; width: 100%; object-fit: contain;">
        <div class="speedometer-status" style="position: absolute;color: white;font-family: 'Lato';width: 100%;top: 0;height: 100%;box-sizing: border-box;display: flex;justify-content: end;padding-top: 10px;padding-right: 10px;"></div>
    </div>
    `)

    let boxGlobal = null

    widgets.register("Speedometer", (box) => {
        boxGlobal = box
        box.injectNode(container)
        return () => {
            boxGlobal = null
            // Deactivation function for clearing intervals or such.
        }
    })

    let currentValue = ""

    simulator("Vehicle.Cabin.InstrumentPanel.Status", "get", async ({args}) => {
        return currentValue
    })

    simulator("Vehicle.Cabin.InstrumentPanel.Status", "set", async ({args}) => {
        currentValue = args[0]
        if (boxGlobal !== null) {
            container.querySelector(".speedometer-status").textContent = currentValue
        }
        return null
    })

    
    return {}
}

export default plugin