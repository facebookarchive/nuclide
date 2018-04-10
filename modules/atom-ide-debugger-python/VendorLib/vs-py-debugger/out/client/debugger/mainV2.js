// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
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
// tslint:disable:no-any max-func-body-length no-empty no-require-imports no-var-requires
if (Reflect.metadata === undefined) {
    require('reflect-metadata');
}
const os_1 = require("os");
const path = require("path");
const stream_1 = require("stream");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const logger_1 = require("vscode-debugadapter/lib/logger");
const messages_1 = require("vscode-debugadapter/lib/messages");
require("../../client/common/extensions");
const core_utils_1 = require("../common/core.utils");
const helpers_1 = require("../common/helpers");
const types_1 = require("../common/types");
const DebugFactory_1 = require("./DebugClients/DebugFactory");
const serviceRegistry_1 = require("./serviceRegistry");
const types_2 = require("./types");
const killProcessTree = require('tree-kill');
const DEBUGGER_CONNECT_TIMEOUT = 20000;
const MIN_DEBUGGER_CONNECT_TIMEOUT = 5000;
/**
 * Primary purpose of this class is to perform the handshake with VS Code and launch PTVSD process.
 * I.e. it communicate with VS Code before PTVSD gets into the picture, once PTVSD is launched, PTVSD will talk directly to VS Code.
 * We're re-using DebugSession so we don't have to handle request/response ourselves.
 * @export
 * @class PythonDebugger
 * @extends {DebugSession}
 */
class PythonDebugger extends vscode_debugadapter_1.DebugSession {
    constructor(serviceContainer) {
        super(false);
        this.serviceContainer = serviceContainer;
        this.client = helpers_1.createDeferred();
    }
    shutdown() {
        if (this.debugServer) {
            this.debugServer.Stop();
            this.debugServer = undefined;
        }
        if (this.debugClient) {
            this.debugClient.Stop();
            this.debugClient = undefined;
        }
        super.shutdown();
    }
    initializeRequest(response, args) {
        const body = response.body;
        body.supportsExceptionInfoRequest = true;
        body.supportsConfigurationDoneRequest = true;
        body.supportsConditionalBreakpoints = true;
        body.supportsSetVariable = true;
        body.supportsExceptionOptions = true;
        body.exceptionBreakpointFilters = [
            {
                filter: 'raised',
                label: 'Raised Exceptions',
                default: false
            },
            {
                filter: 'uncaught',
                label: 'Uncaught Exceptions',
                default: true
            }
        ];
        if (typeof args.supportsRunInTerminalRequest === 'boolean') {
            this.supportsRunInTerminalRequest = args.supportsRunInTerminalRequest;
        }
        this.sendResponse(response);
    }
    attachRequest(response, args) {
        this.sendResponse(response);
    }
    launchRequest(response, args) {
        this.launchPTVSD(args)
            .then(() => this.waitForPTVSDToConnect(args))
            .then(() => this.sendResponse(response))
            .catch(ex => {
            const message = this.getErrorUserFriendlyMessage(args, ex) || 'Debug Error';
            this.sendErrorResponse(response, { format: message, id: 1 }, undefined, undefined, vscode_debugadapter_1.ErrorDestination.User);
        });
    }
    launchPTVSD(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const launcher = DebugFactory_1.CreateLaunchDebugClient(args, this, this.supportsRunInTerminalRequest);
            this.debugServer = launcher.CreateDebugServer(undefined, this.serviceContainer);
            const serverInfo = yield this.debugServer.Start();
            return launcher.LaunchApplicationToDebug(serverInfo);
        });
    }
    waitForPTVSDToConnect(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let rejected = false;
                const duration = this.getConnectionTimeout(args);
                const timeout = setTimeout(() => {
                    rejected = true;
                    reject(new Error('Timeout waiting for debugger connection'));
                }, duration);
                try {
                    yield this.debugServer.client;
                    timeout.unref();
                    if (!rejected) {
                        resolve();
                    }
                }
                catch (ex) {
                    reject(ex);
                }
            }));
        });
    }
    getConnectionTimeout(args) {
        // The timeout can be overridden, but won't be documented unless we see the need for it.
        // This is just a fail safe mechanism, if the current timeout isn't enough (let study the current behaviour before exposing this setting).
        const connectionTimeout = typeof args.timeout === 'number' ? args.timeout : DEBUGGER_CONNECT_TIMEOUT;
        return Math.max(connectionTimeout, MIN_DEBUGGER_CONNECT_TIMEOUT);
    }
    getErrorUserFriendlyMessage(launchArgs, error) {
        if (!error) {
            return;
        }
        const errorMsg = typeof error === 'string' ? error : ((error.message && error.message.length > 0) ? error.message : '');
        if (helpers_1.isNotInstalledError(error)) {
            return `Failed to launch the Python Process, please validate the path '${launchArgs.pythonPath}'`;
        }
        else {
            return errorMsg;
        }
    }
}
exports.PythonDebugger = PythonDebugger;
/**
 * Glue that orchestrates communications between VS Code, PythonDebugger (DebugSession) and PTVSD.
 * @class DebugManager
 * @implements {Disposable}
 */
class DebugManager {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
        this.disposables = [];
        /**
         * Do not put any delays in here expecting VSC to receive messages. VSC could disconnect earlier (PTVSD #128).
         * If any delays are necessary, add them prior to calling this method.
         * If the program is forcefully terminated (e.g. killing terminal), we handle socket.on('error') or socket.on('close'),
         *  Under such circumstances, we need to send the terminated event asap (could be because VSC might be getting an error at its end due to piped stream being closed).
         * @private
         * @memberof DebugManager
         */
        this.shutdown = () => __awaiter(this, void 0, void 0, function* () {
            vscode_debugadapter_1.logger.verbose('check and shutdown');
            if (this.hasShutdown) {
                return;
            }
            this.hasShutdown = true;
            vscode_debugadapter_1.logger.verbose('shutdown');
            if (this.ptvsdSocket) {
                this.throughInputStream.unpipe(this.ptvsdSocket);
                this.ptvsdSocket.unpipe(this.throughOutputStream);
            }
            if (!this.terminatedEventSent) {
                // Possible VS Code has closed its stream.
                try {
                    vscode_debugadapter_1.logger.verbose('Sending Terminated Event');
                    this.sendMessage(new vscode_debugadapter_1.TerminatedEvent(), this.outputStream);
                }
                catch (err) {
                    const message = `Error in sending Terminated Event: ${err && err.message ? err.message : err.toString()}`;
                    const details = [message, err && err.name ? err.name : '', err && err.stack ? err.stack : ''].join(os_1.EOL);
                    vscode_debugadapter_1.logger.error(`${message}${os_1.EOL}${details}`);
                }
                this.terminatedEventSent = true;
            }
            if (this.killPTVSDProcess && this.ptvsdProcessId) {
                vscode_debugadapter_1.logger.verbose('killing process');
                try {
                    // 1. Wait for some time, its possible the program has run to completion.
                    // We need to wait till the process exits (else the message `Terminated: 15` gets printed onto the screen).
                    // 2. Also, its possible we manually sent the `Terminated` event above.
                    // Hence we need to wait till VSC receives the above event.
                    yield core_utils_1.sleep(100);
                    killProcessTree(this.ptvsdProcessId);
                }
                catch (_a) { }
                this.killPTVSDProcess = false;
                this.ptvsdProcessId = undefined;
            }
            if (this.debugSession) {
                vscode_debugadapter_1.logger.verbose('Shutting down debug session');
                this.debugSession.shutdown();
            }
            vscode_debugadapter_1.logger.verbose('disposing');
            yield core_utils_1.sleep(100);
            // Dispose last, we don't want to dispose the protocol loggers too early.
            this.disposables.forEach(disposable => disposable.dispose());
        });
        /**
         * Once PTVSD process has been started (done by DebugSession), we need to connect PTVSD socket to VS Code.
         * This allows PTVSD to communicate directly with VS Code.
         * @private
         * @memberof DebugManager
         */
        this.connectVSCodeToPTVSD = () => __awaiter(this, void 0, void 0, function* () {
            // By now we're connected to the client.
            this.ptvsdSocket = yield this.debugSession.debugServer.client;
            // We need to handle both end and error, sometimes the socket will error out without ending (if debugee is killed).
            // Note, we need a handler for the error event, else nodejs complains when socket gets closed and there are no error handlers.
            this.ptvsdSocket.on('end', this.shutdown);
            this.ptvsdSocket.on('error', this.shutdown);
            const debugSoketProtocolParser = this.serviceContainer.get(types_2.IProtocolParser);
            debugSoketProtocolParser.connect(this.ptvsdSocket);
            // Send PTVSD the launch request (PTVSD needs to do its own initialization using launch arguments).
            // E.g. redirectOutput & fixFilePathCase found in launch request are used to initialize the debugger.
            this.sendMessage(yield this.launchRequest, this.ptvsdSocket);
            yield new Promise(resolve => debugSoketProtocolParser.once('response_launch', resolve));
            // The PTVSD process has launched, now send the initialize request to it (required by PTVSD).
            this.sendMessage(yield this.initializeRequest, this.ptvsdSocket);
            // Keep track of processid for killing it.
            debugSoketProtocolParser.once('event_process', (proc) => {
                this.ptvsdProcessId = proc.body.systemProcessId;
            });
            // Wait for PTVSD to reply back with initialized event.
            debugSoketProtocolParser.once('event_initialized', (initialized) => {
                // Get ready for PTVSD to communicate directly with VS Code.
                this.inputStream.unpipe(this.debugSessionInputStream);
                this.debugSessionOutputStream.unpipe(this.outputStream);
                this.inputStream.pipe(this.ptvsdSocket);
                this.ptvsdSocket.pipe(this.throughOutputStream);
                this.ptvsdSocket.pipe(this.outputStream);
                // Forward the initialized event sent by PTVSD onto VSCode.
                // This is what will cause PTVSD to start the actualy work.
                this.sendMessage(initialized, this.outputStream);
            });
        });
        this.onRequestInitialize = (request) => {
            this.initializeRequestDeferred.resolve(request);
        };
        this.onRequestLaunch = (request) => {
            this.killPTVSDProcess = true;
            this.loggingEnabled = request.arguments.logToFile === true;
            this.launchRequestDeferred.resolve(request);
        };
        this.onEventTerminated = () => __awaiter(this, void 0, void 0, function* () {
            vscode_debugadapter_1.logger.verbose('onEventTerminated');
            this.terminatedEventSent = true;
            // Wait for sometime, untill the messages are sent out (remember, we're just intercepting streams here).
            setTimeout(this.shutdown, 300);
        });
        this.onResponseDisconnect = () => __awaiter(this, void 0, void 0, function* () {
            vscode_debugadapter_1.logger.verbose('onResponseDisconnect');
            // When VS Code sends a disconnect request, PTVSD replies back with a response, but its upto us to kill the process.
            // Wait for sometime, untill the messages are sent out (remember, we're just intercepting streams here).
            // Also its possible PTVSD might run to completion.
            setTimeout(this.shutdown, 100);
        });
        this.throughInputStream = new stream_1.PassThrough();
        this.throughOutputStream = new stream_1.PassThrough();
        this.debugSessionOutputStream = new stream_1.PassThrough();
        this.debugSessionInputStream = new stream_1.PassThrough();
        this.protocolMessageWriter = this.serviceContainer.get(types_2.IProtocolMessageWriter);
        this.inputProtocolParser = this.serviceContainer.get(types_2.IProtocolParser);
        this.inputProtocolParser.connect(this.throughInputStream);
        this.disposables.push(this.inputProtocolParser);
        this.outputProtocolParser = this.serviceContainer.get(types_2.IProtocolParser);
        this.outputProtocolParser.connect(this.throughOutputStream);
        this.disposables.push(this.outputProtocolParser);
        this.protocolLogger = this.serviceContainer.get(types_2.IProtocolLogger);
        this.protocolLogger.connect(this.throughInputStream, this.throughOutputStream);
        this.disposables.push(this.protocolLogger);
        this.initializeRequestDeferred = helpers_1.createDeferred();
        this.launchRequestDeferred = helpers_1.createDeferred();
    }
    get initializeRequest() {
        return this.initializeRequestDeferred.promise;
    }
    get launchRequest() {
        return this.launchRequestDeferred.promise;
    }
    set loggingEnabled(value) {
        if (value) {
            vscode_debugadapter_1.logger.setup(logger_1.LogLevel.Verbose, true);
            this.protocolLogger.setup(vscode_debugadapter_1.logger);
        }
    }
    dispose() {
        this.shutdown().ignoreErrors();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const debugStreamProvider = this.serviceContainer.get(types_2.IDebugStreamProvider);
            const { input, output } = yield debugStreamProvider.getInputAndOutputStreams();
            this.isServerMode = debugStreamProvider.useDebugSocketStream;
            this.inputStream = input;
            this.outputStream = output;
            this.inputStream.pause();
            if (!this.isServerMode) {
                const currentProcess = this.serviceContainer.get(types_1.ICurrentProcess);
                currentProcess.on('SIGTERM', this.shutdown);
            }
            this.interceptProtocolMessages();
            this.startDebugSession();
        });
    }
    sendMessage(message, outputStream) {
        this.protocolMessageWriter.write(outputStream, message);
        this.protocolMessageWriter.write(this.throughOutputStream, message);
    }
    startDebugSession() {
        this.debugSession = new PythonDebugger(this.serviceContainer);
        this.debugSession.setRunAsServer(this.isServerMode);
        this.debugSessionOutputStream.pipe(this.throughOutputStream);
        this.debugSessionOutputStream.pipe(this.outputStream);
        // Start handling requests in the session instance.
        // The session (PythonDebugger class) will only perform the bootstrapping (launching of PTVSD).
        this.inputStream.pipe(this.throughInputStream);
        this.inputStream.pipe(this.debugSessionInputStream);
        this.debugSession.start(this.debugSessionInputStream, this.debugSessionOutputStream);
    }
    interceptProtocolMessages() {
        // Keep track of the initialize and launch requests, we'll need to re-send these to ptvsd, for bootstrapping.
        this.inputProtocolParser.once('request_initialize', this.onRequestInitialize);
        this.inputProtocolParser.once('request_launch', this.onRequestLaunch);
        this.outputProtocolParser.once('event_terminated', this.onEventTerminated);
        this.outputProtocolParser.once('response_disconnect', this.onResponseDisconnect);
        this.outputProtocolParser.once('response_launch', this.connectVSCodeToPTVSD);
    }
}
function startDebugger() {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_debugadapter_1.logger.init(core_utils_1.noop, path.join(__dirname, '..', '..', '..', 'experimental_debug.log'));
        const serviceContainer = serviceRegistry_1.initializeIoc();
        const protocolMessageWriter = serviceContainer.get(types_2.IProtocolMessageWriter);
        try {
            // debugger;
            const debugManager = new DebugManager(serviceContainer);
            yield debugManager.start();
        }
        catch (err) {
            const message = `Debugger Error: ${err && err.message ? err.message : err.toString()}`;
            const details = [message, err && err.name ? err.name : '', err && err.stack ? err.stack : ''].join(os_1.EOL);
            vscode_debugadapter_1.logger.error(`${message}${os_1.EOL}${details}`);
            // Notify the user.
            protocolMessageWriter.write(process.stdout, new messages_1.Event('error', message));
            protocolMessageWriter.write(process.stdout, new vscode_debugadapter_1.OutputEvent(`${message}${os_1.EOL}${details}`, 'stderr'));
        }
    });
}
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
    setTimeout(() => process.exit(-1), 100);
});
startDebugger().catch(ex => {
    // Not necessary except for debugging and to kill linter warning about unhandled promises.
});
//# sourceMappingURL=mainV2.js.map