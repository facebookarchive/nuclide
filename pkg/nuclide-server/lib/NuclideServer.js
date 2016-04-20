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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM5QixVQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3pCOzs7V0FqSGMsb0JBQVM7QUFDdEIsWUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ3hDLFVBQUk7QUFDRixZQUFJLGFBQWEsQ0FBQyxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3BDLHVCQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2xDO09BQ0YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGNBQU0sQ0FBQyxLQUFLLENBQUMsbURBQW1ELEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDdEUsU0FBUztBQUNSLDhDQUFpQixDQUFDLENBQUMsQ0FBQztPQUNyQjtLQUNGOzs7V0FFcUIseUJBQUMsTUFBb0IsRUFBUTtBQUNqRCxZQUFNLENBQUMsSUFBSSx1QkFBcUIsTUFBTSxDQUFDLEVBQUUsQ0FBRyxDQUFDO0FBQzdDLFVBQUksYUFBYSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDcEMscUJBQWEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDbkQ7S0FDRjs7O1NBN0hHLGFBQWE7OztBQStObkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiTnVjbGlkZVNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGJsb2NrZWQgPSByZXF1aXJlKCcuL2Jsb2NrZWQnKTtcbmNvbnN0IGNvbm5lY3Q6IGNvbm5lY3QkbW9kdWxlID0gcmVxdWlyZSgnY29ubmVjdCcpO1xuXG5jb25zdCBodHRwOiBodHRwJGZpeGVkID0gKHJlcXVpcmUoJ2h0dHAnKTogYW55KTtcbmNvbnN0IGh0dHBzOiBodHRwcyRmaXhlZCA9IChyZXF1aXJlKCdodHRwcycpOiBhbnkpO1xuXG5pbXBvcnQge0hFQVJUQkVBVF9DSEFOTkVMfSBmcm9tICcuL2NvbmZpZyc7XG5jb25zdCBXZWJTb2NrZXRTZXJ2ZXI6IENsYXNzPHdzJFNlcnZlcj4gPSByZXF1aXJlKCd3cycpLlNlcnZlcjtcbmNvbnN0IHtkZXNlcmlhbGl6ZUFyZ3MsIHNlbmRKc29uUmVzcG9uc2UsIHNlbmRUZXh0UmVzcG9uc2V9ID0gcmVxdWlyZSgnLi91dGlscycpO1xuY29uc3Qge2dldFZlcnNpb259ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS12ZXJzaW9uJyk7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgU2VydmljZUZyYW1ld29yayBmcm9tICcuL3NlcnZpY2VmcmFtZXdvcmsvaW5kZXgnO1xuaW1wb3J0IHR5cGUge0NvbmZpZ0VudHJ5fSBmcm9tICcuL3NlcnZpY2VmcmFtZXdvcmsvaW5kZXgnO1xuaW1wb3J0IHtTb2NrZXRDbGllbnR9IGZyb20gJy4vU29ja2V0Q2xpZW50JztcblxuaW1wb3J0IHtnZXRMb2dnZXIsIGZsdXNoTG9nc0FuZEV4aXR9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxudHlwZSBOdWNsaWRlU2VydmVyT3B0aW9ucyA9IHtcbiAgcG9ydDogbnVtYmVyO1xuICBzZXJ2ZXJLZXk/OiBCdWZmZXI7XG4gIHNlcnZlckNlcnRpZmljYXRlPzogQnVmZmVyO1xuICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlPzogQnVmZmVyO1xuICB0cmFja0V2ZW50TG9vcD86IGJvb2xlYW47XG59O1xuXG5jbGFzcyBOdWNsaWRlU2VydmVyIHtcbiAgc3RhdGljIF90aGVTZXJ2ZXI6ID9OdWNsaWRlU2VydmVyO1xuXG4gIF93ZWJTZXJ2ZXI6IGh0dHAkZml4ZWQkU2VydmVyO1xuICBfd2ViU29ja2V0U2VydmVyOiB3cyRTZXJ2ZXI7XG4gIF9jbGllbnRzOiBNYXA8c3RyaW5nLCBTb2NrZXRDbGllbnQ+O1xuICBfcG9ydDogbnVtYmVyO1xuICBfYXBwOiBjb25uZWN0JFNlcnZlcjtcbiAgX3NlcnZpY2VSZWdpc3RyeToge1tzZXJ2aWNlTmFtZTogc3RyaW5nXTogKCkgPT4gYW55fTtcbiAgX3ZlcnNpb246IHN0cmluZztcblxuICBfc2VydmVyQ29tcG9uZW50OiBTZXJ2aWNlRnJhbWV3b3JrLlNlcnZlckNvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBOdWNsaWRlU2VydmVyT3B0aW9ucywgc2VydmljZXM6IEFycmF5PENvbmZpZ0VudHJ5Pikge1xuICAgIGludmFyaWFudChOdWNsaWRlU2VydmVyLl90aGVTZXJ2ZXIgPT0gbnVsbCk7XG4gICAgTnVjbGlkZVNlcnZlci5fdGhlU2VydmVyID0gdGhpcztcblxuICAgIGNvbnN0IHtcbiAgICAgIHNlcnZlcktleSxcbiAgICAgIHNlcnZlckNlcnRpZmljYXRlLFxuICAgICAgcG9ydCxcbiAgICAgIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgICB0cmFja0V2ZW50TG9vcCxcbiAgICB9ID0gb3B0aW9ucztcblxuICAgIHRoaXMuX3ZlcnNpb24gPSBnZXRWZXJzaW9uKCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLl9hcHAgPSBjb25uZWN0KCk7XG4gICAgdGhpcy5fYXR0YWNoVXRpbEhhbmRsZXJzKCk7XG4gICAgaWYgKHNlcnZlcktleSAmJiBzZXJ2ZXJDZXJ0aWZpY2F0ZSAmJiBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlKSB7XG4gICAgICBjb25zdCB3ZWJTZXJ2ZXJPcHRpb25zID0ge1xuICAgICAgICBrZXk6IHNlcnZlcktleSxcbiAgICAgICAgY2VydDogc2VydmVyQ2VydGlmaWNhdGUsXG4gICAgICAgIGNhOiBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlLFxuICAgICAgICByZXF1ZXN0Q2VydDogdHJ1ZSxcbiAgICAgICAgcmVqZWN0VW5hdXRob3JpemVkOiB0cnVlLFxuICAgICAgfTtcblxuICAgICAgdGhpcy5fd2ViU2VydmVyID0gaHR0cHMuY3JlYXRlU2VydmVyKHdlYlNlcnZlck9wdGlvbnMsIHRoaXMuX2FwcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3dlYlNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKHRoaXMuX2FwcCk7XG4gICAgfVxuICAgIHRoaXMuX3BvcnQgPSBwb3J0O1xuXG4gICAgdGhpcy5fd2ViU29ja2V0U2VydmVyID0gdGhpcy5fY3JlYXRlV2ViU29ja2V0U2VydmVyKCk7XG4gICAgdGhpcy5fY2xpZW50cyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3NldHVwU2VydmljZXMoKTsgLy8gU2V0dXAgMS4wIGFuZCAyLjAgc2VydmljZXMuXG5cbiAgICBpZiAodHJhY2tFdmVudExvb3ApIHtcbiAgICAgIGJsb2NrZWQoKG1zOiBudW1iZXIpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ051Y2xpZGVTZXJ2ZXIgZXZlbnQgbG9vcCBibG9ja2VkIGZvciAnICsgbXMgKyAnbXMnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudCA9XG4gICAgICAgIG5ldyBTZXJ2aWNlRnJhbWV3b3JrLlNlcnZlckNvbXBvbmVudChzZXJ2aWNlcyk7XG4gIH1cblxuICBfYXR0YWNoVXRpbEhhbmRsZXJzKCkge1xuICAgIC8vIEFkZCBzcGVjaWZpYyBtZXRob2QgaGFuZGxlcnMuXG4gICAgWydnZXQnLCAncG9zdCcsICdkZWxldGUnLCAncHV0J10uZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICAgIC8vICRGbG93Rml4TWUgLSBVc2UgbWFwIGluc3RlYWQgb2YgY29tcHV0ZWQgcHJvcGVydHkgb24gbGlicmFyeSB0eXBlLlxuICAgICAgdGhpcy5fYXBwW21ldGhvZE5hbWVdID0gKHVyaSwgaGFuZGxlcikgPT4ge1xuICAgICAgICB0aGlzLl9hcHAudXNlKHVyaSwgKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KSA9PiB7XG4gICAgICAgICAgaWYgKHJlcXVlc3QubWV0aG9kLnRvVXBwZXJDYXNlKCkgIT09IG1ldGhvZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICAgICAgLy8gc2tpcCBpZiBtZXRob2QgZG9lc24ndCBtYXRjaC5cbiAgICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgX2NyZWF0ZVdlYlNvY2tldFNlcnZlcigpOiB3cyRTZXJ2ZXIge1xuICAgIGNvbnN0IHdlYlNvY2tldFNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3NlcnZlcjogdGhpcy5fd2ViU2VydmVyfSk7XG4gICAgd2ViU29ja2V0U2VydmVyLm9uKCdjb25uZWN0aW9uJywgc29ja2V0ID0+IHRoaXMuX29uQ29ubmVjdGlvbihzb2NrZXQpKTtcbiAgICB3ZWJTb2NrZXRTZXJ2ZXIub24oJ2Vycm9yJywgZXJyb3IgPT4gbG9nZ2VyLmVycm9yKCdXZWJTb2NrZXRTZXJ2ZXIgRXJyb3I6JywgZXJyb3IpKTtcbiAgICByZXR1cm4gd2ViU29ja2V0U2VydmVyO1xuICB9XG5cbiAgX3NldHVwU2VydmljZXMoKSB7XG4gICAgLy8gTGF6eSByZXF1aXJlIHRoZXNlIGZ1bmN0aW9ucyBzbyB0aGF0IHdlIGNvdWxkIHNweU9uIHRoZW0gd2hpbGUgdGVzdGluZyBpblxuICAgIC8vIFNlcnZpY2VJbnRlZ3JhdGlvblRlc3RIZWxwZXIuXG4gICAgdGhpcy5fc2VydmljZVJlZ2lzdHJ5ID0ge307XG4gICAgdGhpcy5fc2V0dXBIZWFydGJlYXRIYW5kbGVyKCk7XG5cbiAgICAvLyBTZXR1cCBlcnJvciBoYW5kbGVyLlxuICAgIHRoaXMuX2FwcC51c2UoKGVycm9yOiA/Y29ubmVjdCRFcnJvcixcbiAgICAgICAgcmVxdWVzdDogaHR0cCRmaXhlZCRJbmNvbWluZ01lc3NhZ2UsXG4gICAgICAgIC8vICRGbG93Rml4TWUgKHBldGVyaGFsKVxuICAgICAgICByZXNwb25zZTogaHR0cCRmaXhlZCRTZXJ2ZXJSZXNwb25zZSxcbiAgICAgICAgbmV4dDogRnVuY3Rpb24pID0+IHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHNlbmRKc29uUmVzcG9uc2UocmVzcG9uc2UsIHtjb2RlOiBlcnJvci5jb2RlLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlfSwgNTAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9zZXR1cEhlYXJ0YmVhdEhhbmRsZXIoKSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJTZXJ2aWNlKCcvJyArIEhFQVJUQkVBVF9DSEFOTkVMLCBhc3luYyAoKSA9PiB0aGlzLl92ZXJzaW9uLFxuICAgICAgICAncG9zdCcsIHRydWUpO1xuICB9XG5cbiAgc3RhdGljIHNodXRkb3duKCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdTaHV0dGluZyBkb3duIHRoZSBzZXJ2ZXInKTtcbiAgICB0cnkge1xuICAgICAgaWYgKE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlciAhPSBudWxsKSB7XG4gICAgICAgIE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlci5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2h1dHRpbmcgZG93biwgYnV0IHByb2NlZWRpbmcgYW55d2F5OicsIGUpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBmbHVzaExvZ3NBbmRFeGl0KDApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBjbG9zZUNvbm5lY3Rpb24oY2xpZW50OiBTb2NrZXRDbGllbnQpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbyhgQ2xvc2luZyBjbGllbnQ6ICMke2NsaWVudC5pZH1gKTtcbiAgICBpZiAoTnVjbGlkZVNlcnZlci5fdGhlU2VydmVyICE9IG51bGwpIHtcbiAgICAgIE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlci5fY2xvc2VDb25uZWN0aW9uKGNsaWVudCk7XG4gICAgfVxuICB9XG5cbiAgX2Nsb3NlQ29ubmVjdGlvbihjbGllbnQ6IFNvY2tldENsaWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jbGllbnRzLmdldChjbGllbnQuaWQpID09PSBjbGllbnQpIHtcbiAgICAgIHRoaXMuX2NsaWVudHMuZGVsZXRlKGNsaWVudC5pZCk7XG4gICAgICBjbGllbnQuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbm5lY3QoKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX3dlYlNlcnZlci5vbignbGlzdGVuaW5nJywgKCkgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3dlYlNlcnZlci5vbignZXJyb3InLCBlID0+IHtcbiAgICAgICAgdGhpcy5fd2ViU2VydmVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3dlYlNlcnZlci5saXN0ZW4odGhpcy5fcG9ydCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgYSByZWdpc3RlcmVkIHNlcnZpY2Ugd2l0aCBhIG5hbWUgYW5kIGFyZ3VtZW50cy5cbiAgICovXG4gIGNhbGxTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcsIGFyZ3M6IEFycmF5PGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHNlcnZpY2VGdW5jdGlvbiA9IHRoaXMuX3NlcnZpY2VSZWdpc3RyeVtzZXJ2aWNlTmFtZV07XG4gICAgaWYgKCFzZXJ2aWNlRnVuY3Rpb24pIHtcbiAgICAgIHRocm93IEVycm9yKCdObyBzZXJ2aWNlIHJlZ2lzdGVyZWQgd2l0aCBuYW1lOiAnICsgc2VydmljZU5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gc2VydmljZUZ1bmN0aW9uLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIHNlcnZpY2UgZnVuY3Rpb24gdG8gYSBzZXJ2aWNlIG5hbWUuXG4gICAqIFRoaXMgYWxsb3dzIHNpbXBsZSBmdXR1cmUgY2FsbHMgb2YgdGhlIHNlcnZpY2UgYnkgbmFtZSBhbmQgYXJndW1lbnRzIG9yIGh0dHAtdHJpZ2dlcmVkXG4gICAqIGVuZHBvaW50IGNhbGxzIHdpdGggYXJndW1lbnRzIHNlcmlhbGl6ZWQgb3ZlciBodHRwLlxuICAgKi9cbiAgX3JlZ2lzdGVyU2VydmljZShcbiAgICAgIHNlcnZpY2VOYW1lOiBzdHJpbmcsXG4gICAgICBzZXJ2aWNlRnVuY3Rpb246ICgpID0+IFByb21pc2U8YW55PixcbiAgICAgIG1ldGhvZDogc3RyaW5nLFxuICAgICAgaXNUZXh0UmVzcG9uc2U6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fc2VydmljZVJlZ2lzdHJ5W3NlcnZpY2VOYW1lXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNlcnZpY2Ugd2l0aCB0aGlzIG5hbWUgaXMgYWxyZWFkeSByZWdpc3RlcmVkOicsIHNlcnZpY2VOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5fc2VydmljZVJlZ2lzdHJ5W3NlcnZpY2VOYW1lXSA9IHNlcnZpY2VGdW5jdGlvbjtcbiAgICB0aGlzLl9yZWdpc3Rlckh0dHBTZXJ2aWNlKHNlcnZpY2VOYW1lLCBtZXRob2QsIGlzVGV4dFJlc3BvbnNlKTtcbiAgfVxuXG4gIF9yZWdpc3Rlckh0dHBTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcsIG1ldGhvZDogc3RyaW5nLCBpc1RleHRSZXNwb25zZTogP2Jvb2xlYW4pIHtcbiAgICBjb25zdCBsb3dlcmVkQ2FzZU1ldGhvZCA9IG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICAgIC8vICRGbG93Rml4TWUgLSBVc2UgbWFwIGluc3RlYWQgb2YgY29tcHV0ZWQgcHJvcGVydHkuXG4gICAgdGhpcy5fYXBwW2xvd2VyZWRDYXNlTWV0aG9kXShzZXJ2aWNlTmFtZSwgYXN5bmMgKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNhbGxTZXJ2aWNlKHNlcnZpY2VOYW1lLCBkZXNlcmlhbGl6ZUFyZ3MocmVxdWVzdC51cmwpKTtcbiAgICAgICAgaWYgKGlzVGV4dFJlc3BvbnNlKSB7XG4gICAgICAgICAgc2VuZFRleHRSZXNwb25zZShyZXNwb25zZSwgcmVzdWx0IHx8ICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kSnNvblJlc3BvbnNlKHJlc3BvbnNlLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIERlbGVnYXRlIHRvIHRoZSByZWdpc3RlcmVkIGNvbm5lY3QgZXJyb3IgaGFuZGxlci5cbiAgICAgICAgbmV4dChlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNvbm5lY3Rpb24oc29ja2V0OiB3cyRXZWJTb2NrZXQpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ1dlYlNvY2tldCBjb25uZWN0aW5nJyk7XG5cblxuICAgIGxldCBjbGllbnQ6ID9Tb2NrZXRDbGllbnQgPSBudWxsO1xuXG4gICAgc29ja2V0Lm9uKCdlcnJvcicsIGUgPT5cbiAgICAgIGxvZ2dlci5lcnJvcignQ2xpZW50ICMlcyBlcnJvcjogJXMnLCBjbGllbnQgPyBjbGllbnQuaWQgOiAndW5rb3duJywgZS5tZXNzYWdlKSk7XG5cbiAgICBzb2NrZXQub25jZSgnbWVzc2FnZScsIChjbGllbnRJZDogc3RyaW5nKSA9PiB7XG4gICAgICBjbGllbnQgPSB0aGlzLl9jbGllbnRzLmdldChjbGllbnRJZCk7XG4gICAgICBpZiAoY2xpZW50ID09IG51bGwpIHtcbiAgICAgICAgY2xpZW50ID0gbmV3IFNvY2tldENsaWVudChjbGllbnRJZCwgdGhpcy5fc2VydmVyQ29tcG9uZW50LCBzb2NrZXQpO1xuICAgICAgICB0aGlzLl9jbGllbnRzLnNldChjbGllbnRJZCwgY2xpZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGludmFyaWFudChjbGllbnRJZCA9PT0gY2xpZW50LmlkKTtcbiAgICAgICAgY2xpZW50LnJlY29ubmVjdChzb2NrZXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaW52YXJpYW50KE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlciA9PT0gdGhpcyk7XG4gICAgTnVjbGlkZVNlcnZlci5fdGhlU2VydmVyID0gbnVsbDtcblxuICAgIHRoaXMuX3dlYlNvY2tldFNlcnZlci5jbG9zZSgpO1xuICAgIHRoaXMuX3dlYlNlcnZlci5jbG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVjbGlkZVNlcnZlcjtcbiJdfQ==