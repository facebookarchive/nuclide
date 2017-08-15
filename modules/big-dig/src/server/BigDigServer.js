'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _url = _interopRequireDefault(require('url'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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


  /**
   * Currently, this is unused, though we will likely use it once we port the
   * logic for XhrConnectionHeartbeat over.
   */
  constructor(httpsServer, webSocketServer) {
    this._logger = (0, (_log4js || _load_log4js()).getLogger)();
    this._tagToSubscriber = new Map();
    this._httpsServer = httpsServer;
    this._httpsServer.on('request', this._onHttpsRequest.bind(this));
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
    this._logger.info(`Ignored HTTPS request for ${request.url}`);
  }

  _onWebSocketConnection(ws) {
    // Note that in ws@3.0.0, the upgradeReq property of ws has been removed:
    // it is passed as the second argument to this callback instead.
    const req = ws.upgradeReq;
    const { pathname } = _url.default.parse(req.url);
    if (pathname !== '/v1') {
      this._logger.info(`Ignored WSS connection for ${String(pathname)}`);
      return;
    }

    // Every subscriber must be notified of the new connection because it may
    // want to broadcast messages to it.
    const tagToTransport = new Map();
    for (const [tag, subscriber] of this._tagToSubscriber) {
      const transport = new InternalTransport(tag, ws);
      this._logger.info(`Created new InternalTransport for ${tag}`);
      tagToTransport.set(tag, transport);
      subscriber.onConnection(transport);
    }

    // Is message a string or could it be a Buffer?
    ws.on('message', message => {
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
    });

    // TODO(mbolin): When ws disconnects, do we explicitly have to clear out
    // tagToTransport? It seems like it should get garbage-collected
    // automatically, assuming this._webSocketServer no longer has a reference
    // to ws. But we should probably call InternalTransport.close() on all of
    // the entries in tagToTransport?
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
    this._ws = ws;
  }

  send(message) {
    this._ws.send(`${this._tag}\0${message}`);
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