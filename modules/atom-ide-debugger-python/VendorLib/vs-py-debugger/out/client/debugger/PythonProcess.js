// tslint:disable:quotemark ordered-imports promise-must-complete member-ordering no-any prefer-template cyclomatic-complexity no-empty no-multiline-string one-line no-invalid-template-strings no-suspicious-comment no-var-self no-require-imports prefer-const
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const ProxyCommands_1 = require("./ProxyCommands");
const idDispenser_1 = require("../common/idDispenser");
const PythonProcessCallbackHandler_1 = require("./PythonProcessCallbackHandler");
const SocketStream_1 = require("../common/net/socket/SocketStream");
class PythonProcess extends events_1.EventEmitter {
    constructor(id, guid, programDirectory) {
        super();
        this.breakpointCommands = [];
        this.id = id;
        this.guid = guid;
        this._threads = new Map();
        this._idDispenser = new idDispenser_1.IdDispenser();
        this.PendingChildEnumCommands = new Map();
        this.PendingExecuteCommands = new Map();
        this.programDirectory = programDirectory;
        this.executeCommandsQueue = [];
    }
    get Id() {
        return this.id;
    }
    get Guid() {
        return this.guid;
    }
    get HasExited() {
        return this.hasExited;
    }
    get MainThread() {
        return this._mainThread;
    }
    get LastExecutedThread() {
        return this._lastExecutedThread;
    }
    get Threads() {
        return this._threads;
    }
    get ProgramDirectory() {
        return this.programDirectory;
    }
    Kill() {
        if (!this.isRemoteProcess && this.pid && typeof this.pid === "number") {
            try {
                let kill = require("tree-kill");
                kill(this.pid);
                this.pid = undefined;
            }
            catch (ex) { }
        }
    }
    Terminate() {
        this.stream.Write(ProxyCommands_1.Commands.ExitCommandBytes);
    }
    Detach() {
        this.stream.Write(ProxyCommands_1.Commands.DetachCommandBytes);
    }
    Connect(buffer, socket, isRemoteProcess = false) {
        this.isRemoteProcess = isRemoteProcess;
        if (!this.stream) {
            this.stream = new SocketStream_1.SocketStream(socket, buffer);
        }
        else {
            this.stream.Append(buffer);
        }
        if (!isRemoteProcess) {
            if (!this.guidRead) {
                this.stream.BeginTransaction();
                this.stream.ReadString();
                if (this.stream.HasInsufficientDataForReading) {
                    this.stream.RollBackTransaction();
                    return false;
                }
                this.guidRead = true;
                this.stream.EndTransaction();
            }
            if (!this.statusRead) {
                this.stream.BeginTransaction();
                this.stream.ReadInt32();
                if (this.stream.HasInsufficientDataForReading) {
                    this.stream.RollBackTransaction();
                    return false;
                }
                this.statusRead = true;
                this.stream.EndTransaction();
            }
            if (!this.pidRead) {
                this.stream.BeginTransaction();
                this.pid = this.stream.ReadInt32();
                if (this.stream.HasInsufficientDataForReading) {
                    this.stream.RollBackTransaction();
                    return false;
                }
                this.pidRead = true;
                this.stream.EndTransaction();
            }
        }
        this.callbackHandler = new PythonProcessCallbackHandler_1.PythonProcessCallbackHandler(this, this.stream, this._idDispenser);
        this.callbackHandler.on("detach", () => this.emit("detach"));
        this.callbackHandler.on("last", () => this.emit("last"));
        this.callbackHandler.on("moduleLoaded", arg => this.emit("moduleLoaded", arg));
        this.callbackHandler.on("asyncBreakCompleted", arg => this.emit("asyncBreakCompleted", arg));
        this.callbackHandler.on("threadCreated", arg => this.emit("threadCreated", arg));
        this.callbackHandler.on("threadExited", arg => this.emit("threadExited", arg));
        this.callbackHandler.on("stepCompleted", arg => this.onPythonStepCompleted(arg));
        this.callbackHandler.on("breakpointSet", arg => this.onBreakpointSet(arg, true));
        this.callbackHandler.on("breakpointNotSet", arg => this.onBreakpointSet(arg, false));
        this.callbackHandler.on("output", (pyThread, output) => this.emit("output", pyThread, output));
        this.callbackHandler.on("exceptionRaised", (pyThread, ex, brkType) => {
            this._lastExecutedThread = pyThread;
            this.emit("exceptionRaised", pyThread, ex, brkType);
        });
        this.callbackHandler.on("breakpointHit", (pyThread, breakpointId) => this.onBreakpointHit(pyThread, breakpointId));
        this.callbackHandler.on("processLoaded", arg => {
            this._mainThread = arg;
            this._lastExecutedThread = this._mainThread;
            this.emit("processLoaded", arg);
        });
        this.callbackHandler.HandleIncomingData();
        return true;
    }
    HandleIncomingData(buffer) {
        this.stream.Append(buffer);
        if (!this.isRemoteProcess) {
            if (!this.guidRead) {
                this.stream.RollBackTransaction();
                this.stream.ReadString();
                if (this.stream.HasInsufficientDataForReading) {
                    return;
                }
                this.guidRead = true;
                this.stream.EndTransaction();
            }
            if (!this.statusRead) {
                this.stream.BeginTransaction();
                this.stream.ReadInt32();
                if (this.stream.HasInsufficientDataForReading) {
                    this.stream.RollBackTransaction();
                    return;
                }
                this.statusRead = true;
                this.stream.EndTransaction();
            }
            if (!this.pidRead) {
                this.stream.BeginTransaction();
                this.pid = this.stream.ReadInt32();
                if (this.stream.HasInsufficientDataForReading) {
                    this.stream.RollBackTransaction();
                    return;
                }
                this.pidRead = true;
                this.stream.EndTransaction();
            }
        }
        this.callbackHandler.HandleIncomingData();
    }
    // #region Step Commands
    onPythonStepCompleted(pyThread) {
        this._lastExecutedThread = pyThread;
        this.emit("stepCompleted", pyThread);
    }
    sendStepCommand(threadId, command) {
        this.stream.Write(command);
        this.stream.WriteInt64(threadId);
    }
    SendExceptionInfo(defaultBreakOnMode, breakOn) {
        if (!this.stream) {
            return;
        }
        this.stream.Write(ProxyCommands_1.Commands.SetExceptionInfoCommandBytes);
        this.stream.WriteInt32(defaultBreakOnMode);
        if (breakOn === null || breakOn === undefined) {
            this.stream.WriteInt32(0);
        }
        else {
            this.stream.WriteInt32(breakOn.size);
            breakOn.forEach((value, key) => {
                this.stream.WriteInt32(value);
                this.stream.WriteString(key);
            });
        }
    }
    SendStepOver(threadId) {
        return this.sendStepCommand(threadId, ProxyCommands_1.Commands.StepOverCommandBytes);
    }
    SendStepOut(threadId) {
        return this.sendStepCommand(threadId, ProxyCommands_1.Commands.StepOutCommandBytes);
    }
    SendStepInto(threadId) {
        return this.sendStepCommand(threadId, ProxyCommands_1.Commands.StepIntoCommandBytes);
    }
    // #endregion
    onBreakpointHit(pyThread, breakpointId) {
        this._lastExecutedThread = pyThread;
        this.emit("breakpointHit", pyThread, breakpointId);
    }
    onBreakpointSet(breakpointId, success) {
        // Find the last breakpoint command associated with this breakpoint
        let index = this.breakpointCommands.findIndex(item => item.Id === breakpointId);
        if (index === -1) {
            this.emit('breakpointChanged', breakpointId, success);
            return;
        }
        let cmd = this.breakpointCommands.splice(index, 1)[0];
        if (success) {
            cmd.PromiseResolve();
        }
        else {
            cmd.PromiseReject();
        }
    }
    DisableBreakPoint(breakpoint) {
        if (breakpoint.IsDjangoBreakpoint) {
            this.stream.Write(ProxyCommands_1.Commands.RemoveDjangoBreakPointCommandBytes);
        }
        else {
            this.stream.Write(ProxyCommands_1.Commands.RemoveBreakPointCommandBytes);
        }
        this.stream.WriteInt32(breakpoint.LineNo);
        this.stream.WriteInt32(breakpoint.Id);
        if (breakpoint.IsDjangoBreakpoint) {
            this.stream.WriteString(breakpoint.Filename);
        }
    }
    BindBreakpoint(brkpoint) {
        // tslint:disable-next-line:promise-must-complete
        return new Promise((resolve, reject) => {
            let bkCmd = {
                Id: brkpoint.Id,
                PromiseResolve: resolve,
                PromiseReject: reject
            };
            this.breakpointCommands.push(bkCmd);
            if (brkpoint.IsDjangoBreakpoint) {
                this.stream.Write(ProxyCommands_1.Commands.AddDjangoBreakPointCommandBytes);
            }
            else {
                this.stream.Write(ProxyCommands_1.Commands.SetBreakPointCommandBytes);
            }
            this.stream.WriteInt32(brkpoint.Id);
            this.stream.WriteInt32(brkpoint.LineNo);
            this.stream.WriteString(brkpoint.Filename);
            if (brkpoint.IsDjangoBreakpoint) {
                // Bining django breakpoints don't return any responses
                // Assume it worked
                resolve();
            }
            else {
                this.SendCondition(brkpoint);
                this.SendPassCount(brkpoint);
            }
        });
    }
    SendCondition(breakpoint) {
        this.stream.WriteInt32(breakpoint.ConditionKind);
        this.stream.WriteString(breakpoint.Condition || "");
    }
    SendPassCount(breakpoint) {
        // DebugWriteCommand("Send BP pass count");
        this.stream.WriteInt32(breakpoint.PassCountKind);
        this.stream.WriteInt32(breakpoint.PassCount);
    }
    SendResumeThread(threadId) {
        return this.sendStepCommand(threadId, ProxyCommands_1.Commands.ResumeThreadCommandBytes);
    }
    SendContinue() {
        return new Promise(resolve => {
            this.stream.Write(ProxyCommands_1.Commands.ResumeAllCommandBytes);
            resolve();
        });
    }
    AutoResumeThread(threadId) {
    }
    SendClearStepping(threadId) {
    }
    Break() {
        this.stream.Write(ProxyCommands_1.Commands.BreakAllCommandBytes);
    }
    ExecuteText(text, reprKind, stackFrame) {
        // tslint:disable-next-line:promise-must-complete
        return new Promise((resolve, reject) => {
            let executeId = this._idDispenser.Allocate();
            let cmd = {
                Id: executeId,
                Text: text,
                Frame: stackFrame,
                PromiseResolve: resolve,
                PromiseReject: reject,
                ReprKind: reprKind
            };
            this.executeCommandsQueue.push(cmd);
            this.ProcessPendingExecuteCommands();
        });
    }
    ProcessPendingExecuteCommands() {
        if (this.executeCommandsQueue.length === 0 || this.PendingExecuteCommands.size > 0) {
            return;
        }
        const cmd = this.executeCommandsQueue.shift();
        this.PendingExecuteCommands.set(cmd.Id, cmd);
        this.stream.Write(ProxyCommands_1.Commands.ExecuteTextCommandBytes);
        this.stream.WriteString(cmd.Text);
        this.stream.WriteInt64(cmd.Frame.Thread.Id);
        this.stream.WriteInt32(cmd.Frame.FrameId);
        this.stream.WriteInt32(cmd.Id);
        this.stream.WriteInt32(cmd.Frame.Kind);
        this.stream.WriteInt32(cmd.ReprKind);
    }
    EnumChildren(text, stackFrame, timeout) {
        return new Promise((resolve, reject) => {
            let executeId = this._idDispenser.Allocate();
            let cmd = {
                Id: executeId,
                Frame: stackFrame,
                PromiseResolve: resolve,
                PromiseReject: reject
            };
            this.PendingChildEnumCommands.set(executeId, cmd);
            setTimeout(() => {
                if (this.PendingChildEnumCommands.has(executeId)) {
                    this.PendingChildEnumCommands.delete(executeId);
                }
                let seconds = timeout / 1000;
                reject(`Enumerating children for ${text} timed out after ${seconds} seconds.`);
            }, timeout);
            this.stream.Write(ProxyCommands_1.Commands.GetChildrenCommandBytes);
            this.stream.WriteString(text);
            this.stream.WriteInt64(stackFrame.Thread.Id);
            this.stream.WriteInt32(stackFrame.FrameId);
            this.stream.WriteInt32(executeId);
            this.stream.WriteInt32(stackFrame.Kind);
        });
    }
    SetLineNumber(pythonStackFrame, lineNo) {
    }
    attach(proc) {
        proc.on('error', error => {
            this.emit("error", undefined, error.toString());
        });
        proc.stderr.setEncoding('utf8');
        proc.stdout.setEncoding('utf8');
        proc.stderr.on('data', (error) => {
            this.emit("error", error.toString());
        });
        proc.stderr.on('error', () => { });
        proc.stdout.on('data', (d) => {
            this.emit("output", undefined, d);
        });
        proc.stdout.on('error', () => { });
        proc.on('close', () => {
            this.emit('detach');
        });
    }
}
exports.PythonProcess = PythonProcess;
//# sourceMappingURL=PythonProcess.js.map