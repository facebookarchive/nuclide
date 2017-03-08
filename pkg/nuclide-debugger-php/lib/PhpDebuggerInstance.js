'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhpDebuggerInstance = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _ObservableManager;

function _load_ObservableManager() {
  return _ObservableManager = require('./ObservableManager');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PhpDebuggerInstance extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance {
  constructor(processInfo, rpcService) {
    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(new (_ObservableManager || _load_ObservableManager()).ObservableManager(rpcService.getNotificationObservable().refCount(), rpcService.getOutputWindowObservable().refCount().map(message => {
      const serverMessage = (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).translateMessageFromServer)((_nuclideUri || _load_nuclideUri()).default.getHostname(processInfo.getTargetUri()), message);
      return JSON.parse(serverMessage);
    })));
    super(processInfo, rpcService, subscriptions);
  }
}
exports.PhpDebuggerInstance = PhpDebuggerInstance; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    */