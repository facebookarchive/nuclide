'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BigDigServer = exports.CLOSE_TAG = exports.HEARTBEAT_CHANNEL = undefined;

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _https = _interopRequireDefault(require('https'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _url = _interopRequireDefault(require('url'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _getVersion;

function _load_getVersion() {
  return _getVersion = require('../common/getVersion');
}

var _WebSocketTransport;

function _load_WebSocketTransport() {
  return _WebSocketTransport = require('../socket/WebSocketTransport');
}

var _QueuedAckTransport;

function _load_QueuedAckTransport() {
  return _QueuedAckTransport = require('../socket/QueuedAckTransport');
}

var _ports;

function _load_ports() {
  return _ports = require('../common/ports');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The absolutePathToServerMain must export a single function of this type.
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

const HEARTBEAT_CHANNEL = exports.HEARTBEAT_CHANNEL = 'big-dig-heartbeat';
const CLOSE_TAG = exports.CLOSE_TAG = 'big-dig-close-connection';

class BigDigServer {

  /**
   * Note: The webSocketServer must be running on top of the httpsServer.
   * Note: This BigDigServer is responsible for closing httpServer and wss.
   */
  constructor(httpsServer, webSocketServer) {
    this._logger = (0, (_log4js || _load_log4js()).getLogger)();
    this._tagToSubscriber = new Map();
    this._httpsServer = httpsServer;
    this._httpsServer.on('request', this._onHttpsRequest.bind(this));
    this._clientIdToTransport = new Map();
    this._webSocketServer = webSocketServer;
    this._webSocketServer.on('connection', this._onWebSocketConnection.bind(this));
  }

  static async createServer(options) {
    const webServer = _https.default.createServer(options.webServer);

    if (!(await (0, (_ports || _load_ports()).scanPortsToListen)(webServer, options.ports))) {
      throw new Error(`All ports in range "${options.ports}" are already in use`);
    }

    const webSocketServer = new (_ws || _load_ws()).default.Server({
      server: webServer,
      perMessageDeflate: true
    });

    // Let unhandled WS server errors go through to the global exception handler.

    // $FlowIgnore
    const launcher = require(options.absolutePathToServerMain);
    const tunnelLauncher = require('../services/tunnel/launcher');

    const bigDigServer = new BigDigServer(webServer, webSocketServer);

    await launcher(bigDigServer);
    await tunnelLauncher(bigDigServer);

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
    const { pathname } = _url.default.parse(request.url);
    if (request.method === 'POST' && pathname === `/v1/${HEARTBEAT_CHANNEL}`) {
      response.write((0, (_getVersion || _load_getVersion()).getVersion)());
      response.end();
      return;
    }
    this._logger.info(`Ignored HTTPS ${request.method} request for ${request.url}`);
  }

  _onWebSocketConnection(ws, req) {
    const { pathname } = _url.default.parse(req.url);
    const clientId = req.headers.client_id;
    this._logger.info(`connection negotiation via path ${String(pathname)}`);
    this._logger.info(`received client_id in header ${clientId}`);

    if (pathname !== '/v1') {
      this._logger.info(`Ignored WSS connection for ${String(pathname)}`);
      return;
    }

    const cachedTransport = this._clientIdToTransport.get(clientId);
    const wsTransport = new (_WebSocketTransport || _load_WebSocketTransport()).WebSocketTransport(clientId, ws);

    if (cachedTransport == null) {
      this._logger.info(`on connection the clientId is ${clientId}`);

      const qaTransport = new (_QueuedAckTransport || _load_QueuedAckTransport()).QueuedAckTransport(clientId, wsTransport);
      this._clientIdToTransport.set(clientId, qaTransport);

      // Every subscriber must be notified of the new connection because it may
      // want to broadcast messages to it.
      const tagToTransport = new Map();
      for (const [tag, subscriber] of this._tagToSubscriber) {
        const transport = new InternalTransport(tag, qaTransport);
        this._logger.info(`Created new InternalTransport for ${tag}`);
        tagToTransport.set(tag, transport);
        subscriber.onConnection(transport);
      }

      // subsequent messages will be BigDig messages
      // TODO: could the message be a Buffer?
      qaTransport.onMessage().subscribe(message => {
        this._handleBigDigMessage(tagToTransport, qaTransport, message);
      });

      // TODO: Either garbage collect inactive transports, or implement
      // an explicit "close" action in the big-dig protocol.
    } else {
      if (!(clientId === cachedTransport.id)) {
        throw new Error('Invariant violation: "clientId === cachedTransport.id"');
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

exports.BigDigServer = BigDigServer; /**
                                      * Note that an InternalTransport maintains a reference to a WS connection.
                                      * It is imperative that it does not leak this reference such that a client
                                      * holds onto it and prevents it from being garbage-collected after the
                                      * connection is terminated.
                                      */

class InternalTransport {

  constructor(tag, ws) {
    this._messages = new _rxjsBundlesRxMinJs.Subject();
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