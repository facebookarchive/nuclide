var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DebuggerInstance = (function () {
  function DebuggerInstance(processInfo) {
    _classCallCheck(this, DebuggerInstance);

    this._processInfo = processInfo;
  }

  _createClass(DebuggerInstance, [{
    key: 'getDebuggerProcessInfo',
    value: function getDebuggerProcessInfo() {
      return this._processInfo;
    }
  }, {
    key: 'getProviderName',
    value: function getProviderName() {
      return this._processInfo.getServiceName();
    }
  }, {
    key: 'getTargetUri',
    value: function getTargetUri() {
      return this._processInfo.getTargetUri();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      throw new Error('abstract method');
    }
  }, {
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      throw new Error('abstract method');
    }
  }]);

  return DebuggerInstance;
})();

module.exports = DebuggerInstance;