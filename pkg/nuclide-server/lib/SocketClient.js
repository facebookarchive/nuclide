Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _config = require('./config');

var _serviceframeworkIndex = require('./serviceframework/index');

var _serviceframeworkIndex2 = _interopRequireDefault(_serviceframeworkIndex);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

var _serviceframeworkObjectRegistry = require('./serviceframework/ObjectRegistry');

// Server side analog to (parts of) NuclideSocket
// Handles JSON messaging and reconnect.

var logger = (0, _nuclideLogging.getLogger)();

var SocketClient = (function () {
  function SocketClient(clientId, serverComponent, socket) {
    _classCallCheck(this, SocketClient);

    this.id = clientId;
    this._isDisposed = false;
    this._socket = null;
    this._messageQueue = [];
    this._objectRegistry = new _serviceframeworkObjectRegistry.ObjectRegistry('server');
    this._serverComponent = serverComponent;
    this._connect(socket);
  }

  _createClass(SocketClient, [{
    key: '_connect',
    value: function _connect(socket) {
      var _this = this;

      logger.info('Client #%s connecting with a new socket!', this.id);
      (0, _assert2['default'])(this._socket == null);
      this._socket = socket;
      socket.on('message', function (message) {
        return _this._onSocketMessage(message);
      });

      socket.on('close', function () {
        if (_this._socket != null) {
          // This can occur on a reconnect, where the old socket has been closed
          // but its close event is sent asynchronously.
          if (_this._socket === socket) {
            _this._socket = null;
            logger.info('Client #%s socket close recieved on open socket!', _this.id);
          } else {
            logger.info('Client #%s socket close received on orphaned socket!', _this.id);
          }
        } else {
          logger.info('Client #%s recieved socket close on already closed socket!', _this.id);
        }
      });
    }
  }, {
    key: 'reconnect',
    value: function reconnect(socket) {
      var _this2 = this;

      this._close();
      this._connect(socket);
      var queuedMessages = this._messageQueue;
      this._messageQueue = [];
      queuedMessages.forEach(function (message) {
        return _this2.sendSocketMessage(message.data);
      });
    }
  }, {
    key: '_close',
    value: function _close() {
      if (this._socket != null) {
        this._socket.close();
        // In certain (Error) conditions socket.close may not emit the on close
        // event synchronously.
        this._socket = null;
      }
    }
  }, {
    key: '_onSocketMessage',
    value: function _onSocketMessage(message) {
      if (this._isDisposed) {
        logger.error('Received socket message after connection closed', new Error());
        return;
      }

      var parsedMessage = JSON.parse(message);
      (0, _assert2['default'])(parsedMessage.protocol && parsedMessage.protocol === _config.SERVICE_FRAMEWORK3_CHANNEL);
      this._serverComponent.handleMessage(this, parsedMessage);
    }
  }, {
    key: 'sendSocketMessage',
    value: function sendSocketMessage(data) {
      var _this3 = this;

      if (this._isDisposed) {
        logger.error('Attempt to send socket message after connection closed', new Error());
        return;
      }

      // Wrap the data in an object, because if `data` is a primitive data type,
      // finding it in an array would return the first matching item, not necessarily
      // the same inserted item.
      var message = { data: data };
      this._messageQueue.push(message);
      var socket = this._socket;
      if (socket == null) {
        return;
      }
      socket.send(JSON.stringify(data), function (err) {
        if (err) {
          logger.warn('Failed sending socket message to client:', _this3.id, data);
        } else {
          var messageIndex = _this3._messageQueue.indexOf(message);
          if (messageIndex !== -1) {
            _this3._messageQueue.splice(messageIndex, 1);
          }
        }
      });
    }
  }, {
    key: 'getMarshallingContext',
    value: function getMarshallingContext() {
      return this._objectRegistry;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._isDisposed = true;
      this._close();
      this._objectRegistry.dispose();
    }
  }]);

  return SocketClient;
})();

exports.SocketClient = SocketClient;