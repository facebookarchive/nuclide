'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VSCodeDebuggerAdapterService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class VSCodeDebuggerAdapterService extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerRpcServiceBase {

  constructor(adapterType) {
    super(adapterType);
    this._adapterType = adapterType;
  }

  debug(adapter, debugMode, args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const translator = _this._translator = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsDebugSessionTranslator(_this._adapterType, adapter, debugMode, args, _this.getClientCallback(), _this.getLogger());
      _this.getSubscriptions().add(translator, translator.observeSessionEnd().subscribe(_this.dispose.bind(_this)), function () {
        return _this._translator = null;
      });
      // Start the session, but don't wait for its initialization sequence.
      yield translator.initilize();
      return `${_this._adapterType} debugger launched`;
    })();
  }

  sendCommand(message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this2._translator == null) {
        _this2.getLogger().info(`No active session / translator: ${message}`);
      } else {
        _this2._translator.processCommand(JSON.parse(message));
      }
    })();
  }

  // Explicit override of service APIs for framrwork parser.

  getOutputWindowObservable() {
    return super.getOutputWindowObservable();
  }

  getAtomNotificationObservable() {
    return super.getAtomNotificationObservable();
  }

  getServerMessageObservable() {
    return super.getServerMessageObservable();
  }

  dispose() {
    return super.dispose();
  }
}
exports.VSCodeDebuggerAdapterService = VSCodeDebuggerAdapterService;

// eslint-disable-next-line rulesdir/no-unresolved