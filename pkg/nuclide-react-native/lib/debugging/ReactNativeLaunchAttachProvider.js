'use strict';

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

var _react = _interopRequireDefault(require('react'));

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

class ReactNativeLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {
  getCallbacksForAction(action) {
    return {
      /**
         * Whether this provider is enabled or not.
         */
      isEnabled: () => {
        return Promise.resolve(action === 'attach');
      },

      /**
         * Returns a list of supported debugger types + environments for the specified action.
         */
      getDebuggerTypeNames: super.getCallbacksForAction(action).getDebuggerTypeNames,

      /**
         * Returns the UI component for configuring the specified debugger type and action.
         */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        if (!(action === 'attach')) {
          throw new Error('Invariant violation: "action === \'attach\'"');
        }

        return _react.default.createElement((_DebugUiComponent || _load_DebugUiComponent()).DebugUiComponent, {
          targetUri: this.getTargetUri(),
          configIsValidChanged: configIsValidChanged
        });
      }
    };
  }

  dispose() {}
}
exports.ReactNativeLaunchAttachProvider = ReactNativeLaunchAttachProvider;