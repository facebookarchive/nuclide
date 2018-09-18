// tslint:disable:quotemark ordered-imports promise-must-complete member-ordering no-any prefer-template cyclomatic-complexity no-empty no-multiline-string one-line no-invalid-template-strings no-suspicious-comment no-var-self no-duplicate-imports
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// This line should always be right on top.
// tslint:disable:no-any no-floating-promises
if (Reflect.metadata === undefined) {
    // tslint:disable-next-line:no-require-imports no-var-requires
    require('reflect-metadata');
}
const fs = require("fs");
const path = require("path");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const constants_1 = require("../../client/telemetry/constants");
const helpers_1 = require("../common/helpers");
const Contracts_1 = require("./Common/Contracts");
const Contracts_2 = require("./Common/Contracts");
const Utils_1 = require("./Common/Utils");
const DebugFactory_1 = require("./DebugClients/DebugFactory");
const PythonProcess_1 = require("./PythonProcess");
const telemetry_1 = require("./Common/telemetry");
const logger_1 = require("vscode-debugadapter/lib/logger");
const CHILD_ENUMEARATION_TIMEOUT = 5000;
class PythonDebugger extends vscode_debugadapter_1.LoggingDebugSession {
    constructor(debuggerLinesStartAt1, isServer) {
        super(path.join(__dirname, '..', '..', '..', 'debug.log'), debuggerLinesStartAt1, isServer === true);
        this.breakPointCounter = 0;
        this._supportsRunInTerminalRequest = false;
        this.terminateEventSent = false;
        this._variableHandles = new vscode_debugadapter_1.Handles();
        this._pythonStackFrames = new vscode_debugadapter_1.Handles();
        this.registeredBreakpoints = new Map();
        this.registeredBreakpointsByFileName = new Map();
        this.debuggerLoaded = new Promise(resolve => {
            this.debuggerLoadedPromiseResolve = resolve;
        });
    }
    // tslint:disable-next-line:no-unnecessary-override
    sendEvent(event) {
        super.sendEvent(event);
    }
    initializeRequest(response, args) {
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsConditionalBreakpoints = true;
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = false;
        response.body.supportsFunctionBreakpoints = false;
        response.body.supportsSetVariable = true;
        response.body.exceptionBreakpointFilters = [
            {
                label: "All Exceptions",
                filter: "all"
            },
            {
                label: "Uncaught Exceptions",
                filter: "uncaught"
            }
        ];
        if (typeof args.supportsRunInTerminalRequest === 'boolean') {
            this._supportsRunInTerminalRequest = args.supportsRunInTerminalRequest;
        }
        this.sendResponse(response);
        // now we are ready to accept breakpoints -> fire the initialized event to give UI a chance to set breakpoints
        this.sendEvent(new vscode_debugadapter_1.InitializedEvent());
    }
    startDebugServer() {
        let programDirectory = '';
        if ((this.launchArgs && this.launchArgs.program) || (this.attachArgs && this.attachArgs.localRoot)) {
            programDirectory = (this.launchArgs && this.launchArgs.program) ? path.dirname(this.launchArgs.program) : this.attachArgs.localRoot;
        }
        if (this.launchArgs && typeof this.launchArgs.cwd === 'string' && this.launchArgs.cwd.length > 0 && this.launchArgs.cwd !== 'null') {
            programDirectory = this.launchArgs.cwd;
        }
        this.pythonProcess = new PythonProcess_1.PythonProcess(0, "", programDirectory);
        this.debugServer = this.debugClient.CreateDebugServer(this.pythonProcess);
        this.InitializeEventHandlers();
        return this.debugServer.Start();
    }
    stopDebugServer() {
        if (this.debugClient) {
            this.debugClient.Stop();
            this.debugClient = undefined;
        }
        if (this.pythonProcess) {
            this.pythonProcess.Kill();
            this.pythonProcess = undefined;
        }
        this.terminateEventSent = true;
        this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
    }
    InitializeEventHandlers() {
        const pythonProcess = this.pythonProcess;
        pythonProcess.on("last", arg => this.onLastCommand());
        pythonProcess.on("threadExited", arg => this.onPythonThreadExited(arg));
        pythonProcess.on("moduleLoaded", arg => this.onPythonModuleLoaded(arg));
        pythonProcess.on("threadCreated", arg => this.onPythonThreadCreated(arg));
        pythonProcess.on("processLoaded", arg => this.onPythonProcessLoaded(arg));
        pythonProcess.on("output", (pyThread, output) => this.onDebuggerOutput(pyThread, output, 'stdout'));
        pythonProcess.on("exceptionRaised", (pyThread, ex) => this.onPythonException(pyThread, ex));
        pythonProcess.on("breakpointHit", (pyThread, breakpointId) => this.onBreakpointHit(pyThread, breakpointId));
        pythonProcess.on("breakpointChanged", (breakpointId, verified) => this.onBreakpointChanged(breakpointId, verified));
        pythonProcess.on("stepCompleted", (pyThread) => this.onStepCompleted(pyThread));
        pythonProcess.on("detach", () => this.onDetachDebugger());
        pythonProcess.on("error", ex => this.onDebuggerOutput(undefined, ex, 'stderr'));
        pythonProcess.on("asyncBreakCompleted", arg => this.onPythonProcessPaused(arg));
        this.debugServer.on("detach", () => this.onDetachDebugger());
    }
    onLastCommand() {
        this.terminateEventSent = true;
        // When running in terminals, and if there are any errors, the PTVSD library
        // first sends the LAST command (meaning everything has ended) and then sends the stderr and stdout messages.
        // I.e. to us, it looks as though everything is done and completed, when it isn't.
        // A simple solution is to tell vscode that it has ended 500ms later (giving us time to receive any messages from stderr/stdout from ptvsd).
        setTimeout(() => this.sendEvent(new vscode_debugadapter_1.TerminatedEvent()), 500);
    }
    onDetachDebugger() {
        this.stopDebugServer();
    }
    onPythonThreadCreated(pyThread) {
        this.sendEvent(new vscode_debugadapter_1.ThreadEvent("started", pyThread.Int32Id));
    }
    onStepCompleted(pyThread) {
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("step", pyThread.Int32Id));
    }
    onPythonException(pyThread, ex) {
        this.lastException = ex;
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("exception", pyThread.Int32Id, `${ex.TypeName}, ${ex.Description}`));
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(`${ex.TypeName}, ${ex.Description}\n`, "stderr"));
    }
    onPythonThreadExited(pyThread) {
        this.sendEvent(new vscode_debugadapter_1.ThreadEvent("exited", pyThread.Int32Id));
    }
    onPythonProcessPaused(pyThread) {
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("pause", pyThread.Int32Id));
    }
    onPythonModuleLoaded(module) {
    }
    onPythonProcessLoaded(pyThread) {
        if (this.entryResponse) {
            this.sendResponse(this.entryResponse);
            this.entryResponse = undefined;
        }
        this.debuggerLoadedPromiseResolve();
        if (this.launchArgs && !this.launchArgs.console) {
            this.launchArgs.console = 'none';
        }
        // If launching the integrated terminal is not supported, then defer to external terminal
        // that will be displayed by our own code.
        if (!this._supportsRunInTerminalRequest && this.launchArgs && this.launchArgs.console === 'integratedTerminal') {
            this.launchArgs.console = 'externalTerminal';
        }
        if (!this.launchArgs || this.launchArgs.noDebug !== true) {
            // tslint:disable-next-line:no-non-null-assertion
            const thread = pyThread;
            if (this.launchArgs && this.launchArgs.stopOnEntry === true) {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent("entry", thread.Int32Id));
            }
            else if (this.launchArgs && this.launchArgs.stopOnEntry === false) {
                this.configurationDone.then(() => {
                    this.pythonProcess.SendResumeThread(thread.Id);
                });
            }
            else {
                this.pythonProcess.SendResumeThread(thread.Id);
            }
        }
    }
    onDebuggerOutput(pyThread, output, outputChannel) {
        if (this.entryResponse) {
            // Sometimes we can get output from PTVSD even before things load.
            // E.g. if the program didn't even run (e.g. simple one liner with invalid syntax).
            // But we need to tell vscode that the debugging has started, so we can send error messages.
            this.sendResponse(this.entryResponse);
            this.debuggerLoadedPromiseResolve();
            this.entryResponse = undefined;
        }
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(output, outputChannel));
    }
    canStartDebugger() {
        return Promise.resolve(true);
    }
    launchRequest(response, args) {
        if (args.logToFile === true) {
            vscode_debugadapter_1.logger.setup(logger_1.LogLevel.Verbose, true);
        }
        // Some versions may still exist with incorrect launch.json values
        const setting = '${config.python.pythonPath}';
        if (args.pythonPath === setting) {
            return this.sendErrorResponse(response, 2001, `Invalid launch.json (re-create it or replace 'config.python.pythonPath' with 'config:python.pythonPath')`);
        }
        // Add support for specifying just the directory where the python executable will be located
        // E.g. virtual directory name
        try {
            args.pythonPath = Utils_1.getPythonExecutable(args.pythonPath);
        }
        catch (ex) {
        }
        // Confirm the file exists
        if (typeof args.module !== 'string' || args.module.length === 0) {
            if (!args.program || !fs.existsSync(args.program)) {
                return this.sendErrorResponse(response, 2001, `File does not exist. "${args.program}"`);
            }
        }
        else {
            // When using modules ensure the cwd has been provided
            if (typeof args.cwd !== 'string' || args.cwd.length === 0 || (this.launchArgs && this.launchArgs.cwd === 'null')) {
                return this.sendErrorResponse(response, 2001, `'cwd' in 'launch.json' needs to point to the working directory`);
            }
        }
        let programDirectory = '';
        if (args && args.program) {
            programDirectory = path.dirname(args.program);
        }
        if (args && typeof args.cwd === 'string' && args.cwd.length > 0 && args.cwd !== 'null') {
            programDirectory = args.cwd;
        }
        if (programDirectory.length > 0 && fs.existsSync(path.join(programDirectory, 'pyenv.cfg'))) {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`Warning 'pyenv.cfg' can interfere with the debugger. Please rename or delete this file (temporary solution)`));
        }
        const telemetryProps = {
            trigger: 'launch',
            console: args.console,
            debugOptions: (Array.isArray(args.debugOptions) ? args.debugOptions : []).join(","),
            pyspark: typeof args.pythonPath === 'string' && args.pythonPath.indexOf('spark-submit') > 0,
            hasEnvVars: args.env && typeof args.env === "object" && Object.keys(args.env).length > 0
        };
        this.sendEvent(new Contracts_2.TelemetryEvent(constants_1.DEBUGGER, telemetryProps));
        this.launchArgs = args;
        this.debugClient = DebugFactory_1.CreateLaunchDebugClient(args, this, this._supportsRunInTerminalRequest);
        this.configurationDone = new Promise(resolve => {
            this.configurationDonePromiseResolve = resolve;
        });
        this.entryResponse = response;
        // tslint:disable-next-line:no-this-assignment
        const that = this;
        this.startDebugServer().then(dbgServer => {
            return that.debugClient.LaunchApplicationToDebug(dbgServer);
        }).catch(error => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`${error}${'\n'}`, "stderr"));
            response.success = false;
            let errorMsg = typeof error === "string" ? error : ((error.message && error.message.length > 0) ? error.message : error);
            if (helpers_1.isNotInstalledError(error)) {
                errorMsg = `Failed to launch the Python Process, please validate the path '${this.launchArgs.pythonPath}'`;
            }
            this.sendErrorResponse(response, 200, errorMsg);
        });
    }
    attachRequest(response, args) {
        if (args.logToFile === true) {
            vscode_debugadapter_1.logger.setup(logger_1.LogLevel.Verbose, true);
        }
        this.sendEvent(new Contracts_2.TelemetryEvent(constants_1.DEBUGGER, { trigger: 'attach' }));
        this.attachArgs = args;
        this.debugClient = DebugFactory_1.CreateAttachDebugClient(args, this);
        this.entryResponse = response;
        // tslint:disable-next-line:no-this-assignment
        const that = this;
        this.canStartDebugger().then(() => {
            return this.startDebugServer();
        }).then(dbgServer => {
            return that.debugClient.LaunchApplicationToDebug(dbgServer);
        }).catch(error => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(`${error}${'\n'}`, "stderr"));
            this.sendErrorResponse(that.entryResponse, 2000, error);
        });
    }
    configurationDoneRequest(response, args) {
        // Tell debugger we have loaded the breakpoints
        if (this.configurationDonePromiseResolve) {
            this.configurationDonePromiseResolve();
            this.configurationDonePromiseResolve = undefined;
        }
        this.sendResponse(response);
    }
    onBreakpointHit(pyThread, breakpointId) {
        // Break only if the breakpoint exists and it is enabled
        if (this.registeredBreakpoints.has(breakpointId) && this.registeredBreakpoints.get(breakpointId).Enabled === true) {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent("breakpoint", pyThread.Int32Id));
        }
        else {
            this.pythonProcess.SendResumeThread(pyThread.Id);
        }
    }
    onBreakpointChanged(breakpointId, verified) {
        if (!this.registeredBreakpoints.has(breakpointId)) {
            return;
        }
        const pythonBkpoint = this.registeredBreakpoints.get(breakpointId);
        const breakpoint = new vscode_debugadapter_1.Breakpoint(verified, pythonBkpoint.LineNo, undefined, new vscode_debugadapter_1.Source(path.basename(pythonBkpoint.Filename), pythonBkpoint.Filename));
        // VSC needs `id` to uniquely identify each breakpoint (part of the protocol spec).
        breakpoint.id = pythonBkpoint.Id;
        this.sendEvent(new vscode_debugadapter_1.BreakpointEvent('changed', breakpoint));
    }
    buildBreakpointDetails(filePath, line, condition) {
        let isDjangoFile = false;
        if (this.launchArgs &&
            Array.isArray(this.launchArgs.debugOptions) &&
            (this.launchArgs.debugOptions.indexOf(Contracts_2.DebugOptions.Django) >= 0 || this.launchArgs.debugOptions.indexOf(Contracts_2.DebugOptions.DjangoDebugging) >= 0)) {
            isDjangoFile = filePath.toUpperCase().endsWith(".HTML");
        }
        if (this.attachArgs &&
            Array.isArray(this.attachArgs.debugOptions) &&
            (this.attachArgs.debugOptions.indexOf(Contracts_2.DebugOptions.Django) >= 0 || this.attachArgs.debugOptions.indexOf(Contracts_2.DebugOptions.DjangoDebugging) >= 0)) {
            isDjangoFile = filePath.toUpperCase().endsWith(".HTML");
        }
        condition = typeof condition === "string" ? condition : "";
        return {
            Condition: condition,
            ConditionKind: condition.length === 0 ? Contracts_1.PythonBreakpointConditionKind.Always : Contracts_1.PythonBreakpointConditionKind.WhenTrue,
            Filename: filePath,
            Id: this.breakPointCounter += 1,
            LineNo: line,
            PassCount: 0,
            PassCountKind: Contracts_1.PythonBreakpointPassCountKind.Always,
            IsDjangoBreakpoint: isDjangoFile,
            Enabled: true
        };
    }
    setBreakPointsRequest(response, args) {
        this.debuggerLoaded.then(() => {
            if (this.terminateEventSent) {
                response.body = {
                    breakpoints: []
                };
                return this.sendResponse(response);
            }
            if (!this.registeredBreakpointsByFileName.has(args.source.path)) {
                this.registeredBreakpointsByFileName.set(args.source.path, []);
            }
            // VSC needs `id` to uniquely identify each breakpoint (part of the protocol spec).
            const breakpoints = [];
            const linesToAdd = args.breakpoints.map(b => b.line);
            const registeredBks = this.registeredBreakpointsByFileName.get(args.source.path);
            const linesToRemove = registeredBks.map(b => b.LineNo).filter(oldLine => linesToAdd.indexOf(oldLine) === -1);
            // Always add new breakpoints, don't re-enable previous breakpoints,
            // Cuz sometimes some breakpoints get added too early (e.g. in django) and don't get registeredBks
            // and the response comes back indicating it wasn't set properly.
            // However, at a later point in time, the program breaks at that point!!!
            const linesToAddPromises = args.breakpoints.map(bk => {
                return new Promise(resolve => {
                    let breakpoint;
                    const existingBreakpointsForThisLine = registeredBks.filter(registeredBk => registeredBk.LineNo === bk.line);
                    if (existingBreakpointsForThisLine.length > 0) {
                        // We have an existing breakpoint for this line
                        // just enable that
                        breakpoint = existingBreakpointsForThisLine[0];
                        breakpoint.Enabled = true;
                    }
                    else {
                        breakpoint = this.buildBreakpointDetails(this.convertClientPathToDebugger(args.source.path), bk.line, bk.condition);
                    }
                    this.pythonProcess.BindBreakpoint(breakpoint).then(() => {
                        this.registeredBreakpoints.set(breakpoint.Id, breakpoint);
                        breakpoints.push({ verified: true, line: bk.line, id: breakpoint.Id });
                        registeredBks.push(breakpoint);
                        resolve();
                    }).catch(reason => {
                        this.registeredBreakpoints.set(breakpoint.Id, breakpoint);
                        breakpoints.push({ verified: false, line: bk.line, id: breakpoint.Id });
                        registeredBks.push(breakpoint);
                        resolve();
                    });
                });
            });
            const linesToRemovePromises = linesToRemove.map(line => {
                return new Promise(resolve => {
                    const bookmarks = this.registeredBreakpointsByFileName.get(args.source.path);
                    const bk = bookmarks.filter(b => b.LineNo === line)[0];
                    // Ok, we won't get a response back, so update the breakpoints list  indicating this has been disabled
                    bk.Enabled = false;
                    this.pythonProcess.DisableBreakPoint(bk);
                    resolve();
                });
            });
            const promises = linesToAddPromises.concat(linesToRemovePromises);
            Promise.all(promises).then(() => {
                response.body = {
                    breakpoints: breakpoints
                };
                this.sendResponse(response);
                // Tell debugger we have loaded the breakpoints
                if (this.configurationDonePromiseResolve) {
                    this.configurationDonePromiseResolve();
                    this.configurationDonePromiseResolve = undefined;
                }
            }).catch(error => this.sendErrorResponse(response, 2000, error));
        });
    }
    threadsRequest(response) {
        const threads = [];
        if (this.pythonProcess) {
            this.pythonProcess.Threads.forEach(t => {
                threads.push(new vscode_debugadapter_1.Thread(t.Int32Id, t.Name));
            });
        }
        response.body = {
            threads: threads
        };
        this.sendResponse(response);
    }
    convertDebuggerPathToClient(remotePath) {
        if (this.attachArgs && this.attachArgs.localRoot && this.attachArgs.remoteRoot) {
            let path2 = path.win32;
            if (this.attachArgs.remoteRoot.indexOf('/') !== -1) {
                path2 = path.posix;
            }
            const pathRelativeToSourceRoot = path2.relative(this.attachArgs.remoteRoot, remotePath);
            return path.resolve(this.attachArgs.localRoot, pathRelativeToSourceRoot);
        }
        else {
            return remotePath;
        }
    }
    convertClientPathToDebugger(clientPath) {
        if (this.attachArgs && this.attachArgs.localRoot && this.attachArgs.remoteRoot) {
            // get the part of the path that is relative to the client root
            const pathRelativeToClientRoot = path.relative(this.attachArgs.localRoot, clientPath);
            // resolve from the remote source root
            let path2 = path.win32;
            if (this.attachArgs.remoteRoot.indexOf('/') !== -1) {
                path2 = path.posix;
            }
            return path2.resolve(this.attachArgs.remoteRoot, pathRelativeToClientRoot);
        }
        else {
            return clientPath;
        }
    }
    stackTraceRequest(response, args) {
        this.debuggerLoaded.then(() => {
            if (this.terminateEventSent || !this.pythonProcess || Array.from(this.pythonProcess.Threads.values()).findIndex(t => t.Int32Id === args.threadId) === -1) {
                response.body = {
                    stackFrames: []
                };
                return this.sendResponse(response);
            }
            const pyThread = Array.from(this.pythonProcess.Threads.values()).find(t => t.Int32Id === args.threadId);
            let maxFrames = typeof args.levels === "number" && args.levels > 0 ? args.levels : pyThread.Frames.length - 1;
            maxFrames = maxFrames < pyThread.Frames.length ? maxFrames : pyThread.Frames.length;
            const frames = pyThread.Frames.map(frame => {
                return Utils_1.validatePath(this.convertDebuggerPathToClient(frame.FileName)).then(fileName => {
                    const frameId = this._pythonStackFrames.create(frame);
                    if (fileName.length === 0) {
                        return new vscode_debugadapter_1.StackFrame(frameId, frame.FunctionName);
                    }
                    else {
                        const realFilePath = fs.realpathSync(fileName);
                        return new vscode_debugadapter_1.StackFrame(frameId, frame.FunctionName, new vscode_debugadapter_1.Source(path.basename(realFilePath), realFilePath), this.convertDebuggerLineToClient(frame.LineNo - 1), 1);
                    }
                });
            });
            Promise.all(frames).then(resolvedFrames => {
                response.body = {
                    stackFrames: resolvedFrames
                };
                this.sendResponse(response);
            });
        });
    }
    stepInRequest(response) {
        this.sendResponse(response);
        this.pythonProcess.SendStepInto(this.pythonProcess.LastExecutedThread.Id);
    }
    stepOutRequest(response) {
        this.sendResponse(response);
        this.pythonProcess.SendStepOut(this.pythonProcess.LastExecutedThread.Id);
    }
    continueRequest(response, args) {
        this.pythonProcess.SendContinue().then(() => {
            this.sendResponse(response);
        }).catch(error => this.sendErrorResponse(response, 2000, error));
    }
    nextRequest(response, args) {
        this.sendResponse(response);
        this.pythonProcess.SendStepOver(this.pythonProcess.LastExecutedThread.Id);
    }
    evaluateRequest(response, args) {
        this.debuggerLoaded.then(() => {
            const frame = this._pythonStackFrames.get(args.frameId);
            if (this.terminateEventSent || !frame || !this.pythonProcess) {
                response.body = {
                    result: '',
                    variablesReference: 0
                };
                return this.sendResponse(response);
            }
            this.pythonProcess.ExecuteText(args.expression, Contracts_1.PythonEvaluationResultReprKind.Normal, frame).then(result => {
                let variablesReference = 0;
                // If this value can be expanded, then create a vars ref for user to expand it
                if (result.IsExpandable) {
                    const parentVariable = {
                        variables: [result],
                        evaluateChildren: true
                    };
                    variablesReference = this._variableHandles.create(parentVariable);
                }
                response.body = {
                    result: result.StringRepr,
                    variablesReference: variablesReference
                };
                this.sendResponse(response);
            }).catch(error => this.sendErrorResponse(response, 2000, error));
        });
    }
    scopesRequest(response, args) {
        this.debuggerLoaded.then(() => {
            const frame = this._pythonStackFrames.get(args.frameId);
            if (this.terminateEventSent || !frame || !this.pythonProcess) {
                response.body = {
                    scopes: []
                };
                return this.sendResponse(response);
            }
            const scopes = [];
            if (this.lastException && this.lastException.Description.length > 0) {
                const values = {
                    variables: [{
                            Frame: frame, Expression: 'Type',
                            Flags: Contracts_2.PythonEvaluationResultFlags.Raw,
                            StringRepr: this.lastException.TypeName,
                            TypeName: 'string', IsExpandable: false, HexRepr: '',
                            ChildName: '', ExceptionText: '', Length: 0, Process: undefined
                        },
                        {
                            Frame: frame, Expression: 'Description',
                            Flags: Contracts_2.PythonEvaluationResultFlags.Raw,
                            StringRepr: this.lastException.Description,
                            TypeName: 'string', IsExpandable: false, HexRepr: '',
                            ChildName: '', ExceptionText: '', Length: 0, Process: undefined
                        }],
                    evaluateChildren: false
                };
                scopes.push(new vscode_debugadapter_1.Scope("Exception", this._variableHandles.create(values), false));
                this.lastException = undefined;
            }
            if (Array.isArray(frame.Locals) && frame.Locals.length > 0) {
                const values = { variables: frame.Locals };
                scopes.push(new vscode_debugadapter_1.Scope("Local", this._variableHandles.create(values), false));
            }
            if (Array.isArray(frame.Parameters) && frame.Parameters.length > 0) {
                const values = { variables: frame.Parameters };
                scopes.push(new vscode_debugadapter_1.Scope("Arguments", this._variableHandles.create(values), false));
            }
            response.body = { scopes };
            this.sendResponse(response);
        });
    }
    variablesRequest(response, args) {
        const varRef = this._variableHandles.get(args.variablesReference);
        if (varRef.evaluateChildren !== true) {
            const variables = [];
            varRef.variables.forEach(variable => {
                let variablesReference = 0;
                // If this value can be expanded, then create a vars ref for user to expand it
                if (variable.IsExpandable) {
                    const parentVariable = {
                        variables: [variable],
                        evaluateChildren: true
                    };
                    variablesReference = this._variableHandles.create(parentVariable);
                }
                variables.push({
                    name: variable.Expression,
                    value: variable.StringRepr,
                    variablesReference: variablesReference
                });
            });
            response.body = {
                variables: variables
            };
            return this.sendResponse(response);
        }
        else {
            // Ok, we need to evaluate the children of the current variable.
            const variables = [];
            const promises = varRef.variables.map(variable => {
                return variable.Process.EnumChildren(variable.Expression, variable.Frame, CHILD_ENUMEARATION_TIMEOUT).then(children => {
                    children.forEach(child => {
                        let variablesReference = 0;
                        // If this value can be expanded, then create a vars ref for user to expand it
                        if (child.IsExpandable) {
                            const childVariable = {
                                variables: [child],
                                evaluateChildren: true
                            };
                            variablesReference = this._variableHandles.create(childVariable);
                        }
                        variables.push({
                            name: child.ChildName,
                            value: child.StringRepr,
                            variablesReference: variablesReference
                        });
                    });
                });
            });
            Promise.all(promises).then(() => {
                response.body = {
                    variables: variables
                };
                return this.sendResponse(response);
            }).catch(error => this.sendErrorResponse(response, 2001, error));
        }
    }
    pauseRequest(response) {
        this.pythonProcess.Break();
        this.sendResponse(response);
    }
    setExceptionBreakPointsRequest(response, args) {
        this.debuggerLoaded.then(() => {
            if (this.terminateEventSent) {
                return this.sendResponse(response);
            }
            let mode = Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_NEVER;
            if (args.filters.indexOf("uncaught") >= 0) {
                mode = Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_UNHANDLED;
            }
            if (args.filters.indexOf("all") >= 0) {
                mode = Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_ALWAYS;
            }
            const exToIgnore = new Map();
            const exceptionHandling = this.launchArgs ? this.launchArgs.exceptionHandling : null;
            if (exceptionHandling) {
                if (Array.isArray(exceptionHandling.ignore)) {
                    exceptionHandling.ignore.forEach(exType => {
                        exToIgnore.set(exType, Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_NEVER);
                    });
                }
                if (Array.isArray(exceptionHandling.always)) {
                    exceptionHandling.always.forEach(exType => {
                        exToIgnore.set(exType, Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_ALWAYS);
                    });
                }
                if (Array.isArray(exceptionHandling.unhandled)) {
                    exceptionHandling.unhandled.forEach(exType => {
                        exToIgnore.set(exType, Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_UNHANDLED);
                    });
                }
            }
            // Ignore StopIteration and GeneratorExit as they are used for
            // control flow and not error conditions.
            if (!exToIgnore.has('StopIteration')) {
                exToIgnore.set('StopIteration', Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_NEVER);
            }
            if (!exToIgnore.has('GeneratorExit')) {
                exToIgnore.set('GeneratorExit', Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_NEVER);
            }
            if (this.pythonProcess) {
                this.pythonProcess.SendExceptionInfo(mode, exToIgnore);
            }
            this.sendResponse(response);
        });
    }
    disconnectRequest(response, args) {
        this.stopDebugServer();
        this.sendResponse(response);
    }
    setVariableRequest(response, args) {
        const variable = this._variableHandles.get(args.variablesReference).variables.find(v => v.ChildName === args.name);
        if (!variable) {
            return this.sendErrorResponse(response, 2000, 'Variable reference not found');
        }
        this.pythonProcess.ExecuteText(`${args.name} = ${args.value}`, Contracts_1.PythonEvaluationResultReprKind.Normal, variable.Frame).then(() => {
            return this.pythonProcess.ExecuteText(args.name, Contracts_1.PythonEvaluationResultReprKind.Normal, variable.Frame).then(result => {
                // If this value can be expanded, then create a vars ref for user to expand it
                if (result.IsExpandable) {
                    const parentVariable = {
                        variables: [result],
                        evaluateChildren: true
                    };
                    this._variableHandles.create(parentVariable);
                }
                response.body = {
                    value: result.StringRepr
                };
                this.sendResponse(response);
            });
        }).catch(error => this.sendErrorResponse(response, 2000, error));
    }
}
__decorate([
    telemetry_1.sendPerformanceTelemetry(telemetry_1.PerformanceTelemetryCondition.stoppedEvent)
], PythonDebugger.prototype, "sendEvent", null);
__decorate([
    telemetry_1.sendPerformanceTelemetry(telemetry_1.PerformanceTelemetryCondition.always)
], PythonDebugger.prototype, "onPythonProcessLoaded", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('launch')
], PythonDebugger.prototype, "launchRequest", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('stepIn')
], PythonDebugger.prototype, "stepInRequest", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('stepOut')
], PythonDebugger.prototype, "stepOutRequest", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('continue')
], PythonDebugger.prototype, "continueRequest", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('next')
], PythonDebugger.prototype, "nextRequest", null);
exports.PythonDebugger = PythonDebugger;
process.stdin.on('error', () => { });
process.stdout.on('error', () => { });
process.stderr.on('error', () => { });
process.on('uncaughtException', (err) => {
    vscode_debugadapter_1.logger.error(`Uncaught Exception: ${err && err.message ? err.message : ''}`);
    vscode_debugadapter_1.logger.error(err && err.name ? err.name : '');
    vscode_debugadapter_1.logger.error(err && err.stack ? err.stack : '');
    // Catch all, incase we have string exceptions being raised.
    vscode_debugadapter_1.logger.error(err ? err.toString() : '');
    // Wait for 1 second before we die, we need to ensure errors are written to the log file.
    setTimeout(() => process.exit(-1), 1000);
});
vscode_debugadapter_1.LoggingDebugSession.run(PythonDebugger);
//# sourceMappingURL=Main.js.map