'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const os_1 = require("os");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const BaseDebugServer_1 = require("./BaseDebugServer");
class LocalDebugServer extends BaseDebugServer_1.BaseDebugServer {
    constructor(debugSession, pythonProcess, args) {
        super(debugSession, pythonProcess);
        this.args = args;
    }
    Stop() {
        if (!this.debugSocketServer) {
            return;
        }
        try {
            this.debugSocketServer.close();
            // tslint:disable-next-line:no-empty
        }
        catch (_a) { }
        this.debugSocketServer = undefined;
    }
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let connectedResolve = this.debugClientConnected.resolve.bind(this.debugClientConnected);
                let connected = false;
                let disconnected = false;
                this.debugSocketServer = net.createServer(c => {
                    // "connection" listener
                    c.on('data', (buffer) => {
                        if (connectedResolve) {
                            // The debug client has connected to the debug server
                            connectedResolve(true);
                            connectedResolve = null;
                        }
                        if (!connected) {
                            connected = this.pythonProcess.Connect(buffer, c, false);
                        }
                        else {
                            this.pythonProcess.HandleIncomingData(buffer);
                            this.isRunning = true;
                        }
                    });
                    c.on('close', d => {
                        disconnected = true;
                        this.emit('detach', d);
                    });
                    c.on('timeout', d => {
                        const msg = `Debugger client timedout, ${d}`;
                        this.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(`${msg}${os_1.EOL}`, 'stderr'));
                    });
                    c.on('error', ex => {
                        // Errors can be raised, when program has termined, but the adapter has
                        // sent an acknowledgement of the last message (LAST), however the socket client has ended.
                        if (connected || disconnected) {
                            return;
                        }
                        const msg = `There was an error in starting the debug server. Error = ${JSON.stringify(ex)}`;
                        this.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(`${msg}${os_1.EOL}`, 'stderr'));
                        reject(msg);
                    });
                });
                this.debugSocketServer.on('error', ex => {
                    const exMessage = JSON.stringify(ex);
                    let msg = '';
                    // tslint:disable-next-line:no-any
                    if (ex.code === 'EADDRINUSE') {
                        msg = `The port used for debugging is in use, please try again or try restarting Visual Studio Code, Error = ${exMessage}`;
                    }
                    else {
                        if (connected) {
                            return;
                        }
                        msg = `There was an error in starting the debug server. Error = ${exMessage}`;
                    }
                    this.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(`${msg}${os_1.EOL}`, 'stderr'));
                    reject(msg);
                });
                const port = typeof this.args.port === 'number' ? this.args.port : 0;
                const host = typeof this.args.host === 'string' && this.args.host.trim().length > 0 ? this.args.host.trim() : 'localhost';
                this.debugSocketServer.listen({ port, host }, () => {
                    const server = this.debugSocketServer.address();
                    resolve({ port: server.port });
                });
            });
        });
    }
}
exports.LocalDebugServer = LocalDebugServer;
//# sourceMappingURL=LocalDebugServer.js.map