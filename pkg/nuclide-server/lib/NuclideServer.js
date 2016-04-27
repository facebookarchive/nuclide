var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _config = require('./config');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _serviceframeworkIndex = require('./serviceframework/index');

var _serviceframeworkIndex2 = _interopRequireDefault(_serviceframeworkIndex);

var _SocketClient = require('./SocketClient');

var _nuclideLogging = require('../../nuclide-logging');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var blocked = require('./blocked');
var connect = require('connect');

var http = require('http');
var https = require('https');

var WebSocketServer = require('ws').Server;

var _require = require('./utils');

var deserializeArgs = _require.deserializeArgs;
var sendJsonResponse = _require.sendJsonResponse;
var sendTextResponse = _require.sendTextResponse;

var _require2 = require('../../nuclide-version');

var getVersion = _require2.getVersion;

var logger = (0, _nuclideLogging.getLogger)();

var NuclideServer = (function () {
  function NuclideServer(options, services) {
    _classCallCheck(this, NuclideServer);

    (0, _assert2['default'])(NuclideServer._theServer == null);
    NuclideServer._theServer = this;

    var serverKey = options.serverKey;
    var serverCertificate = options.serverCertificate;
    var port = options.port;
    var certificateAuthorityCertificate = options.certificateAuthorityCertificate;
    var trackEventLoop = options.trackEventLoop;

    this._version = getVersion().toString();
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
      blocked(function (ms) {
        logger.info('NuclideServer event loop blocked for ' + ms + 'ms');
      });
    }

    this._serverComponent = new _serviceframeworkIndex2['default'].ServerComponent(services);
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

      var webSocketServer = new WebSocketServer({ server: this._webServer });
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
      this._serviceRegistry = {};
      this._setupHeartbeatHandler();

      // Setup error handler.
      this._app.use(function (error, request, response, next) {
        if (error != null) {
          sendJsonResponse(response, { code: error.code, message: error.message }, 500);
        } else {
          next();
        }
      });
    }
  }, {
    key: '_setupHeartbeatHandler',
    value: function _setupHeartbeatHandler() {
      var _this3 = this;

      this._registerService('/' + _config.HEARTBEAT_CHANNEL, _asyncToGenerator(function* () {
        return _this3._version;
      }), 'post', true);
    }
  }, {
    key: '_closeConnection',
    value: function _closeConnection(client) {
      if (this._clients.get(client.id) === client) {
        this._clients['delete'](client.id);
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
      var serviceFunction = this._serviceRegistry[serviceName];
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
      if (this._serviceRegistry[serviceName]) {
        throw new Error('A service with this name is already registered:', serviceName);
      }
      this._serviceRegistry[serviceName] = serviceFunction;
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
          var result = yield _this5.callService(serviceName, deserializeArgs(request.url));
          if (isTextResponse) {
            sendTextResponse(response, result || '');
          } else {
            sendJsonResponse(response, result);
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

      socket.on('error', function (e) {
        return logger.error('Client #%s error: %s', client ? client.id : 'unkown', e.message);
      });

      socket.once('message', function (clientId) {
        client = _this6._clients.get(clientId);
        if (client == null) {
          client = new _SocketClient.SocketClient(clientId, _this6._serverComponent, socket);
          _this6._clients.set(clientId, client);
        } else {
          (0, _assert2['default'])(clientId === client.id);
          client.reconnect(socket);
        }
      });
    }
  }, {
    key: 'close',
    value: function close() {
      (0, _assert2['default'])(NuclideServer._theServer === this);
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
        (0, _nuclideLogging.flushLogsAndExit)(0);
      }
    }
  }, {
    key: 'closeConnection',
    value: function closeConnection(client) {
      logger.info('Closing client: #' + client.id);
      if (NuclideServer._theServer != null) {
        NuclideServer._theServer._closeConnection(client);
      }
    }
  }]);

  return NuclideServer;
})();

module.exports = NuclideServer;

// $FlowFixMe (peterhal)