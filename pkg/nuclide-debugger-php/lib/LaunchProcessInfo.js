'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchProcessInfo = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _PhpDebuggerInstance;

function _load_PhpDebuggerInstance() {
  return _PhpDebuggerInstance = require('./PhpDebuggerInstance');
}

let LaunchProcessInfo = exports.LaunchProcessInfo = class LaunchProcessInfo extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerProcessInfo {

  constructor(targetUri, launchTarget) {
    super('hhvm', targetUri);
    this._launchTarget = launchTarget;
  }

  debug() {
    const phpDebuggerInstance = new (_PhpDebuggerInstance || _load_PhpDebuggerInstance()).PhpDebuggerInstance(this, this._launchTarget);
    return Promise.resolve(phpDebuggerInstance);
  }

  supportThreads() {
    return true;
  }

  supportSingleThreadStepping() {
    return true;
  }

  singleThreadSteppingEnabled() {
    return true;
  }

};