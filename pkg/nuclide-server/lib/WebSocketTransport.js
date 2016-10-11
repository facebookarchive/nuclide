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

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _compression;

function _load_compression() {
  return _compression = require('./compression');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();
// Do not synchronously compress large payloads (risks blocking the event loop)
var MAX_SYNC_COMPRESS_LENGTH = 100000;

// An unreliable transport for sending JSON formatted messages
// over a WebSocket
//
// onClose handlers are guaranteed to be called exactly once.
// onMessage handlers are guaranteed to not be called after onClose has been called.
// send(data) yields false if the message failed to send, true on success.
// onClose handlers will be called before close() returns.

var WebSocketTransport = (function () {
  function WebSocketTransport(clientId, socket, options) {
    var _this = this;

    _classCallCheck(this, WebSocketTransport);

    this.id = clientId;
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();
    this._socket = socket;
    this._messages = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._syncCompression = options == null || options.syncCompression !== false;

    logger.info('Client #%s connecting with a new socket!', this.id);
    socket.on('message', function (data, flags) {
      var message = data;
      // Only compressed data will be sent as binary buffers.
      if (flags.binary) {
        message = (0, (_compression || _load_compression()).decompress)(data);
      }
      _this._onSocketMessage(message);
    });

    socket.on('close', function () {
      if (_this._socket != null) {
        (0, (_assert || _load_assert()).default)(_this._socket === socket);
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
        var data = message;
        var compressed = false;
        if (_this2._syncCompression && message.length < MAX_SYNC_COMPRESS_LENGTH) {
          data = (0, (_compression || _load_compression()).compress)(message);
          compressed = true;
        }
        socket.send(data, { compress: !compressed }, function (err) {
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

// The built-in WebSocket compression implementation can have poor performance characteristics:
// in particular, decompression takes a full event tick client-side.
// This option enables our own custom compression format that allows us to use custom
// decompression client-side.