'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhpDebuggerInstance = undefined;

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _ObservableManager;

function _load_ObservableManager() {
  return _ObservableManager = require('./ObservableManager');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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

class PhpDebuggerInstance extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerInstance {
  constructor(processInfo, rpcService) {
    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(new (_ObservableManager || _load_ObservableManager()).ObservableManager(rpcService.getNotificationObservable().refCount(), rpcService.getOutputWindowObservable().refCount()));
    super(processInfo, rpcService, subscriptions);
  }
}
exports.PhpDebuggerInstance = PhpDebuggerInstance;