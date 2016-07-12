Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _FlowConstants2;

function _FlowConstants() {
  return _FlowConstants2 = require('./FlowConstants');
}

/*
 * Queries Flow for its version and caches the results. The version is a best guess: it is not 100%
 * guaranteed to be reliable due to caching, but will nearly always be correct.
 */

var FlowVersion = (function () {
  function FlowVersion(versionFn) {
    _classCallCheck(this, FlowVersion);

    this._versionFn = versionFn;
    this._lastVersion = null;
  }

  _createClass(FlowVersion, [{
    key: 'invalidateVersion',
    value: function invalidateVersion() {
      this._lastVersion = null;
    }
  }, {
    key: 'getVersion',
    value: _asyncToGenerator(function* () {
      var lastVersion = this._lastVersion;
      if (lastVersion == null) {
        return yield this._queryAndSetVersion();
      }
      var msSinceReceived = Date.now() - lastVersion.receivedTime;
      if (msSinceReceived >= (_FlowConstants2 || _FlowConstants()).VERSION_TIMEOUT_MS) {
        return yield this._queryAndSetVersion();
      }
      return lastVersion.version;
    })
  }, {
    key: '_queryAndSetVersion',
    value: _asyncToGenerator(function* () {
      var version = yield this._versionFn();
      this._lastVersion = {
        version: version,
        receivedTime: Date.now()
      };
      return version;
    })
  }]);

  return FlowVersion;
})();

exports.FlowVersion = FlowVersion;