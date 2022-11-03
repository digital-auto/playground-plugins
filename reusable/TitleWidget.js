const TitleWidget = (title, size = 1) => {
    return (box) => {
        const container = document.createElement("div")
        container.style.fontSize = size.toString() + "em"
        container.innerHTML = (`
        <style>
		@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
        }
		</style>
        `)
        const div = document.createElement("div")
        div.style = "display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #9ca3af; text-align: center; padding: 5px; user-select: none; font-size: 1.2em;"
        div.textContent = title
        container.appendChild(div)
        box.injectNode(container)
    }
}

export default TitleWidget