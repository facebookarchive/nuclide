"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLaunchProcessConfig = getLaunchProcessConfig;
exports.startAttachProcessConfig = startAttachProcessConfig;
exports.default = void 0;

function _debugger() {
  const data = require("../../../modules/nuclide-commons-atom/debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../../../modules/nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _HhvmLaunchUiComponent() {
  const data = require("./HhvmLaunchUiComponent");

  _HhvmLaunchUiComponent = function () {
    return data;
  };

  return data;
}

function _HhvmAttachUiComponent() {
  const data = require("./HhvmAttachUiComponent");

  _HhvmAttachUiComponent = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
function getCustomControlButtons() {
  const customControlButtons = [{
    icon: 'link-external',
    title: 'Toggle HTTP Request Sender',
    onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-http-request-sender:toggle-http-request-edit-dialog')
  }];

  try {
    return customControlButtons.concat( // $FlowFB
    require("./fb-HhvmServices").customControlButtons);
  } catch (_) {
    return customControlButtons;
  }
}

class HhvmLaunchAttachProvider extends _nuclideDebuggerCommon().DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
  }

  getCallbacksForAction(action) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: () => {
        return Promise.resolve(_nuclideUri().default.isRemote(this.getTargetUri()) || process.platform !== 'win32');
      },

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        if (action === 'launch') {
          return React.createElement(_HhvmLaunchUiComponent().LaunchUiComponent, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged,
            getLaunchProcessConfig: getLaunchProcessConfig
          });
        } else if (action === 'attach') {
          return React.createElement(_HhvmAttachUiComponent().AttachUiComponent, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged,
            startAttachProcessConfig: startAttachProcessConfig
          });
        } else {
          if (!false) {
            throw new Error('Unrecognized action for component.');
          }
        }
      }
    };
  }

}

exports.default = HhvmLaunchAttachProvider;

function getConfig() {
  return _featureConfig().default.get('nuclide-debugger-php');
} // Determines the debug configuration for launching the HHVM debugger


function _getHHVMLaunchConfig(targetUri, scriptPath, scriptArgs, scriptWrapperCommand, runInTerminal, cwdPath) {
  const userConfig = getConfig();
  const deferLaunch = runInTerminal; // Honor any PHP configuration the user has in Nuclide settings.

  const phpRuntimePath = userConfig.hhvmRuntimePath != null ? String(userConfig.hhvmRuntimePath) : null;
  const hhvmRuntimeArgs = (0, _string().shellParse)(userConfig.hhvmRuntimeArgs != null ? String(userConfig.hhvmRuntimeArgs) : '');
  const config = {
    targetUri: _nuclideUri().default.getPath(targetUri),
    action: 'launch',
    launchScriptPath: scriptPath,
    scriptArgs: (0, _string().shellParse)(scriptArgs),
    hhvmRuntimeArgs,
    deferLaunch
  };

  if (cwdPath != null && cwdPath !== '') {
    config.cwd = cwdPath;
  }

  if (phpRuntimePath != null) {
    config.hhvmRuntimePath = phpRuntimePath;
  }

  if (scriptWrapperCommand != null) {
    config.launchWrapperCommand = scriptWrapperCommand;
  }

  return config;
}

function getLaunchProcessConfig(targetUri, scriptPath, scriptArgs, scriptWrapperCommand, runInTerminal, cwdPath) {
  const config = _getHHVMLaunchConfig(targetUri, scriptPath, scriptArgs, scriptWrapperCommand, runInTerminal, cwdPath);

  return {
    targetUri,
    debugMode: 'launch',
    adapterType: _nuclideDebuggerCommon().VsAdapterTypes.HHVM,
    config
  };
}

function _getHHVMAttachConfig(targetUri, attachPort) {
  // Note: not specifying startup document or debug port here, the backend
  // will use the default parameters. We can surface these options in the
  const config = {
    targetUri: _nuclideUri().default.getPath(targetUri),
    action: 'attach'
  }; // If attach port is not specified by the caller, see if one is specified
  // in Nuclide configuration.

  if (attachPort == null) {
    const userConfig = getConfig();

    if (userConfig.hhvmServerAttachPort !== '') {
      const userPort = parseInt(userConfig.hhvmServerAttachPort, 10);

      if (!Number.isNaN(userPort)) {
        config.debugPort = userPort;
      }
    }
  } else {
    config.debugPort = attachPort;
  }

  return config;
}

async function startAttachProcessConfig(targetUri, attachPort, serverAttach) {
  const config = _getHHVMAttachConfig(targetUri, attachPort);

  const processConfig = {
    targetUri,
    debugMode: 'attach',
    adapterType: _nuclideDebuggerCommon().VsAdapterTypes.HHVM,
    config,
    customControlButtons: getCustomControlButtons(),
    threadsComponentTitle: 'Requests',
    isRestartable: true,
    onDebugStartingCallback: instance => {
      // This IDisposable will be disposed when the debugging session ends.
      // The debug service will ensure it is called on our behalf.
      const disposables = new (_UniversalDisposable().default)();

      try {
        // $FlowFB
        const services = require("./fb-HhvmServices");

        services.startSlog();
        disposables.add(() => {
          services.stopSlog();
        });

        if (serverAttach) {
          services.startCrashHandler(targetUri, processConfig, startAttachProcessConfig, instance);
          disposables.add(() => {
            services.stopCrashHandler(processConfig);
          });
        }
      } catch (_) {}

      return disposables;
    }
  };
  const debugService = await (0, _debugger().getDebuggerService)();
  debugService.startVspDebugging(processConfig);
}