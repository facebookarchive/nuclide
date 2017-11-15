"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketCallbackHandler_1 = require("../common/comms/socketCallbackHandler");
const commands_1 = require("./commands");
const idDispenser_1 = require("../common/idDispenser");
const helpers_1 = require("../common/helpers");
class SocketClient extends socketCallbackHandler_1.SocketCallbackHandler {
    constructor(socketServer, outputChannel) {
        super(socketServer);
        this.outputChannel = outputChannel;
        this.pendingCommands = new Map();
        this.registerCommandHandler(commands_1.ResponseCommands.Pong, this.onPong.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.Error, this.onError.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.TraceLog, this.onWriteToLog.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.Signature, this.onResponseReceived.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.Completions, this.onResponseReceived.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.Definitions, this.onResponseReceived.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.Hover, this.onResponseReceived.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.DocumentSymbols, this.onResponseReceived.bind(this));
        this.registerCommandHandler(commands_1.ResponseCommands.References, this.onResponseReceived.bind(this));
        this.idDispenser = new idDispenser_1.IdDispenser();
    }
    getResult(command, token, fileName, columnIndex, lineIndex, source) {
        const [def, id] = this.createId(token);
        this.SendRawCommand(command);
        this.stream.WriteString(id);
        this.stream.WriteString(fileName);
        this.stream.WriteInt32(columnIndex);
        this.stream.WriteInt32(lineIndex);
        this.stream.WriteString(source || '');
        return def.promise;
    }
    dispose() {
        super.dispose();
    }
    handleHandshake() {
        if (typeof this.pid !== 'number') {
            this.pid = this.stream.readInt32InTransaction();
            if (typeof this.pid !== 'number') {
                return false;
            }
        }
        this.emit('handshake');
        return true;
    }
    createId(token) {
        const def = helpers_1.createDeferred();
        const id = this.idDispenser.Allocate().toString();
        this.pendingCommands.set(id, def);
        if (token) {
            token.onCancellationRequested(() => {
                this.releaseId(id);
            });
        }
        return [def, id];
    }
    releaseId(id) {
        this.pendingCommands.delete(id);
        this.idDispenser.Free(parseInt(id));
    }
    onResponseReceived() {
        const id = this.stream.readStringInTransaction();
        const responseStr = this.stream.readStringInTransaction();
        if (typeof responseStr !== 'string') {
            return;
        }
        if (!this.pendingCommands.has(id)) {
            return;
        }
        const def = this.pendingCommands.get(id);
        this.releaseId(id);
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseStr);
        }
        catch (ex) {
            def.reject(ex);
            return;
        }
        def.resolve(jsonResponse);
    }
    onWriteToLog() {
        const message = this.stream.readStringInTransaction();
        if (typeof message !== 'string') {
            return;
        }
        this.outputChannel.appendLine(message);
    }
    ping(message) {
        const [def, id] = this.createId(null);
        this.SendRawCommand(commands_1.RequestCommands.Ping);
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
exports.SocketClient = SocketClient;
//# sourceMappingURL=socketClient.js.map