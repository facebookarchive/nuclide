'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHhvmAdapterInfo = exports.getReactNativeLaunchProcessInfo = exports.getReactNativeAttachProcessInfo = exports.getNodeAttachProcessInfo = exports.getNativeVSPAttachProcessInfo = exports.getNativeVSPLaunchProcessInfo = exports.getOCamlLaunchProcessInfo = exports.ocamlHandleLaunchButtonClick = exports.getNodeLaunchProcessInfo = exports.nodeHandleLaunchButtonClick = exports.nodeHandleAttachButtonClick = exports.getPrepackLaunchProcessInfo = exports.getPythonScriptLaunchProcessInfo = exports.pythonHandleLaunchButtonClick = exports.getPythonParLaunchProcessInfo = exports.REACT_NATIVE_PACKAGER_DEFAULT_PORT = exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getPythonParLaunchProcessInfo = exports.getPythonParLaunchProcessInfo = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (parPath, args) {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(parPath, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON, (yield getPythonAdapterInfo(parPath)), getPythonParConfig(parPath, args), { threads: true });
  });

  return function getPythonParLaunchProcessInfo(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let pythonHandleLaunchButtonClick = exports.pythonHandleLaunchButtonClick = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (targetUri, stringValues, booleanValues, enumValues, numberValues) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-python-debugger-launch-from-dialog');
    const pythonPath = (0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('pythonPath')).trim();
    const scriptPath = (0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('program')).trim();
    const args = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('args')));
    const workingDirectory = (0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('cwd')).trim();
    const environmentVariables = {};
    (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('env'))).forEach(function (variable) {
      const [key, value] = variable.split('=');
      environmentVariables[key] = value;
    });

    const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(targetUri);
    const scriptUri = hostname != null ? (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, scriptPath) : scriptPath;

    const launchInfo = yield getPythonScriptLaunchProcessInfo(scriptUri, pythonPath, args, workingDirectory, environmentVariables);

    const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
    debuggerService.startDebugging(launchInfo);
  });

  return function pythonHandleLaunchButtonClick(_x3, _x4, _x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
})();

let getPythonScriptLaunchProcessInfo = exports.getPythonScriptLaunchProcessInfo = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (scriptPath, pythonPath, args, cwd, env) {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(scriptPath, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON, (yield getPythonAdapterInfo(scriptPath)), getPythonScriptConfig(scriptPath, pythonPath, cwd, args, env), { threads: true });
  });

  return function getPythonScriptLaunchProcessInfo(_x8, _x9, _x10, _x11, _x12) {
    return _ref3.apply(this, arguments);
  };
})();

let getAdapterExecutableWithProperNode = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (adapterType, path) {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeDebuggerAdapterServiceByNuclideUri)(path);
    const adapterInfo = yield service.getAdapterExecutableInfo(adapterType);

    if (adapterInfo.command === 'node') {
      adapterInfo.command = yield (0, (_nodeInfo || _load_nodeInfo()).getNodeBinaryPath)(path);
    }

    return adapterInfo;
  });

  return function getAdapterExecutableWithProperNode(_x13, _x14) {
    return _ref4.apply(this, arguments);
  };
})();

let getPythonAdapterInfo = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('python', path);
  });

  return function getPythonAdapterInfo(_x15) {
    return _ref5.apply(this, arguments);
  };
})();

let getPythonAttachTargetProcessInfo = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (targetRootUri, target) {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetRootUri, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON, (yield getPythonAdapterInfo(targetRootUri)), getPythonAttachTargetConfig(target), { threads: true });
  });

  return function getPythonAttachTargetProcessInfo(_x16, _x17) {
    return _ref6.apply(this, arguments);
  };
})();

let getPrepackLaunchProcessInfo = exports.getPrepackLaunchProcessInfo = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (scriptPath, prepackPath, args) {
    const adapterInfo = yield getPrepackAdapterInfo(scriptPath);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(scriptPath, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PREPACK, adapterInfo, getPrepackScriptConfig(scriptPath, prepackPath, args), { threads: false });
  });

  return function getPrepackLaunchProcessInfo(_x18, _x19, _x20) {
    return _ref7.apply(this, arguments);
  };
})();

let getPrepackAdapterInfo = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('prepack', path);
  });

  return function getPrepackAdapterInfo(_x21) {
    return _ref8.apply(this, arguments);
  };
})();

let nodeHandleAttachButtonClick = exports.nodeHandleAttachButtonClick = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (targetUri, stringValues, booleanValues, enumValues, numberValues) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-node-debugger-attach-from-dialog');
    const port = numberValues.get('port');

    if (!(port != null)) {
      throw new Error('Invariant violation: "port != null"');
    }

    const attachInfo = yield getNodeAttachProcessInfo(targetUri, port);
    const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
    debuggerService.startDebugging(attachInfo);
  });

  return function nodeHandleAttachButtonClick(_x22, _x23, _x24, _x25, _x26) {
    return _ref9.apply(this, arguments);
  };
})();

let nodeHandleLaunchButtonClick = exports.nodeHandleLaunchButtonClick = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (targetUri, stringValues, booleanValues, enumValues, numberValues) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-node-debugger-launch-from-dialog');
    const nodePath = (0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('nodePath')).trim();
    const scriptPath = (0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('program')).trim();
    const args = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('args')));
    const workingDirectory = (0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('cwd')).trim();
    const outFiles = (0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('outFiles')).trim();
    const environmentVariables = {};
    (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('env'))).forEach(function (variable) {
      const [key, value] = variable.split('=');
      environmentVariables[key] = value;
    });

    const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(targetUri);
    const scriptUri = hostname != null ? (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, scriptPath) : scriptPath;

    const launchInfo = yield getNodeLaunchProcessInfo(scriptUri, nodePath, args, workingDirectory, environmentVariables, outFiles);
    const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
    debuggerService.startDebugging(launchInfo);
  });

  return function nodeHandleLaunchButtonClick(_x27, _x28, _x29, _x30, _x31) {
    return _ref10.apply(this, arguments);
  };
})();

let getNodeLaunchProcessInfo = exports.getNodeLaunchProcessInfo = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (scriptPath, nodePath, args, cwd, env, outFiles) {
    const adapterInfo = yield getNodeAdapterInfo(scriptPath);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(scriptPath, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NODE, adapterInfo, getNodeScriptConfig(scriptPath, nodePath.length > 0 ? nodePath : adapterInfo.command, cwd, args, env, outFiles), { threads: false });
  });

  return function getNodeLaunchProcessInfo(_x32, _x33, _x34, _x35, _x36, _x37) {
    return _ref11.apply(this, arguments);
  };
})();

let ocamlHandleLaunchButtonClick = exports.ocamlHandleLaunchButtonClick = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (targetUri, stringValues, booleanValues, enumValues, numberValues) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-ocaml-debugger-launch-from-dialog');
    const _expandIfLocal = function (path) {
      if ((_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri)) {
        // TODO: support expansion for remote paths.
        return path;
      }
      return (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path);
    };
    // TODO: perform some validation for the input.
    const launchExecutable = _expandIfLocal((stringValues.get('executable') || '').trim());
    const ocamldebugExecutable = _expandIfLocal((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('ocamldebug executable')).trim());
    const launchArguments = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('arguments')));
    const launchEnvironmentVariables = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('environment variables')));
    const launchWorkingDirectory = _expandIfLocal((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('working directory')).trim());
    const additionalIncludeDirectories = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(stringValues.get('additional include directories')));
    const breakAfterStart = (0, (_nullthrows || _load_nullthrows()).default)(booleanValues.get('break after start'));
    const launchTarget = {
      ocamldebugExecutable,
      executablePath: launchExecutable,
      arguments: launchArguments,
      environmentVariables: launchEnvironmentVariables,
      workingDirectory: launchWorkingDirectory,
      includeDirectories: additionalIncludeDirectories,
      breakAfterStart,
      targetUri,
      logLevel: (_vscodeDebugadapter || _load_vscodeDebugadapter()).Logger.LogLevel.Verbose // TODO: read from configuration
    };

    const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
    const launchProcessInfo = yield getOCamlLaunchProcessInfo(targetUri, launchTarget);
    debuggerService.startDebugging(launchProcessInfo);
  });

  return function ocamlHandleLaunchButtonClick(_x38, _x39, _x40, _x41, _x42) {
    return _ref12.apply(this, arguments);
  };
})();

let getOCamlLaunchProcessInfo = exports.getOCamlLaunchProcessInfo = (() => {
  var _ref13 = (0, _asyncToGenerator.default)(function* (targetUri, launchTarget) {
    const adapterInfo = yield getAdapterExecutableWithProperNode('ocaml', targetUri);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.OCAML, adapterInfo, { config: launchTarget }, { threads: false });
  });

  return function getOCamlLaunchProcessInfo(_x43, _x44) {
    return _ref13.apply(this, arguments);
  };
})();

let lldbVspAdapterWrapperPath = (() => {
  var _ref14 = (0, _asyncToGenerator.default)(function* (program) {
    try {
      // $FlowFB
      return require('./fb-LldbVspAdapterPath').getLldbVspAdapterPath(program);
    } catch (ex) {
      return 'lldb-vscode';
    }
  });

  return function lldbVspAdapterWrapperPath(_x45) {
    return _ref14.apply(this, arguments);
  };
})();

let getNativeVSPAdapterExecutable = (() => {
  var _ref15 = (0, _asyncToGenerator.default)(function* (adapter, program) {
    if (adapter === 'native_gdb') {
      return getAdapterExecutableWithProperNode(adapter, program);
    }

    const adapterInfo = {
      command: yield lldbVspAdapterWrapperPath(program),
      args: []
    };

    return adapterInfo;
  });

  return function getNativeVSPAdapterExecutable(_x46, _x47) {
    return _ref15.apply(this, arguments);
  };
})();

let getNativeVSPLaunchProcessInfo = exports.getNativeVSPLaunchProcessInfo = (() => {
  var _ref16 = (0, _asyncToGenerator.default)(function* (adapter, program, args) {
    const adapterInfo = yield getNativeVSPAdapterExecutable(adapter, program);

    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(program, 'launch', adapter, adapterInfo, Object.assign({
      program: (_nuclideUri || _load_nuclideUri()).default.getPath(program)
    }, args), { threads: true });
  });

  return function getNativeVSPLaunchProcessInfo(_x48, _x49, _x50) {
    return _ref16.apply(this, arguments);
  };
})();

let getNativeVSPAttachProcessInfo = exports.getNativeVSPAttachProcessInfo = (() => {
  var _ref17 = (0, _asyncToGenerator.default)(function* (adapter, targetUri, args) {
    const adapterInfo = yield getNativeVSPAdapterExecutable(adapter, targetUri);

    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, 'attach', adapter, adapterInfo, args, {
      threads: true
    });
  });

  return function getNativeVSPAttachProcessInfo(_x51, _x52, _x53) {
    return _ref17.apply(this, arguments);
  };
})();

let getNodeAttachProcessInfo = exports.getNodeAttachProcessInfo = (() => {
  var _ref18 = (0, _asyncToGenerator.default)(function* (targetUri, port) {
    const adapterInfo = yield getNodeAdapterInfo(targetUri);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NODE, adapterInfo, getAttachNodeConfig(port), { threads: false });
  });

  return function getNodeAttachProcessInfo(_x54, _x55) {
    return _ref18.apply(this, arguments);
  };
})();

let getNodeAdapterInfo = (() => {
  var _ref19 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('node', path);
  });

  return function getNodeAdapterInfo(_x56) {
    return _ref19.apply(this, arguments);
  };
})();

let getReactNativeAttachProcessInfo = exports.getReactNativeAttachProcessInfo = (() => {
  var _ref20 = (0, _asyncToGenerator.default)(function* (args) {
    const adapterInfo = yield getReactNativeAdapterInfo(args.program);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(args.program, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.REACT_NATIVE, adapterInfo, args, { threads: false });
  });

  return function getReactNativeAttachProcessInfo(_x57) {
    return _ref20.apply(this, arguments);
  };
})();

let getReactNativeLaunchProcessInfo = exports.getReactNativeLaunchProcessInfo = (() => {
  var _ref21 = (0, _asyncToGenerator.default)(function* (args) {
    const adapterInfo = yield getReactNativeAdapterInfo(args.program);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(args.program, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.REACT_NATIVE, adapterInfo, args, { threads: false });
  });

  return function getReactNativeLaunchProcessInfo(_x58) {
    return _ref21.apply(this, arguments);
  };
})();

let getReactNativeAdapterInfo = (() => {
  var _ref22 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('react-native', path);
  });

  return function getReactNativeAdapterInfo(_x59) {
    return _ref22.apply(this, arguments);
  };
})();

let getHhvmAdapterInfo = exports.getHhvmAdapterInfo = (() => {
  var _ref23 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('hhvm', path);
  });

  return function getHhvmAdapterInfo(_x60) {
    return _ref23.apply(this, arguments);
  };
})();

exports.getActiveScriptPath = getActiveScriptPath;
exports.getPythonAutoGenConfig = getPythonAutoGenConfig;
exports.getNodeAutoGenConfig = getNodeAutoGenConfig;
exports.getOCamlAutoGenConfig = getOCamlAutoGenConfig;
exports.listenToRemoteDebugCommands = listenToRemoteDebugCommands;

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _react = _interopRequireWildcard(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

var _debugger;

function _load_debugger() {
  return _debugger = require('../../commons-atom/debugger');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

var _nodeInfo;

function _load_nodeInfo() {
  return _nodeInfo = require('../../commons-node/node-info');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_DEBUG_OPTIONS = new Set(['WaitOnAbnormalExit', 'WaitOnNormalExit', 'RedirectOutput']); /**
                                                                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                      * All rights reserved.
                                                                                                      *
                                                                                                      * This source code is licensed under the license found in the LICENSE file in
                                                                                                      * the root directory of this source tree.
                                                                                                      *
                                                                                                      * 
                                                                                                      * @format
                                                                                                      */

const NUCLIDE_PYTHON_DEBUGGER_DEX_URI = exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = 'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide';

const REACT_NATIVE_PACKAGER_DEFAULT_PORT = exports.REACT_NATIVE_PACKAGER_DEFAULT_PORT = 8081;

// Delay starting the remote debug server to avoid affecting Nuclide's startup.
const REMOTE_DEBUG_SERVICES_DELAYED_STARTUP_MS = 10 * 1000;

// extension must be a string starting with a '.' like '.js' or '.py'
function getActiveScriptPath(extension) {
  const center = atom.workspace.getCenter ? atom.workspace.getCenter() : atom.workspace;
  const activeEditor = center.getActiveTextEditor();
  if (activeEditor == null || !activeEditor.getPath() || !(0, (_nullthrows || _load_nullthrows()).default)(activeEditor.getPath()).endsWith(extension)) {
    return '';
  }
  return (_nuclideUri || _load_nuclideUri()).default.getPath((0, (_nullthrows || _load_nullthrows()).default)(activeEditor.getPath()));
}

function generatePropertyArray(launchOrAttachConfigProperties, required) {
  const propertyArray = Object.entries(launchOrAttachConfigProperties).map(property => {
    const name = property[0];
    const propertyDetails = property[1];
    const autoGenProperty = {
      name,
      type: propertyDetails.type,
      description: propertyDetails.description,
      required: required.includes(name)
    };
    if (typeof propertyDetails.default !== 'undefined') {
      autoGenProperty.defaultValue = propertyDetails.default;
    }
    if (propertyDetails.items != null && typeof propertyDetails.items.type !== 'undefined') {
      autoGenProperty.itemType = propertyDetails.items.type;
    }
    return autoGenProperty;
  }).sort((p1, p2) => {
    if (p1.required && !p2.required) {
      return -1;
    }
    if (p2.required && !p1.required) {
      return 1;
    }
    return 0;
  });
  return propertyArray;
}

function getPythonAutoGenConfig() {
  const pkgJson = require('../../../modules/nuclide-debugger-vsps/VendorLib/vs-py-debugger/package.json');
  const configurationAttributes = pkgJson.contributes.debuggers[0].configurationAttributes;
  configurationAttributes.launch.properties.pythonPath.description = 'Path (fully qualified) to python executable.';
  const launchProperties = {};
  const launchRequired = ['pythonPath', 'program', 'cwd'];
  const usedLaunchProperties = new Set(['pythonPath', 'program', 'args', 'cwd', 'env']);
  Object.entries(configurationAttributes.launch.properties).filter(property => usedLaunchProperties.has(property[0])).forEach(property => {
    const name = property[0];
    const propertyDetails = property[1];
    // TODO(goom): replace the indexOf '$' stuff with logic that accesses settings
    if (propertyDetails.default != null && typeof propertyDetails.default === 'string' && propertyDetails.default.indexOf('$') === 0) {
      delete propertyDetails.default;
    }
    launchProperties[name] = propertyDetails;
  });

  return {
    launch: {
      launch: true,
      properties: generatePropertyArray(launchProperties, launchRequired),
      scriptPropertyName: 'program',
      scriptExtension: '.py',
      cwdPropertyName: 'cwd',
      header: _react.createElement(
        'p',
        null,
        'This is intended to debug python script files.',
        _react.createElement('br', null),
        'To debug buck targets, you should',
        ' ',
        _react.createElement(
          'a',
          { href: NUCLIDE_PYTHON_DEBUGGER_DEX_URI },
          'use the buck toolbar instead'
        ),
        '.'
      )
    },
    attach: null
  };
}

function getPythonParConfig(parPath, args) {
  const localParPath = (_nuclideUri || _load_nuclideUri()).default.getPath(parPath);
  const cwd = (_nuclideUri || _load_nuclideUri()).default.dirname(localParPath);
  return {
    stopOnEntry: false,
    console: 'none',
    // Will be replaced with the main module at runtime.
    program: '/dev/null',
    args,
    debugOptions: Array.from(DEFAULT_DEBUG_OPTIONS),
    pythonPath: localParPath,
    cwd
  };
}

function getPythonScriptConfig(scriptPath, pythonPath, cwd, args, env) {
  return {
    stopOnEntry: false,
    console: 'none',
    program: (_nuclideUri || _load_nuclideUri()).default.getPath(scriptPath),
    cwd,
    args,
    env,
    debugOptions: Array.from(DEFAULT_DEBUG_OPTIONS),
    pythonPath
  };
}

function getPythonAttachTargetConfig(target) {
  const debugOptions = new Set(DEFAULT_DEBUG_OPTIONS);
  (target.debugOptions || []).forEach(opt => debugOptions.add(opt));
  return {
    localRoot: target.localRoot,
    remoteRoot: target.remoteRoot,
    // debugOptions: Array.from(debugOptions),
    port: target.port,
    host: '127.0.0.1'
  };
}

function rootUriOfConnection(connection) {
  return connection == null ? '' : connection.getUriOfRemotePath('/');
}

function notifyOpenDebugSession() {
  atom.notifications.addInfo("Received a remote debug request, but there's an open debug session already!", {
    detail: 'To be able to remote debug, please terminate your existing session'
  });
}


function getPrepackScriptConfig(scriptPath, prepackPath, args) {
  return {
    sourceFile: (_nuclideUri || _load_nuclideUri()).default.getPath(scriptPath),
    prepackRuntime: prepackPath,
    prepackArguments: args
  };
}

function getNodeAutoGenConfig() {
  const pkgJson = require('../../../modules/nuclide-debugger-vsps/VendorLib/vscode-node-debug2/package.json');
  const pkgJsonDescriptions = require('../../../modules/nuclide-debugger-vsps/VendorLib/vscode-node-debug2/package.nls.json');
  const configurationAttributes = pkgJson.contributes.debuggers[1].configurationAttributes;
  Object.entries(configurationAttributes.launch.properties).forEach(property => {
    const name = property[0];
    const descriptionSubstitution = configurationAttributes.launch.properties[name].description;
    if (descriptionSubstitution != null && typeof descriptionSubstitution === 'string') {
      configurationAttributes.launch.properties[name].description = pkgJsonDescriptions[descriptionSubstitution.slice(1, -1)];
    }
  });
  configurationAttributes.launch.properties.nodePath = {
    type: 'string',
    description: "Node executable path (e.g. /usr/local/bin/node). Will use Nuclide's node version if not provided.",
    default: ''
  };
  Object.entries(configurationAttributes.attach.properties).forEach(property => {
    const name = property[0];
    const descriptionSubstitution = configurationAttributes.attach.properties[name].description;
    if (descriptionSubstitution != null && typeof descriptionSubstitution === 'string') {
      configurationAttributes.attach.properties[name].description = pkgJsonDescriptions[descriptionSubstitution.slice(1, -1)];
    }
  });

  const launchProperties = {};
  const attachProperties = {};
  const launchRequired = ['program', 'cwd'];
  const attachRequired = ['port'];

  const usedLaunchProperties = new Set(launchRequired.concat(['nodePath', 'args', 'outFiles', 'env']));

  Object.entries(configurationAttributes.launch.properties).filter(property => usedLaunchProperties.has(property[0])).forEach(property => {
    const name = property[0];
    const propertyDetails = property[1];
    launchProperties[name] = propertyDetails;
  });

  const usedAttachProperties = new Set(['port']);

  Object.entries(configurationAttributes.attach.properties).filter(property => usedAttachProperties.has(property[0])).forEach(property => {
    const name = property[0];
    const propertyDetails = property[1];
    attachProperties[name] = propertyDetails;
  });

  return {
    launch: {
      launch: true,
      properties: generatePropertyArray(launchProperties, launchRequired),
      scriptPropertyName: 'program',
      cwdPropertyName: 'cwd',
      scriptExtension: '.js',
      header: _react.createElement(
        'p',
        null,
        'This is intended to debug node.js files (for node version 6.3+).'
      )
    },
    attach: {
      launch: false,
      properties: generatePropertyArray(attachProperties, attachRequired),
      header: _react.createElement(
        'p',
        null,
        'Attach to a running node.js process'
      )
    }
  };
}

function getOCamlAutoGenConfig() {
  const debugExecutable = {
    name: 'ocamldebug executable',
    type: 'string',
    description: 'Path to ocamldebug or launch script',
    required: true
  };
  const executable = {
    name: 'executable',
    type: 'string',
    description: 'Input the executable path you want to launch (leave blank if using an ocamldebug launch script)',
    required: false
  };
  const argumentsProperty = {
    name: 'arguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to the executable',
    required: false,
    defaultValue: ''
  };
  const environmentVariables = {
    name: 'environment variables',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: ''
  };
  const workingDirectory = {
    name: 'working directory',
    type: 'string',
    description: 'Working directory for the launched executable',
    required: true
  };
  const additionalIncludeDirectories = {
    name: 'additional include directories',
    type: 'array',
    itemType: 'string',
    description: 'Additional include directories that debugger will use to search for source code',
    required: false,
    defaultValue: ''
  };
  const breakAfterStart = {
    name: 'break after start',
    type: 'boolean',
    description: '',
    required: false,
    defaultValue: true
  };
  const autoGenLaunchConfig = {
    launch: true,
    properties: [debugExecutable, executable, argumentsProperty, environmentVariables, workingDirectory, additionalIncludeDirectories, breakAfterStart],
    scriptPropertyName: 'executable',
    scriptExtension: '.ml',
    cwdPropertyName: 'working directory',
    header: null
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null
  };
}

function getNodeScriptConfig(scriptPath, nodePath, cwd, args, env, outFiles) {
  return {
    protocol: 'inspector',
    stopOnEntry: false,
    program: (_nuclideUri || _load_nuclideUri()).default.getPath(scriptPath),
    runtimeExecutable: nodePath,
    cwd,
    args,
    env,
    outFiles: outFiles.length > 0 ? [outFiles] : []
  };
}

function getAttachNodeConfig(port) {
  return { port };
}

function listenToRemoteDebugCommands() {
  const connections = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.observeRemoteConnections().map(conns => new Set(conns)).let((0, (_observable || _load_observable()).diffSets)()).flatMap(diff => _rxjsBundlesRxMinJs.Observable.from(diff.added)).startWith(null);

  const remoteDebuggerServices = connections.map(conn => {
    const rootUri = rootUriOfConnection(conn);
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getRemoteDebuggerCommandServiceByNuclideUri)(rootUri);

    return { service, rootUri };
  });

  const delayStartupObservable = _rxjsBundlesRxMinJs.Observable.interval(REMOTE_DEBUG_SERVICES_DELAYED_STARTUP_MS).first().ignoreElements();

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(delayStartupObservable.switchMap(() => {
    return remoteDebuggerServices.flatMap(({ service, rootUri }) => {
      return service.observeAttachDebugTargets().refCount().map(targets => findDuplicateAttachTargetIds(targets));
    });
  }).subscribe(duplicateTargetIds => notifyDuplicateDebugTargets(duplicateTargetIds)), delayStartupObservable.concat(remoteDebuggerServices).flatMap(({ service, rootUri }) => {
    return service.observeRemoteDebugCommands().refCount().catch(error => {
      if (!(0, (_systemInfo || _load_systemInfo()).isRunningInTest)()) {
        (0, (_log4js || _load_log4js()).getLogger)().error('Failed to listen to remote debug commands - ' + 'You could be running locally with two Atom windows. ' + `IsLocal: ${String(rootUri === '')}`);
      }
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).map(command => ({ rootUri, command }));
  }).let((0, (_observable || _load_observable()).fastDebounce)(500)).subscribe((() => {
    var _ref24 = (0, _asyncToGenerator.default)(function* ({ rootUri, command }) {
      const attachProcessInfo = yield getPythonAttachTargetProcessInfo(rootUri, command.target);
      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      const debuggerName = debuggerService.getCurrentDebuggerName();
      if (debuggerName == null) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-python-debugger-auto-attach');
        debuggerService.startDebugging(attachProcessInfo);
        return;
      } else {
        notifyOpenDebugSession();
        return;
      }
      // Otherwise, we're already debugging that target.
    });

    return function (_x61) {
      return _ref24.apply(this, arguments);
    };
  })()));
}

let shouldNotifyDuplicateTargets = true;
let duplicateTargetsNotification;

function notifyDuplicateDebugTargets(duplicateTargetIds) {
  if (duplicateTargetIds.size > 0 && shouldNotifyDuplicateTargets && duplicateTargetsNotification == null) {
    const formattedIds = Array.from(duplicateTargetIds).join(', ');
    duplicateTargetsNotification = atom.notifications.addInfo(`Debugger: duplicate attach targets: \`${formattedIds}\``, {
      buttons: [{
        onDidClick: () => {
          shouldNotifyDuplicateTargets = false;
          if (duplicateTargetsNotification != null) {
            duplicateTargetsNotification.dismiss();
          }
        },
        text: 'Ignore'
      }],
      description: `Nuclide debugger detected duplicate attach targets with ids (${formattedIds}) ` + 'That could be instagram running multiple processes - check out https://our.intern.facebook.com/intern/dex/instagram-server/debugging-with-nuclide/',
      dismissable: true
    });
    duplicateTargetsNotification.onDidDismiss(() => {
      duplicateTargetsNotification = null;
    });
  }
}

function findDuplicateAttachTargetIds(targets) {
  const targetIds = new Set();
  const duplicateTargetIds = new Set();
  targets.forEach(target => {
    const { id } = target;
    if (id == null) {
      return;
    }
    if (targetIds.has(id)) {
      duplicateTargetIds.add(id);
    } else {
      targetIds.add(id);
    }
  });
  return duplicateTargetIds;
}