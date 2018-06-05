'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JavaDebuggerDevicePanelProvider = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _debugger;

function _load_debugger() {
  return _debugger = require('../../../modules/nuclide-commons-atom/debugger');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function _createAndroidDebugAttachConfig(targetUri, device, pid) {
  const config = {
    deviceAndProcess: {
      device,
      selectedProcess: {
        pid,
        name: ''
      }
    },
    adbServiceUri: targetUri
  };
  return {
    targetUri,
    debugMode: 'attach',
    adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.JAVA_ANDROID,
    adapterExecutable: null,
    config,
    capabilities: { threads: true },
    properties: {
      customControlButtons: [],
      threadsComponentTitle: 'Threads'
    },
    customDisposable: new (_UniversalDisposable || _load_UniversalDisposable()).default()
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

class JavaDebuggerDevicePanelProvider {
  constructor() {}

  getType() {
    return 'Android';
  }

  getTaskType() {
    return 'DEBUG';
  }

  getSupportedPIDs(host, device, procs) {
    return _rxjsBundlesRxMinJs.Observable.of(new Set(procs.filter(proc => proc.isJava).map(proc => proc.pid)));
  }

  getName() {
    return 'Attach Java debugger';
  }

  async run(host, device, proc) {
    const debuggerService = await (0, (_debugger || _load_debugger()).getDebuggerService)();
    const config = await _createAndroidDebugAttachConfig(host, device, proc.pid);
    debuggerService.startVspDebugging(config);
  }
}
exports.JavaDebuggerDevicePanelProvider = JavaDebuggerDevicePanelProvider;