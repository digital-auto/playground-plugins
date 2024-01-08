const loadScript = (boxWindow, url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const script = boxWindow.document.createElement("script");
            script.defer = true;
            script.referrerPolicy = "origin"

            script.src = url;
            boxWindow.document.head.appendChild(script);
            script.addEventListener("load", () => resolve(undefined));
        } catch (e) {
            reject();
        }
    });
}

export default loadScript