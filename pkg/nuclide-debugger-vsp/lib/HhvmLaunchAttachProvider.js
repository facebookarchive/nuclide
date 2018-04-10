'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAttachProcessInfo = exports.getLaunchProcessInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// Determines the debug configuration for launching the HHVM debugger
let _getHHVMLaunchConfig = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (targetUri, scriptPath, scriptArgs, scriptWrapperCommand, runInTerminal, cwdPath) {
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

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHhvmDebuggerServiceByNuclideUri)(targetUri);

    if (deferLaunch) {
      // This is a launch in terminal request. Perform the launch and then
      // return an attach configuration.
      const startupArgs = yield service.getLaunchArgs(config);

      // Launch the script and then convert this to an attach operation.
      const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri);
      const launchUri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, scriptPath);

      const remoteService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();

      if (!(remoteService != null)) {
        throw new Error('Invariant violation: "remoteService != null"');
      }

      // Terminal args require everything to be a string, but debug port
      // is typed as a number.


      const terminalArgs = [];
      for (const arg of startupArgs.hhvmArgs) {
        terminalArgs.push(String(arg));
      }

      yield remoteService.launchDebugTargetInTerminal(launchUri, startupArgs.hhvmPath, terminalArgs, (_nuclideUri || _load_nuclideUri()).default.dirname(launchUri), new Map());

      const attachConfig = {
        targetUri: (_nuclideUri || _load_nuclideUri()).default.getPath(targetUri),
        action: 'attach',
        debugPort: startupArgs.debugPort
      };

      return service.getDebuggerArgs(attachConfig);
    }

    return service.getDebuggerArgs(config);
  });

  return function _getHHVMLaunchConfig(_x, _x2, _x3, _x4, _x5, _x6) {
    return _ref.apply(this, arguments);
  };
})();

let getLaunchProcessInfo = exports.getLaunchProcessInfo = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (targetUri, scriptPath, scriptArgs, scriptWrapperCommand, runInTerminal, cwdPath) {
    const adapterExecutable = yield (0, (_utils || _load_utils()).getHhvmAdapterInfo)(targetUri);
    const config = yield _getHHVMLaunchConfig(targetUri, scriptPath, scriptArgs, scriptWrapperCommand, runInTerminal, cwdPath);
    const adapterType = (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.HHVM;
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, runInTerminal ? 'attach' : 'launch', adapterType, adapterExecutable, config, CUSTOM_CPABILITIES);
  });

  return function getLaunchProcessInfo(_x7, _x8, _x9, _x10, _x11, _x12) {
    return _ref2.apply(this, arguments);
  };
})();

let _getHHVMAttachConfig = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (targetUri, attachPort) {
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

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHhvmDebuggerServiceByNuclideUri)(targetUri);
    return service.getDebuggerArgs(config);
  });

  return function _getHHVMAttachConfig(_x13, _x14) {
    return _ref3.apply(this, arguments);
  };
})();

let getAttachProcessInfo = exports.getAttachProcessInfo = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (targetUri, attachPort, serverAttach) {
    const adapterExecutable = yield (0, (_utils || _load_utils()).getHhvmAdapterInfo)(targetUri);
    const config = yield _getHHVMAttachConfig(targetUri, attachPort);
    const processInfo = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.HHVM, adapterExecutable, config, CUSTOM_CPABILITIES, CUSTOM_ATTACH_PROPERTIES);
    try {
      // $FlowFB
      const services = require('./fb-HhvmServices');
      services.startSlog();

      if (serverAttach) {
        services.startCrashHandler(targetUri, processInfo, getAttachProcessInfo);
      }

      processInfo.addCustomDisposable(new (_UniversalDisposable || _load_UniversalDisposable()).default(function () {
        services.stopSlog();

        if (serverAttach) {
          services.stopCrashHandler(processInfo);
        }
      }));
    } catch (_) {}
    return processInfo;
  });

  return function getAttachProcessInfo(_x15, _x16, _x17) {
    return _ref4.apply(this, arguments);
  };
})();

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _react = _interopRequireWildcard(require('react'));

var _debugger;

function _load_debugger() {
  return _debugger = require('../../commons-atom/debugger');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _HhvmLaunchUiComponent;

function _load_HhvmLaunchUiComponent() {
  return _HhvmLaunchUiComponent = require('./HhvmLaunchUiComponent');
}

var _HhvmAttachUiComponent;

function _load_HhvmAttachUiComponent() {
  return _HhvmAttachUiComponent = require('./HhvmAttachUiComponent');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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

const CUSTOM_CPABILITIES = {
  completionsRequest: true,
  conditionalBreakpoints: true,
  continueToLocation: true,
  setVariable: true,
  threads: true
};

const CUSTOM_ATTACH_PROPERTIES = {
  customControlButtons: getCustomControlButtons(),
  threadsComponentTitle: 'Requests'
};

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
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: super.getCallbacksForAction(action).getDebuggerTypeNames,

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        if (action === 'launch') {
          return _react.createElement((_HhvmLaunchUiComponent || _load_HhvmLaunchUiComponent()).LaunchUiComponent, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged,
            getLaunchProcessInfo: getLaunchProcessInfo
          });
        } else if (action === 'attach') {
          return _react.createElement((_HhvmAttachUiComponent || _load_HhvmAttachUiComponent()).AttachUiComponent, {
            targetUri: this.getTargetUri(),
            configIsValidChanged: configIsValidChanged,
            getAttachProcessInfo: getAttachProcessInfo
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

exports.default = HhvmLaunchAttachProvider;
function getConfig() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-php');
}