'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HhvmLaunchAttachProvider = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _react = _interopRequireWildcard(require('react'));

var _LaunchUiComponent;

function _load_LaunchUiComponent() {
  return _LaunchUiComponent = require('./LaunchUiComponent');
}

var _AttachUiComponent;

function _load_AttachUiComponent() {
  return _AttachUiComponent = require('./AttachUiComponent');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class HhvmLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
  }

  getCallbacksForAction(action) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: () => {
        return Promise.resolve(true);
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
          return _react.createElement((_LaunchUiComponent || _load_LaunchUiComponent()).LaunchUiComponent, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged
          });
        } else if (action === 'attach') {
          return _react.createElement((_AttachUiComponent || _load_AttachUiComponent()).AttachUiComponent, {
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
exports.HhvmLaunchAttachProvider = HhvmLaunchAttachProvider; /**
                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                              * All rights reserved.
                                                              *
                                                              * This source code is licensed under the license found in the LICENSE file in
                                                              * the root directory of this source tree.
                                                              *
                                                              * 
                                                              * @format
                                                              */