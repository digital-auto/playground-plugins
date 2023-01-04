import GoogleMapsPluginApi from "./reusable/GoogleMapsPluginApi.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js"

const plugin = ({widgets, simulator}) => {
    let boxGlobal = null
    
    widgets.register("Directions", (box) => {
        boxGlobal = box
        box.injectHTML("<div style='display: flex; height: 100%; width: 100%; justify-content: center; align-items: center; text-align: center; font-family: sans-serif; color: #6b7280; user-select: none;'>Pass lat/lng from prototype code, and run to create map.</div>")
        return () => {
            boxGlobal = null
            // Deactivation function for clearing intervals or such.
        }
    })

    return {
        createDirections: (path) => {
            if (boxGlobal !== null) {
                GoogleMapsPluginApi(PLUGINS_APIKEY, boxGlobal, path)
            }
        }
    }
}

export default plugin