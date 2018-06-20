'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AutoGenLaunchAttachProvider = undefined;

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

const LaunchAttachProviderDefaultIsEnabled = (action, config) => {
  return Promise.resolve(config[action] != null);
}; /**
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

class AutoGenLaunchAttachProvider extends (_DebuggerLaunchAttachProvider || _load_DebuggerLaunchAttachProvider()).default {

  constructor(debuggingTypeName, targetUri, config, isEnabled = LaunchAttachProviderDefaultIsEnabled) {
    super(debuggingTypeName, targetUri);
    this._config = config;
    this._isEnabled = isEnabled;
  }

  async _resolvePath(project, filePath) {
    let rpcService = null;
    // Atom's service hub is synchronous.
    atom.packages.serviceHub.consume('nuclide-rpc-services', '0.0.0', provider => {
      rpcService = provider;
    }).dispose();
    if (rpcService != null) {
      const fsService = rpcService.getServiceByNuclideUri('FileSystemService', project);
      if (fsService != null) {
        try {
          return fsService.expandHomeDir(filePath);
        } catch (_) {}
      }
    }

    return Promise.resolve(filePath);
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
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged, defaultConfig) => {
        const launchOrAttachConfig = this._config[action];

        if (!(launchOrAttachConfig != null)) {
          throw new Error('Invariant violation: "launchOrAttachConfig != null"');
        }

        if (defaultConfig != null) {
          launchOrAttachConfig.properties = launchOrAttachConfig.properties.map(p => Object.assign({}, p, {
            defaultValue: defaultConfig[p.name] == null ? p.defaultValue : defaultConfig[p.name]
          }));
        }
        return _react.createElement((_AutoGenLaunchAttachUiComponent || _load_AutoGenLaunchAttachUiComponent()).default, {
          targetUri: this.getTargetUri(),
          configIsValidChanged: configIsValidChanged,
          config: launchOrAttachConfig,
          debuggerTypeName: debuggerTypeName,
          pathResolver: this._resolvePath
        });
      }
    };
  }
}
exports.AutoGenLaunchAttachProvider = AutoGenLaunchAttachProvider;