'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DebuggerLaunchAttachProvider;

function _load_DebuggerLaunchAttachProvider() {
  return _DebuggerLaunchAttachProvider = _interopRequireDefault(require('./DebuggerLaunchAttachProvider'));
}

var _react = _interopRequireWildcard(require('react'));

var _AutoGenLaunchAttachUiComponent;

function _load_AutoGenLaunchAttachUiComponent() {
  return _AutoGenLaunchAttachUiComponent = _interopRequireDefault(require('./AutoGenLaunchAttachUiComponent'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

const LaunchAttachProviderDefaultIsEnabled = (action, config) => {
  return Promise.resolve(config[action] != null);
};

class AutoGenLaunchAttachProvider extends (_DebuggerLaunchAttachProvider || _load_DebuggerLaunchAttachProvider()).default {

  constructor(debuggingTypeName, targetUri, config, isEnabled = LaunchAttachProviderDefaultIsEnabled) {
    super(debuggingTypeName, targetUri);
    this._config = config;
    this._isEnabled = isEnabled;
  }

  getCallbacksForAction(action) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: async () => {
        return this._isEnabled(action, this._config);
      },

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: super.getCallbacksForAction(action).getDebuggerTypeNames,

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        const launchOrAttachConfig = this._config[action];

        if (!(launchOrAttachConfig != null)) {
          throw new Error('Invariant violation: "launchOrAttachConfig != null"');
        }

        return _react.createElement((_AutoGenLaunchAttachUiComponent || _load_AutoGenLaunchAttachUiComponent()).default, {
          targetUri: this.getTargetUri(),
          configIsValidChanged: configIsValidChanged,
          config: launchOrAttachConfig,
          debuggerTypeName: debuggerTypeName
        });
      }
    };
  }

  dispose() {}
}
exports.default = AutoGenLaunchAttachProvider;