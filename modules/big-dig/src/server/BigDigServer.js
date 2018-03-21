/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Observable} from 'rxjs';
import type WS from 'ws';
import type https from 'https';

import {getLogger} from 'log4js';
import invariant from 'assert';
import url from 'url';
import {Subject} from 'rxjs';
import {getVersion} from '../common/getVersion';

import {WebSocketTransport} from '../socket/WebSocketTransport';
import {QueuedAckTransport} from '../socket/QueuedAckTransport';

export const HEARTBEAT_CHANNEL = 'big-dig-heartbeat';

export type Transport = {
  send(message: string): void,
  onMessage(): Observable<string>,
};

type Subscriber = {
  onConnection(transport: Transport): mixed,
};

export default class BigDigServer {
  _logger: log4js$Logger;
  _tagToSubscriber: Map<string, Subscriber>;
  _clientIdToTransport: Map<string, QueuedAckTransport>;

  _httpsServer: https.Server;
  _webSocketServer: WS.Server;

  /**
   * Note: The webSocketServer must be running on top of the httpsServer.
   * Note: This BigDigServer is responsible for closing httpServer and wss.
   */
  constructor(httpsServer: https.Server, webSocketServer: WS.Server) {
    this._logger = getLogger();
    this._tagToSubscriber = new Map();
    this._httpsServer = httpsServer;
    this._httpsServer.on('request', this._onHttpsRequest.bind(this));
    this._clientIdToTransport = new Map();
    this._webSocketServer = webSocketServer;
    this._webSocketServer.on(
      'connection',
      this._onWebSocketConnection.bind(this),
    );
  }

  addSubscriber(tag: string, subscriber: Subscriber) {
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

  _onHttpsRequest(
    request: http$IncomingMessage,
    response: http$ServerResponse,
  ) {
    const {pathname} = url.parse(request.url);
    if (request.method === 'POST' && pathname === `/v1/${HEARTBEAT_CHANNEL}`) {
      response.write(getVersion());
      response.end();
      return;
    }
    this._logger.info(
      `Ignored HTTPS ${request.method} request for ${request.url}`,
    );
  }

  _onWebSocketConnection(ws: WS, req: http$IncomingMessage) {
    const {pathname} = url.parse(req.url);
    const clientId = req.headers.client_id;
    this._logger.info(`connection negotiation via path ${String(pathname)}`);
    this._logger.info(`received client_id in header ${clientId}`);

    if (pathname !== '/v1') {
      this._logger.info(`Ignored WSS connection for ${String(pathname)}`);
      return;
    }

    const cachedTransport = this._clientIdToTransport.get(clientId);
    const wsTransport = new WebSocketTransport(clientId, ws);

    if (cachedTransport == null) {
      this._logger.info(`on connection the clientId is ${clientId}`);

      const qaTransport = new QueuedAckTransport(clientId, wsTransport);
      this._clientIdToTransport.set(clientId, qaTransport);

      // Every subscriber must be notified of the new connection because it may
      // want to broadcast messages to it.
      const tagToTransport: Map<string, InternalTransport> = new Map();
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

      // TODO: Either garbage collect inactive transports, or implement
      // an explicit "close" action in the big-dig protocol.
    } else {
      invariant(clientId === cachedTransport.id);
      cachedTransport.reconnect(wsTransport);
    }
  }

  _handleBigDigMessage(
    tagToTransport: Map<string, InternalTransport>,
    message: string,
  ) {
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

/**
 * Note that an InternalTransport maintains a reference to a WS connection.
 * It is imperative that it does not leak this reference such that a client
 * holds onto it and prevents it from being garbage-collected after the
 * connection is terminated.
 */
class InternalTransport {
  _messages: Subject<string>;
  _tag: string;
  _transport: QueuedAckTransport;

  constructor(tag: string, ws: QueuedAckTransport) {
    this._messages = new Subject();
    this._tag = tag;
    this._transport = ws;
  }

  send(message: string): void {
    this._transport.send(`${this._tag}\0${message}`);
  }

  onMessage(): Observable<string> {
    // Only expose the subset of the Subject interface that implements
    // Observable.
    return this._messages.asObservable();
  }

  broadcastMessage(message: string): void {
    this._messages.next(message);
  }

  close(): void {
    this._messages.complete();
  }
}
