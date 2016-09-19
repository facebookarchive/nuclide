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

var _ServerConnection2;

function _ServerConnection() {
  return _ServerConnection2 = require('./ServerConnection');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

// A cache of values by ServerConnection.
// Will lazily create the values when requested for each connection.
// Note that an entry is added for local with connection == null.

var ConnectionCache = (function () {

  // If lazy is true, then entries will only be created when get() is called.
  // Otherwise, entries will be created as soon as ServerConnection's are
  // established.

  function ConnectionCache(factory) {
    var _this = this;

    var lazy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, ConnectionCache);

    this._values = new Map();
    this._factory = factory;
    this._subscriptions = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default();
    this._subscriptions.add((_ServerConnection2 || _ServerConnection()).ServerConnection.onDidCloseServerConnection(_asyncToGenerator(function* (connection) {
      var value = _this._values.get(connection);
      if (value != null) {
        _this._values.delete(connection);
        (yield value).dispose();
      }
    })));

    if (!lazy) {
      this.get(null);
      this._subscriptions.add((_ServerConnection2 || _ServerConnection()).ServerConnection.observeConnections(function (connection) {
        _this.get(connection);
      }));
    }
  }

  _createClass(ConnectionCache, [{
    key: 'get',
    value: function get(connection) {
      var existingValue = this._values.get(connection);
      if (existingValue != null) {
        return existingValue;
      }

      var newValue = this._factory(connection);
      this._values.set(connection, newValue);
      return newValue;
    }
  }, {
    key: 'getForUri',
    value: function getForUri(filePath) {
      if (filePath == null) {
        return null;
      }

      var connection = (_ServerConnection2 || _ServerConnection()).ServerConnection.getForUri(filePath);
      // During startup & shutdown of connections we can have a remote uri
      // without the corresponding connection.
      if (connection == null && (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRemote(filePath)) {
        return null;
      }
      return this.get(connection);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      Array.from(this._values.values()).forEach(function (valuePromise) {
        return valuePromise.then(function (value) {
          return value.dispose();
        });
      });
      this._values.clear();
    }
  }]);

  return ConnectionCache;
})();

exports.ConnectionCache = ConnectionCache;