'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const fs = require("fs");
const os = require("os");
const helpers_1 = require("../../common/helpers");
const events_1 = require("events");
const MaxConnections = 100;
function getIPType() {
    const networkInterfaces = os.networkInterfaces();
    let IPType = '';
    if (networkInterfaces && Array.isArray(networkInterfaces) && networkInterfaces.length > 0) {
        // getting the family of first network interface available
        IPType = networkInterfaces[Object.keys(networkInterfaces)[0]][0].family;
    }
    return IPType;
}
class Server extends events_1.EventEmitter {
    constructor() {
        super();
        this.sockets = [];
        this.ipcBuffer = '';
        this.path = (getIPType() === 'IPv6') ? '::1' : '127.0.0.1';
    }
    get clientsConnected() {
        return this.sockets.length > 0;
    }
    dispose() {
        this.stop();
    }
    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }
    start() {
        this.startedDef = helpers_1.createDeferred();
        fs.unlink(this.path, () => {
            this.server = net.createServer(this.connectionListener.bind(this));
            this.server.maxConnections = MaxConnections;
            this.server.on('error', (err) => {
                if (this.startedDef) {
                    this.startedDef.reject(err);
                    this.startedDef = null;
                }
                this.emit('error', err);
            });
            this.log('starting server as', 'TCP');
            this.server.listen(0, this.path, (socket) => {
                this.startedDef.resolve(this.server.address().port);
                this.startedDef = null;
                this.emit('start', socket);
            });
        });
        return this.startedDef.promise;
    }
    connectionListener(socket) {
        this.sockets.push(socket);
        socket.setEncoding('utf8');
        this.log('## socket connection to server detected ##');
        socket.on('close', this.onCloseSocket.bind(this));
        socket.on('error', (err) => {
            this.log('server socket error', err);
            this.emit('error', err);
        });
        socket.on('data', (data) => {
            let sock = socket;
            // Assume we have just one client socket connection
            let dataStr = this.ipcBuffer += data;
            while (true) {
                const startIndex = dataStr.indexOf('{');
                if (startIndex === -1) {
                    return;
                }
                const lengthOfMessage = parseInt(dataStr.slice(dataStr.indexOf(':') + 1, dataStr.indexOf('{')).trim());
                if (dataStr.length < startIndex + lengthOfMessage) {
                    return;
                }
                const message = JSON.parse(dataStr.substring(startIndex, lengthOfMessage + startIndex));
                dataStr = this.ipcBuffer = dataStr.substring(startIndex + lengthOfMessage);
                this.emit(message.event, message.body, sock);
            }
        });
        this.emit('connect', socket);
    }
    log(message, ...data) {
        this.emit('log', message, ...data);
    }
    onCloseSocket() {
        for (let i = 0, count = this.sockets.length; i < count; i++) {
            let socket = this.sockets[i];
            let destroyedSocketId = false;
            if (socket && socket.readable) {
                continue;
            }
            if (socket.id) {
                destroyedSocketId = socket.id;
            }
            this.log('socket disconnected', destroyedSocketId.toString());
            if (socket && socket.destroy) {
                socket.destroy();
            }
            this.sockets.splice(i, 1);
            this.emit('socket.disconnected', socket, destroyedSocketId);
            return;
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=socketServer.js.map