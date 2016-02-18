Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _config = require('./config');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _serviceframework = require('./serviceframework');

var _serviceframework2 = _interopRequireDefault(_serviceframework);

var _logging = require('../../logging');

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

var _require2 = require('../../version');

var getVersion = _require2.getVersion;

var logger = (0, _logging.getLogger)();

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

    this._serverComponent = new _serviceframework2['default'].ServerComponent(this, services);
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
          client = { subscriptions: {}, id: clientId, socket: null, messageQueue: [] };
          _this6._clients.set(clientId, client);
        }
        var localClient = client;
        // If an existing client, we close its socket before listening to the new socket.
        if (client.socket) {
          client.socket.close();
          client.socket = null;
        }
        logger.info('Client #%s connecting with a new socket!', clientId);
        client.socket = socket;
        client.messageQueue.splice(0).forEach(function (message) {
          return _this6._sendSocketMessage(localClient, message.data);
        });
        socket.on('message', function (message) {
          return _this6._onSocketMessage(localClient, message);
        });
      });

      socket.on('close', function () {
        if (!client) {
          return;
        }
        if (client.socket === socket) {
          client.socket = null;
        }
        logger.info('Client #%s closing a socket!', client.id);
      });
    }
  }, {
    key: '_onSocketMessage',
    value: function _onSocketMessage(client, message) {
      message = JSON.parse(message);
      (0, _assert2['default'])(message.protocol && message.protocol === _config.SERVICE_FRAMEWORK3_CHANNEL);
      this._serverComponent.handleMessage(client, message);
    }
  }, {
    key: '_sendSocketMessage',
    value: function _sendSocketMessage(client, data) {
      // Wrap the data in an object, because if `data` is a primitive data type,
      // finding it in an array would return the first matching item, not necessarily
      // the same inserted item.
      var message = { data: data };
      var id = client.id;
      var socket = client.socket;
      var messageQueue = client.messageQueue;

      messageQueue.push(message);
      if (!socket) {
        return;
      }
      socket.send(JSON.stringify(data), function (err) {
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
        (0, _logging.flushLogsAndExit)(0);
      }
    }
  }]);

  return NuclideServer;
})();

module.exports = NuclideServer;

// $FlowFixMe (peterhal)
//# sourceMappingURL=data:application/json;base64,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QUUsVUFBQSxHQUFHLEVBQUk7QUFDdkMsWUFBSSxHQUFHLEVBQUU7QUFDUCxnQkFBTSxDQUFDLElBQUksQ0FBQywwQ0FBMEMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbkUsTUFBTTtBQUNMLGNBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsY0FBSSxZQUFZLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDdkIsd0JBQVksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1dBQ3RDO1NBQ0Y7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRUksaUJBQUc7QUFDTiwrQkFBVSxhQUFhLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQzdDLG1CQUFhLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDekI7OztXQWpKYyxvQkFBUztBQUN0QixZQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDeEMsVUFBSTtBQUNGLFlBQUksYUFBYSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDcEMsdUJBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDbEM7T0FDRixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsY0FBTSxDQUFDLEtBQUssQ0FBQyxtREFBbUQsRUFBRSxDQUFDLENBQUMsQ0FBQztPQUN0RSxTQUFTO0FBQ1IsdUNBQWlCLENBQUMsQ0FBQyxDQUFDO09BQ3JCO0tBQ0Y7OztTQXRIRyxhQUFhOzs7QUErUG5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6Ik51Y2xpZGVTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBibG9ja2VkID0gcmVxdWlyZSgnLi9ibG9ja2VkJyk7XG5jb25zdCBjb25uZWN0OiBjb25uZWN0JG1vZHVsZSA9IHJlcXVpcmUoJ2Nvbm5lY3QnKTtcblxuY29uc3QgaHR0cDogaHR0cCRmaXhlZCA9IChyZXF1aXJlKCdodHRwJyk6IGFueSk7XG5jb25zdCBodHRwczogaHR0cHMkZml4ZWQgPSAocmVxdWlyZSgnaHR0cHMnKTogYW55KTtcblxuaW1wb3J0IHtcbiAgSEVBUlRCRUFUX0NIQU5ORUwsXG4gIFNFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMfSBmcm9tICcuL2NvbmZpZyc7XG5jb25zdCBXZWJTb2NrZXRTZXJ2ZXI6IENsYXNzPHdzJFNlcnZlcj4gPSByZXF1aXJlKCd3cycpLlNlcnZlcjtcbmNvbnN0IHtkZXNlcmlhbGl6ZUFyZ3MsIHNlbmRKc29uUmVzcG9uc2UsIHNlbmRUZXh0UmVzcG9uc2V9ID0gcmVxdWlyZSgnLi91dGlscycpO1xuY29uc3Qge2dldFZlcnNpb259ID0gcmVxdWlyZSgnLi4vLi4vdmVyc2lvbicpO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi9zZXJ2aWNlZnJhbWV3b3JrJztcbmltcG9ydCB0eXBlIHtDb25maWdFbnRyeX0gZnJvbSAnLi9zZXJ2aWNlZnJhbWV3b3JrL2luZGV4JztcblxuaW1wb3J0IHtnZXRMb2dnZXIsIGZsdXNoTG9nc0FuZEV4aXR9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgTnVjbGlkZVNlcnZlck9wdGlvbnMgPSB7XG4gIHBvcnQ6IG51bWJlcixcbiAgc2VydmVyS2V5PzogQnVmZmVyLFxuICBzZXJ2ZXJDZXJ0aWZpY2F0ZT86IEJ1ZmZlcixcbiAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZT86IEJ1ZmZlcixcbiAgdHJhY2tFdmVudExvb3A/OiBib29sZWFuLFxufVxuXG5leHBvcnQgdHlwZSBTb2NrZXRDbGllbnQgPSB7XG4gIGlkOiBzdHJpbmcsXG4gIHN1YnNjcmlwdGlvbnM6IHtbY2hhbm5lbDogc3RyaW5nXTogKGV2ZW50OiBhbnkpID0+IHZvaWR9LFxuICBzb2NrZXQ6ID93cyRXZWJTb2NrZXQsXG4gIG1lc3NhZ2VRdWV1ZTogQXJyYXk8e2RhdGE6IHN0cmluZ30+LFxufTtcblxuY2xhc3MgTnVjbGlkZVNlcnZlciB7XG4gIHN0YXRpYyBfdGhlU2VydmVyOiA/TnVjbGlkZVNlcnZlcjtcblxuICBfd2ViU2VydmVyOiBodHRwJGZpeGVkJFNlcnZlcjtcbiAgX3dlYlNvY2tldFNlcnZlcjogd3MkU2VydmVyO1xuICBfY2xpZW50czogTWFwPHN0cmluZywgU29ja2V0Q2xpZW50PjtcbiAgX3BvcnQ6IG51bWJlcjtcbiAgX2FwcDogY29ubmVjdCRTZXJ2ZXI7XG4gIF9zZXJ2aWNlUmVnaXN0cnk6IHtbc2VydmljZU5hbWU6IHN0cmluZ106ICgpID0+IGFueX07XG4gIF92ZXJzaW9uOiBzdHJpbmc7XG5cbiAgX3NlcnZlckNvbXBvbmVudDogU2VydmljZUZyYW1ld29yay5TZXJ2ZXJDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogTnVjbGlkZVNlcnZlck9wdGlvbnMsIHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICBpbnZhcmlhbnQoTnVjbGlkZVNlcnZlci5fdGhlU2VydmVyID09IG51bGwpO1xuICAgIE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlciA9IHRoaXM7XG5cbiAgICBjb25zdCB7XG4gICAgICBzZXJ2ZXJLZXksXG4gICAgICBzZXJ2ZXJDZXJ0aWZpY2F0ZSxcbiAgICAgIHBvcnQsXG4gICAgICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlLFxuICAgICAgdHJhY2tFdmVudExvb3AsXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICB0aGlzLl92ZXJzaW9uID0gZ2V0VmVyc2lvbigpLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5fYXBwID0gY29ubmVjdCgpO1xuICAgIHRoaXMuX2F0dGFjaFV0aWxIYW5kbGVycygpO1xuICAgIGlmIChzZXJ2ZXJLZXkgJiYgc2VydmVyQ2VydGlmaWNhdGUgJiYgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSkge1xuICAgICAgY29uc3Qgd2ViU2VydmVyT3B0aW9ucyA9IHtcbiAgICAgICAga2V5OiBzZXJ2ZXJLZXksXG4gICAgICAgIGNlcnQ6IHNlcnZlckNlcnRpZmljYXRlLFxuICAgICAgICBjYTogY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSxcbiAgICAgICAgcmVxdWVzdENlcnQ6IHRydWUsXG4gICAgICAgIHJlamVjdFVuYXV0aG9yaXplZDogdHJ1ZSxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX3dlYlNlcnZlciA9IGh0dHBzLmNyZWF0ZVNlcnZlcih3ZWJTZXJ2ZXJPcHRpb25zLCB0aGlzLl9hcHApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl93ZWJTZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcih0aGlzLl9hcHApO1xuICAgIH1cbiAgICB0aGlzLl9wb3J0ID0gcG9ydDtcblxuICAgIHRoaXMuX3dlYlNvY2tldFNlcnZlciA9IHRoaXMuX2NyZWF0ZVdlYlNvY2tldFNlcnZlcigpO1xuICAgIHRoaXMuX2NsaWVudHMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9zZXR1cFNlcnZpY2VzKCk7IC8vIFNldHVwIDEuMCBhbmQgMi4wIHNlcnZpY2VzLlxuXG4gICAgaWYgKHRyYWNrRXZlbnRMb29wKSB7XG4gICAgICBibG9ja2VkKChtczogbnVtYmVyKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdOdWNsaWRlU2VydmVyIGV2ZW50IGxvb3AgYmxvY2tlZCBmb3IgJyArIG1zICsgJ21zJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXJ2ZXJDb21wb25lbnQgPVxuICAgICAgICBuZXcgU2VydmljZUZyYW1ld29yay5TZXJ2ZXJDb21wb25lbnQodGhpcywgc2VydmljZXMpO1xuICB9XG5cbiAgX2F0dGFjaFV0aWxIYW5kbGVycygpIHtcbiAgICAvLyBBZGQgc3BlY2lmaWMgbWV0aG9kIGhhbmRsZXJzLlxuICAgIFsnZ2V0JywgJ3Bvc3QnLCAnZGVsZXRlJywgJ3B1dCddLmZvckVhY2gobWV0aG9kTmFtZSA9PiB7XG4gICAgICAvLyAkRmxvd0ZpeE1lIC0gVXNlIG1hcCBpbnN0ZWFkIG9mIGNvbXB1dGVkIHByb3BlcnR5IG9uIGxpYnJhcnkgdHlwZS5cbiAgICAgIHRoaXMuX2FwcFttZXRob2ROYW1lXSA9ICh1cmksIGhhbmRsZXIpID0+IHtcbiAgICAgICAgdGhpcy5fYXBwLnVzZSh1cmksIChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmIChyZXF1ZXN0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpICE9PSBtZXRob2ROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIC8vIHNraXAgaWYgbWV0aG9kIGRvZXNuJ3QgbWF0Y2guXG4gICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIF9jcmVhdGVXZWJTb2NrZXRTZXJ2ZXIoKTogd3MkU2VydmVyIHtcbiAgICBjb25zdCB3ZWJTb2NrZXRTZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtzZXJ2ZXI6IHRoaXMuX3dlYlNlcnZlcn0pO1xuICAgIHdlYlNvY2tldFNlcnZlci5vbignY29ubmVjdGlvbicsIHNvY2tldCA9PiB0aGlzLl9vbkNvbm5lY3Rpb24oc29ja2V0KSk7XG4gICAgd2ViU29ja2V0U2VydmVyLm9uKCdlcnJvcicsIGVycm9yID0+IGxvZ2dlci5lcnJvcignV2ViU29ja2V0U2VydmVyIEVycm9yOicsIGVycm9yKSk7XG4gICAgcmV0dXJuIHdlYlNvY2tldFNlcnZlcjtcbiAgfVxuXG4gIF9zZXR1cFNlcnZpY2VzKCkge1xuICAgIC8vIExhenkgcmVxdWlyZSB0aGVzZSBmdW5jdGlvbnMgc28gdGhhdCB3ZSBjb3VsZCBzcHlPbiB0aGVtIHdoaWxlIHRlc3RpbmcgaW5cbiAgICAvLyBTZXJ2aWNlSW50ZWdyYXRpb25UZXN0SGVscGVyLlxuICAgIHRoaXMuX3NlcnZpY2VSZWdpc3RyeSA9IHt9O1xuICAgIHRoaXMuX3NldHVwSGVhcnRiZWF0SGFuZGxlcigpO1xuXG4gICAgLy8gU2V0dXAgZXJyb3IgaGFuZGxlci5cbiAgICB0aGlzLl9hcHAudXNlKChlcnJvcjogP2Nvbm5lY3QkRXJyb3IsXG4gICAgICAgIHJlcXVlc3Q6IGh0dHAkZml4ZWQkSW5jb21pbmdNZXNzYWdlLFxuICAgICAgICAvLyAkRmxvd0ZpeE1lIChwZXRlcmhhbClcbiAgICAgICAgcmVzcG9uc2U6IGh0dHAkZml4ZWQkU2VydmVyUmVzcG9uc2UsXG4gICAgICAgIG5leHQ6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICBzZW5kSnNvblJlc3BvbnNlKHJlc3BvbnNlLCB7Y29kZTogZXJyb3IuY29kZSwgbWVzc2FnZTogZXJyb3IubWVzc2FnZX0sIDUwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfc2V0dXBIZWFydGJlYXRIYW5kbGVyKCkge1xuICAgIHRoaXMuX3JlZ2lzdGVyU2VydmljZSgnLycgKyBIRUFSVEJFQVRfQ0hBTk5FTCwgYXN5bmMgKCkgPT4gdGhpcy5fdmVyc2lvbixcbiAgICAgICAgJ3Bvc3QnLCB0cnVlKTtcbiAgfVxuXG4gIHN0YXRpYyBzaHV0ZG93bigpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnU2h1dHRpbmcgZG93biB0aGUgc2VydmVyJyk7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChOdWNsaWRlU2VydmVyLl90aGVTZXJ2ZXIgIT0gbnVsbCkge1xuICAgICAgICBOdWNsaWRlU2VydmVyLl90aGVTZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIHNodXR0aW5nIGRvd24sIGJ1dCBwcm9jZWVkaW5nIGFueXdheTonLCBlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZmx1c2hMb2dzQW5kRXhpdCgwKTtcbiAgICB9XG4gIH1cblxuICBjb25uZWN0KCk6IFByb21pc2Uge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl93ZWJTZXJ2ZXIub24oJ2xpc3RlbmluZycsICgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl93ZWJTZXJ2ZXIub24oJ2Vycm9yJywgZSA9PiB7XG4gICAgICAgIHRoaXMuX3dlYlNlcnZlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl93ZWJTZXJ2ZXIubGlzdGVuKHRoaXMuX3BvcnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGEgcmVnaXN0ZXJlZCBzZXJ2aWNlIHdpdGggYSBuYW1lIGFuZCBhcmd1bWVudHMuXG4gICAqL1xuICBjYWxsU2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nLCBhcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBzZXJ2aWNlRnVuY3Rpb24gPSB0aGlzLl9zZXJ2aWNlUmVnaXN0cnlbc2VydmljZU5hbWVdO1xuICAgIGlmICghc2VydmljZUZ1bmN0aW9uKSB7XG4gICAgICB0aHJvdyBFcnJvcignTm8gc2VydmljZSByZWdpc3RlcmVkIHdpdGggbmFtZTogJyArIHNlcnZpY2VOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlcnZpY2VGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBzZXJ2aWNlIGZ1bmN0aW9uIHRvIGEgc2VydmljZSBuYW1lLlxuICAgKiBUaGlzIGFsbG93cyBzaW1wbGUgZnV0dXJlIGNhbGxzIG9mIHRoZSBzZXJ2aWNlIGJ5IG5hbWUgYW5kIGFyZ3VtZW50cyBvciBodHRwLXRyaWdnZXJlZFxuICAgKiBlbmRwb2ludCBjYWxscyB3aXRoIGFyZ3VtZW50cyBzZXJpYWxpemVkIG92ZXIgaHR0cC5cbiAgICovXG4gIF9yZWdpc3RlclNlcnZpY2UoXG4gICAgICBzZXJ2aWNlTmFtZTogc3RyaW5nLFxuICAgICAgc2VydmljZUZ1bmN0aW9uOiAoKSA9PiBQcm9taXNlPGFueT4sXG4gICAgICBtZXRob2Q6IHN0cmluZyxcbiAgICAgIGlzVGV4dFJlc3BvbnNlOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuX3NlcnZpY2VSZWdpc3RyeVtzZXJ2aWNlTmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQSBzZXJ2aWNlIHdpdGggdGhpcyBuYW1lIGlzIGFscmVhZHkgcmVnaXN0ZXJlZDonLCBzZXJ2aWNlTmFtZSk7XG4gICAgfVxuICAgIHRoaXMuX3NlcnZpY2VSZWdpc3RyeVtzZXJ2aWNlTmFtZV0gPSBzZXJ2aWNlRnVuY3Rpb247XG4gICAgdGhpcy5fcmVnaXN0ZXJIdHRwU2VydmljZShzZXJ2aWNlTmFtZSwgbWV0aG9kLCBpc1RleHRSZXNwb25zZSk7XG4gIH1cblxuICBfcmVnaXN0ZXJIdHRwU2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nLCBtZXRob2Q6IHN0cmluZywgaXNUZXh0UmVzcG9uc2U6ID9ib29sZWFuKSB7XG4gICAgY29uc3QgbG93ZXJlZENhc2VNZXRob2QgPSBtZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgICAvLyAkRmxvd0ZpeE1lIC0gVXNlIG1hcCBpbnN0ZWFkIG9mIGNvbXB1dGVkIHByb3BlcnR5LlxuICAgIHRoaXMuX2FwcFtsb3dlcmVkQ2FzZU1ldGhvZF0oc2VydmljZU5hbWUsIGFzeW5jIChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jYWxsU2VydmljZShzZXJ2aWNlTmFtZSwgZGVzZXJpYWxpemVBcmdzKHJlcXVlc3QudXJsKSk7XG4gICAgICAgIGlmIChpc1RleHRSZXNwb25zZSkge1xuICAgICAgICAgIHNlbmRUZXh0UmVzcG9uc2UocmVzcG9uc2UsIHJlc3VsdCB8fCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VuZEpzb25SZXNwb25zZShyZXNwb25zZSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBEZWxlZ2F0ZSB0byB0aGUgcmVnaXN0ZXJlZCBjb25uZWN0IGVycm9yIGhhbmRsZXIuXG4gICAgICAgIG5leHQoZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfb25Db25uZWN0aW9uKHNvY2tldDogd3MkV2ViU29ja2V0KTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdXZWJTb2NrZXQgY29ubmVjdGluZycpO1xuXG5cbiAgICBsZXQgY2xpZW50OiA/U29ja2V0Q2xpZW50ID0gbnVsbDtcblxuICAgIHNvY2tldC5vbignZXJyb3InLCBlID0+XG4gICAgICBsb2dnZXIuZXJyb3IoJ0NsaWVudCAjJXMgZXJyb3I6ICVzJywgY2xpZW50ID8gY2xpZW50LmlkIDogJ3Vua293bicsIGUubWVzc2FnZSkpO1xuXG4gICAgc29ja2V0Lm9uY2UoJ21lc3NhZ2UnLCAoY2xpZW50SWQ6IHN0cmluZykgPT4ge1xuICAgICAgY2xpZW50ID0gdGhpcy5fY2xpZW50cy5nZXQoY2xpZW50SWQpO1xuICAgICAgaWYgKGNsaWVudCA9PSBudWxsKSB7XG4gICAgICAgIGNsaWVudCA9IHtzdWJzY3JpcHRpb25zOiB7fSwgaWQ6IGNsaWVudElkLCBzb2NrZXQ6IG51bGwsIG1lc3NhZ2VRdWV1ZTogW119O1xuICAgICAgICB0aGlzLl9jbGllbnRzLnNldChjbGllbnRJZCwgY2xpZW50KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxvY2FsQ2xpZW50ID0gY2xpZW50O1xuICAgICAgLy8gSWYgYW4gZXhpc3RpbmcgY2xpZW50LCB3ZSBjbG9zZSBpdHMgc29ja2V0IGJlZm9yZSBsaXN0ZW5pbmcgdG8gdGhlIG5ldyBzb2NrZXQuXG4gICAgICBpZiAoY2xpZW50LnNvY2tldCkge1xuICAgICAgICBjbGllbnQuc29ja2V0LmNsb3NlKCk7XG4gICAgICAgIGNsaWVudC5zb2NrZXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmluZm8oJ0NsaWVudCAjJXMgY29ubmVjdGluZyB3aXRoIGEgbmV3IHNvY2tldCEnLCBjbGllbnRJZCk7XG4gICAgICBjbGllbnQuc29ja2V0ID0gc29ja2V0O1xuICAgICAgY2xpZW50Lm1lc3NhZ2VRdWV1ZS5zcGxpY2UoMCkuXG4gICAgICAgICAgZm9yRWFjaChtZXNzYWdlID0+IHRoaXMuX3NlbmRTb2NrZXRNZXNzYWdlKGxvY2FsQ2xpZW50LCBtZXNzYWdlLmRhdGEpKTtcbiAgICAgIHNvY2tldC5vbignbWVzc2FnZScsIG1lc3NhZ2UgPT4gdGhpcy5fb25Tb2NrZXRNZXNzYWdlKGxvY2FsQ2xpZW50LCBtZXNzYWdlKSk7XG4gICAgfSk7XG5cbiAgICBzb2NrZXQub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGNsaWVudC5zb2NrZXQgPT09IHNvY2tldCkge1xuICAgICAgICBjbGllbnQuc29ja2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5pbmZvKCdDbGllbnQgIyVzIGNsb3NpbmcgYSBzb2NrZXQhJywgY2xpZW50LmlkKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9vblNvY2tldE1lc3NhZ2UoY2xpZW50OiBTb2NrZXRDbGllbnQsIG1lc3NhZ2U6IGFueSk6IHZvaWQge1xuICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKG1lc3NhZ2UpO1xuICAgIGludmFyaWFudChtZXNzYWdlLnByb3RvY29sICYmIG1lc3NhZ2UucHJvdG9jb2wgPT09IFNFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMKTtcbiAgICB0aGlzLl9zZXJ2ZXJDb21wb25lbnQuaGFuZGxlTWVzc2FnZShjbGllbnQsIG1lc3NhZ2UpO1xuICB9XG5cbiAgX3NlbmRTb2NrZXRNZXNzYWdlKGNsaWVudDogU29ja2V0Q2xpZW50LCBkYXRhOiBhbnkpIHtcbiAgICAvLyBXcmFwIHRoZSBkYXRhIGluIGFuIG9iamVjdCwgYmVjYXVzZSBpZiBgZGF0YWAgaXMgYSBwcmltaXRpdmUgZGF0YSB0eXBlLFxuICAgIC8vIGZpbmRpbmcgaXQgaW4gYW4gYXJyYXkgd291bGQgcmV0dXJuIHRoZSBmaXJzdCBtYXRjaGluZyBpdGVtLCBub3QgbmVjZXNzYXJpbHlcbiAgICAvLyB0aGUgc2FtZSBpbnNlcnRlZCBpdGVtLlxuICAgIGNvbnN0IG1lc3NhZ2UgPSB7ZGF0YX07XG4gICAgY29uc3Qge2lkLCBzb2NrZXQsIG1lc3NhZ2VRdWV1ZX0gPSBjbGllbnQ7XG4gICAgbWVzc2FnZVF1ZXVlLnB1c2gobWVzc2FnZSk7XG4gICAgaWYgKCFzb2NrZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSksIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdGYWlsZWQgc2VuZGluZyBzb2NrZXQgbWVzc2FnZSB0byBjbGllbnQ6JywgaWQsIGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZUluZGV4ID0gbWVzc2FnZVF1ZXVlLmluZGV4T2YobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgbWVzc2FnZVF1ZXVlLnNwbGljZShtZXNzYWdlSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpbnZhcmlhbnQoTnVjbGlkZVNlcnZlci5fdGhlU2VydmVyID09PSB0aGlzKTtcbiAgICBOdWNsaWRlU2VydmVyLl90aGVTZXJ2ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fd2ViU29ja2V0U2VydmVyLmNsb3NlKCk7XG4gICAgdGhpcy5fd2ViU2VydmVyLmNsb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlU2VydmVyO1xuIl19