"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketCallbackHandler_1 = require("../../common/comms/socketCallbackHandler");
const commands_1 = require("./commands");
const idDispenser_1 = require("../../common/idDispenser");
const helpers_1 = require("../../common/helpers");
const contracts_1 = require("./contracts");
const helpers_2 = require("../common/helpers");
const Rx = require("rx");
const errors_1 = require("../common/errors");
class JupyterSocketClient extends socketCallbackHandler_1.SocketCallbackHandler {
    constructor(socketServer, outputChannel) {
        super(socketServer);
        this.outputChannel = outputChannel;
        this.pendingCommands = new Map();
        this.msgSubject = new Map();
        this.msgSubjectIndexedWithRunId = new Map();
        this.unhandledMessages = new Map();
        this.finalMessage = new Map();
        this.isDebugging = process.env['DEBUG_DJAYAMANNE_IPYTHON'] === '1';
        this.registerCommandHandler(commands_1.ResponseCommands.Pong, this.onPong.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.ListKernelsSpecs, this.onKernelsListed.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.Error, this.onError.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.KernelStarted, this.onKernelStarted.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.KernelInterrupted, this.onKernelCommandComplete.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.KernelRestarted, this.onKernelCommandComplete.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.KernelShutdown, this.onKernelCommandComplete.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.RunCode, this.onCodeSentForExecution.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.ShellResult, this.onShellResult.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.IOPUBMessage, this.onIOPUBMessage.bind(this));
        this.idDispenser = new idDispenser_1.IdDispenser();
    }
    writeToDebugLog(message) {
        if (!this.isDebugging) {
            return;
        }
        this.outputChannel.appendLine(message);
    }
    dispose() {
        super.dispose();
    }
    handleHandshake() {
        if (typeof this.guid !== 'string') {
            this.guid = this.stream.readStringInTransaction();
            if (typeof this.guid !== 'string') {
                return false;
            }
        }
        if (typeof this.pid !== 'number') {
            this.pid = this.stream.readInt32InTransaction();
            if (typeof this.pid !== 'number') {
                return false;
            }
        }
        this.emit('handshake');
        return true;
    }
    createId() {
        const def = helpers_1.createDeferred();
        const id = this.idDispenser.Allocate().toString();
        this.pendingCommands.set(id, def);
        return [def, id];
    }
    releaseId(id) {
        this.pendingCommands.delete(id);
        this.idDispenser.Free(parseInt(id));
    }
    listKernelSpecs() {
        const [def, id] = this.createId();
        this.SendRawCommand(commands_1.Commands.ListKernelSpecsBytes);
        this.stream.WriteString(id);
        return def.promise;
    }
    onKernelsListed() {
        const id = this.stream.readStringInTransaction();
        const kernels = this.stream.readStringInTransaction();
        if (typeof kernels !== 'string') {
            return;
        }
        const def = this.pendingCommands.get(id);
        this.releaseId(id);
        let kernelList;
        try {
            kernelList = JSON.parse(kernels);
        }
        catch (ex) {
            def.reject(ex);
            return;
        }
        def.resolve(kernelList);
    }
    startKernel(kernelName) {
        const [def, id] = this.createId();
        this.SendRawCommand(commands_1.Commands.StartKernelBytes);
        this.stream.WriteString(id);
        this.stream.WriteString(kernelName);
        return def.promise;
    }
    onKernelStarted() {
        const id = this.stream.readStringInTransaction();
        const kernelUUID = this.stream.readStringInTransaction();
        const configStr = this.stream.readStringInTransaction();
        const connectionFile = this.stream.readStringInTransaction();
        if (typeof connectionFile !== 'string') {
            return;
        }
        const def = this.pendingCommands.get(id);
        let config = {};
        try {
            config = JSON.parse(configStr);
        }
        catch (ex) {
            def.reject(ex);
            return;
        }
        this.releaseId(id);
        def.resolve([kernelUUID, config, connectionFile]);
    }
    sendKernelCommand(kernelUUID, command) {
        const [def, id] = this.createId();
        let commandBytes;
        let error;
        switch (command) {
            case contracts_1.KernelCommand.interrupt: {
                commandBytes = commands_1.Commands.InterruptKernelBytes;
                break;
            }
            case contracts_1.KernelCommand.restart: {
                commandBytes = commands_1.Commands.RestartKernelBytes;
                error = new errors_1.KernelRestartedError();
                break;
            }
            case contracts_1.KernelCommand.shutdown: {
                commandBytes = commands_1.Commands.ShutdownKernelBytes;
                error = new errors_1.KernelShutdownError();
                break;
            }
            default: {
                throw new Error('Unrecognized Kernel Command');
            }
        }
        this.SendRawCommand(commandBytes);
        this.stream.WriteString(id);
        this.stream.WriteString(kernelUUID);
        if (error) {
            // Throw errors for pending commands
            this.pendingCommands.forEach((pendingDef, key) => {
                if (id !== key) {
                    this.pendingCommands.delete(id);
                    pendingDef.reject(error);
                }
            });
            this.msgSubject.forEach((subject, key) => {
                subject.onError(error);
            });
            this.msgSubject.clear();
            this.unhandledMessages.clear();
            this.finalMessage.clear();
        }
        return def.promise;
    }
    onKernelCommandComplete() {
        const id = this.stream.readStringInTransaction();
        if (typeof id !== 'string') {
            return;
        }
        const def = this.pendingCommands.get(id);
        this.releaseId(id);
        def.resolve();
    }
    ping(message) {
        const [def, id] = this.createId();
        this.SendRawCommand(commands_1.Commands.PingBytes);
        this.stream.WriteString(id);
        this.stream.WriteString(message);
        return def.promise;
    }
    onPong() {
        const id = this.stream.readStringInTransaction();
        const message = this.stream.readStringInTransaction();
        if (typeof message !== 'string') {
            return;
        }
        const def = this.pendingCommands.get(id);
        this.releaseId(id);
        def.resolve(message);
    }
    runCode(code) {
        const [def, id] = this.createId();
        const observable = new Rx.Subject();
        this.msgSubjectIndexedWithRunId.set(id, observable);
        this.writeToDebugLog(`Send Code with Id = ${id}`);
        this.SendRawCommand(commands_1.Commands.RunCodeBytes);
        this.stream.WriteString(id);
        this.stream.WriteString(code);
        def.promise.then(msg_id => {
            // Do nothing, code moved to 
            // onCodeSentForExecution (so we have synchronous processing)
        }).catch(reason => {
            observable.onError(reason);
        });
        return observable;
    }
    onCodeSentForExecution() {
        const id = this.stream.readStringInTransaction();
        const msg_id = this.stream.readStringInTransaction();
        if (typeof msg_id !== 'string') {
            return;
        }
        this.writeToDebugLog(`Code with Id = ${id} has msg_id = ${msg_id}`);
        const def = this.pendingCommands.get(id);
        this.releaseId(id);
        def.resolve(msg_id);
        const observable = this.msgSubjectIndexedWithRunId.get(id);
        this.msgSubjectIndexedWithRunId.delete(id);
        this.msgSubject.set(msg_id, observable);
    }
    onShellResult() {
        const jsonResult = this.stream.readStringInTransaction();
        if (typeof jsonResult !== 'string') {
            return;
        }
        try {
            const message = JSON.parse(jsonResult);
            if (!helpers_2.Helpers.isValidMessag(message)) {
                return;
            }
            const msg_type = message.header.msg_type;
            if (msg_type === 'status') {
                this.writeToDebugLog(`Kernel Status = ${message.content.execution_state}`);
                this.emit('status', message.content.execution_state);
            }
            const msg_id = message.parent_header.msg_id;
            if (!msg_id) {
                return;
            }
            const status = message.content.status;
            let parsedMesage;
            switch (status) {
                case 'abort':
                case 'aborted':
                case 'error': {
                    // http://jupyter-client.readthedocs.io/en/latest/messaging.html#request-reply
                    if (msg_type !== 'complete_reply' && msg_type !== 'inspect_reply') {
                        parsedMesage = {
                            data: 'error',
                            type: 'text',
                            stream: 'status'
                        };
                    }
                    break;
                }
                case 'ok': {
                    // http://jupyter-client.readthedocs.io/en/latest/messaging.html#request-reply
                    if (msg_type !== 'complete_reply' && msg_type !== 'inspect_reply') {
                        parsedMesage = {
                            data: 'ok',
                            type: 'text',
                            stream: 'status'
                        };
                    }
                }
            }
            this.writeToDebugLog(`Shell Result with msg_id = ${msg_id} with status = ${status}`);
            if (!parsedMesage) {
                this.writeToDebugLog(`Shell Result with msg_id = ${msg_id} with status = ${status} ignored`);
                return;
            }
            this.writeToDebugLog(`Shell Result with msg_id = ${msg_id} has message of: '\n${jsonResult}`);
            if (this.finalMessage.has(msg_id) && this.msgSubject.has(msg_id)) {
                const subject = this.msgSubject.get(msg_id);
                const info = this.finalMessage.get(msg_id);
                this.writeToDebugLog(`Shell Result with msg_id = ${msg_id} found in finalMessage and msgSubject`);
                // If th io message with status='idle' has been received, that means message execution is deemed complete
                if (info.ioStatusSent) {
                    this.writeToDebugLog(`Shell Result with msg_id = ${msg_id} found in finalMessage and msgSubject, and ioStatusSent = true`);
                    this.finalMessage.delete(msg_id);
                    this.msgSubject.delete(msg_id);
                    subject.onNext(parsedMesage);
                    subject.onCompleted();
                }
                else {
                    this.writeToDebugLog(`Shell Result with msg_id = ${msg_id} found in finalMessage and msgSubject, and ioStatusSent = false`);
                }
            }
            else {
                this.writeToDebugLog(`Shell Result with msg_id = ${msg_id} not found in finalMessage or not found in msgSubject`);
                // Wait for the io message with status='idle' to arrive
                const info = this.finalMessage.has(msg_id) ? this.finalMessage.get(msg_id) : { ioStatusSent: false };
                info.shellMessage = parsedMesage;
                this.finalMessage.set(msg_id, info);
            }
        }
        catch (ex) {
            this.emit('shellmessagepareerror', ex, jsonResult);
        }
    }
    onIOPUBMessage() {
        const jsonResult = this.stream.readStringInTransaction();
        if (typeof jsonResult !== 'string') {
            return;
        }
        try {
            const message = JSON.parse(jsonResult);
            if (!helpers_2.Helpers.isValidMessag(message)) {
                return;
            }
            const msg_type = message.header.msg_type;
            if (msg_type === 'status') {
                this.writeToDebugLog(`io Kernel Status = ${message.content.execution_state}`);
                this.emit('status', message.content.execution_state);
            }
            const msg_id = message.parent_header.msg_id;
            if (!msg_id) {
                return;
            }
            this.writeToDebugLog(`iopub with msg_id = ${msg_id}`);
            // Ok, if we have received a status of 'idle' this means the execution has completed
            if (msg_type === 'status' && message.content.execution_state === 'idle') {
                this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle`);
                let timesWaited = 0;
                const waitForFinalIOMessage = () => {
                    timesWaited += 1;
                    // The Shell message handler has processed the message
                    if (!this.msgSubject.has(msg_id)) {
                        this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle, not yet in msgSubject`);
                        return;
                    }
                    // Last message sent on shell channel (status='ok' or status='error')
                    // and now we have a status message, this means the exection is deemed complete
                    if (this.finalMessage.has(msg_id)) {
                        this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle, found in finalMessage`);
                        const subject = this.msgSubject.get(msg_id);
                        const info = this.finalMessage.get(msg_id);
                        if (!info.shellMessage && timesWaited < 10) {
                            this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle, found in finalMessage and info.shellMessage = ` + typeof (info.shellMessage));
                            this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle, found in finalMessage and timesWaited = ` + timesWaited.toString());
                            setTimeout(() => {
                                waitForFinalIOMessage();
                            }, 10);
                            return;
                        }
                        this.finalMessage.delete(msg_id);
                        this.msgSubject.delete(msg_id);
                        this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle almost done`);
                        if (info.shellMessage) {
                            this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle, and shell message being sent out`);
                            subject.onNext(info.shellMessage);
                        }
                        this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle, done`);
                        subject.onCompleted();
                    }
                    else {
                        this.writeToDebugLog(`iopub with msg_id = ${msg_id} and msg_type == status and execution_state == idle, inserted into finalMessage`);
                        this.finalMessage.set(msg_id, { ioStatusSent: true });
                    }
                };
                // Wait for the shell message to come through
                setTimeout(() => {
                    waitForFinalIOMessage();
                }, 10);
            }
            const parsedMesage = helpers_2.Helpers.parseIOMessage(message);
            if (!parsedMesage) {
                return;
            }
            if (this.msgSubject.has(msg_id)) {
                this.writeToDebugLog(`iopub with msg_id = ${msg_id} found in msgSubject`);
                this.msgSubject.get(msg_id).onNext(parsedMesage);
            }
            else {
                this.writeToDebugLog(`iopub with msg_id = ${msg_id} not found in msgSubject and inserted into unhandledMessages`);
                let data = [];
                if (this.unhandledMessages.has(msg_id)) {
                    data = this.unhandledMessages.get(msg_id);
                }
                data.push(parsedMesage);
                this.unhandledMessages.set(msg_id, data);
                return;
            }
        }
        catch (ex) {
            this.emit('iopubmessagepareerror', ex, jsonResult);
        }
    }
    onError() {
        const cmd = this.stream.readStringInTransaction();
        const id = this.stream.readStringInTransaction();
        const trace = this.stream.readStringInTransaction();
        if (typeof trace !== 'string') {
            return;
        }
        if (cmd === 'exit') {
            return;
        }
        if (id.length > 0 && this.pendingCommands.has(id)) {
            const def = this.pendingCommands.get(id);
            this.pendingCommands.delete(id);
            def.reject(new Error(`Command: ${cmd}, Id: ${id}, Python Trace: ${trace}`));
            return;
        }
        this.emit("commanderror", { command: cmd, id: id, trace: trace });
    }
}
exports.JupyterSocketClient = JupyterSocketClient;
//# sourceMappingURL=jupyterSocketClient.js.map