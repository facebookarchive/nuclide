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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _StreamTransport;

function _load_StreamTransport() {
  return _StreamTransport = require('./StreamTransport');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _commonsNodePromise;

function _load_commonsNodePromise() {
  return _commonsNodePromise = require('../../commons-node/promise');
}

var SocketTransport = (function (_StreamTransport2) {
  _inherits(SocketTransport, _StreamTransport2);

  function SocketTransport(socket) {
    var _this = this;

    var messageLogger = arguments.length <= 1 || arguments[1] === undefined ? function (direction, message) {
      return;
    } : arguments[1];

    _classCallCheck(this, SocketTransport);

    // $FlowIssue: Sockets are a stream$Duplex, but flow doesn't handle this.
    _get(Object.getPrototypeOf(SocketTransport.prototype), 'constructor', this).call(this, socket, socket, messageLogger);
    this._socket = socket;
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();

    socket.on('close', function () {
      if (!_this.isClosed()) {
        _this.close();
      }
      _this._emitter.emit('close');
    });

    var connectionDeferred = new (_commonsNodePromise || _load_commonsNodePromise()).Deferred();
    socket.on('connect', connectionDeferred.resolve);
    socket.on('error', function (error) {
      return connectionDeferred.reject(error);
    });
    this._onConnect = connectionDeferred;
  }

  // Returns a promise which resolves on connection or rejects if connection fails.

  _createClass(SocketTransport, [{
    key: 'onConnected',
    value: function onConnected() {
      return this._onConnect.promise;
    }
  }, {
    key: 'onClose',
    value: function onClose(callback) {
      return this._emitter.on('close', callback);
    }
  }, {
    key: 'close',
    value: function close() {
      _get(Object.getPrototypeOf(SocketTransport.prototype), 'close', this).call(this);

      // Send the FIN packet ...
      this._socket.end();
      // Then hammer it closed
      this._socket.destroy();

      this._emitter.dispose();
    }
  }]);

  return SocketTransport;
})((_StreamTransport || _load_StreamTransport()).StreamTransport);

exports.SocketTransport = SocketTransport;