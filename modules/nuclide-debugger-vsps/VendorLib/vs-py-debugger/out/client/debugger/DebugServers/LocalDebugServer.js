"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_debugadapter_1 = require("vscode-debugadapter");
const net = require("net");
const BaseDebugServer_1 = require("./BaseDebugServer");
class LocalDebugServer extends BaseDebugServer_1.BaseDebugServer {
    constructor(debugSession, pythonProcess) {
        super(debugSession, pythonProcess);
        this.debugSocketServer = null;
    }
    Stop() {
        if (this.debugSocketServer === null) {
            return;
        }
        try {
            this.debugSocketServer.close();
        }
        catch (ex) { }
        this.debugSocketServer = null;
    }
    Start() {
        return new Promise((resolve, reject) => {
            let that = this;
            let connectedResolve = this.debugClientConnected.resolve.bind(this.debugClientConnected);
            let connected = false;
            this.debugSocketServer = net.createServer(c => {
                // "connection" listener
                c.on("data", (buffer) => {
                    if (connectedResolve) {
                        // The debug client has connected to the debug server
                        connectedResolve(true);
                        connectedResolve = null;
                    }
                    if (!connected) {
                        connected = that.pythonProcess.Connect(buffer, c, false);
                    }
                    else {
                        that.pythonProcess.HandleIncomingData(buffer);
                        that.isRunning = true;
                    }
                });
                c.on("close", d => {
                    that.emit("detach", d);
                });
                c.on("timeout", d => {
                    let msg = "Debugger client timedout, " + d;
                    that.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(msg + "\n", "stderr"));
                });
            });
            this.debugSocketServer.on("error", ex => {
                let exMessage = JSON.stringify(ex);
                let msg = "";
                if (ex.code === "EADDRINUSE") {
                    msg = `The port used for debugging is in use, please try again or try restarting Visual Studio Code, Error = ${exMessage}`;
                }
                else {
                    if (connected) {
                        // Under what circumstance does this happen?
                        // Needs to be documented
                        return;
                    }
                    msg = `There was an error in starting the debug server. Error = ${exMessage}`;
                }
                that.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(msg + "\n", "stderr"));
                reject(msg);
            });
            this.debugSocketServer.listen(0, () => {
                let server = that.debugSocketServer.address();
                resolve({ port: server.port });
            });
        });
    }
}
exports.LocalDebugServer = LocalDebugServer;
//# sourceMappingURL=LocalDebugServer.js.map