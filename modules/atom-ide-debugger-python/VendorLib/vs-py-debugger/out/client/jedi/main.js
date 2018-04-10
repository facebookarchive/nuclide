"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketClient_1 = require("./socketClient");
const socketServer_1 = require("../common/comms/socketServer");
const child_process = require("child_process");
const path = require("path");
const helpers_1 = require("../common/helpers");
const configSettings_1 = require("../common/configSettings");
const events_1 = require("events");
const commands_1 = require("./commands");
var Command;
(function (Command) {
    Command[Command["Completions"] = 0] = "Completions";
    Command[Command["Definition"] = 1] = "Definition";
    Command[Command["Hover"] = 2] = "Hover";
    Command[Command["References"] = 3] = "References";
    Command[Command["Signature"] = 4] = "Signature";
    Command[Command["DocumentSymbols"] = 5] = "DocumentSymbols";
})(Command = exports.Command || (exports.Command = {}));
const commandMapping = new Map();
commandMapping.set(Command.Completions, commands_1.RequestCommands.Completions);
commandMapping.set(Command.Definition, commands_1.RequestCommands.Definitions);
commandMapping.set(Command.Hover, commands_1.RequestCommands.Hover);
commandMapping.set(Command.References, commands_1.RequestCommands.Usages);
commandMapping.set(Command.Signature, commands_1.RequestCommands.Arguments);
commandMapping.set(Command.DocumentSymbols, commands_1.RequestCommands.Names);
class ClientAdapter extends events_1.EventEmitter {
    constructor(outputChannel, rootDir) {
        super();
        this.outputChannel = outputChannel;
        this.rootDir = rootDir;
    }
    getResult(responseParser, command, token, fileName, columnIndex, lineIndex, source) {
        const cmd = commandMapping.get(command);
        return this.socketClient.getResult(cmd, token, fileName, columnIndex, lineIndex, source)
            .then(responseParser);
    }
    dispose() {
        try {
            if (this.process) {
                this.process.stdin.write('\n');
            }
        }
        catch (ex) {
        }
        try {
            this.socketClient.dispose();
        }
        catch (ex) {
        }
        try {
            this.socketServer.Stop();
        }
        catch (ex) {
        }
        this.socketClient = null;
        this.process = null;
        this.socketServer = null;
        this.startDef = null;
    }
    start(envVariables) {
        if (this.startDef) {
            return this.startDef.promise;
        }
        this.startDef = helpers_1.createDeferred();
        const pyFile = path.join(__dirname, '..', '..', '..', '..', 'pythonFiles', 'completionServer.py');
        const newEnv = {};
        Object.assign(newEnv, envVariables);
        Object.assign(newEnv, process.env);
        this.startSocketServer().then(port => {
            const def = helpers_1.createDeferred();
            const options = { env: newEnv, cwd: this.rootDir };
            this.process = child_process.spawn(configSettings_1.PythonSettings.getInstance().pythonPath, [pyFile, port.toString()], options);
            this.process.stdout.setEncoding('utf8');
            this.process.stderr.setEncoding('utf8');
            let processStarted = false;
            let handshakeDone = false;
            this.process.stdout.on('data', (data) => {
                if (!processStarted && data.split(/\r?\n/g).some(line => line === 'Started')) {
                    processStarted = true;
                    if (processStarted && handshakeDone) {
                        def.resolve();
                    }
                    return;
                }
                this.outputChannel.append(data);
            });
            this.process.stderr.on('data', (data) => {
                this.outputChannel.append(data);
            });
            this.socketClient.on('handshake', () => {
                handshakeDone = true;
                if (processStarted && handshakeDone) {
                    def.resolve();
                }
            });
            return def.promise;
        }).then(() => {
            this.startDef.resolve();
        }).catch(reason => {
            this.startDef.reject(reason);
        });
        return this.startDef.promise;
    }
    startSocketServer() {
        this.socketServer = new socketServer_1.SocketServer();
        this.socketClient = new socketClient_1.SocketClient(this.socketServer, this.outputChannel);
        this.socketClient.on('status', status => {
            this.emit('status', status);
        });
        this.socketClient.on('error', error => {
            this.emit('error', error);
            console.error(error);
            this.outputChannel.appendLine('Error received: ' + error);
        });
        this.socketClient.on('commanderror', (commandError) => {
            this.outputChannel.appendLine(`Unhandled command Error from Autocompletion Library. '${JSON.stringify(commandError)}'`);
        });
        return this.socketServer.Start();
    }
}
exports.ClientAdapter = ClientAdapter;
//# sourceMappingURL=main.js.map