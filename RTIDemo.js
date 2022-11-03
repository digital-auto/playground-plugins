import AnimatedWipers from "./reusable/AnimatedWipers.js"

const RTIDemo = ({widgets, vehicle}) => {
    widgets.register("AnimatedWipers", AnimatedWipers("Vehicle.Body.Windshield.Front.Wiping.Mode", vehicle))
}

export default RTIDemo