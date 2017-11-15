"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
// Borrowed from omnisharpServer.ts (omnisharp-vscode)
class Delays {
    constructor() {
        this.immediateDelays = 0; // 0-25 milliseconds
        this.nearImmediateDelays = 0; // 26-50 milliseconds
        this.shortDelays = 0; // 51-250 milliseconds
        this.mediumDelays = 0; // 251-500 milliseconds
        this.idleDelays = 0; // 501-1500 milliseconds
        this.nonFocusDelays = 0; // 1501-3000 milliseconds
        this.bigDelays = 0; // 3000+ milliseconds
        this.startTime = Date.now();
    }
    stop() {
        let endTime = Date.now();
        let elapsedTime = endTime - this.startTime;
        if (elapsedTime <= 25) {
            this.immediateDelays += 1;
        }
        else if (elapsedTime <= 50) {
            this.nearImmediateDelays += 1;
        }
        else if (elapsedTime <= 250) {
            this.shortDelays += 1;
        }
        else if (elapsedTime <= 500) {
            this.mediumDelays += 1;
        }
        else if (elapsedTime <= 1500) {
            this.idleDelays += 1;
        }
        else if (elapsedTime <= 3000) {
            this.nonFocusDelays += 1;
        }
        else {
            this.bigDelays += 1;
        }
    }
    toMeasures() {
        return {
            immedateDelays: this.immediateDelays,
            nearImmediateDelays: this.nearImmediateDelays,
            shortDelays: this.shortDelays,
            mediumDelays: this.mediumDelays,
            idleDelays: this.idleDelays,
            nonFocusDelays: this.nonFocusDelays
        };
    }
}
exports.Delays = Delays;
const extensionId = "donjayamanne.python";
const extension = vscode_1.extensions.getExtension(extensionId);
const extensionVersion = extension.packageJSON.version;
const aiKey = "2f1b85ee-b1eb-469f-8ae3-5adb7114efd7";
let reporter = new vscode_extension_telemetry_1.default(extensionId, extensionVersion, aiKey);
/**
 * Sends a telemetry event
 * @param {string} eventName The event name
 * @param {object} properties An associative array of strings
 * @param {object} measures An associative array of numbers
 */
function sendTelemetryEvent(eventName, properties, measures) {
    reporter.sendTelemetryEvent.apply(reporter, arguments);
}
exports.sendTelemetryEvent = sendTelemetryEvent;
//# sourceMappingURL=telemetry.js.map