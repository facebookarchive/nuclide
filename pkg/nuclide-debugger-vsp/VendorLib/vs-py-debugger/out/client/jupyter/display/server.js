"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/10097
/// The following line in 'socket.io/index.d.ts' causes a compiler error
/// </reference types="node" />
/// Solution is to use typescript 2.0
/// <xreference path="../../../../node_modules/@types/socket.io/index.d.ts" />
// import * as io from 'socket.io';
// Temporary solution is to create our own definitions
const io = require('socket.io');
const http = require("http");
const helpers_1 = require("../../common/helpers");
const events_1 = require("events");
class Server extends events_1.EventEmitter {
    constructor() {
        super();
        this.clients = [];
        this.responsePromises = new Map();
    }
    dispose() {
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = null;
        }
        if (this.server) {
            this.server.close();
            this.server = null;
        }
        this.port = null;
    }
    start() {
        if (this.port) {
            return Promise.resolve(this.port);
        }
        let def = helpers_1.createDeferred();
        this.httpServer = http.createServer(this.listener.bind(this));
        this.server = io(this.httpServer);
        this.httpServer.listen(0, () => {
            this.port = this.httpServer.address().port;
            def.resolve(this.port);
            def = null;
        });
        this.httpServer.on('error', error => {
            if (def) {
                def.reject(error);
            }
        });
        this.server.on('connection', this.onSocketConnection.bind(this));
        return def.promise;
    }
    sendResults(data) {
        this.broadcast('results', data);
    }
    broadcast(eventName, data) {
        this.clients = this.clients.filter(client => client && client.connected);
        this.clients.forEach(client => {
            try {
                client.emit(eventName, data);
            }
            catch (ex) {
            }
        });
    }
    listener(request, response) {
    }
    onSocketConnection(socket) {
        this.clients.push(socket);
        socket.on('disconnect', () => {
            const index = this.clients.findIndex(sock => sock.id === socket.id);
            if (index >= 0) {
                this.clients.splice(index, 1);
            }
        });
        socket.on('clientExists', (data) => {
            if (!this.responsePromises.has(data.id)) {
                return;
            }
            const def = this.responsePromises.get(data.id);
            this.responsePromises.delete(data.id);
            def.resolve(true);
        });
        socket.on('appendResults', (data) => {
            this.emit('appendResults', data.append);
        });
    }
    clientsConnected(timeoutMilliSeconds) {
        const id = new Date().getTime().toString();
        const def = helpers_1.createDeferred();
        this.broadcast('clientExists', { id: id });
        this.responsePromises.set(id, def);
        setTimeout(() => {
            if (this.responsePromises.has(id)) {
                this.responsePromises.delete(id);
                def.resolve(false);
            }
        }, timeoutMilliSeconds);
        return def.promise;
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map