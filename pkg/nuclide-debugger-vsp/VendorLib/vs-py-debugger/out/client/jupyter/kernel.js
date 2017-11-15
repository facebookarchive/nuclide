"use strict";
// http://jupyter-client.readthedocs.io/en/latest/messaging.html#to-do
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Kernel extends vscode.Disposable {
    constructor(kernelSpec, language) {
        super(() => { });
        this.kernelSpec = kernelSpec;
        this.language = language;
        this._onStatusChange = new vscode.EventEmitter();
        this.watchCallbacks = [];
    }
    dispose() {
    }
    get onStatusChange() {
        return this._onStatusChange.event;
    }
    raiseOnStatusChange(status) {
        this._onStatusChange.fire([this.kernelSpec, status]);
    }
    addWatchCallback(watchCallback) {
        return this.watchCallbacks.push(watchCallback);
    }
    ;
    _callWatchCallbacks() {
        return this.watchCallbacks.forEach(watchCallback => {
            watchCallback();
        });
    }
    ;
}
exports.Kernel = Kernel;
//# sourceMappingURL=kernel.js.map