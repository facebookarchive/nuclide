'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class VspProcessInfo {

  constructor(targetUri, debugMode, adapterType, adapterExecutable, config, customCapabilities, customProperties, preprocessors) {
    this._targetUri = targetUri;
    this._debugMode = debugMode;
    this._adapterType = adapterType;
    this._adapterExecutable = adapterExecutable;
    this._config = config;
    this._customCapabilities = customCapabilities || {};
    this._customProperties = customProperties || {};
    this._preprocessors = preprocessors;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  getTargetUri() {
    return this._targetUri;
  }

  setVspDebuggerInstance(vspInstance) {
    this._vspInstance = vspInstance;
  }

  getDebuggerCapabilities() {
    const defaultCapabilities = {
      conditionalBreakpoints: false,
      continueToLocation: false,
      customSourcePaths: false,
      disassembly: false,
      readOnlyTarget: false,
      registers: false,
      setVariable: false,
      threads: false,
      completionsRequest: false
    };
    return Object.assign({}, defaultCapabilities, {
      conditionalBreakpoints: true,
      setVariable: true,
      completionsRequest: true
    }, this._customCapabilities);
  }

  getDebuggerProps() {
    const defaultProps = {
      customControlButtons: [],
      targetDescription: () => null,
      threadsComponentTitle: 'Threads'
    };
    return Object.assign({}, defaultProps, this._customProperties);
  }

  getVspAdapterPreprocessor() {
    return this._preprocessors == null ? null : this._preprocessors.vspAdapterPreprocessor;
  }

  getVspClientPreprocessor() {
    return this._preprocessors == null ? null : this._preprocessors.vspClientPreprocessor;
  }

  debug() {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('Old chrome-based debugger is no longer supported!');
    })();
  }

  customRequest(request, args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._vspInstance != null) {
        return _this._vspInstance.customRequest(request, args);
      } else {
        throw new Error('Cannot send custom requests to inactive debug sessions');
      }
    })();
  }

  observeCustomEvents() {
    if (this._vspInstance != null) {
      return this._vspInstance.observeCustomEvents();
    } else {
      return _rxjsBundlesRxMinJs.Observable.throw(new Error('Cannot send custom requests to inactive debug sessions'));
    }
  }

  addCustomDisposable(disposable) {
    this._disposables.add(disposable);
  }

  dispose() {
    this._disposables.dispose();
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
}
exports.default = VspProcessInfo; /**
                                   * Copyright (c) 2017-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the BSD-style license found in the
                                   * LICENSE file in the root directory of this source tree. An additional grant
                                   * of patent rights can be found in the PATENTS file in the same directory.
                                   *
                                   * 
                                   * @format
                                   */