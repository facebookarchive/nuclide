"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const SocketStream_1 = require("../client/common/comms/SocketStream");
const socketServer_1 = require("../client/common/comms/socketServer");
const socketCallbackHandler_1 = require("../client/common/comms/socketCallbackHandler");
const helpers_1 = require("../client/common/helpers");
const idDispenser_1 = require("../client/common/idDispenser");
const net = require("net");
const uint64be = require("uint64be");
class Commands {
}
Commands.ExitCommandBytes = new Buffer("exit");
Commands.PingBytes = new Buffer("ping");
Commands.ListKernelsBytes = new Buffer("lstk");
var ResponseCommands;
(function (ResponseCommands) {
    ResponseCommands.Pong = 'PONG';
    ResponseCommands.ListKernels = 'LSTK';
    ResponseCommands.Error = 'EROR';
})(ResponseCommands || (ResponseCommands = {}));
const GUID = 'This is the Guid';
const PID = 1234;
class MockSocketCallbackHandler extends socketCallbackHandler_1.SocketCallbackHandler {
    constructor(socketServer) {
        super(socketServer);
        this.registerCommandHandler(ResponseCommands.Pong, this.onPong.bind(this));
        this.registerCommandHandler(ResponseCommands.Error, this.onError.bind(this));
        this.idDispenser = new idDispenser_1.IdDispenser();
    }
    onError() {
        const message = this.stream.readStringInTransaction();
        if (message == undefined) {
            return;
        }
        this.emit("error", '', '', message);
    }
    ping(message) {
        this.SendRawCommand(Commands.PingBytes);
        const stringBuffer = new Buffer(message);
        let buffer = Buffer.concat([Buffer.concat([new Buffer('U'), uint64be.encode(stringBuffer.byteLength)]), stringBuffer]);
        this.stream.Write(buffer);
    }
    onPong() {
        const message = this.stream.readStringInTransaction();
        if (message == undefined) {
            return;
        }
        this.emit("pong", message);
    }
    handleHandshake() {
        if (!this.guid) {
            this.guid = this.stream.readStringInTransaction();
            if (this.guid == undefined) {
                return false;
            }
        }
        if (!this.pid) {
            this.pid = this.stream.readInt32InTransaction();
            if (this.pid == undefined) {
                return false;
            }
        }
        if (this.guid !== GUID) {
            this.emit('error', this.guid, GUID, 'Guids not the same');
            return true;
        }
        if (this.pid !== PID) {
            this.emit('error', this.pid, PID, 'pids not the same');
            return true;
        }
        this.emit("handshake");
        return true;
    }
}
class MockSocketClient {
    constructor(port) {
        this.port = port;
    }
    start() {
        this.def = helpers_1.createDeferred();
        this.socket = net.connect(this.port, this.connectionListener.bind(this));
        return this.def.promise;
    }
    connectionListener() {
        this.SocketStream = new SocketStream_1.SocketStream(this.socket, new Buffer(''));
        this.def.resolve();
        this.socket.on('data', (data) => {
            try {
                this.SocketStream.Append(data);
                // We can only receive ping messages
                this.SocketStream.BeginTransaction();
                const cmdId = new Buffer([this.SocketStream.ReadByte(), this.SocketStream.ReadByte(), this.SocketStream.ReadByte(), this.SocketStream.ReadByte()]).toString();
                const message = this.SocketStream.ReadString();
                if (message == undefined) {
                    this.SocketStream.EndTransaction();
                    return;
                }
                if (cmdId !== 'ping') {
                    this.SocketStream.Write(new Buffer(ResponseCommands.Error));
                    const errorMessage = `Received unknown command '${cmdId}'`;
                    const errorBuffer = Buffer.concat([Buffer.concat([new Buffer('A'), uint64be.encode(errorMessage.length)]), new Buffer(errorMessage)]);
                    this.SocketStream.Write(errorBuffer);
                    return;
                }
                this.SocketStream.Write(new Buffer(ResponseCommands.Pong));
                const messageBuffer = new Buffer(message);
                const pongBuffer = Buffer.concat([Buffer.concat([new Buffer('U'), uint64be.encode(messageBuffer.byteLength)]), messageBuffer]);
                this.SocketStream.Write(pongBuffer);
            }
            catch (ex) {
                this.SocketStream.Write(new Buffer(ResponseCommands.Error));
                const errorMessage = `Fatal error in handling data at socket client. Error: ${ex.message}`;
                const errorBuffer = Buffer.concat([Buffer.concat([new Buffer('A'), uint64be.encode(errorMessage.length)]), new Buffer(errorMessage)]);
                this.SocketStream.Write(errorBuffer);
            }
        });
    }
}
class MockSocket {
    constructor() {
        this._data = '';
    }
    get dataWritten() {
        return this._data;
    }
    get rawDataWritten() {
        return this._rawDataWritten;
    }
    write(data) {
        this._data = data + '';
        this._rawDataWritten = data;
    }
}
// Defines a Mocha test suite to group tests of similar kind together
suite('SocketCallbackHandler', () => {
    test('Succesful Handshake', done => {
        const socketServer = new socketServer_1.SocketServer();
        let socketClient;
        let callbackHandler;
        socketServer.Start().then(port => {
            callbackHandler = new MockSocketCallbackHandler(socketServer);
            socketClient = new MockSocketClient(port);
            return socketClient.start();
        }).then(() => {
            const def = helpers_1.createDeferred();
            let timeOut = setTimeout(() => {
                def.reject('Handshake not completed in allocated time');
            }, 5000);
            callbackHandler.on('handshake', () => {
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
                def.resolve();
            });
            callbackHandler.on('error', (actual, expected, message) => {
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
                def.reject({ actual: actual, expected: expected, message: message });
            });
            // Client has connected, now send information to the callback handler via sockets
            const guidBuffer = Buffer.concat([new Buffer('A'), uint64be.encode(GUID.length), new Buffer(GUID)]);
            socketClient.SocketStream.Write(guidBuffer);
            socketClient.SocketStream.WriteInt32(PID);
            return def.promise;
        }).then(done).catch(done);
    });
    test('Unsuccesful Handshake', done => {
        const socketServer = new socketServer_1.SocketServer();
        let socketClient;
        let callbackHandler;
        socketServer.Start().then(port => {
            callbackHandler = new MockSocketCallbackHandler(socketServer);
            socketClient = new MockSocketClient(port);
            return socketClient.start();
        }).then(() => {
            const def = helpers_1.createDeferred();
            let timeOut = setTimeout(() => {
                def.reject('Handshake not completed in allocated time');
            }, 5000);
            callbackHandler.on('handshake', () => {
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
                def.reject('handshake should fail, but it succeeded!');
            });
            callbackHandler.on('error', (actual, expected, message) => {
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
                if (actual === 0 && message === 'pids not the same') {
                    def.resolve();
                }
                else {
                    def.reject({ actual: actual, expected: expected, message: message });
                }
            });
            // Client has connected, now send information to the callback handler via sockets
            const guidBuffer = Buffer.concat([new Buffer('A'), uint64be.encode(GUID.length), new Buffer(GUID)]);
            socketClient.SocketStream.Write(guidBuffer);
            // Send the wrong pid
            socketClient.SocketStream.WriteInt32(0);
            return def.promise;
        }).then(done).catch(done);
    });
    test('Ping with message', done => {
        const socketServer = new socketServer_1.SocketServer();
        let socketClient;
        let callbackHandler;
        socketServer.Start().then(port => {
            callbackHandler = new MockSocketCallbackHandler(socketServer);
            socketClient = new MockSocketClient(port);
            return socketClient.start();
        }).then(() => {
            const def = helpers_1.createDeferred();
            const PING_MESSAGE = 'This is the Ping Message - Функция проверки ИНН и КПП - 说明';
            let timeOut = setTimeout(() => {
                def.reject('Handshake not completed in allocated time');
            }, 5000);
            callbackHandler.on('handshake', () => {
                // Send a custom message (only after handshake has been done)
                callbackHandler.ping(PING_MESSAGE);
            });
            callbackHandler.on('pong', (message) => {
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
                try {
                    assert.equal(message, PING_MESSAGE);
                    def.resolve();
                }
                catch (ex) {
                    def.reject(ex);
                }
            });
            callbackHandler.on('error', (actual, expected, message) => {
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
                def.reject({ actual: actual, expected: expected, message: message });
            });
            // Client has connected, now send information to the callback handler via sockets
            const guidBuffer = Buffer.concat([new Buffer('A'), uint64be.encode(GUID.length), new Buffer(GUID)]);
            socketClient.SocketStream.Write(guidBuffer);
            // Send the wrong pid
            socketClient.SocketStream.WriteInt32(PID);
            return def.promise;
        }).then(done).catch(done);
    });
});
//# sourceMappingURL=extension.common.comms.socketCallbackHandler.test.js.map