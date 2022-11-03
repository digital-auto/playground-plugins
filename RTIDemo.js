import AnimatedWipers from "./reusable/AnimatedWipers"

const RTIDemo = ({widgets, simulator}) => {
    widgets.register("AnimatedWipers", (box) => {
        const [onActivate, setWiperSpeed] = AnimatedWipers()
        return onActivate(box)
    })
}

export default RTIDemo