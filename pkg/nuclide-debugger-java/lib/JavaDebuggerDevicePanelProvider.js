'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JavaDebuggerDevicePanelProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _debugger;

function _load_debugger() {
  return _debugger = require('../../../modules/nuclide-commons-atom/debugger');
}

class JavaDebuggerDevicePanelProvider {

  constructor(javaDebugger) {
    this._javaDebugger = javaDebugger;
  }

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
    const config = await this._javaDebugger.createAndroidDebugAttachConfig({
      targetUri: host,
      packageName: '',
      device,
      pid: proc.pid
    });
    debuggerService.startVspDebugging(config);
  }
}
exports.JavaDebuggerDevicePanelProvider = JavaDebuggerDevicePanelProvider; /**
                                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                                            * All rights reserved.
                                                                            *
                                                                            * This source code is licensed under the license found in the LICENSE file in
                                                                            * the root directory of this source tree.
                                                                            *
                                                                            *  strict-local
                                                                            * @format
                                                                            */