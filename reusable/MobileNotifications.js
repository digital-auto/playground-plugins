/*
** This is a generic plugin to show notifications on a mobile device. 
** The notification messages are published on the image of a mobile device.
**  It needs the following parameters:
** box, apis, vehicle, refresh
** all the options are mandatory but if you do not want to show the notification based on
** VSS signal values, then you can send apis, vehicle and refresh as null
*/
const MobileNotifications = ({box, apis = null, vehicle = null, refresh = null, paddingTop = 25, paddingHorizontal = 12, backgroundColor = null}) => {
    const container = document.createElement("div")
    container.setAttribute("style", `height: 100%; width: 100%;`)
    container.innerHTML = (`
    <style>
		@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
            color:#ffffe3;
            background-color:${backgroundColor};
            text-align:center;            
        }
		</style>
    <div style="max-width: fit-content; margin: 0 auto; position: relative;">
    <img src="https://firebasestorage.googleapis.com/v0/b/digital-auto.appspot.com/o/media%2FDashboardPhone.png?alt=media&token=d361018a-b4b3-42c0-8ef0-16c9e70fd9c7" style="height: 100%; width: 100%; object-fit: contain;">
        <div class="smartphone-text" style="position: absolute; color: white; font-family: 'Lato'; width: 100%; top: 0; height: 100%; box-sizing: border-box; padding-top: ${paddingTop}px; padding-right: ${paddingHorizontal}px; padding-left: ${paddingHorizontal}px; padding-bottom: 25px; white-space: break-spaces;"></div>
    </div>
    `)
    box.injectNode(container)

    const updateNotification = async () => {
        if(apis !== null || apis !== undefined) {
            for (const api of apis) {
                const stripped = api.split(".").slice(1).join(".")
                const val = await vehicle[stripped].get()
                if (box !== null) {
                    container.querySelector(".smartphone-text").textContent = val
                }
            }
        }                    
    }

    if (refresh !== null) {
        if (typeof refresh !== "number") {
            throw new Error("parameter 'refresh' must be an error")
        }
        const intervalId = setInterval(updateNotification, refresh)
        return () => clearInterval(intervalId)
    }

    return {
        printNotification: (message) => {
            if(message !== undefined || message !== "") {
                container.querySelector(".smartphone-text").textContent = message
            }            
        }
    }

};
  
export default MobileNotifications