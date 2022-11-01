"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadScript = (window, url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const script = window.document.createElement("script");
            script.defer = true;
            script.src = url;
            window.document.head.appendChild(script);
            script.addEventListener("load", () => resolve());
        }
        catch (e) {
            reject();
        }
    });
};
exports.default = loadScript;
