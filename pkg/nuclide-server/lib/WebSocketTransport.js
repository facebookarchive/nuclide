Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

// An unreliable transport for sending JSON formatted messages
// over a WebSocket
//
// onClose handlers are guaranteed to be called exactly once.
// onMessage handlers are guaranteed to not be called after onClose has been called.
// send(data) yields false if the message failed to send, true on success.
// onClose handlers will be called before close() returns.

var WebSocketTransport = (function () {
  function WebSocketTransport(clientId, socket) {
    var _this = this;

    _classCallCheck(this, WebSocketTransport);

    this.id = clientId;
    this._emitter = new (_eventKit2 || _eventKit()).Emitter();
    this._socket = socket;
    this._messages = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();

    logger.info('Client #%s connecting with a new socket!', this.id);
    socket.on('message', function (message) {
      return _this._onSocketMessage(message);
    });

    socket.on('close', function () {
      if (_this._socket != null) {
        (0, (_assert2 || _assert()).default)(_this._socket === socket);
        logger.info('Client #%s socket close recieved on open socket!', _this.id);
        _this._setClosed();
      } else {
        logger.info('Client #%s recieved socket close on already closed socket!', _this.id);
      }
    });

    socket.on('error', function (e) {
      if (_this._socket != null) {
        logger.error('Client #' + _this.id + ' error: ' + e.message);
        _this._emitter.emit('error', e);
      } else {
        logger.error('Client #' + _this.id + ' error after close: ' + e.message);
      }
    });

    socket.on('pong', function (data, flags) {
      if (_this._socket != null) {
        // data may be a Uint8Array
        _this._emitter.emit('pong', data != null ? String(data) : data);
      } else {
        logger.error('Received socket pong after connection closed');
      }
    });
  }

  _createClass(WebSocketTransport, [{
    key: '_onSocketMessage',
    value: function _onSocketMessage(message) {
      if (this._socket == null) {
        logger.error('Received socket message after connection closed', new Error());
        return;
      }
      this._messages.next(message);
    }
  }, {
    key: 'onMessage',
    value: function onMessage() {
      return this._messages;
    }
  }, {
    key: 'onClose',
    value: function onClose(callback) {
      return this._emitter.on('close', callback);
    }
  }, {
    key: 'onError',
    value: function onError(callback) {
      return this._emitter.on('error', callback);
    }
  }, {
    key: 'send',
    value: function send(message) {
      var _this2 = this;

      var socket = this._socket;
      if (socket == null) {
        logger.error('Attempt to send socket message after connection closed', new Error());
        return Promise.resolve(false);
      }

      return new Promise(function (resolve, reject) {
        socket.send(message, function (err) {
          if (err != null) {
            logger.warn('Failed sending socket message to client:', _this2.id, JSON.parse(message));
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    }

    // The WS socket automatically responds to pings with pongs.
  }, {
    key: 'ping',
    value: function ping(data) {
      if (this._socket != null) {
        this._socket.ping(data);
      } else {
        logger.error('Attempted to send socket ping after connection closed');
      }
    }
  }, {
    key: 'onPong',
    value: function onPong(callback) {
      return this._emitter.on('pong', callback);
    }
  }, {
    key: 'close',
    value: function close() {
      if (this._socket != null) {
        // The call to socket.close may or may not cause our handler to be called
        this._socket.close();
        this._setClosed();
      }
    }
  }, {
    key: 'isClosed',
    value: function isClosed() {
      return this._socket == null;
    }
  }, {
    key: '_setClosed',
    value: function _setClosed() {
      if (this._socket != null) {
        // In certain (Error) conditions socket.close may not emit the on close
        // event synchronously.
        this._socket = null;
        this._emitter.emit('close');
      }
    }
  }]);

  return WebSocketTransport;
})();

exports.WebSocketTransport = WebSocketTransport;