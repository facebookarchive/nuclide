"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AutoGenLaunchAttachProvider = void 0;

function _DebuggerLaunchAttachProvider() {
  const data = _interopRequireDefault(require("./DebuggerLaunchAttachProvider"));

  _DebuggerLaunchAttachProvider = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _AutoGenLaunchAttachUiComponent() {
  const data = _interopRequireDefault(require("./AutoGenLaunchAttachUiComponent"));

  _AutoGenLaunchAttachUiComponent = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

class AutoGenLaunchAttachProvider extends _DebuggerLaunchAttachProvider().default {
  constructor(debuggingTypeName, targetUri, config, isEnabled = LaunchAttachProviderDefaultIsEnabled) {
    super(debuggingTypeName, targetUri);
    this._config = config;
    this._isEnabled = isEnabled;
  }

  async _resolvePath(project, filePath) {
    let rpcService = null; // Atom's service hub is synchronous.

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
          throw new Error("Invariant violation: \"launchOrAttachConfig != null\"");
        }

        if (defaultConfig != null) {
          launchOrAttachConfig.properties = launchOrAttachConfig.properties.map(p => Object.assign({}, p, {
            defaultValue: defaultConfig[p.name] == null ? p.defaultValue : defaultConfig[p.name]
          })); // Pass the ignore flag from the properites to the LaunchOrAttachConfigBase

          if (defaultConfig.ignorePreviousParams !== undefined) {
            launchOrAttachConfig.ignorePreviousParams = Boolean(defaultConfig.ignorePreviousParams);
          } else {
            launchOrAttachConfig.ignorePreviousParams = false;
          }
        }

        return React.createElement(_AutoGenLaunchAttachUiComponent().default, {
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