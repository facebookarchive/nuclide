"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRpcService = setRpcService;
exports.listenToRemoteDebugCommands = listenToRemoteDebugCommands;
exports.getRemoteDebuggerCommandServiceByNuclideUri = getRemoteDebuggerCommandServiceByNuclideUri;

function _debugger() {
  const data = require("../nuclide-commons-atom/debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _analytics() {
  const data = require("../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function RemoteDebuggerCommandServiceLocal() {
  const data = _interopRequireWildcard(require("./RemoteDebuggerCommandService"));

  RemoteDebuggerCommandServiceLocal = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
let _rpcService = null;

function getPythonAttachTargetProcessConfig(targetRootUri, target) {
  return {
    targetUri: targetRootUri,
    debugMode: 'attach',
    adapterType: _nuclideDebuggerCommon().VsAdapterTypes.PYTHON,
    config: getPythonAttachTargetConfig(target)
  };
}

function getPythonAttachTargetConfig(target) {
  return {
    localRoot: target.localRoot,
    remoteRoot: target.remoteRoot,
    port: target.port,
    host: '127.0.0.1'
  };
}

function setRpcService(rpcService) {
  _rpcService = rpcService;
  return new (_UniversalDisposable().default)(() => {
    _rpcService = null;
  });
}

function listenToRemoteDebugCommands() {
  const addedHostnames = (0, _projects().observeAddedHostnames)().startWith('local');
  const remoteDebuggerServices = addedHostnames.flatMap(hostname => {
    const rootUri = hostname === 'local' ? '' : _nuclideUri().default.createRemoteUri(hostname, '/');
    const service = getRemoteDebuggerCommandServiceByNuclideUri(rootUri);

    if (service == null) {
      (0, _log4js().getLogger)().error('null remote command service for uri:', rootUri);
      return _RxMin.Observable.empty();
    } else {
      return _RxMin.Observable.of({
        service,
        rootUri
      });
    }
  });
  return new (_UniversalDisposable().default)(remoteDebuggerServices.flatMap(({
    service,
    rootUri
  }) => {
    return service.observeAttachDebugTargets().refCount().map(targets => findDuplicateAttachTargetIds(targets));
  }).subscribe(duplicateTargetIds => notifyDuplicateDebugTargets(duplicateTargetIds)), remoteDebuggerServices.flatMap(({
    service,
    rootUri
  }) => {
    return service.observeRemoteDebugCommands().refCount().catch(error => {
      // eslint-disable-next-line no-console
      console.warn('Failed to listen to remote debug commands - ' + 'You could be running locally with two Atom windows. ' + `IsLocal: ${String(rootUri === '')}`);
      return _RxMin.Observable.empty();
    }).map(command => ({
      rootUri,
      command
    }));
  }).let((0, _observable().fastDebounce)(500)).subscribe(async ({
    rootUri,
    command
  }) => {
    const attachProcessConfig = getPythonAttachTargetProcessConfig(rootUri, command.target);
    const debuggerService = await (0, _debugger().getDebuggerService)();
    (0, _analytics().track)('fb-python-debugger-auto-attach');
    debuggerService.startVspDebugging(attachProcessConfig); // Otherwise, we're already debugging that target.
  }));
}

let shouldNotifyDuplicateTargets = true;
let duplicateTargetsNotification;

function notifyDuplicateDebugTargets(duplicateTargetIds) {
  if (duplicateTargetIds.size > 0 && shouldNotifyDuplicateTargets && duplicateTargetsNotification == null) {
    const formattedIds = Array.from(duplicateTargetIds).join(', ');
    duplicateTargetsNotification = atom.notifications.addInfo(`Debugger: duplicate attach targets: \`${formattedIds}\``, {
      buttons: [{
        onDidClick: () => {
          shouldNotifyDuplicateTargets = false;

          if (duplicateTargetsNotification != null) {
            duplicateTargetsNotification.dismiss();
          }
        },
        text: 'Ignore'
      }],
      description: `Nuclide debugger detected duplicate attach targets with ids (${formattedIds}) ` + 'That could be instagram running multiple processes - check out https://our.intern.facebook.com/intern/dex/instagram-server/debugging-with-nuclide/',
      dismissable: true
    });
    duplicateTargetsNotification.onDidDismiss(() => {
      duplicateTargetsNotification = null;
    });
  }
}

function findDuplicateAttachTargetIds(targets) {
  const targetIds = new Set();
  const duplicateTargetIds = new Set();
  targets.forEach(target => {
    const {
      id
    } = target;

    if (id == null) {
      return;
    }

    if (targetIds.has(id)) {
      duplicateTargetIds.add(id);
    } else {
      targetIds.add(id);
    }
  });
  return duplicateTargetIds;
}

function getRemoteDebuggerCommandServiceByNuclideUri(uri) {
  if (_rpcService == null && !_nuclideUri().default.isRemote(uri)) {
    return RemoteDebuggerCommandServiceLocal();
  }

  return (0, _nullthrows().default)(_rpcService).getServiceByNuclideUri('RemoteDebuggerCommandService', uri);
}