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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeCache;

function _load_commonsNodeCache() {
  return _commonsNodeCache = require('../../commons-node/cache');
}

// A cache of values by ServerConnection.
// Will lazily create the values when requested for each connection.
// Note that an entry is added for local with connection == null.

var ConnectionCache = (function (_Cache) {
  _inherits(ConnectionCache, _Cache);

  // If lazy is true, then entries will only be created when get() is called.
  // Otherwise, entries will be created as soon as ServerConnection's are
  // established.

  function ConnectionCache(factory) {
    var _this = this;

    var lazy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, ConnectionCache);

    _get(Object.getPrototypeOf(ConnectionCache.prototype), 'constructor', this).call(this, factory, function (valuePromise) {
      return valuePromise.then(function (value) {
        return value.dispose();
      });
    });
    this._subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._subscriptions.add((_ServerConnection || _load_ServerConnection()).ServerConnection.onDidCloseServerConnection(_asyncToGenerator(function* (connection) {
      var value = _this.get(connection);
      if (value != null) {
        _this.delete(connection);
        (yield value).dispose();
      }
    })));

    if (!lazy) {
      this.get(null);
      this._subscriptions.add((_ServerConnection || _load_ServerConnection()).ServerConnection.observeConnections(function (connection) {
        _this.get(connection);
      }));
    }
  }

  _createClass(ConnectionCache, [{
    key: 'getForUri',
    value: function getForUri(filePath) {
      if (filePath == null) {
        return null;
      }

      var connection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getForUri(filePath);
      // During startup & shutdown of connections we can have a remote uri
      // without the corresponding connection.
      if (connection == null && (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(filePath)) {
        return null;
      }
      return this.get(connection);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      _get(Object.getPrototypeOf(ConnectionCache.prototype), 'dispose', this).call(this);
      this._subscriptions.dispose();
    }
  }]);

  return ConnectionCache;
})((_commonsNodeCache || _load_commonsNodeCache()).Cache);

exports.ConnectionCache = ConnectionCache;