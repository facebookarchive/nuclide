Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _DebuggerConnection;

function _load_DebuggerConnection() {
  return _DebuggerConnection = require('./DebuggerConnection');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _connectToIwdp;

function _load_connectToIwdp() {
  return _connectToIwdp = require('./connectToIwdp');
}

var log = (_logger || _load_logger()).logger.log;

var lastServiceObjectDispose = null;

var _nuclideDebuggerCommonLibMain;

function _load_nuclideDebuggerCommonLibMain() {
  return _nuclideDebuggerCommonLibMain = require('../../nuclide-debugger-common/lib/main');
}

var IwdpDebuggerService = (function () {
  function IwdpDebuggerService() {
    _classCallCheck(this, IwdpDebuggerService);

    if (lastServiceObjectDispose != null) {
      lastServiceObjectDispose();
    }
    lastServiceObjectDispose = this.dispose.bind(this);
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._clientCallback = new (_nuclideDebuggerCommonLibMain || _load_nuclideDebuggerCommonLibMain()).ClientCallback();
    this._disposables.add(this._clientCallback);
  }

  _createClass(IwdpDebuggerService, [{
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._clientCallback.getServerMessageObservable().publish();
    }
  }, {
    key: 'attach',
    value: function attach() {
      var _this = this;

      return new Promise(function (resolve) {
        _this._disposables.add((0, (_connectToIwdp || _load_connectToIwdp()).connectToIwdp)().subscribe(function (deviceInfos) {
          log('Got device infos: ' + JSON.stringify(deviceInfos));
          (0, (_assert || _load_assert()).default)(deviceInfos.length > 0, 'DeviceInfo array is empty.');
          _this._debuggerConnection = new (_DebuggerConnection || _load_DebuggerConnection()).DebuggerConnection(deviceInfos[0], function (message) {
            return _this._clientCallback.sendChromeMessage(message);
          });
          // Block resolution of this promise until we have successfully connected to the proxy.
          resolve('IWDP connected');
        }));
      });
    }
  }, {
    key: 'sendCommand',
    value: function sendCommand(message) {
      if (this._debuggerConnection != null) {
        this._debuggerConnection.sendCommand(message);
      }
      return Promise.resolve();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      return Promise.resolve();
    }
  }]);

  return IwdpDebuggerService;
})();

exports.IwdpDebuggerService = IwdpDebuggerService;