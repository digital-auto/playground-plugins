const loadScript = (window: Window, url: string) => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const script = window.document.createElement("script");
            script.defer = true;

            script.src = url;
            window.document.head.appendChild(script);
            script.addEventListener("load", () => resolve());
        } catch (e) {
            reject();
        }
    });
}

export default loadScript