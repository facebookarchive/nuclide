'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HEARTBEAT_CHANNEL = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HEARTBEAT_CHANNEL = exports.HEARTBEAT_CHANNEL = 'big-dig-heartbeat'; /**
                                                                            * Copyright (c) 2017-present, Facebook, Inc.
                                                                            * All rights reserved.
                                                                            *
                                                                            * This source code is licensed under the BSD-style license found in the
                                                                            * LICENSE file in the root directory of this source tree. An additional grant
                                                                            * of patent rights can be found in the PATENTS file in the same directory.
                                                                            *
                                                                            * 
                                                                            * @format
                                                                            */

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

  addSubscriber(tag, subscriber) {
    const existingSubscriber = this._tagToSubscriber.get(tag);
    if (existingSubscriber == null) {
      // TODO(mbolin): WS connections that were created before this subscriber
      // were added will not be able to leverage this subscriber because no
      // InternalTransport was created for it. We should probably add a new
      // entry for all valid tagToTransport maps.
      this._tagToSubscriber.set(tag, subscriber);
    } else {
      throw Error(`subscriber is already registered for ${tag}`);
    }
  }

  _onHttpsRequest(request, response) {
    const { pathname } = _url.default.parse(request.url);
    if (pathname === `/v1/${HEARTBEAT_CHANNEL}`) {
      response.write((0, (_getVersion || _load_getVersion()).getVersion)());
      response.end();
      return;
    }
    this._logger.info(`Ignored HTTPS request for ${request.url}`);
  }

  _onWebSocketConnection(ws, req) {
    const { pathname } = _url.default.parse(req.url);
    this._logger.info(`connection negotiation via path ${String(pathname)}`);

    if (pathname !== '/v1') {
      this._logger.info(`Ignored WSS connection for ${String(pathname)}`);
      return;
    }

    // TODO: send clientId in the http headers on the websocket connection

    // the first message after a connection should only include
    // the clientId of the connecting client; the BigDig connection
    // is not actually made until we get this connection
    ws.once('message', clientId => {
      const cachedTransport = this._clientIdToTransport.get(clientId);
      const wsTransport = new (_WebSocketTransport || _load_WebSocketTransport()).WebSocketTransport(clientId, ws);

      if (cachedTransport == null) {
        // handle first message which should include the clientId
        this._logger.info(`got first message from client with clientId ${clientId}`);

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
          this._handleBigDigMessage(tagToTransport, message);
        });

        ws.once('close', () => {
          for (const transport of tagToTransport.values()) {
            transport.close();
          }
          // This may be garbage-collected automatically, but clearing it won't hurt...
          tagToTransport.clear();
        });
      } else {
        if (!(clientId === cachedTransport.id)) {
          throw new Error('Invariant violation: "clientId === cachedTransport.id"');
        }

        cachedTransport.reconnect(wsTransport);
      }
    });

    // TODO: need to handle ws errors.
  }

  _handleBigDigMessage(tagToTransport, message) {
    // The message must start with a header identifying its route.
    const index = message.indexOf('\0');
    const tag = message.substring(0, index);
    const body = message.substring(index + 1);

    const transport = tagToTransport.get(tag);
    if (transport != null) {
      transport.broadcastMessage(body);
    } else {
      this._logger.info(`No route for ${tag}.`);
    }
  }
}

exports.default = BigDigServer; /**
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