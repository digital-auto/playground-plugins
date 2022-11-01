"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadScript_js_1 = require("./loadScript.js");
const SignalPills = (pills, vehicle) => {
    return (box) => {
        const div = document.createElement("div");
        div.innerHTML = (`
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Lato', sans-serif;
        }
        </style>
        <div style="height: 100%; padding: 10px; display: flex; flex-direction: column;">
            ${pills.map((pill, i) => (`
                <div style="display: flex; height: 100%; background-color: rgb(0 80 114); color: white; padding: 15px; border-radius: 15px; user-select: none; align-items: center;${i !== pills.length - 1 && 'margin-bottom: 7px;'}" data-signal="${pill.signal}">
                    <div style="display: flex; flex-direction: column; overflow: hidden; width: 100%;">
                        <div style="margin-bottom: 10px; overflow: hidden;text-overflow: ellipsis; font-size: 0.75em;" title="${pill.signal}">${pill.signal}</div>
                        <div style="font-size: 1.1em;" class="signal-value">No Value Yet</div>
                    </div>
                    ${pill.icon && `<div style="margin-left: auto; height: 100%; margin-left: 6px;">${pill.icon}</div>`}
                </div>
            `)).join("")}
        </div>
        `);
        const intervalId = setInterval(async () => {
            for (const { signal } of pills) {
                const strippedApi = signal.split(".").slice(1).join(".");
                const signalValueEl = div.querySelector(`[data-signal="${signal}"] .signal-value`);
                if (signalValueEl !== null) {
                    signalValueEl.textContent = await vehicle[strippedApi].get();
                }
                else {
                    throw new Error(`Signal Pill ${signal} div couldn't be found.`);
                }
            }
        }, 300);
        box.injectNode(div);
        (0, loadScript_js_1.default)(box.window, "https://kit.fontawesome.com/c37d34b852.js");
        return () => {
            clearInterval(intervalId);
        };
    };
};
exports.default = SignalPills;
