"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _HhvmLaunchAttachProvider() {
  const data = require("../../nuclide-debugger-vsp/lib/HhvmLaunchAttachProvider");

  _HhvmLaunchAttachProvider = function () {
    return data;
  };

  return data;
}

function _HhvmBuildSystem() {
  const data = _interopRequireDefault(require("./HhvmBuildSystem"));

  _HhvmBuildSystem = function () {
    return data;
  };

  return data;
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
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeTaskRunnerServiceApi(api) {
    this._disposables.add(api.register(this._getBuildSystem()));
  }

  consumeCwdApi(api) {
    this._cwdApi = api;
    return new (_UniversalDisposable().default)(() => {
      this._cwdApi = null;
    });
  }

  consumeRemoteProjectsService(service) {
    this._remoteProjectsService = service;
    return new (_UniversalDisposable().default)(() => {
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
      const buildSystem = new (_HhvmBuildSystem().default)();

      this._disposables.add(buildSystem);

      this._buildSystem = buildSystem;
    }

    return this._buildSystem;
  }

  async _debugDeepWithHhvm(params) {
    const {
      nuclidePath,
      hackRoot,
      line,
      addBreakpoint,
      source
    } = params;

    if (typeof nuclidePath !== 'string' || !_nuclideUri().default.isRemote(nuclidePath) || typeof hackRoot !== 'string') {
      atom.notifications.addError('Invalid arguments.');
      return;
    }

    const pathString = decodeURIComponent(String(nuclidePath));
    const hackRootString = decodeURIComponent(String(hackRoot));
    const startDebugger = params.noDebugger == null || params.noDebugger !== 'true';
    (0, _nuclideAnalytics().track)('nuclide-attach-hhvm-deeplink', {
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

    const host = _nuclideUri().default.getHostname(pathString); // Allow only valid hostname characters, per RFC 952:
    // https://tools.ietf.org/html/rfc952


    const invalidMatch = host.match(/[^A-Za-z0-9\-._]+/);

    if (invalidMatch != null) {
      atom.notifications.addError('The specified host name contained invalid characters.');
      return;
    }

    const cwd = _nuclideUri().default.createRemoteUri(host, hackRootString);

    const notification = atom.notifications.addInfo(startDebugger ? `Connecting to ${host} and attaching debugger...` : `Connecting to ${host}...`, {
      dismissable: true
    });

    if (!(this._remoteProjectsService != null)) {
      throw new Error("Invariant violation: \"this._remoteProjectsService != null\"");
    }

    const remoteConnection = await this._remoteProjectsService.createRemoteConnection({
      host,
      path: _nuclideUri().default.getPath(cwd),
      displayTitle: host
    });

    if (remoteConnection == null) {
      atom.notifications.addError(`Could not connect to ${host}`);
      return;
    } // The hostname might have changed slightly from what was passed in due to
    // DNS lookup, so create a new remote URI rather than using cwd from above.


    const hackRootUri = remoteConnection.getConnection().getUriOfRemotePath(hackRootString);
    const navUri = remoteConnection.getConnection().getUriOfRemotePath(_nuclideUri().default.getPath(pathString)); // Set the current project root.

    if (this._cwdApi != null) {
      this._cwdApi.setCwd(hackRootUri);
    } // Open the script path in the editor.


    const lineNumber = parseInt(line, 10);

    if (Number.isNaN(lineNumber)) {
      (0, _goToLocation().goToLocation)(navUri);
    } else if (addBreakpoint !== 'true') {
      // If addBreakpoint === 'true', we will run the goToLocation later.
      // NOTE: line numbers start at 0, so subtract 1.
      (0, _goToLocation().goToLocation)(navUri, {
        line: lineNumber - 1
      });
    }

    if (startDebugger) {
      if (addBreakpoint === 'true' && !Number.isNaN(lineNumber)) {
        // Insert a breakpoint if requested.
        // NOTE: line numbers start at 0, so subtract 1.
        await (0, _goToLocation().goToLocation)(navUri, {
          line: lineNumber - 1
        });
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:add-breakpoint');
      }

      await (0, _HhvmLaunchAttachProvider().startAttachProcessConfig)(hackRootUri, null
      /* attachPort */
      , true
      /* serverAttach */
      );
    }

    notification.dismiss();
  }

}

(0, _createPackage().default)(module.exports, Activation);