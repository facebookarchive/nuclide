"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Contracts_1 = require("./Common/Contracts");
const Contracts_2 = require("./Common/Contracts");
const utils = require("./Common/Utils");
const events_1 = require("events");
const ProxyCommands_1 = require("./ProxyCommands");
const TryParser_1 = require("./Common/TryParser");
const path = require("path");
class PythonProcessCallbackHandler extends events_1.EventEmitter {
    constructor(process, stream, idDispenser) {
        super();
        this.process = process;
        this.stream = stream;
        this.idDispenser = idDispenser;
    }
    HandleIncomingData() {
        if (this.stream.Length === 0) {
            return;
        }
        this.stream.BeginTransaction();
        let cmd = this.stream.ReadAsciiString(4);
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        switch (cmd) {
            case "MODL":
                this.HandleModuleLoad();
                break;
            case "LOAD":
                this.HandleProcessLoad();
                break;
            case "STPD":
                this.HandleStepDone();
                break;
            case "NEWT":
                this.HandleThreadCreate();
                break;
            case "EXTT":
                this.HandleThreadExit();
                break;
            case "THRF":
                this.HandleThreadFrameList();
                break;
            case "OUTP":
                this.HandleDebuggerOutput();
                break;
            case "BRKS":
                this.HandleBreakPointSet();
                break;
            case "BRKF":
                this.HandleBreakPointFailed();
                break;
            case "BRKH":
                this.HandleBreakPointHit();
                break;
            case "DETC":
                this.HandleDetach();
                break; // detach, report process exit
            case "LAST":
                this.HandleLast();
                break;
            case "CHLD":
                this.HandleEnumChildren();
                break;
            case "REQH":
                this.HandleRequestHandlers();
                break;
            case "EXCP":
                this.HandleException();
                break;
            case "EXC2":
                this.HandleRichException();
                break;
            case "EXCR":
                this.HandleExecutionResult();
                break;
            case "EXCE":
                this.HandleExecutionException();
                break;
            case "ASBR":
                this.HandleAsyncBreak();
                break;
            default: {
                this.emit("error", `Unhandled command '${cmd}'`);
            }
        }
        if (this.stream.HasInsufficientDataForReading) {
            // Most possibly due to insufficient data
            this.stream.RollBackTransaction();
            return;
        }
        this.stream.EndTransaction();
        if (this.stream.Length > 0) {
            this.HandleIncomingData();
        }
    }
    get LanguageVersion() {
        return Contracts_2.PythonLanguageVersion.Is2;
    }
    HandleDetach() {
        this.emit("detach");
    }
    HandleLast() {
        this.stream.Write(ProxyCommands_1.Commands.LastAckCommandBytes);
        this.emit("last");
    }
    HandleModuleLoad() {
        let moduleId = this.stream.ReadInt32();
        let filename = this.stream.ReadString();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        if (filename != null) {
            this.emit("moduleLoaded", utils.CreatePythonModule(moduleId, filename));
        }
    }
    HandleDebuggerOutput() {
        let threadId = this.stream.ReadInt64();
        let output = this.stream.ReadString();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let pyThread;
        if (this.process.Threads.has(threadId)) {
            pyThread = this.process.Threads.get(threadId);
        }
        this.emit("output", pyThread, output);
    }
    HandleThreadCreate() {
        let threadId = this.stream.ReadInt64();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let pyThread = utils.CreatePythonThread(threadId, this._createdFirstThread, this.process);
        this._createdFirstThread = true;
        this.process.Threads.set(threadId, pyThread);
        this.emit("threadCreated", pyThread);
    }
    HandleThreadExit() {
        let threadId = this.stream.ReadInt64();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let thread;
        if (this.process.Threads.has(threadId)) {
            thread = this.process.Threads.get(threadId);
            this.emit("threadExited", thread);
            // this.process.Threads.delete(threadId);
        }
    }
    HandleProcessLoad() {
        let threadId = this.stream.ReadInt64();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let pyThread;
        if (this.process.Threads.has(threadId)) {
            pyThread = this.process.Threads.get(threadId);
        }
        this.emit("processLoaded", pyThread);
    }
    HandleStepDone() {
        let threadId = this.stream.ReadInt64();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let pyThread;
        if (this.process.Threads.has(threadId)) {
            pyThread = this.process.Threads.get(threadId);
        }
        this.emit("stepCompleted", pyThread);
    }
    HandleAsyncBreak() {
        let threadId = this.stream.ReadInt64();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let pyThread;
        if (this.process.Threads.has(threadId)) {
            pyThread = this.process.Threads.get(threadId);
        }
        this.emit("asyncBreakCompleted", pyThread);
    }
    HandleBreakPointFailed() {
        let id = this.stream.ReadInt32();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        this.emit("breakpointNotSet", id);
    }
    HandleBreakPointSet() {
        let id = this.stream.ReadInt32();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        this.emit("breakpointSet", id);
    }
    HandleBreakPointHit() {
        let breakId = this.stream.ReadInt32();
        let threadId = this.stream.ReadInt64();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let pyThread;
        if (this.process.Threads.has(threadId)) {
            pyThread = this.process.Threads.get(threadId);
        }
        this.emit("breakpointHit", pyThread, breakId);
    }
    HandleRequestHandlers() {
        let filename = this.stream.ReadString();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let fullyQualifiedFileName = filename;
        if (!path.isAbsolute(fullyQualifiedFileName)) {
            fullyQualifiedFileName = path.join(this.process.ProgramDirectory, filename);
        }
        this.GetHandledExceptionRanges(fullyQualifiedFileName).then(statements => {
            this.stream.Write(ProxyCommands_1.Commands.SetExceptionHandlerInfoCommandBytes);
            this.stream.WriteString(filename);
            this.stream.WriteInt32(statements.length);
            statements.forEach(statement => {
                this.stream.WriteInt32(statement.startLine);
                this.stream.WriteInt32(statement.endLine);
                statement.expressions.forEach(expr => {
                    this.stream.WriteString(expr);
                });
                this.stream.WriteString("-");
            });
        });
    }
    GetHandledExceptionRanges(fileName) {
        return TryParser_1.ExtractTryStatements(fileName).then(statements => {
            let exceptionRanges = [];
            statements.forEach(statement => {
                let expressions = [];
                if (statement.Exceptions.length === 0 || statement.Exceptions.indexOf("*") >= 0) {
                    expressions = ["*"];
                }
                else {
                    statement.Exceptions.forEach(ex => {
                        if (expressions.indexOf(ex) === -1) {
                            expressions.push(ex);
                        }
                    });
                }
                exceptionRanges.push({
                    endLine: statement.EndLineNumber,
                    startLine: statement.StartLineNumber,
                    expressions: expressions
                });
            });
            return exceptionRanges;
        });
    }
    HandleException() {
        let typeName = this.stream.ReadString();
        let threadId = this.stream.ReadInt64();
        let breakType = this.stream.ReadInt32();
        let desc = this.stream.ReadString();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        if (typeName != null && desc != null) {
            let ex = {
                TypeName: typeName,
                Description: desc
            };
            let pyThread;
            if (this.process.Threads.has(threadId)) {
                pyThread = this.process.Threads.get(threadId);
            }
            this.emit("exceptionRaised", pyThread, ex, breakType === 1 /* BREAK_TYPE_UNHANLDED */);
        }
        this._stoppedForException = true;
    }
    HandleRichException() {
        // let typeName = this.stream.ReadString();
        // let threadId = this.stream.ReadInt64();
        // let breakType = this.stream.ReadInt32();
        // let desc = this.stream.ReadString();
        // if (this.stream.HasInsufficientDataForReading) {
        //     return;
        // }
        // if (typeName != null && desc != null) {
        //     let ex: IPythonException = {
        //         TypeName: typeName,
        //         Description: desc
        //     };
        //     let pyThread: IPythonThread;
        //     if (this.process.Threads.has(threadId)) {
        //         pyThread = this.process.Threads.get(threadId);
        //     }
        //     this.emit("exceptionRaised", pyThread, ex, breakType === 1 /* BREAK_TYPE_UNHANLDED */);
        // }
        // this._stoppedForException = true;
    }
    HandleExecutionException() {
        let execId = this.stream.ReadInt32();
        let exceptionText = this.stream.ReadString();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let cmd = null;
        if (this.process.PendingExecuteCommands.has(execId)) {
            cmd = this.process.PendingExecuteCommands.get(execId);
            if (this.process.PendingExecuteCommands.has(execId)) {
                this.process.PendingExecuteCommands.delete(execId);
            }
            cmd.PromiseReject(exceptionText);
        }
        this.process.ProcessPendingExecuteCommands();
        this.idDispenser.Free(execId);
    }
    HandleExecutionResult() {
        let execId = this.stream.ReadInt32();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let cmd = null;
        if (this.process.PendingExecuteCommands.has(execId)) {
            cmd = this.process.PendingExecuteCommands.get(execId);
        }
        if (cmd === null) {
            // Passing null for parameters other than stream is okay as long
            // as we drop the result.
            this.ReadPythonObject(null, null, null);
            if (this.stream.HasInsufficientDataForReading) {
                return;
            }
        }
        else {
            let evalResult = this.ReadPythonObject(cmd.Text, null, cmd.Frame);
            if (this.stream.HasInsufficientDataForReading) {
                return;
            }
            cmd.PromiseResolve(evalResult);
        }
        if (cmd != null) {
            if (this.process.PendingExecuteCommands.has(execId)) {
                this.process.PendingExecuteCommands.delete(execId);
            }
        }
        this.process.ProcessPendingExecuteCommands();
        this.idDispenser.Free(execId);
    }
    HandleEnumChildren() {
        let execId = this.stream.ReadInt32();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let cmd = null;
        if (this.process.PendingChildEnumCommands.has(execId)) {
            cmd = this.process.PendingChildEnumCommands.get(execId);
        }
        let childrenCount = this.stream.ReadInt32();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        const children = [];
        for (let childCount = 0; childCount < childrenCount; childCount++) {
            const childName = this.stream.ReadString();
            const childExpr = this.stream.ReadString();
            if (this.stream.HasInsufficientDataForReading) {
                return;
            }
            let obj = this.ReadPythonObject(childExpr, childName, cmd === null ? null : cmd.Frame);
            if (this.stream.HasInsufficientDataForReading) {
                return;
            }
            children.push(obj);
        }
        if (cmd != null) {
            cmd.PromiseResolve(children);
            if (this.process.PendingChildEnumCommands.has(execId)) {
                this.process.PendingChildEnumCommands.delete(execId);
            }
        }
        this.idDispenser.Free(execId);
    }
    HandleThreadFrameList() {
        let frames = [];
        let threadId = this.stream.ReadInt64();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        let pyThread;
        if (this.process.Threads.has(threadId)) {
            pyThread = this.process.Threads.get(threadId);
        }
        let threadName = this.stream.ReadString();
        let frameCount = this.stream.ReadInt32();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        for (let i = 0; i < frameCount; i++) {
            let startLine = this.stream.ReadInt32();
            let endLine = this.stream.ReadInt32();
            let lineNo = this.stream.ReadInt32();
            let frameName = this.stream.ReadString();
            let filename = this.stream.ReadString();
            let argCount = this.stream.ReadInt32();
            let frameKind = this.stream.ReadInt32();
            if (this.stream.HasInsufficientDataForReading) {
                return;
            }
            let frame = null;
            if (pyThread != null) {
                switch (frameKind) {
                    case Contracts_1.FrameKind.Django: {
                        let sourceFile = this.stream.ReadString();
                        let sourceLine = this.stream.ReadInt32();
                        if (this.stream.HasInsufficientDataForReading) {
                            return;
                        }
                        let djangoFrame = {
                            EndLine: endLine, FileName: filename,
                            FrameId: i, FunctionName: frameName,
                            Kind: frameKind, LineNo: lineNo,
                            Locals: [], Parameters: [],
                            Thread: pyThread, SourceFile: sourceFile,
                            SourceLine: sourceLine, StartLine: startLine
                        };
                        frame = djangoFrame;
                        break;
                    }
                    default: {
                        frame = {
                            EndLine: endLine, FileName: filename,
                            FrameId: i, FunctionName: frameName,
                            Kind: frameKind, LineNo: lineNo,
                            Locals: [], Parameters: [],
                            Thread: pyThread, StartLine: startLine
                        };
                        break;
                    }
                }
            }
            let varCount = this.stream.ReadInt32();
            if (this.stream.HasInsufficientDataForReading) {
                return;
            }
            let variables = [];
            for (let j = 0; j < varCount; j++) {
                let name = this.stream.ReadString();
                if (this.stream.HasInsufficientDataForReading) {
                    return;
                }
                if (frame != null) {
                    let variableObj = this.ReadPythonObject(name, name, frame);
                    if (this.stream.HasInsufficientDataForReading) {
                        return;
                    }
                    variables.push(variableObj);
                }
            }
            if (frame != null) {
                frame.Parameters = variables.splice(0, argCount);
                frame.Locals = variables;
                frames.push(frame);
            }
        }
        if (pyThread != null) {
            pyThread.Frames = frames;
            if (typeof threadName === "string" && threadName.length > 0) {
                pyThread.Name = threadName;
            }
        }
    }
    ReadPythonObject(expr, childName, frame) {
        let objRepr = this.stream.ReadString();
        let hexRepr = this.stream.ReadString();
        let typeName = this.stream.ReadString();
        let length = this.stream.ReadInt64();
        let flags = this.stream.ReadInt32();
        if (this.stream.HasInsufficientDataForReading) {
            return;
        }
        if ((flags & Contracts_2.PythonEvaluationResultFlags.Raw) === 0 && ((typeName === "unicode" && this.LanguageVersion === Contracts_2.PythonLanguageVersion.Is2)
            || (typeName === "str" && this.LanguageVersion === Contracts_2.PythonLanguageVersion.Is3))) {
            objRepr = utils.FixupEscapedUnicodeChars(objRepr);
        }
        if (typeName === "bool") {
            hexRepr = null;
        }
        let pythonEvaluationResult = {
            ChildName: childName,
            Process: this.process,
            IsExpandable: (flags & Contracts_2.PythonEvaluationResultFlags.Expandable) > 0,
            Flags: flags,
            StringRepr: objRepr,
            HexRepr: hexRepr,
            TypeName: typeName,
            Expression: expr,
            Length: length,
            Frame: frame
        };
        return pythonEvaluationResult;
    }
}
exports.PythonProcessCallbackHandler = PythonProcessCallbackHandler;
//# sourceMappingURL=PythonProcessCallbackHandler.js.map