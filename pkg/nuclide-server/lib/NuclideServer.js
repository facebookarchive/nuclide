var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _blocked2;

function _blocked() {
  return _blocked2 = _interopRequireDefault(require('./blocked'));
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _nuclideVersion2;

function _nuclideVersion() {
  return _nuclideVersion2 = require('../../nuclide-version');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _QueuedTransport2;

function _QueuedTransport() {
  return _QueuedTransport2 = require('./QueuedTransport');
}

var _WebSocketTransport2;

function _WebSocketTransport() {
  return _WebSocketTransport2 = require('./WebSocketTransport');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var connect = require('connect');
var http = require('http');
var https = require('https');

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var NuclideServer = (function () {
  function NuclideServer(options, services) {
    _classCallCheck(this, NuclideServer);

    (0, (_assert2 || _assert()).default)(NuclideServer._theServer == null);
    NuclideServer._theServer = this;

    var serverKey = options.serverKey;
    var serverCertificate = options.serverCertificate;
    var port = options.port;
    var certificateAuthorityCertificate = options.certificateAuthorityCertificate;
    var trackEventLoop = options.trackEventLoop;

    this._version = (0, (_nuclideVersion2 || _nuclideVersion()).getVersion)().toString();
    this._app = connect();
    this._attachUtilHandlers();
    if (serverKey && serverCertificate && certificateAuthorityCertificate) {
      var webServerOptions = {
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
      (0, (_blocked2 || _blocked()).default)(function (ms) {
        logger.info('NuclideServer event loop blocked for ' + ms + 'ms');
      });
    }

    this._rpcServiceRegistry = (_nuclideRpc2 || _nuclideRpc()).ServiceRegistry.createLocal(services);
  }

  _createClass(NuclideServer, [{
    key: '_attachUtilHandlers',
    value: function _attachUtilHandlers() {
      var _this = this;

      // Add specific method handlers.
      ['get', 'post', 'delete', 'put'].forEach(function (methodName) {
        // $FlowFixMe - Use map instead of computed property on library type.
        _this._app[methodName] = function (uri, handler) {
          _this._app.use(uri, function (request, response, next) {
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
  }, {
    key: '_createWebSocketServer',
    value: function _createWebSocketServer() {
      var _this2 = this;

      var webSocketServer = new (_ws2 || _ws()).default.Server({ server: this._webServer });
      webSocketServer.on('connection', function (socket) {
        return _this2._onConnection(socket);
      });
      webSocketServer.on('error', function (error) {
        return logger.error('WebSocketServer Error:', error);
      });
      return webSocketServer;
    }
  }, {
    key: '_setupServices',
    value: function _setupServices() {
      // Lazy require these functions so that we could spyOn them while testing in
      // ServiceIntegrationTestHelper.
      this._xhrServiceRegistry = {};
      this._setupHeartbeatHandler();

      // Setup error handler.
      this._app.use(function (error, request, response, next) {
        if (error != null) {
          (0, (_utils2 || _utils()).sendJsonResponse)(response, { code: error.code, message: error.message }, 500);
        } else {
          next();
        }
      });
    }
  }, {
    key: '_setupHeartbeatHandler',
    value: function _setupHeartbeatHandler() {
      var _this3 = this;

      this._registerService('/' + (_config2 || _config()).HEARTBEAT_CHANNEL, _asyncToGenerator(function* () {
        return _this3._version;
      }), 'post', true);
    }
  }, {
    key: '_closeConnection',
    value: function _closeConnection(client) {
      if (this._clients.get(client.getTransport().id) === client) {
        this._clients.delete(client.getTransport().id);
        client.dispose();
      }
    }
  }, {
    key: 'connect',
    value: function connect() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4._webServer.on('listening', function () {
          resolve();
        });
        _this4._webServer.on('error', function (e) {
          _this4._webServer.removeAllListeners();
          reject(e);
        });
        _this4._webServer.listen(_this4._port);
      });
    }

    /**
     * Calls a registered service with a name and arguments.
     */
  }, {
    key: 'callService',
    value: function callService(serviceName, args) {
      var serviceFunction = this._xhrServiceRegistry[serviceName];
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
  }, {
    key: '_registerService',
    value: function _registerService(serviceName, serviceFunction, method, isTextResponse) {
      if (this._xhrServiceRegistry[serviceName]) {
        throw new Error('A service with this name is already registered:', serviceName);
      }
      this._xhrServiceRegistry[serviceName] = serviceFunction;
      this._registerHttpService(serviceName, method, isTextResponse);
    }
  }, {
    key: '_registerHttpService',
    value: function _registerHttpService(serviceName, method, isTextResponse) {
      var _this5 = this;

      var loweredCaseMethod = method.toLowerCase();
      // $FlowFixMe - Use map instead of computed property.
      this._app[loweredCaseMethod](serviceName, _asyncToGenerator(function* (request, response, next) {
        try {
          var result = yield _this5.callService(serviceName, (0, (_utils2 || _utils()).deserializeArgs)(request.url));
          if (isTextResponse) {
            (0, (_utils2 || _utils()).sendTextResponse)(response, result || '');
          } else {
            (0, (_utils2 || _utils()).sendJsonResponse)(response, result);
          }
        } catch (e) {
          // Delegate to the registered connect error handler.
          next(e);
        }
      }));
    }
  }, {
    key: '_onConnection',
    value: function _onConnection(socket) {
      var _this6 = this;

      logger.debug('WebSocket connecting');

      var client = null;

      var errorSubscription = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(socket, 'error', function (e) {
        return logger.error('WebSocket error before first message', e);
      });

      socket.once('message', function (clientId) {
        errorSubscription.dispose();
        client = _this6._clients.get(clientId);
        var transport = new (_WebSocketTransport2 || _WebSocketTransport()).WebSocketTransport(clientId, socket);
        if (client == null) {
          client = (_nuclideRpc2 || _nuclideRpc()).RpcConnection.createServer(_this6._rpcServiceRegistry, new (_QueuedTransport2 || _QueuedTransport()).QueuedTransport(clientId, transport));
          _this6._clients.set(clientId, client);
        } else {
          (0, (_assert2 || _assert()).default)(clientId === client.getTransport().id);
          client.getTransport().reconnect(transport);
        }
      });
    }
  }, {
    key: 'close',
    value: function close() {
      (0, (_assert2 || _assert()).default)(NuclideServer._theServer === this);
      NuclideServer._theServer = null;

      this._webSocketServer.close();
      this._webServer.close();
    }
  }], [{
    key: 'shutdown',
    value: function shutdown() {
      logger.info('Shutting down the server');
      try {
        if (NuclideServer._theServer != null) {
          NuclideServer._theServer.close();
        }
      } catch (e) {
        logger.error('Error while shutting down, but proceeding anyway:', e);
      } finally {
        (0, (_nuclideLogging2 || _nuclideLogging()).flushLogsAndExit)(0);
      }
    }
  }, {
    key: 'closeConnection',
    value: function closeConnection(client) {
      logger.info('Closing client: #' + client.getTransport().id);
      if (NuclideServer._theServer != null) {
        NuclideServer._theServer._closeConnection(client);
      }
    }
  }]);

  return NuclideServer;
})();

module.exports = NuclideServer;