'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _react = _interopRequireWildcard(require('react'));

var _PythonScriptLaunchUiComponent;

function _load_PythonScriptLaunchUiComponent() {
  return _PythonScriptLaunchUiComponent = _interopRequireDefault(require('./PythonScriptLaunchUiComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class PythonLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {
  constructor(targetUri) {
    super('Python', targetUri);
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
        if (action === 'launch') {
          return _react.createElement((_PythonScriptLaunchUiComponent || _load_PythonScriptLaunchUiComponent()).default, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged
          });
        } else {
          if (!false) {
            throw new Error('Unrecognized action for component.');
          }
        }
      }
    };
  }

  dispose() {}
}
exports.default = PythonLaunchAttachProvider; /**
                                               * Copyright (c) 2015-present, Facebook, Inc.
                                               * All rights reserved.
                                               *
                                               * This source code is licensed under the license found in the LICENSE file in
                                               * the root directory of this source tree.
                                               *
                                               * 
                                               * @format
                                               */