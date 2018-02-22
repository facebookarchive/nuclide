'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('../../nuclide-debugger/lib/AtomServiceContainer');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const VSP_DEBUGGER_SERVICE_NAME = 'vscode-adapter';
// eslint-disable-next-line rulesdir/no-cross-atom-imports
class VspProcessInfo extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerProcessInfo {

  constructor(targetUri, debugMode, adapterType, adapterExecutable, showThreads, config, preprocessors) {
    super(VSP_DEBUGGER_SERVICE_NAME, targetUri);
    this._debugMode = debugMode;
    this._adapterType = adapterType;
    this._adapterExecutable = adapterExecutable;
    this._showThreads = showThreads;
    this._config = config;
    this._rpcService = null;
    this._preprocessors = preprocessors;
    this._customDisposable = null;
  }

  clone() {
    return new VspProcessInfo(this._targetUri, this._debugMode, this._adapterType, Object.assign({}, this._adapterExecutable), this._showThreads, Object.assign({}, this._config));
  }

  setVspDebuggerInstance(vspInstance) {
    this._vspInstance = vspInstance;
  }

  getDebuggerCapabilities() {
    return Object.assign({}, super.getDebuggerCapabilities(), {
      conditionalBreakpoints: true,
      threads: this._showThreads,
      setVariable: true,
      completionsRequest: true
    });
  }

  getDebuggerProps() {
    return Object.assign({}, super.getDebuggerProps());
  }

  getVspAdapterPreprocessor() {
    return this._preprocessors == null ? null : this._preprocessors.vspAdapterPreprocessor;
  }

  getVspClientPreprocessor() {
    return this._preprocessors == null ? null : this._preprocessors.vspClientPreprocessor;
  }

  debug() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = _this._getRpcService();
      _this._rpcService = rpcService;
      const outputDisposable = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).registerConsoleLogging)(_this._adapterType, rpcService.getOutputWindowObservable().refCount());
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-vscode-debugger-launch', {
        type: _this._adapterType,
        mode: _this._debugMode
      });

      if (!outputDisposable) {
        throw new Error('Debugger output service not available');
      }

      try {
        yield rpcService.debug(_this._adapterExecutable, _this._debugMode, _this._config);
        return new ChromeDebuggerInstance(_this, rpcService, new (_UniversalDisposable || _load_UniversalDisposable()).default(outputDisposable, function () {
          _this._rpcService = null;
        }), _this._preprocessors);
      } catch (error) {
        outputDisposable.dispose();
        throw error;
      }
    })();
  }

  customRequest(request, args) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this2._rpcService != null) {
        return _this2._rpcService.custom(request, args);
      } else if (_this2._vspInstance != null) {
        return _this2._vspInstance.customRequest(request, args);
      } else {
        throw new Error('Cannot send custom requests to inactive debug sessions');
      }
    })();
  }

  observeCustomEvents() {
    if (this._rpcService != null) {
      return this._rpcService.observeCustomEvents().refCount();
    } else if (this._vspInstance != null) {
      return this._vspInstance.observeCustomEvents();
    } else {
      return _rxjsBundlesRxMinJs.Observable.throw(new Error('Cannot send custom requests to inactive debug sessions'));
    }
  }

  setCustomDisposable(disposable) {
    this._customDisposable = disposable;
  }

  dispose() {
    if (this._rpcService != null) {
      this._rpcService.dispose();
      this._rpcService = null;
    }
    if (this._customDisposable != null) {
      this._customDisposable.dispose();
      this._customDisposable = null;
    }
    this._vspInstance = null;
  }

  getAdapterType() {
    return this._adapterType;
  }

  getDebugMode() {
    return this._debugMode;
  }

  getConfig() {
    return this._config;
  }

  _getRpcService() {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeDebuggerAdapterServiceByNuclideUri)(this.getTargetUri());
    return new service.VSCodeDebuggerAdapterService(this._adapterType);
  }
}

exports.default = VspProcessInfo;
class ChromeDebuggerInstance extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerInstance {

  constructor(processInfo, rpcService, disposables, processors) {
    super(processInfo, rpcService, disposables);
    this._processors = processors;
  }

  // Preprocessing hook for messages sent from the device to Nuclide. This includes messages
  // that are device events or responses to requests.
  preProcessServerMessage(message) {
    if (this._processors == null) {
      return message;
    }
    return this._processors.chromeAdapterPreprocessor(message);
  }

  // This is a hook for messages sent from Nuclide to the device.
  preProcessClientMessage(message) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this3._processors == null) {
        return message;
      }
      return _this3._processors.chromeClientPreprocessor(message);
    })();
  }
}