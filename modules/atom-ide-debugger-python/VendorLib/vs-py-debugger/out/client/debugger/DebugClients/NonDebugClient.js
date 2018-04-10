"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebugClient_1 = require("./DebugClient");
const LocalDebugClient_1 = require("./LocalDebugClient");
class NonDebugClient extends LocalDebugClient_1.LocalDebugClient {
    // tslint:disable-next-line:no-any
    constructor(args, debugSession, canLaunchTerminal, launcherScriptProvider) {
        super(args, debugSession, canLaunchTerminal, launcherScriptProvider);
    }
    get DebugType() {
        return DebugClient_1.DebugType.RunLocal;
    }
    Stop() {
        super.Stop();
        if (this.pyProc) {
            try {
                this.pyProc.kill();
                // tslint:disable-next-line:no-empty
            }
            catch (_a) { }
            this.pyProc = undefined;
        }
    }
    handleProcessOutput(proc, _failedToLaunch) {
        this.pythonProcess.attach(proc);
    }
}
exports.NonDebugClient = NonDebugClient;
//# sourceMappingURL=NonDebugClient.js.map