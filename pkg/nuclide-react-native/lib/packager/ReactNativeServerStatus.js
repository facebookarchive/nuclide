Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var ReactNativeServerStatus = (function () {
  function ReactNativeServerStatus() {
    _classCallCheck(this, ReactNativeServerStatus);

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._isRunning = false;
  }

  _createClass(ReactNativeServerStatus, [{
    key: 'subscribe',
    value: function subscribe(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'isServerRunning',
    value: function isServerRunning() {
      return this._isRunning;
    }
  }, {
    key: 'setServerRunning',
    value: function setServerRunning(isRunning) {
      if (this._isRunning !== isRunning) {
        this._isRunning = isRunning;
        this._emitter.emit('change');
      }
    }
  }]);

  return ReactNativeServerStatus;
})();

exports.default = ReactNativeServerStatus;
module.exports = exports.default;