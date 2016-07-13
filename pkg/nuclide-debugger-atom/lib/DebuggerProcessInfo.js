var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DebuggerProcessInfo = (function () {
  function DebuggerProcessInfo(serviceName, targetUri) {
    _classCallCheck(this, DebuggerProcessInfo);

    this._serviceName = serviceName;
    this._targetUri = targetUri;
  }

  _createClass(DebuggerProcessInfo, [{
    key: 'toString',
    value: function toString() {
      return this._serviceName + ' : ' + this.displayString();
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      throw new Error('abstract method');
    }
  }, {
    key: 'getServiceName',
    value: function getServiceName() {
      return this._serviceName;
    }
  }, {
    key: 'getTargetUri',
    value: function getTargetUri() {
      return this._targetUri;
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      throw new Error('abstract method');
    }

    // Whether or not this ProcessInfo supports threading or not.
    // TODO: move this into chrome protocol after we move threads window
    // to Nuclide UI.
  }, {
    key: 'supportThreads',
    value: function supportThreads() {
      return false;
    }
  }, {
    key: 'debug',
    value: _asyncToGenerator(function* () {
      throw new Error('abstract method');
    })

    // For debugLLDB().
  }]);

  return DebuggerProcessInfo;
})();

module.exports = DebuggerProcessInfo;