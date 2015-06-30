'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var blocked = require('./blocked');
var connect = require('connect');
var fs = require('fs');
var {getService, getRemoteEventName} = require('./service-manager');
var http = require('http');
var https = require('https');
var {SERVICE_FRAMEWORK_EVENT_CHANNEL,
  SERVICE_FRAMEWORK_RPC_CHANNEL} = require('./config');
var {parseServiceApiSync} = require('nuclide-service-transformer');
var path = require('path');
var {EventEmitter} = require('events');
var WebSocketServer = require('ws').Server;
var {deserializeArgs, sendJsonResponse, sendTextResponse} = require('./utils');
var {getVersion} = require('nuclide-version');

var logger = require('nuclide-logging').getLogger();

const SERVER_SHUTDOWN_TIMEOUT_MS = 1000;

var EVENT_HANDLE_REGISTERED = '_nuclideServerEventHandleRegstered';
var idIncrement = 0;

type NuclideServerOptions = {
  port: number;
  serverKey: ?Buffer;
  serverCertificate: ?Buffer;
  certificateAuthorityCertificate: ?Buffer;
  trackEventLoop: ?boolean;
}

type SocketClient = {
  id: string;
  subscriptions: {[channel: string]: (event: any) => void};
  socket: ?WebSocket;
};

type ServiceConfig = {
  name: string;
  definition: string;
  implementation: string;
}

class NuclideServer {
  _webServer: http.Server | https.Server;
  _webSocketServer: WebSocketServer;
  _clients: {[clientId: string]: SocketClient};
  _eventSubscriptions: Map</* eventName */ string, Set</* clientId */ string>>;
  _port: number;
  _version: string;
  _serviceWithoutServiceFrameworkConfigs: Array<string>;
  _serviceWithServiceFrameworkConfigs: Array<any>;

  constructor(options: NuclideServerOptions) {
    var {serverKey, serverCertificate, port, certificateAuthorityCertificate, trackEventLoop} = options;

    this._app = connect();
    this._attachUtilHandlers(this._app);
    if (serverKey && serverCertificate && certificateAuthorityCertificate) {
      var webServerOptions = {
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
    this._clients = {};
    this._eventSubscriptions = new Map();

    var eventbus = this.eventbus = new EventEmitter();
    // Any service can use the eventbus API like: `this.publish(eventName, {})`.
    this.publish = this.broadcast = eventbus.emit.bind(eventbus);
    this.subscribe = eventbus.on.bind(eventbus);
    this.subscribeOnce = eventbus.once.bind(eventbus);
    this.unsubscribe = eventbus.removeListener.bind(eventbus);
    this._eventEmitters = {};

    this._setupServices();

    if (trackEventLoop) {
      blocked((ms: number) => {
        logger.info('NuclideServer event loop blocked for ' + ms + 'ms');
      });
    }
  }

  _attachUtilHandlers(app) {
    // Add specific method handlers.
    ['get', 'post', 'delete', 'put'].forEach((methodName) => {
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

  _createWebSocketServer(): WebSocketServer {
    var webSocketServer = new WebSocketServer({server: this._webServer});
    webSocketServer.on('connection', (socket) => this._onConnection(socket));
    webSocketServer.on('error', (error) => logger.error('WebSocketServer Error:', error));
    return webSocketServer;
  }

  _getServiceFrameworkServiceAndRegisterEventHandle(
      serviceConfig: ServiceConfig, serviceOptions: any): any {
    var localServiceInstance = getService(serviceConfig.name, serviceOptions, serviceConfig.implementation);
    if (localServiceInstance[EVENT_HANDLE_REGISTERED]) {
      return localServiceInstance;
    }

    var serviceApi = parseServiceApiSync(serviceConfig.definition);

    serviceApi.eventMethodNames.forEach(methodName => {
      localServiceInstance[methodName].call(localServiceInstance, (...args) => {
        var eventName = getRemoteEventName(serviceConfig.name, methodName, serviceOptions);
        (this._eventSubscriptions.get(eventName) || []).forEach(clientId => {
          var client = this._clients[clientId];

          if (!client) {
            logger.warn('Client with clientId: %s not found!', clientId);
            return;
          }

          this._sendSocketMessage(client, {
            channel: SERVICE_FRAMEWORK_EVENT_CHANNEL,
            event: {
              name: eventName,
              args,
            },
          });
        });
      });
    });
    Object.defineProperty(localServiceInstance, EVENT_HANDLE_REGISTERED, {value: true});

    return localServiceInstance;
  }

  _registerServiceWithServiceFramework(serviceConfig: ServiceConfig): void {
    var serviceApi = parseServiceApiSync(serviceConfig.definition);

    serviceApi.rpcMethodNames.forEach(methodName => {
      this._registerService(
        '/' + serviceApi.className + '/' + methodName,

        // Take serviceOptions as first argument for serviceFramework service.
        // TODO(chenshen) seperate the logic of service initialization.
        (serviceOptions, ...args) => {
          var localServiceInstance = this._getServiceFrameworkServiceAndRegisterEventHandle(
              serviceConfig, serviceOptions);
          return localServiceInstance[methodName].apply(localServiceInstance, args);
        },
        'post',
      );
    });

  }

  _registerServiceWithoutServiceFramework(serviceFilePath: string): void {
    var {urlHandlers, services, initialize} = require(serviceFilePath);
    for (var serviceName in services) {
      var serviceConfig = services[serviceName];
      this._registerService(serviceName, serviceConfig.handler, serviceConfig.method, serviceConfig.text);
    }

    if (urlHandlers) {
      for (var url in urlHandlers) {
        var handlerConfig = urlHandlers[url];
        this._attachUrlHandler(url, handlerConfig.handler, handlerConfig.method);
      }
    }

    if (initialize) {
      initialize(this);
    }
  }

  _setupServices() {
    // Lazy require these functions so that we could spyOn them while testing in
    // ServiceIntegrationTestHelper.
    var {loadConfigsOfServiceWithServiceFramework,
      loadConfigsOfServiceWithoutServiceFramework} = require('./config');
    this._serviceRegistry = {};
    this._setupVersionHandler();
    this._setupShutdownHandler();
    this._setupSubscriptionHandler();
    this._setupServiceFrameworkSubscriptionHandler();
    this._serviceWithoutServiceFrameworkConfigs = loadConfigsOfServiceWithoutServiceFramework();
    this._serviceWithServiceFrameworkConfigs = loadConfigsOfServiceWithServiceFramework();

    this._serviceWithoutServiceFrameworkConfigs.forEach((config: string) => {
      this._registerServiceWithoutServiceFramework(config);
      logger.info(`Registered service ${config} without ServiceFramework.`);
    });

    this._serviceWithServiceFrameworkConfigs.forEach(config => {
      this._registerServiceWithServiceFramework(config);
      logger.info(`Registered service ${config.name} with ServiceFramework.`);
    });

    // Setup error handler.
    this._app.use((error, request, response, next) => {
      if (error) {
        sendJsonResponse(response, {code: error.code, message: error.message}, 500);
      } else {
        next();
      }
    });
  }

  _setupVersionHandler() {
    this._version = getVersion().toString();
    this._registerService('/server/version', () => this._version, 'post', true);
  }

  _setupShutdownHandler() {
    var shutdownServer = () => {
      logger.info('Shutting down the server');
      try {
        this.close();
      } catch (e) {
        logger.error('Error while shutting down, but proceeding anyway:', e);
      } finally {
        process.exit(0);
      }
    };
    this._registerService('/server/shutdown', () => {
      logger.info('Server received a shutdown request - terminating!');
      // Shutdown after timeout to give a chance to reply success to the shutdown request.
      setTimeout(shutdownServer, SERVER_SHUTDOWN_TIMEOUT_MS);
    }, 'post');
  }

  _setupSubscriptionHandler() {
    this._registerService('/eventbus/subscribe', (clientId: string, channel: string, options: any) => {
      var client = this._clients[clientId];
      if (!client) {
        return logger.error('Client with clientId: %s not found!', clientId);
      } else if (client.subscriptions[channel]) {
        return logger.warn('Client %s already subscribed to channel: %s', clientId, channel);
      } else {
        var subscibeHandler = client.subscriptions[channel] = (event) =>
            this._sendSocketMessage(client, {channel, event});
        this.subscribe(channel, subscibeHandler);
      }
      if (options.eventEmitterId) {
        this._consumeEventEmitter(options.eventEmitterId, channel, options.eventNames);
      }
    }, 'post');
  }

  _setupServiceFrameworkSubscriptionHandler() {
    this._registerService('/serviceFramework/subscribeEvent', (serviceOptions: any, clientId: string, serviceName: string, methodName: string) => {

      // Create the service instance and register the event handle.
      var [serviceConfig] = this._serviceWithServiceFrameworkConfigs.filter(config => config.name === serviceName);
      this._getServiceFrameworkServiceAndRegisterEventHandle(serviceConfig, serviceOptions);

      var eventName = getRemoteEventName(serviceName, methodName, serviceOptions);

      this._eventSubscriptions.set(
        eventName,
        (this._eventSubscriptions.get(eventName) || new Set()).add(clientId),
      );

      logger.debug(`${clientId} subscribed to ${eventName}`);
    }, 'post');

    this._registerService('/serviceFramework/unsubscribeEvent', (serviceOptions: any, clientId: string, serviceName: string, methodName: string) => {
      var eventName = getRemoteEventName(serviceName, methodName, serviceOptions);
      if (this._eventSubscriptions.has(eventName)) {
        this._eventSubscriptions.get(eventName).delete(clientId);
      }
      logger.debug(`${clientId} unsubscribed to ${eventName}`);
    }, 'post');
  }

  connect(): Promise {
    return new Promise((resolve, reject) => {
      this._webServer.on('listening', () => {
        resolve();
      });
      this._webServer.on('error', (e) => {
        this._webServer.removeAllListeners();
        reject(e);
      });
      this._webServer.listen(this._port, '::');
    });
  }

  /**
   * Calls a registered service with a name and arguments.
   */
  callService(serviceName: string, args: Array<any>): Promise<any> {
    var serviceFunction = this._serviceRegistry[serviceName];
    if (!serviceFunction) {
      throw Error('No service registered with name: ' + serviceName);
    }
    return serviceFunction.apply(this, args);
  }

  /**
   * Registers a service function to a service name.
   * This allows simple future calls of the service by name and arguments or http-triggered endpoint calls
   * with arguments serialized over http.
   */
  _registerService(
      serviceName: string,
      serviceFunction: () => Promise<any>,
      method: ?string = 'get',
      isTextResponse: ?boolean) {
    if (this._serviceRegistry[serviceName]) {
      throw new Error('A service with this name is already registered:', serviceName);
    }
    this._serviceRegistry[serviceName] = serviceFunction;
    this._registerHttpService(serviceName, method, isTextResponse);
  }

  _registerHttpService(serviceName: string, method: string, isTextResponse: ?boolean) {
    var loweredCaseMethod = method.toLowerCase();
    this._app[loweredCaseMethod](serviceName, async (request, response, next) => {
      try {
        var result = await this.callService(serviceName, deserializeArgs(request.url));
        if (isTextResponse) {
          sendTextResponse(response, result || '');
        } else {
          sendJsonResponse(response, result);
        }
      } catch(e) {
        // Delegate to the registered connect error handler.
        next(e);
      }
    });
  }

  /**
   * Attach an explicit http connect handler for some services that need request/response related optimizations.
   * e.g. readFile and writeFile uses it to stream reading and writing files (perf improvement for big files).
   */
  _attachUrlHandler(
    url: string,
    handler: (request: http.IncomingMessage, response: http.OutgoingMessage, next: (err: Error) => void) => void,
    method: ?string = 'get'
  ): void {
    this._app[method](url, handler);
  }

  _onConnection(socket: WebSocket): void {
    logger.info('WebSocket connecting');

    var subscriptions = {};
    var client = null;

    socket.on('error', (e) =>
      logger.error('Client #%s error: %s', client ? client.id : 'unkown', e.message));

    socket.once('message', (clientId) => {
      client = this._clients[clientId] = this._clients[clientId] ||
          {subscriptions: {}, id: clientId, messageQueue: []};
      // If an existing client, we close its socket before listening to the new socket.
      if (client.socket) {
        client.socket.close();
        client.socket = null;
      }
      logger.info('Client #%s connecting with a new socket!', clientId);
      client.socket = socket;
      client.messageQueue.splice(0).forEach(message => this._sendSocketMessage(client, message.data));
      socket.on('message', (message) => this._onSocketMessage(client, message));
    });

    socket.on('close', () => {
      if (!client) {
        return;
      }
      if (client.socket === socket) {
        client.socket = null;
      }
      logger.info('Client #%s closing a socket!', client.id);
      // TODO: enable subscription cleanup when we have a robust reconnect scenario.
      /*
      for (var channel in client.subscriptions) {
        this.unsubscribe(channel, subscriptions[channel]);
      }
      this._eventSubscriptions.forEach(value => value.delete(client.id));
      delete this._clients[client.id];
      */
    });
  }

  async _onSocketMessage(client: SocketClient, message: any): void {
    message = JSON.parse(message);
    var {serviceName, methodName, methodArgs, serviceOptions, requestId} = message;
    var result = null;
    var error = null;

    try {
      var result = await this.callService(
        '/' + serviceName + '/' + methodName,
        [serviceOptions].concat(methodArgs),
      );
    } catch (e) {
      logger.error('Failed to call %s/%s with error %o', serviceName, methodName, e);
      error = e;
    }

    this._sendSocketMessage(client, {
      channel: SERVICE_FRAMEWORK_RPC_CHANNEL,
      requestId,
      result,
      error,
    });
  }

  /**
   * This could be used by services to wrap a stream or an event emitter to an id that
   * a client can subscribe to on the eventbus.
   */
  registerEventEmitter(eventEmitter: EventEmitter): number {
    var id = ++idIncrement;
    this._eventEmitters[id] = eventEmitter;
    return id;
  }

  /**
   * Starts consuming an event emitter by listening on the requested event names
   * and publish them on the eventbus for subscribed clients to consume as part of thier services.
   */
  _consumeEventEmitter(
      id: number,
      channel: string,
      eventNames: Array<string>) {
    var eventEmitter = this._eventEmitters[id];
    if (eventEmitter.consumed) {
      return;
    }

    eventNames.forEach((eventName) => {
      // listen to every event and publish it on the event bus.
      eventEmitter.on(eventName, (...args) => {
        this.publish(channel, {
          eventEmitterId: id,
          type: eventName,
          args: args.map((arg) => {
            // The arguments needs to be json serializable.
            if (Buffer.isBuffer(arg)) {
              // e.g. node streams emit 'data' buffers.
              return arg.toString();
            } else {
              // string, number, object, null, boolean, ..etc.
              return arg;
            }
          }),
        });
      });
    });

    eventEmitter.consumed = true;
  }

  _sendSocketMessage(client: SocketClient, data: any) {
    // Wrap the data in an object, because if `data` is a primitive data type,
    // finding it in an array would return the first matching item, not necessarily the same inserted item.
    var message = {data};
    var {id, socket, messageQueue} = client;
    messageQueue.push(message);
    if (!socket) {
      return;
    }
    socket.send(JSON.stringify(data), (err) => {
      if (err) {
        logger.warn('Failed sending socket message to client:', id, data);
      } else {
        var messageIndex = messageQueue.indexOf(message);
        if (messageIndex !== -1) {
          messageQueue.splice(messageIndex, 1);
        }
      }
    });
  }

  close() {
    this._webSocketServer.close();
    this._webServer.close();
    this._serviceWithoutServiceFrameworkConfigs.forEach(service_path => {
      var {shutdown} = require(service_path);
      if (shutdown) {
        shutdown(this);
      }
    });
  }
}

module.exports = NuclideServer;
