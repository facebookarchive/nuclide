"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_debugadapter_1 = require("vscode-debugadapter");
const vscode_debugadapter_2 = require("vscode-debugadapter");
const path = require("path");
const fs = require("fs");
const PythonProcess_1 = require("./PythonProcess");
const Contracts_1 = require("./Common/Contracts");
const DebugFactory_1 = require("./DebugClients/DebugFactory");
const Contracts_2 = require("./Common/Contracts");
const telemetryContracts = require("../common/telemetryContracts");
const Utils_1 = require("./Common/Utils");
const helpers_1 = require("../common/helpers");
const CHILD_ENUMEARATION_TIMEOUT = 5000;
class PythonDebugger extends vscode_debugadapter_1.DebugSession {
    constructor(debuggerLinesStartAt1, isServer) {
        super(debuggerLinesStartAt1, isServer === true);
        this.breakPointCounter = 0;
        this._variableHandles = new vscode_debugadapter_1.Handles();
        this._pythonStackFrames = new vscode_debugadapter_1.Handles();
        this.registeredBreakpoints = new Map();
        this.registeredBreakpointsByFileName = new Map();
        this.debuggerLoaded = new Promise(resolve => {
            this.debuggerLoadedPromiseResolve = resolve;
        });
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
            programDirectory = this.launchArgs ? path.dirname(this.launchArgs.program) : this.attachArgs.localRoot;
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
            this.debugClient = null;
        }
        if (this.pythonProcess) {
            this.pythonProcess.Kill();
            this.pythonProcess = null;
        }
    }
    InitializeEventHandlers() {
        this.pythonProcess.on("last", arg => this.onLastCommand());
        this.pythonProcess.on("threadExited", arg => this.onPythonThreadExited(arg));
        this.pythonProcess.on("moduleLoaded", arg => this.onPythonModuleLoaded(arg));
        this.pythonProcess.on("threadCreated", arg => this.onPythonThreadCreated(arg));
        this.pythonProcess.on("processLoaded", arg => this.onPythonProcessLoaded(arg));
        this.pythonProcess.on("output", (pyThread, output) => this.onDebuggerOutput(pyThread, output));
        this.pythonProcess.on("exceptionRaised", (pyThread, ex) => this.onPythonException(pyThread, ex));
        this.pythonProcess.on("breakpointHit", (pyThread, breakpointId) => this.onBreakpointHit(pyThread, breakpointId));
        this.pythonProcess.on("stepCompleted", (pyThread) => this.onStepCompleted(pyThread));
        this.pythonProcess.on("detach", () => this.onDetachDebugger());
        this.pythonProcess.on("error", ex => this.sendEvent(new vscode_debugadapter_1.OutputEvent(ex, "stderr")));
        this.pythonProcess.on("asyncBreakCompleted", arg => this.onPythonProcessPaused(arg));
        this.debugServer.on("detach", () => this.onDetachDebugger());
    }
    onLastCommand() {
        // If we're running in terminal (integrated or external)
        // Then don't stop the debug server
        if (this.launchArgs && (this.launchArgs.console === "externalTerminal" ||
            this.launchArgs.console === "integratedTerminal")) {
            return;
        }
        // Else default behaviour as previous, which was to perform the same as onDetachDebugger
        this.onDetachDebugger();
    }
    onDetachDebugger() {
        this.stopDebugServer();
        this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
        this.shutdown();
    }
    onPythonThreadCreated(pyThread) {
        this.sendEvent(new vscode_debugadapter_2.ThreadEvent("started", pyThread.Id));
    }
    onStepCompleted(pyThread) {
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("step", pyThread.Id));
    }
    onPythonException(pyThread, ex) {
        this.lastException = ex;
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("exception", pyThread.Id, `${ex.TypeName}, ${ex.Description}`));
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(`${ex.TypeName}, ${ex.Description}\n`, "stderr"));
    }
    onPythonThreadExited(pyThread) {
        this.sendEvent(new vscode_debugadapter_2.ThreadEvent("exited", pyThread.Id));
    }
    onPythonProcessPaused(pyThread) {
        this.sendEvent(new vscode_debugadapter_1.StoppedEvent("user request", pyThread.Id));
    }
    onPythonModuleLoaded(module) {
    }
    onPythonProcessLoaded(pyThread) {
        this.debuggerHasLoaded = true;
        this.sendResponse(this.entryResponse);
        this.debuggerLoadedPromiseResolve();
        if (this.launchArgs && !this.launchArgs.console) {
            this.launchArgs.console = this.launchArgs.externalConsole === true ? 'externalTerminal' : 'none';
        }
        // If launching the integrated terminal is not supported, then defer to external terminal
        // that will be displayed by our own code
        if (!this._supportsRunInTerminalRequest && this.launchArgs && this.launchArgs.console === 'integratedTerminal') {
            this.launchArgs.console = 'externalTerminal';
        }
        if (this.launchArgs && this.launchArgs.stopOnEntry === true) {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent("entry", pyThread.Id));
        }
        else if (this.launchArgs && this.launchArgs.stopOnEntry === false) {
            this.configurationDone.then(() => {
                this.pythonProcess.SendResumeThread(pyThread.Id);
            });
        }
        else {
            this.pythonProcess.SendResumeThread(pyThread.Id);
        }
    }
    onDebuggerOutput(pyThread, output) {
        if (!this.debuggerHasLoaded) {
            this.sendResponse(this.entryResponse);
            this.debuggerLoadedPromiseResolve();
        }
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(output, "stdout"));
    }
    canStartDebugger() {
        return Promise.resolve(true);
    }
    launchRequest(response, args) {
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
        if (Array.isArray(args.debugOptions) && args.debugOptions.indexOf("Pyramid") >= 0) {
            if (fs.existsSync(args.pythonPath)) {
                args.program = path.join(path.dirname(args.pythonPath), "pserve");
            }
            else {
                args.program = "pserve";
            }
        }
        // Confirm the file exists
        if (typeof args.module !== 'string' || args.module.length === 0) {
            if (!fs.existsSync(args.program)) {
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
        // this.sendEvent(new TelemetryEvent(telemetryContracts.Debugger.Load, {
        //     Debug_Console: args.console,
        //     Debug_DebugOptions: args.debugOptions.join(","),
        //     Debug_DJango: args.debugOptions.indexOf("DjangoDebugging") >= 0 ? "true" : "false",
        //     Debug_PySpark: typeof args.pythonPath === 'string' && args.pythonPath.indexOf('spark-submit') > 0 ? 'true' : 'false',
        //     Debug_HasEnvVaraibles: args.env && typeof args.env === "object" && Object.keys(args.env).length > 0 ? "true" : "false"
        // }));
        this.launchArgs = args;
        this.debugClient = DebugFactory_1.CreateLaunchDebugClient(args, this);
        //this.debugClient.on('exit', () => this.sendEvent(new TerminatedEvent()));
        this.configurationDone = new Promise(resolve => {
            this.configurationDonePromiseResolve = resolve;
        });
        this.entryResponse = response;
        let that = this;
        this.startDebugServer().then(dbgServer => {
            return that.debugClient.LaunchApplicationToDebug(dbgServer, that.unhandledProcessError.bind(that));
        }).catch(error => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(error + "\n", "stderr"));
            response.success = false;
            let errorMsg = typeof error === "string" ? error : ((error.message && error.message.length > 0) ? error.message : error + '');
            if (helpers_1.isNotInstalledError(error)) {
                errorMsg = `Failed to launch the Python Process, please validate the path '${this.launchArgs.pythonPath}'`;
            }
            this.sendErrorResponse(response, 200, errorMsg);
        });
    }
    unhandledProcessError(error) {
        if (!error) {
            return;
        }
        let errorMsg = typeof error === "string" ? error : ((error.message && error.message.length > 0) ? error.message : "");
        if (helpers_1.isNotInstalledError(error)) {
            errorMsg = `Failed to launch the Python Process, please validate the path '${this.launchArgs.pythonPath}'`;
        }
        if (errorMsg.length > 0) {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(errorMsg + "\n", "stderr"));
        }
        this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
    }
    attachRequest(response, args) {
        this.sendEvent(new Contracts_2.TelemetryEvent(telemetryContracts.Debugger.Attach));
        this.attachArgs = args;
        this.debugClient = DebugFactory_1.CreateAttachDebugClient(args, this);
        this.entryResponse = response;
        let that = this;
        this.canStartDebugger().then(() => {
            return this.startDebugServer();
        }).then(dbgServer => {
            return that.debugClient.LaunchApplicationToDebug(dbgServer, () => { });
        }).catch(error => {
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(error + "\n", "stderr"));
            this.sendErrorResponse(that.entryResponse, 2000, error);
        });
    }
    configurationDoneRequest(response, args) {
        // Tell debugger we have loaded the breakpoints
        if (this.configurationDonePromiseResolve) {
            this.configurationDonePromiseResolve();
            this.configurationDonePromiseResolve = null;
        }
        this.sendResponse(response);
    }
    onBreakpointHit(pyThread, breakpointId) {
        // Break only if the breakpoint exists and it is enabled
        if (this.registeredBreakpoints.has(breakpointId) && this.registeredBreakpoints.get(breakpointId).Enabled === true) {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent("breakpoint", pyThread.Id));
        }
        else {
            this.pythonProcess.SendResumeThread(pyThread.Id);
        }
    }
    buildBreakpointDetails(filePath, line, condition) {
        let isDjangoFile = false;
        if (this.launchArgs != null &&
            Array.isArray(this.launchArgs.debugOptions) &&
            this.launchArgs.debugOptions.indexOf(Contracts_2.DebugOptions.DjangoDebugging) >= 0) {
            isDjangoFile = filePath.toUpperCase().endsWith(".HTML");
        }
        if (this.attachArgs != null &&
            Array.isArray(this.attachArgs.debugOptions) &&
            this.attachArgs.debugOptions.indexOf(Contracts_2.DebugOptions.DjangoDebugging) >= 0) {
            isDjangoFile = filePath.toUpperCase().endsWith(".HTML");
        }
        condition = typeof condition === "string" ? condition : "";
        return {
            Condition: condition,
            ConditionKind: condition.length === 0 ? Contracts_1.PythonBreakpointConditionKind.Always : Contracts_1.PythonBreakpointConditionKind.WhenTrue,
            Filename: filePath,
            Id: this.breakPointCounter++,
            LineNo: line,
            PassCount: 0,
            PassCountKind: Contracts_1.PythonBreakpointPassCountKind.Always,
            IsDjangoBreakpoint: isDjangoFile,
            Enabled: true
        };
    }
    setBreakPointsRequest(response, args) {
        this.debuggerLoaded.then(() => {
            if (!this.registeredBreakpointsByFileName.has(args.source.path)) {
                this.registeredBreakpointsByFileName.set(args.source.path, []);
            }
            let breakpoints = [];
            let linesToAdd = args.breakpoints.map(b => b.line);
            let registeredBks = this.registeredBreakpointsByFileName.get(args.source.path);
            let linesToRemove = registeredBks.map(b => b.LineNo).filter(oldLine => linesToAdd.indexOf(oldLine) === -1);
            // let linesToUpdate = registeredBks.map(b => b.LineNo).filter(oldLine => linesToAdd.indexOf(oldLine) >= 0);
            // Always add new breakpoints, don't re-enable previous breakpoints
            // Cuz sometimes some breakpoints get added too early (e.g. in django) and don't get registeredBks
            // and the response comes back indicating it wasn't set properly
            // However, at a later point in time, the program breaks at that point!!!
            let linesToAddPromises = args.breakpoints.map(bk => {
                return new Promise(resolve => {
                    let breakpoint;
                    let existingBreakpointsForThisLine = registeredBks.filter(registeredBk => registeredBk.LineNo === bk.line);
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
                        breakpoints.push({ verified: true, line: bk.line });
                        registeredBks.push(breakpoint);
                        resolve();
                    }).catch(reason => {
                        this.registeredBreakpoints.set(breakpoint.Id, breakpoint);
                        breakpoints.push({ verified: false, line: bk.line });
                        registeredBks.push(breakpoint);
                        resolve();
                    });
                });
            });
            let linesToRemovePromises = linesToRemove.map(line => {
                return new Promise(resolve => {
                    let registeredBks = this.registeredBreakpointsByFileName.get(args.source.path);
                    let bk = registeredBks.filter(b => b.LineNo === line)[0];
                    // Ok, we won't get a response back, so update the breakpoints list  indicating this has been disabled
                    bk.Enabled = false;
                    this.pythonProcess.DisableBreakPoint(bk);
                    resolve();
                });
            });
            let promises = linesToAddPromises.concat(linesToRemovePromises);
            Promise.all(promises).then(() => {
                response.body = {
                    breakpoints: breakpoints
                };
                this.sendResponse(response);
                // Tell debugger we have loaded the breakpoints
                if (this.configurationDonePromiseResolve) {
                    this.configurationDonePromiseResolve();
                    this.configurationDonePromiseResolve = null;
                }
            }).catch(error => this.sendErrorResponse(response, 2000, error));
        });
    }
    threadsRequest(response) {
        let threads = [];
        this.pythonProcess.Threads.forEach(t => {
            threads.push(new vscode_debugadapter_1.Thread(t.Id, t.Name));
        });
        response.body = {
            threads: threads
        };
        this.sendResponse(response);
    }
    /** converts the remote path to local path */
    convertDebuggerPathToClient(remotePath) {
        if (this.attachArgs && this.attachArgs.localRoot && this.attachArgs.remoteRoot) {
            let path2 = path.win32;
            if (this.attachArgs.remoteRoot.indexOf('/') !== -1) {
                path2 = path.posix;
            }
            let pathRelativeToSourceRoot = path2.relative(this.attachArgs.remoteRoot, remotePath);
            // resolve from the local source root
            let clientPath = path.resolve(this.attachArgs.localRoot, pathRelativeToSourceRoot);
            return clientPath;
        }
        else {
            return remotePath;
        }
    }
    /** converts the local path to remote path */
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
            if (!this.pythonProcess.Threads.has(args.threadId)) {
                response.body = {
                    stackFrames: []
                };
                this.sendResponse(response);
            }
            let pyThread = this.pythonProcess.Threads.get(args.threadId);
            let maxFrames = typeof args.levels === "number" && args.levels > 0 ? args.levels : pyThread.Frames.length - 1;
            maxFrames = maxFrames < pyThread.Frames.length ? maxFrames : pyThread.Frames.length;
            let frames = pyThread.Frames.map(frame => {
                return Utils_1.validatePath(this.convertDebuggerPathToClient(frame.FileName)).then(fileName => {
                    let frameId = this._pythonStackFrames.create(frame);
                    if (fileName.length === 0) {
                        return new vscode_debugadapter_1.StackFrame(frameId, frame.FunctionName);
                    }
                    else {
                        return new vscode_debugadapter_1.StackFrame(frameId, frame.FunctionName, new vscode_debugadapter_1.Source(path.basename(frame.FileName), fileName), this.convertDebuggerLineToClient(frame.LineNo - 1), 0);
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
            let frame = this._pythonStackFrames.get(args.frameId);
            if (!frame) {
                response.body = {
                    result: null,
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
            let frame = this._pythonStackFrames.get(args.frameId);
            if (!frame) {
                response.body = {
                    scopes: []
                };
                return this.sendResponse(response);
            }
            let scopes = [];
            if (typeof this.lastException === 'object' && this.lastException !== null && this.lastException.Description.length > 0) {
                let values = {
                    variables: [{
                            Frame: frame, Expression: 'Type',
                            Flags: Contracts_2.PythonEvaluationResultFlags.Raw,
                            StringRepr: this.lastException.TypeName,
                            TypeName: 'string', IsExpandable: false, HexRepr: '',
                            ChildName: '', ExceptionText: '', Length: 0, Process: null
                        },
                        {
                            Frame: frame, Expression: 'Description',
                            Flags: Contracts_2.PythonEvaluationResultFlags.Raw,
                            StringRepr: this.lastException.Description,
                            TypeName: 'string', IsExpandable: false, HexRepr: '',
                            ChildName: '', ExceptionText: '', Length: 0, Process: null
                        }],
                    evaluateChildren: false
                };
                scopes.push(new vscode_debugadapter_1.Scope("Exception", this._variableHandles.create(values), false));
                this.lastException = null;
            }
            if (Array.isArray(frame.Locals) && frame.Locals.length > 0) {
                let values = { variables: frame.Locals };
                scopes.push(new vscode_debugadapter_1.Scope("Local", this._variableHandles.create(values), false));
            }
            if (Array.isArray(frame.Parameters) && frame.Parameters.length > 0) {
                let values = { variables: frame.Parameters };
                scopes.push(new vscode_debugadapter_1.Scope("Arguments", this._variableHandles.create(values), false));
            }
            response.body = { scopes };
            this.sendResponse(response);
        });
    }
    variablesRequest(response, args) {
        let varRef = this._variableHandles.get(args.variablesReference);
        if (varRef.evaluateChildren !== true) {
            let variables = [];
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
        // Ok, we need to evaluate the children of the current variable
        let variables = [];
        let promises = varRef.variables.map(variable => {
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
    pauseRequest(response) {
        this.pythonProcess.Break();
        this.sendResponse(response);
    }
    setExceptionBreakPointsRequest(response, args) {
        this.debuggerLoaded.then(() => {
            let mode = Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_NEVER;
            if (args.filters.indexOf("uncaught") >= 0) {
                mode = Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_UNHANDLED;
            }
            if (args.filters.indexOf("all") >= 0) {
                mode = Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_ALWAYS;
            }
            let exToIgnore = new Map();
            let exceptionHandling = this.launchArgs ? this.launchArgs.exceptionHandling : null;
            // Todo: exception handling for remote debugging
            // let exceptionHandling = this.launchArgs ? this.launchArgs.exceptionHandling : this.attachArgs.exceptionHandling;
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
            // For some reason on python 3.5 iterating through generators throws the StopIteration, GeneratorExit Exceptions
            // https://docs.python.org/2/library/exceptions.html#exceptions.StandardError
            // Lets ignore them
            if (!exToIgnore.has('StopIteration')) {
                exToIgnore.set('StopIteration', Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_NEVER);
            }
            if (!exToIgnore.has('GeneratorExit')) {
                exToIgnore.set('GeneratorExit', Contracts_1.enum_EXCEPTION_STATE.BREAK_MODE_NEVER);
            }
            this.pythonProcess.SendExceptionInfo(mode, exToIgnore);
            this.sendResponse(response);
        });
    }
    disconnectRequest(response, args) {
        this.stopDebugServer();
        this.sendResponse(response);
    }
    setVariableRequest(response, args) {
        let variable = this._variableHandles.get(args.variablesReference).variables.find(v => v.ChildName === args.name);
        if (!variable) {
            return this.sendErrorResponse(response, 2000, 'Variable reference not found');
        }
        this.pythonProcess.ExecuteText(`${args.name} = ${args.value}`, Contracts_1.PythonEvaluationResultReprKind.Normal, variable.Frame).then(result => {
            return this.pythonProcess.ExecuteText(args.name, Contracts_1.PythonEvaluationResultReprKind.Normal, variable.Frame).then(result => {
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
                    value: result.StringRepr
                };
                this.sendResponse(response);
            });
        }).catch(error => this.sendErrorResponse(response, 2000, error));
    }
}
exports.PythonDebugger = PythonDebugger;
vscode_debugadapter_1.DebugSession.run(PythonDebugger);
//# sourceMappingURL=Main.js.map
