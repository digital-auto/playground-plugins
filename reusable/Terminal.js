const Terminal = ({widgets}) => {
    widgets.register("Terminal", (box) => {
        box.innerHTML = `
        <div class="flex flex-col text-gray-100 text-sm subpixel-antialiased bg-gray-800 leading-normal overflow-auto h-48 scroll-gray">
            <div class="top flex items-center sticky top-0 left-0 bg-gray-800 px-5 pt-4 pb-2">
                <div class="select-none">Terminal</div>
            </div>
            <div class="flex flex-col h-full px-5 text-xs">
                <div class="mt-2 flex font-mono last:pb-4">
                    <span class="text-green-400 select-none">&gt;&gt;&gt;</span>
                    <p class="flex-1 items-center pl-2 whitespace-pre-line">
                        <span class="">Starting Now: Passenger Welcome - 08:11:51</span>
                        <span class="">Ending Now: Passenger Welcome</span>
                    </p>
                </div>
            </div>
        </div>
        `
    })
}

export default Terminal