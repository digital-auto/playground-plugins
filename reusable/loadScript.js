const loadScript = (boxWindow, url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const script = boxWindow.document.createElement("script");
            script.defer = true;

            script.src = url;
            boxWindow.document.head.appendChild(script);
            script.addEventListener("load", () => resolve());
        } catch (e) {
            reject();
        }
    });
}

export default loadScript