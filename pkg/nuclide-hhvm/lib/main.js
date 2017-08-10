'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('../../nuclide-debugger-php/lib/AttachProcessInfo');
}

var _HhvmBuildSystem;

function _load_HhvmBuildSystem() {
  return _HhvmBuildSystem = _interopRequireDefault(require('./HhvmBuildSystem'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeTaskRunnerServiceApi(api) {
    this._disposables.add(api.register(this._getBuildSystem()));
  }

  consumeCwdApi(api) {
    this._cwdApi = api;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._cwdApi = null;
    });
  }

  consumeRemoteProjectsService(service) {
    this._remoteProjectsService = service;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._remoteProjectsService = null;
    });
  }

  consumeDeepLinkService(deepLink) {
    this._disposables.add(deepLink.subscribeToPath('attach-hhvm', params => {
      this._debugDeepWithHhvm(params);
    }));
  }

  _getBuildSystem() {
    if (this._buildSystem == null) {
      const buildSystem = new (_HhvmBuildSystem || _load_HhvmBuildSystem()).default();
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }

  _debugDeepWithHhvm(params) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { nuclidePath, hackRoot, line, addBreakpoint, source } = params;

      if (typeof nuclidePath !== 'string' || !(_nuclideUri || _load_nuclideUri()).default.isRemote(nuclidePath) || typeof hackRoot !== 'string') {
        atom.notifications.addError('Invalid arguments.');
        return;
      }

      const pathString = decodeURIComponent(String(nuclidePath));
      const hackRootString = decodeURIComponent(String(hackRoot));

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-attach-hhvm-deeplink', {
        pathString,
        line,
        addBreakpoint,
        source
      });

      if (_this._remoteProjectsService == null) {
        atom.notifications.addError('The remote project service is unavailable.');
        return;
      } else {
        const remoteProjectsService = _this._remoteProjectsService;
        yield new Promise(function (resolve) {
          return remoteProjectsService.waitForRemoteProjectReload(resolve);
        });
      }

      const host = (_nuclideUri || _load_nuclideUri()).default.getHostname(pathString);
      const cwd = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(host, hackRootString);
      const notification = atom.notifications.addInfo(`Connecting to ${host} and attaching debugger...`, {
        dismissable: true
      });

      if (!(_this._remoteProjectsService != null)) {
        throw new Error('Invariant violation: "this._remoteProjectsService != null"');
      }

      const remoteConnection = yield _this._remoteProjectsService.createRemoteConnection({
        host,
        cwd: (_nuclideUri || _load_nuclideUri()).default.getPath(cwd),
        displayTitle: host
      });

      if (remoteConnection == null) {
        atom.notifications.addError(`Could not connect to ${host}`);
        return;
      }

      // The hostname might have changed slightly from what was passed in due to
      // DNS lookup, so create a new remote URI rather than using cwd from above.
      const hackRootUri = remoteConnection.getUriOfRemotePath(hackRootString);
      const navUri = remoteConnection.getUriOfRemotePath((_nuclideUri || _load_nuclideUri()).default.getPath(pathString));

      // Set the current project root.
      if (_this._cwdApi != null) {
        _this._cwdApi.setCwd(hackRootUri);
      }

      // Open the script path in the editor.
      const lineNumber = parseInt(line, 10);
      if (Number.isNaN(lineNumber)) {
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(navUri);
      } else {
        // NOTE: line numbers start at 0, so subtract 1.
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(navUri, lineNumber - 1);
      }

      // Debug the remote HHVM server!
      const debuggerService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');

      if (addBreakpoint === 'true' && !Number.isNaN(lineNumber)) {
        // Insert a breakpoint if requested.
        // NOTE: Nuclide protocol breakpoint line numbers start at 0, so subtract 1.
        debuggerService.addBreakpoint(navUri, lineNumber - 1);
      }

      yield debuggerService.startDebugging(new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo(hackRootUri));
      notification.dismiss();
    })();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);