'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLaunchProcessConfig = getLaunchProcessConfig;
exports.startAttachProcessConfig = startAttachProcessConfig;

var _debugger;

function _load_debugger() {
  return _debugger = require('../../../modules/nuclide-commons-atom/debugger');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('../../../modules/nuclide-commons/string');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');
}

var _react = _interopRequireWildcard(require('react'));

var _HhvmLaunchUiComponent;

function _load_HhvmLaunchUiComponent() {
  return _HhvmLaunchUiComponent = require('./HhvmLaunchUiComponent');
}

var _HhvmAttachUiComponent;

function _load_HhvmAttachUiComponent() {
  return _HhvmAttachUiComponent = require('./HhvmAttachUiComponent');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
    return customControlButtons.concat(
    // $FlowFB
    require('./fb-HhvmServices').customControlButtons);
  } catch (_) {
    return customControlButtons;
  }
}

class HhvmLaunchAttachProvider extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
  }

  getCallbacksForAction(action) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: () => {
        return Promise.resolve((_nuclideUri || _load_nuclideUri()).default.isRemote(this.getTargetUri()));
      },

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        if (action === 'launch') {
          return _react.createElement((_HhvmLaunchUiComponent || _load_HhvmLaunchUiComponent()).LaunchUiComponent, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged,
            getLaunchProcessConfig: getLaunchProcessConfig
          });
        } else if (action === 'attach') {
          return _react.createElement((_HhvmAttachUiComponent || _load_HhvmAttachUiComponent()).AttachUiComponent, {
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
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-php');
}

// Determines the debug configuration for launching the HHVM debugger
function _getHHVMLaunchConfig(targetUri, scriptPath, scriptArgs, scriptWrapperCommand, runInTerminal, cwdPath) {
  const userConfig = getConfig();
  const deferLaunch = runInTerminal;

  // Honor any PHP configuration the user has in Nuclide settings.
  const phpRuntimePath = userConfig.hhvmRuntimePath != null ? String(userConfig.hhvmRuntimePath) : null;
  const hhvmRuntimeArgs = (0, (_string || _load_string()).shellParse)(userConfig.hhvmRuntimeArgs != null ? String(userConfig.hhvmRuntimeArgs) : '');

  const config = {
    targetUri: (_nuclideUri || _load_nuclideUri()).default.getPath(targetUri),
    action: 'launch',
    launchScriptPath: scriptPath,
    scriptArgs: (0, (_string || _load_string()).shellParse)(scriptArgs),
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
    adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.HHVM,
    config
  };
}

function _getHHVMAttachConfig(targetUri, attachPort) {
  // Note: not specifying startup document or debug port here, the backend
  // will use the default parameters. We can surface these options in the
  const config = {
    targetUri: (_nuclideUri || _load_nuclideUri()).default.getPath(targetUri),
    action: 'attach'
  };

  // If attach port is not specified by the caller, see if one is specified
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
    adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.HHVM,
    config,
    customControlButtons: getCustomControlButtons(),
    threadsComponentTitle: 'Requests',
    customDisposable: new (_UniversalDisposable || _load_UniversalDisposable()).default()
  };

  const debugService = await (0, (_debugger || _load_debugger()).getDebuggerService)();
  const startDebuggingPromise = debugService.startVspDebugging(processConfig);
  try {
    // $FlowFB
    const services = require('./fb-HhvmServices');
    services.startSlog();

    processConfig.customDisposable.add(() => {
      services.stopSlog();
      if (serverAttach) {
        services.stopCrashHandler(processConfig);
      }
    });

    if (serverAttach) {
      const instance = await startDebuggingPromise;
      services.startCrashHandler(targetUri, processConfig, startAttachProcessConfig, instance);
    }
  } catch (_) {}
}