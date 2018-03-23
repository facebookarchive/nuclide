'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OcamlLaunchProvider = undefined;

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _react = _interopRequireDefault(require('react'));

var _OCamlLaunchUIComponent;

function _load_OCamlLaunchUIComponent() {
  return _OCamlLaunchUIComponent = require('./OCamlLaunchUIComponent');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OcamlLaunchProvider extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerLaunchAttachProvider {
  constructor(targetUri) {
    super('OCaml', targetUri);
  }

  getCallbacksForAction(action) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: () => {
        return Promise.resolve(action === 'launch');
      },

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: super.getCallbacksForAction(action).getDebuggerTypeNames,

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */

      getComponent: (debuggerTypeName, configIsValidChanged) => {
        if (action === 'attach') {
          return null;
        }
        return _react.default.createElement((_OCamlLaunchUIComponent || _load_OCamlLaunchUIComponent()).OCamlLaunchUIComponent, {
          targetUri: this.getTargetUri(),
          configIsValidChanged: configIsValidChanged
        });
      }
    };
  }

  dispose() {}
}
exports.OcamlLaunchProvider = OcamlLaunchProvider; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    * @format
                                                    */