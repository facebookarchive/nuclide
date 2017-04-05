'use strict';

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
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

var _openArcDeepLink;

function _load_openArcDeepLink() {
  return _openArcDeepLink = require('./openArcDeepLink');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable();
    this._busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
  }

  dispose() {
    this._disposables.dispose();
  }

  provideBusySignal() {
    return this._busySignalProvider;
  }

  provideDiagnostics() {
    const provider = new (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).ArcanistDiagnosticsProvider(this._busySignalProvider);
    this._disposables.add(provider);
    return provider;
  }

  consumeCwdApi(api) {
    this._cwdApi = api;
    return new _atom.Disposable(() => {
      this._cwdApi = null;
    });
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

  /**
   * Files can be opened relative to Arcanist directories via
   *   atom://nuclide/open-arc?project=<project_id>&path=<relative_path>
   * `line` and `column` can also be optionally provided as 1-based integers.
   */
  consumeDeepLinkService(deepLink) {
    this._disposables.add(deepLink.subscribeToPath('open-arc', params => {
      const maybeCwd = this._cwdApi ? this._cwdApi.getCwd() : null;
      const maybeCwdPath = maybeCwd ? maybeCwd.getPath() : null;
      (0, (_openArcDeepLink || _load_openArcDeepLink()).openArcDeepLink)(params, this._remoteProjectsService, deepLink, maybeCwdPath);
    }));
  }

  consumeRemoteProjectsService(service) {
    this._remoteProjectsService = service;
    return new _atom.Disposable(() => {
      this._remoteProjectsService = null;
    });
  }

  _getBuildSystem() {
    if (this._buildSystem == null) {
      const buildSystem = new (_ArcBuildSystem || _load_ArcBuildSystem()).default();
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);