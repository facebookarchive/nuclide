"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JavaDebuggerDevicePanelProvider = void 0;

function _nuclideDebuggerCommon() {
  const data = require("../../../modules/nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _debugger() {
  const data = require("../../../modules/nuclide-commons-atom/debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function _createAndroidDebugAttachConfig(targetUri, device, proc) {
  const config = {
    deviceAndProcess: {
      // See pkg/nuclide-device-panel-android/lib/Registration.js to see why
      // serial and identifier are interchangeable
      deviceSerial: device.identifier,
      selectedProcess: {
        user: proc.user,
        pid: String(proc.pid),
        name: proc.name
      }
    },
    adbServiceUri: targetUri
  };
  return {
    targetUri,
    debugMode: 'attach',
    adapterType: _nuclideDebuggerCommon().VsAdapterTypes.JAVA_ANDROID,
    config,
    processName: 'Process ' + proc.pid + ' (Android Java ' + device.displayName + ')'
  };
}

class JavaDebuggerDevicePanelProvider {
  constructor() {}

  getType() {
    return 'Android';
  }

  getTaskType() {
    return 'DEBUG';
  }

  getSupportedPIDs(host, device, procs) {
    return _rxjsCompatUmdMin.Observable.of(new Set(procs.filter(proc => proc.isJava).map(proc => proc.pid)));
  }

  getName() {
    return 'Attach Java debugger';
  }

  async run(host, device, proc) {
    const debuggerService = await (0, _debugger().getDebuggerService)();

    const config = _createAndroidDebugAttachConfig(host, device, proc);

    debuggerService.startVspDebugging(config);
  }

}

exports.JavaDebuggerDevicePanelProvider = JavaDebuggerDevicePanelProvider;