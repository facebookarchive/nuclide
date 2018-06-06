'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _HhvmLaunchAttachProvider;

function _load_HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider = require('../../nuclide-debugger-vsp/lib/HhvmLaunchAttachProvider');
}

var _HhvmBuildSystem;

function _load_HhvmBuildSystem() {
  return _HhvmBuildSystem = _interopRequireDefault(require('./HhvmBuildSystem'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
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

  async _debugDeepWithHhvm(params) {
    const { nuclidePath, hackRoot, line, addBreakpoint, source } = params;

    if (typeof nuclidePath !== 'string' || !(_nuclideUri || _load_nuclideUri()).default.isRemote(nuclidePath) || typeof hackRoot !== 'string') {
      atom.notifications.addError('Invalid arguments.');
      return;
    }

    const pathString = decodeURIComponent(String(nuclidePath));
    const hackRootString = decodeURIComponent(String(hackRoot));

    const startDebugger = params.noDebugger == null || params.noDebugger !== 'true';

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-attach-hhvm-deeplink', {
      pathString,
      line,
      addBreakpoint,
      source
    });

    if (this._remoteProjectsService == null) {
      atom.notifications.addError('The remote project service is unavailable.');
      return;
    } else {
      const remoteProjectsService = this._remoteProjectsService;
      await new Promise(resolve => remoteProjectsService.waitForRemoteProjectReload(resolve));
    }

    const host = (_nuclideUri || _load_nuclideUri()).default.getHostname(pathString);

    // Allow only valid hostname characters, per RFC 952:
    // https://tools.ietf.org/html/rfc952
    const invalidMatch = host.match(/[^A-Za-z0-9\-._]+/);
    if (invalidMatch != null) {
      atom.notifications.addError('The specified host name contained invalid characters.');
      return;
    }

    const cwd = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(host, hackRootString);
    const notification = atom.notifications.addInfo(startDebugger ? `Connecting to ${host} and attaching debugger...` : `Connecting to ${host}...`, {
      dismissable: true
    });

    if (!(this._remoteProjectsService != null)) {
      throw new Error('Invariant violation: "this._remoteProjectsService != null"');
    }

    const remoteConnection = await this._remoteProjectsService.createRemoteConnection({
      host,
      path: (_nuclideUri || _load_nuclideUri()).default.getPath(cwd),
      displayTitle: host
    });

    if (remoteConnection == null) {
      atom.notifications.addError(`Could not connect to ${host}`);
      return;
    }

    // The hostname might have changed slightly from what was passed in due to
    // DNS lookup, so create a new remote URI rather than using cwd from above.
    const hackRootUri = remoteConnection.getConnection().getUriOfRemotePath(hackRootString);
    const navUri = remoteConnection.getConnection().getUriOfRemotePath((_nuclideUri || _load_nuclideUri()).default.getPath(pathString));

    // Set the current project root.
    if (this._cwdApi != null) {
      this._cwdApi.setCwd(hackRootUri);
    }

    // Open the script path in the editor.
    const lineNumber = parseInt(line, 10);
    if (Number.isNaN(lineNumber)) {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(navUri);
    } else {
      // NOTE: line numbers start at 0, so subtract 1.
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(navUri, { line: lineNumber - 1 });
    }

    if (startDebugger) {
      if (addBreakpoint === 'true' && !Number.isNaN(lineNumber)) {
        // Insert a breakpoint if requested.
        // NOTE: Nuclide protocol breakpoint line numbers start at 0, so subtract 1.
        // TODO debuggerService.addBreakpoint(navUri, lineNumber - 1);
      }

      await (0, (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).startAttachProcessInfo)(hackRootUri, null /* attachPort */
      , true /* serverAttach */
      );
    }

    notification.dismiss();
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