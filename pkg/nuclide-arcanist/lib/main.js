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
  return _ArcanistDiagnosticsProvider = _interopRequireWildcard(require('./ArcanistDiagnosticsProvider'));
}

var _ArcBuildSystem;

function _load_ArcBuildSystem() {
  return _ArcBuildSystem = _interopRequireDefault(require('./ArcBuildSystem'));
}

var _openArcDeepLink;

function _load_openArcDeepLink() {
  return _openArcDeepLink = require('./openArcDeepLink');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
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

  provideLinter() {
    return {
      name: 'Arc',
      grammarScopes: ['*'],
      scope: 'file',
      lint: editor => {
        const path = editor.getPath();
        if (path == null) {
          return null;
        }
        return this._busySignalProvider.reportBusy(`Waiting for arc lint results for \`${editor.getTitle()}\``, () => (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).lint(editor), { onlyForFile: path });
      }
    };
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
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);