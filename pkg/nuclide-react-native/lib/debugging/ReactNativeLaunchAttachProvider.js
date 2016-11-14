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
exports.ReactNativeLaunchAttachProvider = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../../nuclide-debugger-base');
}

var _DebugUiComponent;

function _load_DebugUiComponent() {
  return _DebugUiComponent = require('./DebugUiComponent');
}

var _reactForAtom = require('react-for-atom');

let ReactNativeLaunchAttachProvider = exports.ReactNativeLaunchAttachProvider = class ReactNativeLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {

  getActions() {
    return Promise.resolve(['Attach']);
  }

  getComponent(action, parentEventEmitter) {
    if (!(action === 'Attach')) {
      throw new Error('Invariant violation: "action === \'Attach\'"');
    }

    return _reactForAtom.React.createElement((_DebugUiComponent || _load_DebugUiComponent()).DebugUiComponent, { targetUri: this.getTargetUri(), parentEmitter: parentEventEmitter });
  }

  dispose() {}
};