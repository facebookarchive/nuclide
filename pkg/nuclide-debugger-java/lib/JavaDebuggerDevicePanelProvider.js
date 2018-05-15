'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.JavaDebuggerDevicePanelProvider = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));



















var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _debugger;
function _load_debugger() {return _debugger = require('../../../modules/nuclide-commons-atom/debugger');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class JavaDebuggerDevicePanelProvider
{


  constructor(javaDebugger) {
    this._javaDebugger = javaDebugger;
  }

  getType() {
    return 'Android';
  }

  getTaskType() {
    return 'DEBUG';
  }

  getSupportedPIDs(
  host,
  device,
  procs)
  {
    return _rxjsBundlesRxMinJs.Observable.of(
    new Set(procs.filter(proc => proc.isJava).map(proc => proc.pid)));

  }

  getName() {
    return 'Attach Java debugger';
  }

  run(host, device, proc) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      const { processInfo } = yield _this._javaDebugger.createAndroidDebugInfo({
        targetUri: host,
        packageName: '',
        device,
        pid: proc.pid });

      debuggerService.startDebugging(processInfo);})();
  }}exports.JavaDebuggerDevicePanelProvider = JavaDebuggerDevicePanelProvider; /**
                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                * All rights reserved.
                                                                                *
                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                * the root directory of this source tree.
                                                                                *
                                                                                *  strict-local
                                                                                * @format
                                                                                */