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
    this._clients = {};

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
        client = _this6._clients[clientId] = _this6._clients[clientId] || { subscriptions: {}, id: clientId, messageQueue: [] };
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
//# sourceMappingURL=data:application/json;base64,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QU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsY0FBSSxZQUFZLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDdkIsd0JBQVksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1dBQ3RDO1NBQ0Y7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRUksaUJBQUc7QUFDTiwrQkFBVSxhQUFhLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQzdDLG1CQUFhLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDekI7OztXQTlJYyxvQkFBUztBQUN0QixZQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDeEMsVUFBSTtBQUNGLFlBQUksYUFBYSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDcEMsdUJBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDbEM7T0FDRixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsY0FBTSxDQUFDLEtBQUssQ0FBQyxtREFBbUQsRUFBRSxDQUFDLENBQUMsQ0FBQztPQUN0RSxTQUFTO0FBQ1IsdUNBQWlCLENBQUMsQ0FBQyxDQUFDO09BQ3JCO0tBQ0Y7OztTQXRIRyxhQUFhOzs7QUE0UG5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6Ik51Y2xpZGVTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBibG9ja2VkID0gcmVxdWlyZSgnLi9ibG9ja2VkJyk7XG5jb25zdCBjb25uZWN0OiBjb25uZWN0JG1vZHVsZSA9IHJlcXVpcmUoJ2Nvbm5lY3QnKTtcblxuY29uc3QgaHR0cDogaHR0cCRmaXhlZCA9IChyZXF1aXJlKCdodHRwJyk6IGFueSk7XG5jb25zdCBodHRwczogaHR0cHMkZml4ZWQgPSAocmVxdWlyZSgnaHR0cHMnKTogYW55KTtcblxuaW1wb3J0IHtcbiAgSEVBUlRCRUFUX0NIQU5ORUwsXG4gIFNFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMfSBmcm9tICcuL2NvbmZpZyc7XG5jb25zdCBXZWJTb2NrZXRTZXJ2ZXI6IENsYXNzPHdzJFNlcnZlcj4gPSByZXF1aXJlKCd3cycpLlNlcnZlcjtcbmNvbnN0IHtkZXNlcmlhbGl6ZUFyZ3MsIHNlbmRKc29uUmVzcG9uc2UsIHNlbmRUZXh0UmVzcG9uc2V9ID0gcmVxdWlyZSgnLi91dGlscycpO1xuY29uc3Qge2dldFZlcnNpb259ID0gcmVxdWlyZSgnLi4vLi4vdmVyc2lvbicpO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi9zZXJ2aWNlZnJhbWV3b3JrJztcbmltcG9ydCB0eXBlIHtDb25maWdFbnRyeX0gZnJvbSAnLi9zZXJ2aWNlZnJhbWV3b3JrL2luZGV4JztcblxuaW1wb3J0IHtnZXRMb2dnZXIsIGZsdXNoTG9nc0FuZEV4aXR9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgTnVjbGlkZVNlcnZlck9wdGlvbnMgPSB7XG4gIHBvcnQ6IG51bWJlcjtcbiAgc2VydmVyS2V5PzogQnVmZmVyO1xuICBzZXJ2ZXJDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjtcbiAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjtcbiAgdHJhY2tFdmVudExvb3A/OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBTb2NrZXRDbGllbnQgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIHN1YnNjcmlwdGlvbnM6IHtbY2hhbm5lbDogc3RyaW5nXTogKGV2ZW50OiBhbnkpID0+IHZvaWR9O1xuICBzb2NrZXQ6ID93cyRXZWJTb2NrZXQ7XG4gIG1lc3NhZ2VRdWV1ZTogQXJyYXk8e2RhdGE6IHN0cmluZ30+O1xufTtcblxuY2xhc3MgTnVjbGlkZVNlcnZlciB7XG4gIHN0YXRpYyBfdGhlU2VydmVyOiA/TnVjbGlkZVNlcnZlcjtcblxuICBfd2ViU2VydmVyOiBodHRwJGZpeGVkJFNlcnZlcjtcbiAgX3dlYlNvY2tldFNlcnZlcjogd3MkU2VydmVyO1xuICBfY2xpZW50czoge1tjbGllbnRJZDogc3RyaW5nXTogU29ja2V0Q2xpZW50fTtcbiAgX3BvcnQ6IG51bWJlcjtcbiAgX2FwcDogY29ubmVjdCRTZXJ2ZXI7XG4gIF9zZXJ2aWNlUmVnaXN0cnk6IHtbc2VydmljZU5hbWU6IHN0cmluZ106ICgpID0+IGFueX07XG4gIF92ZXJzaW9uOiBzdHJpbmc7XG5cbiAgX3NlcnZlckNvbXBvbmVudDogU2VydmljZUZyYW1ld29yay5TZXJ2ZXJDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogTnVjbGlkZVNlcnZlck9wdGlvbnMsIHNlcnZpY2VzOiBBcnJheTxDb25maWdFbnRyeT4pIHtcbiAgICBpbnZhcmlhbnQoTnVjbGlkZVNlcnZlci5fdGhlU2VydmVyID09IG51bGwpO1xuICAgIE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlciA9IHRoaXM7XG5cbiAgICBjb25zdCB7XG4gICAgICBzZXJ2ZXJLZXksXG4gICAgICBzZXJ2ZXJDZXJ0aWZpY2F0ZSxcbiAgICAgIHBvcnQsXG4gICAgICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlLFxuICAgICAgdHJhY2tFdmVudExvb3AsXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICB0aGlzLl92ZXJzaW9uID0gZ2V0VmVyc2lvbigpLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5fYXBwID0gY29ubmVjdCgpO1xuICAgIHRoaXMuX2F0dGFjaFV0aWxIYW5kbGVycygpO1xuICAgIGlmIChzZXJ2ZXJLZXkgJiYgc2VydmVyQ2VydGlmaWNhdGUgJiYgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSkge1xuICAgICAgY29uc3Qgd2ViU2VydmVyT3B0aW9ucyA9IHtcbiAgICAgICAga2V5OiBzZXJ2ZXJLZXksXG4gICAgICAgIGNlcnQ6IHNlcnZlckNlcnRpZmljYXRlLFxuICAgICAgICBjYTogY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSxcbiAgICAgICAgcmVxdWVzdENlcnQ6IHRydWUsXG4gICAgICAgIHJlamVjdFVuYXV0aG9yaXplZDogdHJ1ZSxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX3dlYlNlcnZlciA9IGh0dHBzLmNyZWF0ZVNlcnZlcih3ZWJTZXJ2ZXJPcHRpb25zLCB0aGlzLl9hcHApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl93ZWJTZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcih0aGlzLl9hcHApO1xuICAgIH1cbiAgICB0aGlzLl9wb3J0ID0gcG9ydDtcblxuICAgIHRoaXMuX3dlYlNvY2tldFNlcnZlciA9IHRoaXMuX2NyZWF0ZVdlYlNvY2tldFNlcnZlcigpO1xuICAgIHRoaXMuX2NsaWVudHMgPSB7fTtcblxuICAgIHRoaXMuX3NldHVwU2VydmljZXMoKTsgLy8gU2V0dXAgMS4wIGFuZCAyLjAgc2VydmljZXMuXG5cbiAgICBpZiAodHJhY2tFdmVudExvb3ApIHtcbiAgICAgIGJsb2NrZWQoKG1zOiBudW1iZXIpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ051Y2xpZGVTZXJ2ZXIgZXZlbnQgbG9vcCBibG9ja2VkIGZvciAnICsgbXMgKyAnbXMnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudCA9XG4gICAgICAgIG5ldyBTZXJ2aWNlRnJhbWV3b3JrLlNlcnZlckNvbXBvbmVudCh0aGlzLCBzZXJ2aWNlcyk7XG4gIH1cblxuICBfYXR0YWNoVXRpbEhhbmRsZXJzKCkge1xuICAgIC8vIEFkZCBzcGVjaWZpYyBtZXRob2QgaGFuZGxlcnMuXG4gICAgWydnZXQnLCAncG9zdCcsICdkZWxldGUnLCAncHV0J10uZm9yRWFjaCgobWV0aG9kTmFtZSkgPT4ge1xuICAgICAgLy8gJEZsb3dGaXhNZSAtIFVzZSBtYXAgaW5zdGVhZCBvZiBjb21wdXRlZCBwcm9wZXJ0eSBvbiBsaWJyYXJ5IHR5cGUuXG4gICAgICB0aGlzLl9hcHBbbWV0aG9kTmFtZV0gPSAodXJpLCBoYW5kbGVyKSA9PiB7XG4gICAgICAgIHRoaXMuX2FwcC51c2UodXJpLCAocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpID0+IHtcbiAgICAgICAgICBpZiAocmVxdWVzdC5tZXRob2QudG9VcHBlckNhc2UoKSAhPT0gbWV0aG9kTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICAvLyBza2lwIGlmIG1ldGhvZCBkb2Vzbid0IG1hdGNoLlxuICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlcihyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBfY3JlYXRlV2ViU29ja2V0U2VydmVyKCk6IHdzJFNlcnZlciB7XG4gICAgY29uc3Qgd2ViU29ja2V0U2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7c2VydmVyOiB0aGlzLl93ZWJTZXJ2ZXJ9KTtcbiAgICB3ZWJTb2NrZXRTZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCAoc29ja2V0KSA9PiB0aGlzLl9vbkNvbm5lY3Rpb24oc29ja2V0KSk7XG4gICAgd2ViU29ja2V0U2VydmVyLm9uKCdlcnJvcicsIChlcnJvcikgPT4gbG9nZ2VyLmVycm9yKCdXZWJTb2NrZXRTZXJ2ZXIgRXJyb3I6JywgZXJyb3IpKTtcbiAgICByZXR1cm4gd2ViU29ja2V0U2VydmVyO1xuICB9XG5cbiAgX3NldHVwU2VydmljZXMoKSB7XG4gICAgLy8gTGF6eSByZXF1aXJlIHRoZXNlIGZ1bmN0aW9ucyBzbyB0aGF0IHdlIGNvdWxkIHNweU9uIHRoZW0gd2hpbGUgdGVzdGluZyBpblxuICAgIC8vIFNlcnZpY2VJbnRlZ3JhdGlvblRlc3RIZWxwZXIuXG4gICAgdGhpcy5fc2VydmljZVJlZ2lzdHJ5ID0ge307XG4gICAgdGhpcy5fc2V0dXBIZWFydGJlYXRIYW5kbGVyKCk7XG5cbiAgICAvLyBTZXR1cCBlcnJvciBoYW5kbGVyLlxuICAgIHRoaXMuX2FwcC51c2UoKGVycm9yOiA/Y29ubmVjdCRFcnJvcixcbiAgICAgICAgcmVxdWVzdDogaHR0cCRmaXhlZCRJbmNvbWluZ01lc3NhZ2UsXG4gICAgICAgIC8vICRGbG93Rml4TWUgKHBldGVyaGFsKVxuICAgICAgICByZXNwb25zZTogaHR0cCRmaXhlZCRTZXJ2ZXJSZXNwb25zZSxcbiAgICAgICAgbmV4dDogRnVuY3Rpb24pID0+IHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHNlbmRKc29uUmVzcG9uc2UocmVzcG9uc2UsIHtjb2RlOiBlcnJvci5jb2RlLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlfSwgNTAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9zZXR1cEhlYXJ0YmVhdEhhbmRsZXIoKSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJTZXJ2aWNlKCcvJyArIEhFQVJUQkVBVF9DSEFOTkVMLCBhc3luYyAoKSA9PiB0aGlzLl92ZXJzaW9uLFxuICAgICAgICAncG9zdCcsIHRydWUpO1xuICB9XG5cbiAgc3RhdGljIHNodXRkb3duKCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdTaHV0dGluZyBkb3duIHRoZSBzZXJ2ZXInKTtcbiAgICB0cnkge1xuICAgICAgaWYgKE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlciAhPSBudWxsKSB7XG4gICAgICAgIE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlci5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2h1dHRpbmcgZG93biwgYnV0IHByb2NlZWRpbmcgYW55d2F5OicsIGUpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBmbHVzaExvZ3NBbmRFeGl0KDApO1xuICAgIH1cbiAgfVxuXG4gIGNvbm5lY3QoKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX3dlYlNlcnZlci5vbignbGlzdGVuaW5nJywgKCkgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3dlYlNlcnZlci5vbignZXJyb3InLCAoZSkgPT4ge1xuICAgICAgICB0aGlzLl93ZWJTZXJ2ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fd2ViU2VydmVyLmxpc3Rlbih0aGlzLl9wb3J0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBhIHJlZ2lzdGVyZWQgc2VydmljZSB3aXRoIGEgbmFtZSBhbmQgYXJndW1lbnRzLlxuICAgKi9cbiAgY2FsbFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZywgYXJnczogQXJyYXk8YW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3Qgc2VydmljZUZ1bmN0aW9uID0gdGhpcy5fc2VydmljZVJlZ2lzdHJ5W3NlcnZpY2VOYW1lXTtcbiAgICBpZiAoIXNlcnZpY2VGdW5jdGlvbikge1xuICAgICAgdGhyb3cgRXJyb3IoJ05vIHNlcnZpY2UgcmVnaXN0ZXJlZCB3aXRoIG5hbWU6ICcgKyBzZXJ2aWNlTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBzZXJ2aWNlRnVuY3Rpb24uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgc2VydmljZSBmdW5jdGlvbiB0byBhIHNlcnZpY2UgbmFtZS5cbiAgICogVGhpcyBhbGxvd3Mgc2ltcGxlIGZ1dHVyZSBjYWxscyBvZiB0aGUgc2VydmljZSBieSBuYW1lIGFuZCBhcmd1bWVudHMgb3IgaHR0cC10cmlnZ2VyZWRcbiAgICogZW5kcG9pbnQgY2FsbHMgd2l0aCBhcmd1bWVudHMgc2VyaWFsaXplZCBvdmVyIGh0dHAuXG4gICAqL1xuICBfcmVnaXN0ZXJTZXJ2aWNlKFxuICAgICAgc2VydmljZU5hbWU6IHN0cmluZyxcbiAgICAgIHNlcnZpY2VGdW5jdGlvbjogKCkgPT4gUHJvbWlzZTxhbnk+LFxuICAgICAgbWV0aG9kOiBzdHJpbmcsXG4gICAgICBpc1RleHRSZXNwb25zZTogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl9zZXJ2aWNlUmVnaXN0cnlbc2VydmljZU5hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc2VydmljZSB3aXRoIHRoaXMgbmFtZSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQ6Jywgc2VydmljZU5hbWUpO1xuICAgIH1cbiAgICB0aGlzLl9zZXJ2aWNlUmVnaXN0cnlbc2VydmljZU5hbWVdID0gc2VydmljZUZ1bmN0aW9uO1xuICAgIHRoaXMuX3JlZ2lzdGVySHR0cFNlcnZpY2Uoc2VydmljZU5hbWUsIG1ldGhvZCwgaXNUZXh0UmVzcG9uc2UpO1xuICB9XG5cbiAgX3JlZ2lzdGVySHR0cFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZywgbWV0aG9kOiBzdHJpbmcsIGlzVGV4dFJlc3BvbnNlOiA/Ym9vbGVhbikge1xuICAgIGNvbnN0IGxvd2VyZWRDYXNlTWV0aG9kID0gbWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gJEZsb3dGaXhNZSAtIFVzZSBtYXAgaW5zdGVhZCBvZiBjb21wdXRlZCBwcm9wZXJ0eS5cbiAgICB0aGlzLl9hcHBbbG93ZXJlZENhc2VNZXRob2RdKHNlcnZpY2VOYW1lLCBhc3luYyAocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuY2FsbFNlcnZpY2Uoc2VydmljZU5hbWUsIGRlc2VyaWFsaXplQXJncyhyZXF1ZXN0LnVybCkpO1xuICAgICAgICBpZiAoaXNUZXh0UmVzcG9uc2UpIHtcbiAgICAgICAgICBzZW5kVGV4dFJlc3BvbnNlKHJlc3BvbnNlLCByZXN1bHQgfHwgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbmRKc29uUmVzcG9uc2UocmVzcG9uc2UsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRGVsZWdhdGUgdG8gdGhlIHJlZ2lzdGVyZWQgY29ubmVjdCBlcnJvciBoYW5kbGVyLlxuICAgICAgICBuZXh0KGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX29uQ29ubmVjdGlvbihzb2NrZXQ6IHdzJFdlYlNvY2tldCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygnV2ViU29ja2V0IGNvbm5lY3RpbmcnKTtcblxuXG4gICAgbGV0IGNsaWVudCA9IG51bGw7XG5cbiAgICBzb2NrZXQub24oJ2Vycm9yJywgKGUpID0+XG4gICAgICBsb2dnZXIuZXJyb3IoJ0NsaWVudCAjJXMgZXJyb3I6ICVzJywgY2xpZW50ID8gY2xpZW50LmlkIDogJ3Vua293bicsIGUubWVzc2FnZSkpO1xuXG4gICAgc29ja2V0Lm9uY2UoJ21lc3NhZ2UnLCAoY2xpZW50SWQ6IHN0cmluZykgPT4ge1xuICAgICAgY2xpZW50ID0gdGhpcy5fY2xpZW50c1tjbGllbnRJZF0gPSB0aGlzLl9jbGllbnRzW2NsaWVudElkXSB8fFxuICAgICAgICAgIHtzdWJzY3JpcHRpb25zOiB7fSwgaWQ6IGNsaWVudElkLCBtZXNzYWdlUXVldWU6IFtdfTtcbiAgICAgIGNvbnN0IGxvY2FsQ2xpZW50ID0gY2xpZW50O1xuICAgICAgLy8gSWYgYW4gZXhpc3RpbmcgY2xpZW50LCB3ZSBjbG9zZSBpdHMgc29ja2V0IGJlZm9yZSBsaXN0ZW5pbmcgdG8gdGhlIG5ldyBzb2NrZXQuXG4gICAgICBpZiAoY2xpZW50LnNvY2tldCkge1xuICAgICAgICBjbGllbnQuc29ja2V0LmNsb3NlKCk7XG4gICAgICAgIGNsaWVudC5zb2NrZXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmluZm8oJ0NsaWVudCAjJXMgY29ubmVjdGluZyB3aXRoIGEgbmV3IHNvY2tldCEnLCBjbGllbnRJZCk7XG4gICAgICBjbGllbnQuc29ja2V0ID0gc29ja2V0O1xuICAgICAgY2xpZW50Lm1lc3NhZ2VRdWV1ZS5zcGxpY2UoMCkuXG4gICAgICAgICAgZm9yRWFjaChtZXNzYWdlID0+IHRoaXMuX3NlbmRTb2NrZXRNZXNzYWdlKGxvY2FsQ2xpZW50LCBtZXNzYWdlLmRhdGEpKTtcbiAgICAgIHNvY2tldC5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB0aGlzLl9vblNvY2tldE1lc3NhZ2UobG9jYWxDbGllbnQsIG1lc3NhZ2UpKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoY2xpZW50LnNvY2tldCA9PT0gc29ja2V0KSB7XG4gICAgICAgIGNsaWVudC5zb2NrZXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmluZm8oJ0NsaWVudCAjJXMgY2xvc2luZyBhIHNvY2tldCEnLCBjbGllbnQuaWQpO1xuICAgIH0pO1xuICB9XG5cbiAgX29uU29ja2V0TWVzc2FnZShjbGllbnQ6IFNvY2tldENsaWVudCwgbWVzc2FnZTogYW55KTogdm9pZCB7XG4gICAgbWVzc2FnZSA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgaW52YXJpYW50KG1lc3NhZ2UucHJvdG9jb2wgJiYgbWVzc2FnZS5wcm90b2NvbCA9PT0gU0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUwpO1xuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudC5oYW5kbGVNZXNzYWdlKGNsaWVudCwgbWVzc2FnZSk7XG4gIH1cblxuICBfc2VuZFNvY2tldE1lc3NhZ2UoY2xpZW50OiBTb2NrZXRDbGllbnQsIGRhdGE6IGFueSkge1xuICAgIC8vIFdyYXAgdGhlIGRhdGEgaW4gYW4gb2JqZWN0LCBiZWNhdXNlIGlmIGBkYXRhYCBpcyBhIHByaW1pdGl2ZSBkYXRhIHR5cGUsXG4gICAgLy8gZmluZGluZyBpdCBpbiBhbiBhcnJheSB3b3VsZCByZXR1cm4gdGhlIGZpcnN0IG1hdGNoaW5nIGl0ZW0sIG5vdCBuZWNlc3NhcmlseVxuICAgIC8vIHRoZSBzYW1lIGluc2VydGVkIGl0ZW0uXG4gICAgY29uc3QgbWVzc2FnZSA9IHtkYXRhfTtcbiAgICBjb25zdCB7aWQsIHNvY2tldCwgbWVzc2FnZVF1ZXVlfSA9IGNsaWVudDtcbiAgICBtZXNzYWdlUXVldWUucHVzaChtZXNzYWdlKTtcbiAgICBpZiAoIXNvY2tldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSwgKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBsb2dnZXIud2FybignRmFpbGVkIHNlbmRpbmcgc29ja2V0IG1lc3NhZ2UgdG8gY2xpZW50OicsIGlkLCBkYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VJbmRleCA9IG1lc3NhZ2VRdWV1ZS5pbmRleE9mKG1lc3NhZ2UpO1xuICAgICAgICBpZiAobWVzc2FnZUluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIG1lc3NhZ2VRdWV1ZS5zcGxpY2UobWVzc2FnZUluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaW52YXJpYW50KE51Y2xpZGVTZXJ2ZXIuX3RoZVNlcnZlciA9PT0gdGhpcyk7XG4gICAgTnVjbGlkZVNlcnZlci5fdGhlU2VydmVyID0gbnVsbDtcblxuICAgIHRoaXMuX3dlYlNvY2tldFNlcnZlci5jbG9zZSgpO1xuICAgIHRoaXMuX3dlYlNlcnZlci5jbG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVjbGlkZVNlcnZlcjtcbiJdfQ==