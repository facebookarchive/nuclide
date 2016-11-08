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
exports.HhvmLaunchAttachProvider = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _reactForAtom = require('react-for-atom');

var _LaunchUiComponent;

function _load_LaunchUiComponent() {
  return _LaunchUiComponent = require('./LaunchUiComponent');
}

var _AttachUiComponent;

function _load_AttachUiComponent() {
  return _AttachUiComponent = require('./AttachUiComponent');
}

let HhvmLaunchAttachProvider = exports.HhvmLaunchAttachProvider = class HhvmLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
  }

  getActions() {
    return Promise.resolve(['Attach', 'Launch']);
  }

  getComponent(action, parentEventEmitter) {
    if (action === 'Launch') {
      return _reactForAtom.React.createElement((_LaunchUiComponent || _load_LaunchUiComponent()).LaunchUiComponent, {
        targetUri: this.getTargetUri(),
        parentEmitter: parentEventEmitter
      });
    } else if (action === 'Attach') {
      return _reactForAtom.React.createElement((_AttachUiComponent || _load_AttachUiComponent()).AttachUiComponent, {
        targetUri: this.getTargetUri(),
        parentEmitter: parentEventEmitter
      });
    } else {
      if (!false) {
        throw new Error('Unrecognized action for component.');
      }
    }
  }

  dispose() {}
};