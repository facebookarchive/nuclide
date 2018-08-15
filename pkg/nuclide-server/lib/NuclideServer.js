"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.HEARTBEAT_CHANNEL = void 0;

var _os = _interopRequireDefault(require("os"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _ws() {
  const data = _interopRequireDefault(require("ws"));

  _ws = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _blocked() {
  const data = _interopRequireDefault(require("./blocked"));

  _blocked = function () {
    return data;
  };

  return data;
}

function _QueuedAckTransport() {
  const data = require("../../../modules/big-dig/src/socket/QueuedAckTransport");

  _QueuedAckTransport = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideVersion() {
  const data = require("../../nuclide-version");

  _nuclideVersion = function () {
    return data;
  };

  return data;
}

function _nuclideLogging() {
  const data = require("../../nuclide-logging");

  _nuclideLogging = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _WebSocketTransport() {
  const data = require("../../../modules/big-dig/src/socket/WebSocketTransport");

  _WebSocketTransport = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const HEARTBEAT_CHANNEL = 'heartbeat'; // eslint-disable-next-line nuclide-internal/no-commonjs

exports.HEARTBEAT_CHANNEL = HEARTBEAT_CHANNEL;

const connect = require('connect'); // eslint-disable-next-line nuclide-internal/no-commonjs


const http = require('http'); // eslint-disable-next-line nuclide-internal/no-commonjs


const https = require('https');

const logger = (0, _log4js().getLogger)('nuclide-server');

class NuclideServer {
  constructor(options, services) {
    this._disposables = new (_UniversalDisposable().default)();

    if (!(NuclideServer._theServer == null)) {
      throw new Error("Invariant violation: \"NuclideServer._theServer == null\"");
    }

    NuclideServer._theServer = this;
    const {
      serverKey,
      serverCertificate,
      port,
      certificateAuthorityCertificate,
      trackEventLoop
    } = options;
    this._version = (0, _nuclideVersion().getVersion)().toString();
    this._app = connect();

    this._attachUtilHandlers();

    const isHttps = Boolean(serverKey && serverCertificate && certificateAuthorityCertificate);

    if (isHttps) {
      const webServerOptions = {
        key: serverKey,
        cert: serverCertificate,
        ca: certificateAuthorityCertificate,
        requestCert: true,
        rejectUnauthorized: true
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
      const stallTracker = new (_nuclideAnalytics().HistogramTracker)('server-event-loop-blocked',
      /* max */
      1000,
      /* buckets */
      10);

      this._disposables.add(stallTracker, (0, _blocked().default)(ms => {
        stallTracker.track(ms);
        logger.info('NuclideServer event loop blocked for ' + ms + 'ms');
      }));
    }

    this._rpcServiceRegistry = new (_nuclideRpc().ServiceRegistry)(_nuclideMarshalersCommon().getServerSideMarshalers, services);
    (0, _nuclideAnalytics().track)('server-created', {
      port,
      isHttps,
      host: _os.default.hostname()
    });
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

  _createWebSocketServer() {
    const webSocketServer = new (_ws().default.Server)({
      server: this._webServer,
      perMessageDeflate: true
    });
    webSocketServer.on('connection', (socket, req) => this._onConnection(socket, req));
    webSocketServer.on('error', error => logger.error('WebSocketServer Error:', error));
    return webSocketServer;
  }

  _setupServices() {
    // Lazy require these functions so that we could spyOn them while testing in
    // ServiceIntegrationTestHelper.
    this._xhrServiceRegistry = {};

    this._setupHeartbeatHandler(); // Setup error handler.


    this._app.use((error, request, response, next) => {
      if (error != null) {
        (0, _utils().sendJsonResponse)(response, {
          code: error.code,
          message: error.message
        }, 500);
      } else {
        next();
      }
    });
  }

  _setupHeartbeatHandler() {
    this._registerService('/' + HEARTBEAT_CHANNEL, async () => this._version, 'post', true);
  }

  static shutdown() {
    logger.info('Shutting down the server');

    for (const callback of NuclideServer._shutdownCallbacks) {
      try {
        callback();
      } catch (e) {
        logger.error('Error when executing shutdown callback:', e);
      }
    }

    try {
      if (NuclideServer._theServer != null) {
        NuclideServer._theServer.close();
      }
    } catch (e) {
      logger.error('Error while shutting down, but proceeding anyway:', e);
    } finally {
      (0, _nuclideLogging().flushLogsAndExit)(0);
    }
  }

  static registerShutdownCallback(callback) {
    NuclideServer._shutdownCallbacks.add(callback);

    return {
      dispose: () => NuclideServer._shutdownCallbacks.delete(callback)
    };
  }

  static closeConnection(client) {
    logger.info(`Closing client: #${client.getTransport().id}`);

    if (NuclideServer._theServer != null) {
      NuclideServer._theServer._closeConnection(client);
    }
  }

  _closeConnection(client) {
    if (this._clients.get(client.getTransport().id) === client) {
      this._clients.delete(client.getTransport().id);
    }
  }

  connect() {
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


  callService(serviceName, args) {
    const serviceFunction = this._xhrServiceRegistry[serviceName];

    if (!serviceFunction) {
      throw new Error('No service registered with name: ' + serviceName);
    }

    return serviceFunction.apply(this, args);
  }
  /**
   * Registers a service function to a service name.
   * This allows simple future calls of the service by name and arguments or http-triggered
   * endpoint calls with arguments serialized over http.
   */


  _registerService(serviceName, serviceFunction, method, isTextResponse) {
    if (this._xhrServiceRegistry[serviceName]) {
      throw new Error('A service with this name is already registered: ' + serviceName);
    }

    this._xhrServiceRegistry[serviceName] = serviceFunction;

    this._registerHttpService(serviceName, method, isTextResponse);
  }

  _registerHttpService(serviceName, method, isTextResponse) {
    const loweredCaseMethod = method.toLowerCase(); // $FlowFixMe - Use map instead of computed property.

    this._app[loweredCaseMethod](serviceName, async (request, response, next) => {
      try {
        const result = await this.callService(serviceName, (0, _utils().deserializeArgs)(request.url));

        if (isTextResponse) {
          (0, _utils().sendTextResponse)(response, result || '');
        } else {
          (0, _utils().sendJsonResponse)(response, result);
        }
      } catch (e) {
        // Delegate to the registered connect error handler.
        next(e);
      }
    });
  }

  _onConnection(socket, req) {
    logger.debug('WebSocket connecting');
    const clientId = req.headers.client_id;
    logger.info(`received client_id in header ${clientId}`);
    let client = null;
    client = this._clients.get(clientId);
    const transport = new (_WebSocketTransport().WebSocketTransport)(clientId, socket);

    if (client == null) {
      client = _nuclideRpc().RpcConnection.createServer(this._rpcServiceRegistry, new (_QueuedAckTransport().QueuedAckTransport)(clientId, transport, _utils().protocolLogger), {}, clientId, _utils().protocolLogger);

      this._clients.set(clientId, client);
    } else {
      if (!(clientId === client.getTransport().id)) {
        throw new Error("Invariant violation: \"clientId === client.getTransport().id\"");
      }

      client.getTransport().reconnect(transport);
    }
  }

  close() {
    return new Promise(resolve => {
      if (!(NuclideServer._theServer === this)) {
        throw new Error("Invariant violation: \"NuclideServer._theServer === this\"");
      }

      NuclideServer._theServer = null;

      this._disposables.dispose();

      this._webSocketServer.close();

      this._webServer.close(() => {
        resolve();
      });
    });
  }

}

exports.default = NuclideServer;
NuclideServer._shutdownCallbacks = new Set();