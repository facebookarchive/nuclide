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

var DebuggerSettings = (function () {
  function DebuggerSettings() {
    _classCallCheck(this, DebuggerSettings);

    this._settings = {
      SupportThreadsWindow: false
    };
  }

  _createClass(DebuggerSettings, [{
    key: 'set',
    value: function set(key, value) {
      this._settings[key] = value;
    }
  }, {
    key: 'get',
    value: function get(key) {
      return this._settings[key];
    }
  }, {
    key: 'getSerializedData',
    value: function getSerializedData() {
      return JSON.stringify(this._settings);
    }
  }]);

  return DebuggerSettings;
})();

exports.DebuggerSettings = DebuggerSettings;