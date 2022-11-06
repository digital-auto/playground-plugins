const Terminal = ({widgets}) => {
    let print = null, reset = null
    widgets.register("Terminal", (box) => {
        const div = document.createElement("div")
        div.innerHTML = `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">
        <div class="flex flex-col text-gray-100 text-sm subpixel-antialiased bg-gray-800 leading-normal overflow-auto h-48 scroll-gray h-full">
            <div class="top flex items-center sticky top-0 left-0 bg-gray-800 px-5 pt-4 pb-2">
                <div class="select-none">Terminal</div>
            </div>
            <div class="flex flex-col h-full px-5 text-xs terminal-lines"></div>
        </div>
        `
        box.injectNode(div)

        print = (text) => {
            const line = document.createElement("div")
            line.className = "flex mt-2 font-mono last:pb-4"
            line.innerHTML = `
            <span class="text-green-400 select-none">&gt;&gt;&gt;</span>
            <p class="flex-1 items-center pl-2 whitespace-pre-line">${text}</p>
            `
            div.querySelector(".terminal-lines").appendChild(line)
        }

        reset = () => {
            div.querySelector(".terminal-lines").textContent = ""
        }

        return () => {
            print = null
        }
    })

    return {
        print: (text) => {
            if (print !== null) {
                print(text)
            }
        },
        reset: () => {
            if (reset !== null) {
                reset()
            }
        }
    }
}

export default Terminal