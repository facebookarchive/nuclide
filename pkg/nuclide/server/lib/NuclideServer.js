'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const blocked = require('./blocked');
const connect: connect$module = require('connect');

const http: http$fixed = (require('http'): any);
const https: https$fixed = (require('https'): any);

import {HEARTBEAT_CHANNEL} from './config';
const WebSocketServer: Class<ws$Server> = require('ws').Server;
const {deserializeArgs, sendJsonResponse, sendTextResponse} = require('./utils');
const {getVersion} = require('../../version');
import invariant from 'assert';
import ServiceFramework from './serviceframework';
import type {ConfigEntry} from './serviceframework/index';
import {SocketClient} from './SocketClient';

import {getLogger, flushLogsAndExit} from '../../logging';
const logger = getLogger();

type NuclideServerOptions = {
  port: number;
  serverKey?: Buffer;
  serverCertificate?: Buffer;
  certificateAuthorityCertificate?: Buffer;
  trackEventLoop?: boolean;
}

class NuclideServer {
  static _theServer: ?NuclideServer;

  _webServer: http$fixed$Server;
  _webSocketServer: ws$Server;
  _clients: Map<string, SocketClient>;
  _port: number;
  _app: connect$Server;
  _serviceRegistry: {[serviceName: string]: () => any};
  _version: string;

  _serverComponent: ServiceFramework.ServerComponent;

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
    if (serverKey && serverCertificate && certificateAuthorityCertificate) {
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
      blocked((ms: number) => {
        logger.info('NuclideServer event loop blocked for ' + ms + 'ms');
      });
    }

    this._serverComponent =
        new ServiceFramework.ServerComponent(services);
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

  _createWebSocketServer(): ws$Server {
    const webSocketServer = new WebSocketServer({server: this._webServer});
    webSocketServer.on('connection', socket => this._onConnection(socket));
    webSocketServer.on('error', error => logger.error('WebSocketServer Error:', error));
    return webSocketServer;
  }

  _setupServices() {
    // Lazy require these functions so that we could spyOn them while testing in
    // ServiceIntegrationTestHelper.
    this._serviceRegistry = {};
    this._setupHeartbeatHandler();

    // Setup error handler.
    this._app.use((error: ?connect$Error,
        request: http$fixed$IncomingMessage,
        // $FlowFixMe (peterhal)
        response: http$fixed$ServerResponse,
        next: Function) => {
      if (error != null) {
        sendJsonResponse(response, {code: error.code, message: error.message}, 500);
      } else {
        next();
      }
    });
  }

  _setupHeartbeatHandler() {
    this._registerService('/' + HEARTBEAT_CHANNEL, async () => this._version,
        'post', true);
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

  connect(): Promise {
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
    const serviceFunction = this._serviceRegistry[serviceName];
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
      isTextResponse: boolean) {
    if (this._serviceRegistry[serviceName]) {
      throw new Error('A service with this name is already registered:', serviceName);
    }
    this._serviceRegistry[serviceName] = serviceFunction;
    this._registerHttpService(serviceName, method, isTextResponse);
  }

  _registerHttpService(serviceName: string, method: string, isTextResponse: ?boolean) {
    const loweredCaseMethod = method.toLowerCase();
    // $FlowFixMe - Use map instead of computed property.
    this._app[loweredCaseMethod](serviceName, async (request, response, next) => {
      try {
        const result = await this.callService(serviceName, deserializeArgs(request.url));
        if (isTextResponse) {
          sendTextResponse(response, result || '');
        } else {
          sendJsonResponse(response, result);
        }
      } catch (e) {
        // Delegate to the registered connect error handler.
        next(e);
      }
    });
  }

  _onConnection(socket: ws$WebSocket): void {
    logger.debug('WebSocket connecting');


    let client: ?SocketClient = null;

    socket.on('error', e =>
      logger.error('Client #%s error: %s', client ? client.id : 'unkown', e.message));

    socket.once('message', (clientId: string) => {
      client = this._clients.get(clientId);
      if (client == null) {
        client = new SocketClient(clientId, this._serverComponent, socket);
        this._clients.set(clientId, client);
      } else {
        invariant(clientId === client.id);
        client.reconnect(socket);
      }
    });
  }

  close() {
    invariant(NuclideServer._theServer === this);
    NuclideServer._theServer = null;

    this._webSocketServer.close();
    this._webServer.close();
  }
}

module.exports = NuclideServer;
