'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _ArcanistDiagnosticsProvider;

function _load_ArcanistDiagnosticsProvider() {
  return _ArcanistDiagnosticsProvider = require('./ArcanistDiagnosticsProvider');
}

var _ArcBuildSystem;

function _load_ArcBuildSystem() {
  return _ArcBuildSystem = _interopRequireDefault(require('./ArcBuildSystem'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Activation = class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable();
    this._busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
    (0, (_registerGrammar || _load_registerGrammar()).default)('source.json', '.arcconfig');
  }

  dispose() {
    this._disposables.dispose();
  }

  setCwdApi(cwdApi) {
    this._cwdApi = cwdApi;
    if (this._buildSystem != null) {
      this._buildSystem.setCwdApi(cwdApi);
    }
  }

  provideBusySignal() {
    return this._busySignalProvider;
  }

  provideDiagnostics() {
    const provider = new (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).ArcanistDiagnosticsProvider(this._busySignalProvider);
    this._disposables.add(provider);
    return provider;
  }

  consumeTaskRunnerServiceApi(api) {
    this._disposables.add(api.register(this._getBuildSystem()));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'Arc Build',
      messages: this._getBuildSystem().getOutputMessages()
    }));
  }

  consumeCwdApi(api) {
    this.setCwdApi(api);

    let pkg = this;
    this._disposables.add({
      dispose: function () {
        pkg = null;
      }
    });
    return new _atom.Disposable(() => {
      if (pkg != null) {
        pkg.setCwdApi(null);
      }
    });
  }

  _getBuildSystem() {
    if (this._buildSystem == null) {
      const buildSystem = new (_ArcBuildSystem || _load_ArcBuildSystem()).default();
      if (this._cwdApi != null) {
        buildSystem.setCwdApi(this._cwdApi);
      }
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }
};
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];