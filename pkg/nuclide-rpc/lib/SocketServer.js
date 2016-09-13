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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _net2;

function _net() {
  return _net2 = _interopRequireDefault(require('net'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _RpcConnection2;

function _RpcConnection() {
  return _RpcConnection2 = require('./RpcConnection');
}

var _SocketTransport2;

function _SocketTransport() {
  return _SocketTransport2 = require('./SocketTransport');
}

var _ServiceRegistry2;

function _ServiceRegistry() {
  return _ServiceRegistry2 = require('./ServiceRegistry');
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

// An RPC server which listens for connections on a localhost socket.
// TODO: Consider extending with more socket listening options.

var SocketServer = (function () {
  function SocketServer(serviceRegistry) {
    var _this = this;

    _classCallCheck(this, SocketServer);

    this._emitter = new (_eventKit2 || _eventKit()).Emitter();
    this._connections = new Set();
    this._serviceRegistry = serviceRegistry;
    this._listening = new (_commonsNodePromise2 || _commonsNodePromise()).Deferred();
    this._server = (_net2 || _net()).default.createServer();
    this._server.on('connection', function (socket) {
      _this._onConnection(socket);
    });
    this._server.on('error', function (error) {
      _this._onError(error);
    });
    this._server.listen(0, 'localhost', undefined, function () {
      _this._listening.resolve();
    });
  }

  _createClass(SocketServer, [{
    key: '_onConnection',
    value: function _onConnection(socket) {
      var _this2 = this;

      var transport = new (_SocketTransport2 || _SocketTransport()).SocketTransport(socket);
      var connection = (_RpcConnection2 || _RpcConnection()).RpcConnection.createServer(this._serviceRegistry, transport);
      transport.onClose(function () {
        _this2._connections.delete(connection);
      });
      this._connections.add(connection);
    }
  }, {
    key: '_onError',
    value: function _onError(error) {
      this._emitter.emit('error', error);
    }
  }, {
    key: 'onError',
    value: function onError(callback) {
      return this._emitter.on('error', callback);
    }
  }, {
    key: 'untilListening',
    value: function untilListening() {
      return this._listening.promise;
    }
  }, {
    key: 'getAddress',
    value: _asyncToGenerator(function* () {
      yield this.untilListening();
      return this._server.address();
    })

    // Close all open connections and shutdown the server.
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var connection of this._connections) {
        connection.getTransport().close();
      }
      this._connections.clear();
      this._listening.reject(new Error('Closing SocketServer'));
      this._server.close();
      this._emitter.dispose();
    }
  }]);

  return SocketServer;
})();

exports.SocketServer = SocketServer;