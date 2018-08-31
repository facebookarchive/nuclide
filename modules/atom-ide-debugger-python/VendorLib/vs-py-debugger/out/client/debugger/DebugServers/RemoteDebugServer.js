// tslint:disable:quotemark ordered-imports no-any no-empty curly member-ordering one-line max-func-body-length no-var-self prefer-const cyclomatic-complexity prefer-template no-this-assignment
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_debugadapter_1 = require("vscode-debugadapter");
const Contracts_1 = require("../Common/Contracts");
const net = require("net");
const BaseDebugServer_1 = require("./BaseDebugServer");
const SocketStream_1 = require("../../common/net/socket/SocketStream");
const DebuggerProtocolVersion = 6; // must be kept in sync with PTVSDBG_VER in attach_server.py
const DebuggerSignature = "PTVSDBG";
const Accepted = "ACPT";
const DebuggerSignatureBytes = new Buffer(DebuggerSignature, "ascii");
const AttachCommandBytes = new Buffer("ATCH", "ascii");
class RemoteDebugServer extends BaseDebugServer_1.BaseDebugServer {
    constructor(debugSession, pythonProcess, args) {
        super(debugSession, pythonProcess);
        this.args = args;
    }
    Stop() {
        if (!this.socket)
            return;
        try {
            this.socket.end();
        }
        catch (ex) { }
        this.socket = undefined;
    }
    Start() {
        return new Promise((resolve, reject) => {
            let that = this;
            let connected = false;
            let secretWrittenToDebugProgram = false;
            let secretConfirmedByDebugProgram = false;
            let commandBytesWritten = false;
            let languageVersionRead = false;
            let portNumber = this.args.port;
            let debugCommandsAccepted = false;
            let options = { port: portNumber };
            if (typeof this.args.host === "string" && this.args.host.length > 0) {
                options.host = this.args.host;
            }
            this.socket = net.connect(options, () => {
                resolve(options);
            });
            this.socket.on("end", (ex) => {
                // let msg = `Debugger client disconneced, ex`;
                // that.debugSession.sendEvent(new OutputEvent(msg + "\n", "stderr"));
            });
            this.socket.on("data", (buffer) => {
                if (connected) {
                    that.pythonProcess.HandleIncomingData(buffer);
                    return;
                }
                if (!that.stream) {
                    that.stream = new SocketStream_1.SocketStream(that.socket, buffer);
                }
                else {
                    if (!connected) {
                        if (that.stream.Length === 0) {
                            that.stream = new SocketStream_1.SocketStream(that.socket, buffer);
                        }
                        else {
                            that.stream.Append(buffer);
                        }
                    }
                }
                if (!secretWrittenToDebugProgram) {
                    that.stream.BeginTransaction();
                    let sig = that.stream.ReadAsciiString(DebuggerSignature.length);
                    if (that.stream.HasInsufficientDataForReading) {
                        that.stream.RollBackTransaction();
                        return;
                    }
                    if (sig !== DebuggerSignature) {
                        throw new Error("ConnErrorMessages.RemoteUnsupportedServer");
                    }
                    let ver = that.stream.ReadInt64();
                    if (that.stream.HasInsufficientDataForReading) {
                        that.stream.RollBackTransaction();
                        return;
                    }
                    // If we are talking the same protocol but different version, reply with signature + version before bailing out
                    // so that ptvsd has a chance to gracefully close the socket on its side.
                    that.stream.EndTransaction();
                    that.stream.Write(DebuggerSignatureBytes);
                    that.stream.WriteInt64(DebuggerProtocolVersion);
                    if (ver !== DebuggerProtocolVersion) {
                        throw new Error("ConnErrorMessages.RemoteUnsupportedServer");
                    }
                    that.stream.WriteString(that.args.secret || "");
                    secretWrittenToDebugProgram = true;
                    that.stream.EndTransaction();
                    let secretResp = that.stream.ReadAsciiString(Accepted.length);
                    if (that.stream.HasInsufficientDataForReading) {
                        that.stream.RollBackTransaction();
                        return;
                    }
                    if (secretResp !== Accepted) {
                        throw new Error("ConnErrorMessages.RemoteSecretMismatch");
                    }
                    secretConfirmedByDebugProgram = true;
                    that.stream.EndTransaction();
                }
                if (!secretConfirmedByDebugProgram) {
                    let secretResp = that.stream.ReadAsciiString(Accepted.length);
                    if (that.stream.HasInsufficientDataForReading) {
                        that.stream.RollBackTransaction();
                        return;
                    }
                    if (secretResp !== Accepted) {
                        throw new Error("ConnErrorMessages.RemoteSecretMismatch");
                    }
                    secretConfirmedByDebugProgram = true;
                    that.stream.EndTransaction();
                }
                if (!commandBytesWritten) {
                    that.stream.Write(AttachCommandBytes);
                    let debugOptions = "WaitOnAbnormalExit, WaitOnNormalExit, RedirectOutput";
                    if (Array.isArray(this.args.debugOptions)) {
                        debugOptions = this.args.debugOptions.filter(opt => Contracts_1.VALID_DEBUG_OPTIONS.indexOf(opt) >= 0).join(',');
                    }
                    that.stream.WriteString(debugOptions);
                    commandBytesWritten = true;
                }
                if (commandBytesWritten && !debugCommandsAccepted) {
                    let attachResp = that.stream.ReadAsciiString(Accepted.length);
                    if (that.stream.HasInsufficientDataForReading) {
                        that.stream.RollBackTransaction();
                        return;
                    }
                    if (attachResp !== Accepted) {
                        throw new Error("ConnErrorMessages.RemoteAttachRejected");
                    }
                    debugCommandsAccepted = true;
                    that.stream.EndTransaction();
                }
                if (debugCommandsAccepted && !languageVersionRead) {
                    that.stream.EndTransaction();
                    that.stream.ReadInt32();
                    that.stream.ReadInt32();
                    that.stream.ReadInt32();
                    that.stream.ReadInt32();
                    if (that.stream.HasInsufficientDataForReading) {
                        that.stream.RollBackTransaction();
                        return;
                    }
                    that.stream.EndTransaction();
                    languageVersionRead = true;
                }
                if (languageVersionRead) {
                    if (connected) {
                        that.pythonProcess.HandleIncomingData(buffer);
                    }
                    else {
                        that.pythonProcess.Connect(that.stream.Buffer, this.socket, true);
                        connected = true;
                    }
                }
            });
            this.socket.on("close", d => {
                that.emit("detach", d);
            });
            this.socket.on("timeout", d => {
                let msg = `Debugger client timedout, ${d}`;
                that.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(msg + "\n", "stderr"));
            });
            this.socket.on("error", ex => {
                if (connected) {
                    return;
                }
                let exMessage = JSON.stringify(ex);
                let msg = `There was an error in starting the debug server. Error = ${exMessage}`;
                that.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(msg + "\n", "stderr"));
                reject(msg);
            });
        });
    }
}
exports.RemoteDebugServer = RemoteDebugServer;
//# sourceMappingURL=RemoteDebugServer.js.map