'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VsRawAdapterSpawnerService = exports.VSCodeDebuggerAdapterService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line rulesdir/no-unresolved
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
        _this2.getLogger().error(`No active session / translator: ${message}`);
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

  custom(request, args) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this3._translator == null) {
        throw new Error(`No active session / translator: ${request}`);
      } else {
        return _this3._translator.getSession().custom(request, args);
      }
    })();
  }

  observeCustomEvents() {
    if (this._translator == null) {
      return _rxjsBundlesRxMinJs.Observable.throw(new Error('No active session / translator')).publish();
    } else {
      return this._translator.getSession().observeCustomEvents().publish();
    }
  }

  dispose() {
    return super.dispose();
  }
}

exports.VSCodeDebuggerAdapterService = VSCodeDebuggerAdapterService;
class VsRawAdapterSpawnerService extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterSpawner {
  spawnAdapter(adapter) {
    return super.spawnAdapter(adapter);
  }

  write(input) {
    return super.write(input);
  }

  dispose() {
    return super.dispose();
  }
}
exports.VsRawAdapterSpawnerService = VsRawAdapterSpawnerService;