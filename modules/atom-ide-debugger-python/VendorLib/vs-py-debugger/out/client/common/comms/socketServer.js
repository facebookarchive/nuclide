"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const events_1 = require("events");
const helpers_1 = require("../helpers");
class SocketServer extends events_1.EventEmitter {
    constructor() {
        super();
        this.socketServer = null;
    }
    Stop() {
        if (this.socketServer === null) {
            return;
        }
        try {
            this.socketServer.close();
        }
        catch (ex) { }
        this.socketServer = null;
    }
    Start() {
        const def = helpers_1.createDeferred();
        this.socketServer = net.createServer(this.connectionListener.bind(this));
        this.socketServer.listen(0, function () {
            def.resolve(this.socketServer.address().port);
        }.bind(this));
        this.socketServer.on("error", ex => {
            console.error('Error in Socket Server', ex);
            if (def.completed) {
                // Ooops
                debugger;
            }
            const msg = `Failed to start the socket server. (Error: ${ex.message})`;
            def.reject(msg);
        });
        return def.promise;
    }
    connectionListener(client) {
        client.on("close", function () {
            this.emit('close', client);
        }.bind(this));
        client.on("data", function (data) {
            this.emit('data', client, data);
        }.bind(this));
        client.on("timeout", d => {
            // let msg = "Debugger client timedout, " + d;
        });
    }
}
exports.SocketServer = SocketServer;
//# sourceMappingURL=socketServer.js.map