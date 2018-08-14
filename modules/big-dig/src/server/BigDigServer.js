"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BigDigServer = exports.CLOSE_TAG = exports.HEARTBEAT_CHANNEL = void 0;

function _ws() {
  const data = _interopRequireDefault(require("ws"));

  _ws = function () {
    return data;
  };

  return data;
}

var _https = _interopRequireDefault(require("https"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _url = _interopRequireDefault(require("url"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _getVersion() {
  const data = require("../common/getVersion");

  _getVersion = function () {
    return data;
  };

  return data;
}

function _WebSocketTransport() {
  const data = require("../socket/WebSocketTransport");

  _WebSocketTransport = function () {
    return data;
  };

  return data;
}

function _QueuedAckTransport() {
  const data = require("../socket/QueuedAckTransport");

  _QueuedAckTransport = function () {
    return data;
  };

  return data;
}

function _ports() {
  const data = require("../common/ports");

  _ports = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const HEARTBEAT_CHANNEL = 'big-dig-heartbeat';
exports.HEARTBEAT_CHANNEL = HEARTBEAT_CHANNEL;
const CLOSE_TAG = 'big-dig-close-connection';
exports.CLOSE_TAG = CLOSE_TAG;

class BigDigServer {
  /**
   * Note: The webSocketServer must be running on top of the httpsServer.
   * Note: This BigDigServer is responsible for closing httpServer and wss.
   */
  constructor(httpsServer, webSocketServer) {
    this._logger = (0, _log4js().getLogger)('BigDigServer');
    this._tagToSubscriber = new Map();
    this._httpsServer = httpsServer;

    this._httpsServer.on('request', this._onHttpsRequest.bind(this));

    this._httpsServer.on('error', err => {
      this._logger.error('Received error from httpsServer', err);
    });

    this._clientIdToTransport = new Map();
    this._webSocketServer = webSocketServer;

    this._webSocketServer.on('connection', this._onWebSocketConnection.bind(this));

    this._webSocketServer.on('error', err => {
      this._logger.error('Received error from webSocketServer', err);
    });
  }

  static async createServer(options) {
    const webServer = _https.default.createServer(options.webServer);

    if (!(await (0, _ports().scanPortsToListen)(webServer, options.ports))) {
      throw new Error(`All ports in range "${options.ports}" are already in use`);
    }

    const webSocketServer = new (_ws().default.Server)({
      server: webServer,
      perMessageDeflate: true
    }); // $FlowIgnore

    const launcher = require(options.absolutePathToServerMain);

    const tunnelLauncher = require("../services/tunnel/launcher");

    const thriftLauncher = require("../services/thrift/launcher");

    const bigDigServer = new BigDigServer(webServer, webSocketServer);
    await launcher(bigDigServer);
    await tunnelLauncher(bigDigServer);
    await thriftLauncher(bigDigServer);
    return bigDigServer;
  }

  addSubscriber(tag, subscriber) {
    if (tag === CLOSE_TAG) {
      throw new Error(`Tag ${CLOSE_TAG} is reserved; cannot subscribe.`);
    }

    const existingSubscriber = this._tagToSubscriber.get(tag);

    if (existingSubscriber == null) {
      // TODO(mbolin): WS connections that were created before this subscriber
      // were added will not be able to leverage this subscriber because no
      // InternalTransport was created for it. We should probably add a new
      // entry for all valid tagToTransport maps.
      this._tagToSubscriber.set(tag, subscriber);
    } else {
      throw new Error(`subscriber is already registered for ${tag}`);
    }
  }

  getPort() {
    return this._httpsServer.address().port;
  }

  _onHttpsRequest(request, response) {
    // catch request's error that might be caused after request ends OK
    // see: https://github.com/nodejs/node/issues/14102
    request.on('error', error => {
      this._logger.error('Received error from https request', error);
    });

    const {
      pathname
    } = _url.default.parse(request.url);

    if (request.method === 'POST' && pathname === `/v1/${HEARTBEAT_CHANNEL}`) {
      response.write((0, _getVersion().getVersion)());
      response.end();
      return;
    }

    this._logger.info(`Ignored HTTPS ${request.method} request for ${request.url}`);
  }

  _onWebSocketConnection(ws, req) {
    ws.on('error', err => {
      this._logger.error('Received error from socket', err);
    });

    const {
      pathname
    } = _url.default.parse(req.url);

    const clientId = req.headers.client_id;

    this._logger.info(`connection negotiation via path ${String(pathname)}`);

    this._logger.info(`received client_id in header ${clientId}`);

    if (pathname !== '/v1') {
      this._logger.info(`Ignored WSS connection for ${String(pathname)}`);

      return;
    }

    const cachedTransport = this._clientIdToTransport.get(clientId);

    const wsTransport = new (_WebSocketTransport().WebSocketTransport)(clientId, ws);

    if (cachedTransport == null) {
      this._logger.info(`on connection the clientId is ${clientId}`);

      const qaTransport = new (_QueuedAckTransport().QueuedAckTransport)(clientId, wsTransport);

      this._clientIdToTransport.set(clientId, qaTransport); // Every subscriber must be notified of the new connection because it may
      // want to broadcast messages to it.


      const tagToTransport = new Map();

      for (const [tag, subscriber] of this._tagToSubscriber) {
        const transport = new InternalTransport(tag, qaTransport);

        this._logger.info(`Created new InternalTransport for ${tag}`);

        tagToTransport.set(tag, transport);
        subscriber.onConnection(transport);
      } // subsequent messages will be BigDig messages
      // TODO: could the message be a Buffer?


      qaTransport.onMessage().subscribe(message => {
        this._handleBigDigMessage(tagToTransport, qaTransport, message);
      }); // TODO: Either garbage collect inactive transports, or implement
      // an explicit "close" action in the big-dig protocol.
    } else {
      if (!(clientId === cachedTransport.id)) {
        throw new Error("Invariant violation: \"clientId === cachedTransport.id\"");
      }

      cachedTransport.reconnect(wsTransport);
    }
  }

  _handleBigDigMessage(tagToTransport, qaTransport, message) {
    // The message must start with a header identifying its route.
    const index = message.indexOf('\0');
    const tag = message.substring(0, index);

    if (tag === CLOSE_TAG) {
      for (const transport of tagToTransport.values()) {
        transport.close();
      }

      tagToTransport.clear();

      this._clientIdToTransport.delete(qaTransport.id);

      qaTransport.close();
    } else {
      const body = message.substring(index + 1);
      const transport = tagToTransport.get(tag);

      if (transport != null) {
        transport.broadcastMessage(body);
      } else {
        this._logger.info(`No route for ${tag}.`);
      }
    }
  }

}
/**
 * Note that an InternalTransport maintains a reference to a WS connection.
 * It is imperative that it does not leak this reference such that a client
 * holds onto it and prevents it from being garbage-collected after the
 * connection is terminated.
 */


exports.BigDigServer = BigDigServer;

class InternalTransport {
  constructor(tag, ws) {
    this._messages = new _RxMin.Subject();
    this._tag = tag;
    this._transport = ws;
  }

  send(message) {
    this._transport.send(`${this._tag}\0${message}`);
  }

  onMessage() {
    // Only expose the subset of the Subject interface that implements
    // Observable.
    return this._messages.asObservable();
  }

  broadcastMessage(message) {
    this._messages.next(message);
  }

  close() {
    this._messages.complete();
  }

}