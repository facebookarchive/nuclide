/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ConfigEntry} from '../../nuclide-rpc';

import invariant from 'assert';
import os from 'os';
import {getLogger} from 'log4js';
import WS from 'ws';
import {attachEvent} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import blocked from './blocked';
import {QueuedAckTransport} from 'big-dig/src/socket/QueuedAckTransport';
import {deserializeArgs, sendJsonResponse, sendTextResponse} from './utils';
import {HistogramTracker} from '../../nuclide-analytics';
import {getVersion} from '../../nuclide-version';
import {flushLogsAndExit} from '../../nuclide-logging';
import {RpcConnection, ServiceRegistry} from '../../nuclide-rpc';
import {WebSocketTransport} from 'big-dig/src/socket/WebSocketTransport';
import {getServerSideMarshalers} from '../../nuclide-marshalers-common';
import {protocolLogger} from './utils';
import {track} from '../../nuclide-analytics';

export const HEARTBEAT_CHANNEL = 'heartbeat';

// eslint-disable-next-line rulesdir/no-commonjs
const connect: connect$module = require('connect');
// eslint-disable-next-line rulesdir/no-commonjs
const http: http$fixed = (require('http'): any);
// eslint-disable-next-line rulesdir/no-commonjs
const https: https$fixed = (require('https'): any);

const logger = getLogger('nuclide-server');

type NuclideServerOptions = {
  port: number,
  serverKey?: Buffer,
  serverCertificate?: Buffer,
  certificateAuthorityCertificate?: Buffer,
  trackEventLoop?: boolean,
};

export default class NuclideServer {
  static _theServer: ?NuclideServer;

  _webServer: http$fixed$Server;
  _webSocketServer: WS.Server;
  _clients: Map<string, RpcConnection<QueuedAckTransport>>;
  _port: number;
  _app: connect$Server;
  _xhrServiceRegistry: {[serviceName: string]: () => any};
  _version: string;
  _rpcServiceRegistry: ServiceRegistry;
  _disposables: UniversalDisposable = new UniversalDisposable();

  constructor(options: NuclideServerOptions, services: Array<ConfigEntry>) {
    invariant(NuclideServer._theServer == null);
    NuclideServer._theServer = this;

    const {
      serverKey,
      serverCertificate,
      port,
      certificateAuthorityCertificate,
      trackEventLoop,
    } = options;

    this._version = getVersion().toString();
    this._app = connect();
    this._attachUtilHandlers();
    const isHttps = Boolean(
      serverKey && serverCertificate && certificateAuthorityCertificate,
    );
    if (isHttps) {
      const webServerOptions = {
        key: serverKey,
        cert: serverCertificate,
        ca: certificateAuthorityCertificate,
        requestCert: true,
        rejectUnauthorized: true,
      };

      this._webServer = https.createServer(webServerOptions, this._app);
    } else {
      this._webServer = http.createServer(this._app);
    }
    this._port = port;

    this._webSocketServer = this._createWebSocketServer();
    this._clients = new Map();

    this._setupServices(); // Setup 1.0 and 2.0 services.

    if (trackEventLoop) {
      const stallTracker = new HistogramTracker(
        'server-event-loop-blocked',
        /* max */ 1000,
        /* buckets */ 10,
      );
      this._disposables.add(
        stallTracker,
        blocked((ms: number) => {
          stallTracker.track(ms);
          logger.info('NuclideServer event loop blocked for ' + ms + 'ms');
        }),
      );
    }

    this._rpcServiceRegistry = new ServiceRegistry(
      getServerSideMarshalers,
      services,
    );

    track('server-created', {port, isHttps, host: os.hostname()});
  }

  _attachUtilHandlers() {
    // Add specific method handlers.
    ['get', 'post', 'delete', 'put'].forEach(methodName => {
      // $FlowFixMe - Use map instead of computed property on library type.
      this._app[methodName] = (uri, handler) => {
        this._app.use(uri, (request, response, next) => {
          if (request.method.toUpperCase() !== methodName.toUpperCase()) {
            // skip if method doesn't match.
            return next();
          } else {
            handler(request, response, next);
          }
        });
      };
    });
  }

  _createWebSocketServer(): WS.Server {
    const webSocketServer = new WS.Server({
      server: this._webServer,
      perMessageDeflate: true,
    });
    webSocketServer.on('connection', (socket, req) =>
      this._onConnection(socket, req),
    );
    webSocketServer.on('error', error =>
      logger.error('WebSocketServer Error:', error),
    );
    return webSocketServer;
  }

  _setupServices() {
    // Lazy require these functions so that we could spyOn them while testing in
    // ServiceIntegrationTestHelper.
    this._xhrServiceRegistry = {};
    this._setupHeartbeatHandler();

    // Setup error handler.
    this._app.use(
      (
        error: ?connect$Error,
        request: http$fixed$IncomingMessage,
        response: http$fixed$ServerResponse,
        next: Function,
      ) => {
        if (error != null) {
          sendJsonResponse(
            response,
            {code: error.code, message: error.message},
            500,
          );
        } else {
          next();
        }
      },
    );
  }

  _setupHeartbeatHandler() {
    this._registerService(
      '/' + HEARTBEAT_CHANNEL,
      async () => this._version,
      'post',
      true,
    );
  }

  static shutdown(): void {
    logger.info('Shutting down the server');
    try {
      if (NuclideServer._theServer != null) {
        NuclideServer._theServer.close();
      }
    } catch (e) {
      logger.error('Error while shutting down, but proceeding anyway:', e);
    } finally {
      flushLogsAndExit(0);
    }
  }

  static closeConnection(client: RpcConnection<QueuedAckTransport>): void {
    logger.info(`Closing client: #${client.getTransport().id}`);
    if (NuclideServer._theServer != null) {
      NuclideServer._theServer._closeConnection(client);
    }
  }

  _closeConnection(client: RpcConnection<QueuedAckTransport>): void {
    if (this._clients.get(client.getTransport().id) === client) {
      this._clients.delete(client.getTransport().id);
      client.dispose();
    }
  }

  connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._webServer.on('listening', () => {
        resolve();
      });
      this._webServer.on('error', e => {
        this._webServer.removeAllListeners();
        reject(e);
      });
      this._webServer.listen(this._port);
    });
  }

  /**
   * Calls a registered service with a name and arguments.
   */
  callService(serviceName: string, args: Array<any>): Promise<any> {
    const serviceFunction = this._xhrServiceRegistry[serviceName];
    if (!serviceFunction) {
      throw Error('No service registered with name: ' + serviceName);
    }
    return serviceFunction.apply(this, args);
  }

  /**
   * Registers a service function to a service name.
   * This allows simple future calls of the service by name and arguments or http-triggered
   * endpoint calls with arguments serialized over http.
   */
  _registerService(
    serviceName: string,
    serviceFunction: () => Promise<any>,
    method: string,
    isTextResponse: boolean,
  ) {
    if (this._xhrServiceRegistry[serviceName]) {
      throw new Error(
        'A service with this name is already registered: ' + serviceName,
      );
    }
    this._xhrServiceRegistry[serviceName] = serviceFunction;
    this._registerHttpService(serviceName, method, isTextResponse);
  }

  _registerHttpService(
    serviceName: string,
    method: string,
    isTextResponse: ?boolean,
  ) {
    const loweredCaseMethod = method.toLowerCase();
    // $FlowFixMe - Use map instead of computed property.
    this._app[loweredCaseMethod](
      serviceName,
      async (request, response, next) => {
        try {
          const result = await this.callService(
            serviceName,
            deserializeArgs(request.url),
          );
          if (isTextResponse) {
            sendTextResponse(response, result || '');
          } else {
            sendJsonResponse(response, result);
          }
        } catch (e) {
          // Delegate to the registered connect error handler.
          next(e);
        }
      },
    );
  }

  _onConnection(socket: WS, req: http$IncomingMessage): void {
    logger.debug('WebSocket connecting');

    const headerClientId = req.headers.client_id;

    // XXX: Once we ship the client that is sending the clientId in the header
    // we can remove this check and just leave the else block
    if (headerClientId != null) {
      logger.info(
        `received clientId in the initial ws header: ${headerClientId}`,
      );
      this._handleClientId(socket, headerClientId);
    } else {
      logger.info('did not receive the clientId in the initial ws header');
      logger.info('will wait for the clientId in the first message...');
      const errorSubscription = attachEvent(socket, 'error', e =>
        logger.error('WebSocket error before first message', e),
      );

      socket.once('message', (clientId: string) => {
        errorSubscription.dispose();
        this._handleClientId(socket, clientId);
      });
    }
  }

  _handleClientId(socket: WS, clientId: string) {
    let client: ?RpcConnection<QueuedAckTransport> = null;

    client = this._clients.get(clientId);
    const transport = new WebSocketTransport(clientId, socket);
    if (client == null) {
      client = RpcConnection.createServer(
        this._rpcServiceRegistry,
        new QueuedAckTransport(clientId, transport, protocolLogger),
        {},
        clientId,
        protocolLogger,
      );
      this._clients.set(clientId, client);
    } else {
      invariant(clientId === client.getTransport().id);
      client.getTransport().reconnect(transport);
    }
  }

  close() {
    invariant(NuclideServer._theServer === this);
    NuclideServer._theServer = null;

    this._disposables.dispose();
    this._webSocketServer.close();
    this._webServer.close();
  }
}
