'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getPythonAttachTargetProcessInfo = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (targetRootUri, target) {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetRootUri, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON, null, getPythonAttachTargetConfig(target), { threads: true });
  });

  return function getPythonAttachTargetProcessInfo(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.setRpcService = setRpcService;
exports.listenToRemoteDebugCommands = listenToRemoteDebugCommands;
exports.getRemoteDebuggerCommandServiceByNuclideUri = getRemoteDebuggerCommandServiceByNuclideUri;

var _debugger;

function _load_debugger() {
  return _debugger = require('nuclide-commons-atom/debugger');
}

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _analytics;

function _load_analytics() {
  return _analytics = require('nuclide-commons/analytics');
}

var _RemoteDebuggerCommandService;

function _load_RemoteDebuggerCommandService() {
  return _RemoteDebuggerCommandService = _interopRequireWildcard(require('./RemoteDebuggerCommandService'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _rpcService = null;
  });
}

function listenToRemoteDebugCommands() {
  const addedHostnames = (0, (_projects || _load_projects()).observeAddedHostnames)().startWith('local');

  const remoteDebuggerServices = addedHostnames.map(hostname => {
    const rootUri = hostname === 'local' ? '' : (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, '/');
    const service = getRemoteDebuggerCommandServiceByNuclideUri(rootUri);
    return { service, rootUri };
  });

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(remoteDebuggerServices.flatMap(({ service, rootUri }) => {
    return service.observeAttachDebugTargets().refCount().map(targets => findDuplicateAttachTargetIds(targets));
  }).subscribe(duplicateTargetIds => notifyDuplicateDebugTargets(duplicateTargetIds)), remoteDebuggerServices.flatMap(({ service, rootUri }) => {
    return service.observeRemoteDebugCommands().refCount().catch(error => {
      // eslint-disable-next-line no-console
      console.warn('Failed to listen to remote debug commands - ' + 'You could be running locally with two Atom windows. ' + `IsLocal: ${String(rootUri === '')}`);
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).map(command => ({ rootUri, command }));
  }).let((0, (_observable || _load_observable()).fastDebounce)(500)).subscribe((() => {
    var _ref2 = (0, _asyncToGenerator.default)(function* ({ rootUri, command }) {
      const attachProcessInfo = yield getPythonAttachTargetProcessInfo(rootUri, command.target);
      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      (0, (_analytics || _load_analytics()).track)('fb-python-debugger-auto-attach');
      debuggerService.startDebugging(attachProcessInfo);
      // Otherwise, we're already debugging that target.
    });

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  })()));
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
    const { id } = target;
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
  if (_rpcService != null) {
    return _rpcService.getServiceByNuclideUri('RemoteDebuggerCommandService', uri);
  } else {
    return _RemoteDebuggerCommandService || _load_RemoteDebuggerCommandService();
  }
}