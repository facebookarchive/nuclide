'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHhvmAdapterInfo = exports.getReactNativeLaunchProcessInfo = exports.getReactNativeAttachProcessInfo = exports.getNativeVSPAttachProcessInfo = exports.getNativeVSPLaunchProcessInfo = exports.getAdapterExecutableWithProperNode = exports.getPythonParLaunchProcessInfo = exports.REACT_NATIVE_PACKAGER_DEFAULT_PORT = exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getPythonParLaunchProcessInfo = exports.getPythonParLaunchProcessInfo = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (parPath, args) {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(parPath, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON, (yield getPythonAdapterInfo(parPath)), getPythonParConfig(parPath, args), { threads: true });
  });

  return function getPythonParLaunchProcessInfo(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getAdapterExecutableWithProperNode = exports.getAdapterExecutableWithProperNode = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (adapterType, path) {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeDebuggerAdapterServiceByNuclideUri)(path);
    const adapterInfo = yield service.getAdapterExecutableInfo(adapterType);

    if (adapterInfo.command === 'node') {
      adapterInfo.command = yield (0, (_nodeInfo || _load_nodeInfo()).getNodeBinaryPath)(path);
    }

    return adapterInfo;
  });

  return function getAdapterExecutableWithProperNode(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let getPythonAdapterInfo = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('python', path);
  });

  return function getPythonAdapterInfo(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

let getPythonAttachTargetProcessInfo = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (targetRootUri, target) {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetRootUri, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON, (yield getPythonAdapterInfo(targetRootUri)), getPythonAttachTargetConfig(target), { threads: true });
  });

  return function getPythonAttachTargetProcessInfo(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
})();

let lldbVspAdapterWrapperPath = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (program) {
    try {
      // $FlowFB
      return require('./fb-LldbVspAdapterPath').getLldbVspAdapterPath(program);
    } catch (ex) {
      return 'lldb-vscode';
    }
  });

  return function lldbVspAdapterWrapperPath(_x8) {
    return _ref5.apply(this, arguments);
  };
})();

let getNativeVSPAdapterExecutable = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (adapter, program) {
    if (adapter === 'native_gdb') {
      return getAdapterExecutableWithProperNode(adapter, program);
    }

    const adapterInfo = {
      command: yield lldbVspAdapterWrapperPath(program),
      args: []
    };

    return adapterInfo;
  });

  return function getNativeVSPAdapterExecutable(_x9, _x10) {
    return _ref6.apply(this, arguments);
  };
})();

let getNativeVSPLaunchProcessInfo = exports.getNativeVSPLaunchProcessInfo = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (adapter, program, args) {
    const adapterInfo = yield getNativeVSPAdapterExecutable(adapter, program);

    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(program, 'launch', adapter, adapterInfo, Object.assign({
      program: (_nuclideUri || _load_nuclideUri()).default.getPath(program)
    }, args), { threads: true });
  });

  return function getNativeVSPLaunchProcessInfo(_x11, _x12, _x13) {
    return _ref7.apply(this, arguments);
  };
})();

let getNativeVSPAttachProcessInfo = exports.getNativeVSPAttachProcessInfo = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (adapter, targetUri, args) {
    const adapterInfo = yield getNativeVSPAdapterExecutable(adapter, targetUri);

    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, 'attach', adapter, adapterInfo, args, {
      threads: true
    });
  });

  return function getNativeVSPAttachProcessInfo(_x14, _x15, _x16) {
    return _ref8.apply(this, arguments);
  };
})();

let getReactNativeAttachProcessInfo = exports.getReactNativeAttachProcessInfo = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (args) {
    const adapterInfo = yield getReactNativeAdapterInfo(args.program);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(args.program, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.REACT_NATIVE, adapterInfo, args, { threads: false });
  });

  return function getReactNativeAttachProcessInfo(_x17) {
    return _ref9.apply(this, arguments);
  };
})();

let getReactNativeLaunchProcessInfo = exports.getReactNativeLaunchProcessInfo = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (args) {
    const adapterInfo = yield getReactNativeAdapterInfo(args.program);
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(args.program, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.REACT_NATIVE, adapterInfo, args, { threads: false });
  });

  return function getReactNativeLaunchProcessInfo(_x18) {
    return _ref10.apply(this, arguments);
  };
})();

let getReactNativeAdapterInfo = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('react-native', path);
  });

  return function getReactNativeAdapterInfo(_x19) {
    return _ref11.apply(this, arguments);
  };
})();

let getHhvmAdapterInfo = exports.getHhvmAdapterInfo = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (path) {
    return getAdapterExecutableWithProperNode('hhvm', path);
  });

  return function getHhvmAdapterInfo(_x20) {
    return _ref12.apply(this, arguments);
  };
})();

exports.getActiveScriptPath = getActiveScriptPath;
exports.getPythonAutoGenConfig = getPythonAutoGenConfig;
exports.getPrepackAutoGenConfig = getPrepackAutoGenConfig;
exports.getNodeAutoGenConfig = getNodeAutoGenConfig;
exports.getOCamlAutoGenConfig = getOCamlAutoGenConfig;
exports.listenToRemoteDebugCommands = listenToRemoteDebugCommands;

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

function generatePropertyArray(launchOrAttachConfigProperties, required, visible) {
  const propertyArray = Object.entries(launchOrAttachConfigProperties).map(property => {
    const name = property[0];
    const propertyDetails = property[1];
    const autoGenProperty = {
      name,
      type: propertyDetails.type,
      description: propertyDetails.description,
      required: required.includes(name),
      visible: visible.includes(name)
    };
    if (typeof propertyDetails.default !== 'undefined') {
      autoGenProperty.defaultValue = propertyDetails.default;
    }
    if (propertyDetails.items != null && typeof propertyDetails.items.type !== 'undefined') {
      autoGenProperty.itemType = propertyDetails.items.type;
    }
    return autoGenProperty;
  }).sort((p1, p2) => {
    // TODO (goom): sort all configs, not just ones generated from the json
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
  const launchVisible = launchRequired.concat(['args', 'env', 'stopOnEntry']);
  const launchWhitelisted = new Set(launchVisible.concat(['console', 'debugOptions']));

  Object.entries(configurationAttributes.launch.properties).filter(property => launchWhitelisted.has(property[0])).forEach(property => {
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
      vsAdapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON,
      adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PYTHON,
      threads: true,
      properties: generatePropertyArray(launchProperties, launchRequired, launchVisible),
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

function getPrepackAutoGenConfig() {
  const fileToPrepack = {
    name: 'sourceFile',
    type: 'string',
    description: 'Input the file you want to Prepack',
    required: true,
    visible: true
  };
  const prepackRuntimePath = {
    name: 'prepackRuntime',
    type: 'string',
    description: 'Prepack executable path (e.g. lib/prepack-cli.js). Will use default prepack command if not provided',
    required: false,
    visible: true
  };
  const argumentsProperty = {
    name: 'prepackArguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to start Prepack',
    required: false,
    defaultValue: '',
    visible: true
  };

  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PREPACK,
    adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PREPACK,
    threads: false,
    properties: [fileToPrepack, prepackRuntimePath, argumentsProperty],
    scriptPropertyName: 'fileToPrepack',
    scriptExtension: '.js',
    cwdPropertyName: null,
    header: null
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null
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
  configurationAttributes.launch.properties.runtimeExecutable = {
    type: 'string',
    description: "Runtime to use. Either an absolute path or the name of a runtime available on the PATH. If ommitted 'node' is assumed.",
    default: ''
  };
  configurationAttributes.launch.properties.protocol = {
    type: 'string',
    description: '',
    default: 'inspector'
  };
  Object.entries(configurationAttributes.attach.properties).forEach(property => {
    const name = property[0];
    const descriptionSubstitution = configurationAttributes.attach.properties[name].description;
    if (descriptionSubstitution != null && typeof descriptionSubstitution === 'string') {
      configurationAttributes.attach.properties[name].description = pkgJsonDescriptions[descriptionSubstitution.slice(1, -1)];
    }
  });

  const launchProperties = {};
  const launchRequired = ['program', 'cwd'];
  const launchVisible = launchRequired.concat(['runtimeExecutable', 'args', 'outFiles', 'env', 'stopOnEntry']);
  const launchWhitelisted = new Set(launchVisible.concat(['protocol', 'outFiles']));

  Object.entries(configurationAttributes.launch.properties).filter(property => launchWhitelisted.has(property[0])).forEach(property => {
    const name = property[0];
    const propertyDetails = property[1];
    launchProperties[name] = propertyDetails;
  });

  const attachProperties = {};
  const attachRequired = ['port'];

  Object.entries(configurationAttributes.attach.properties).forEach(property => {
    const name = property[0];
    const propertyDetails = property[1];
    attachProperties[name] = propertyDetails;
  });

  return {
    launch: {
      launch: true,
      vsAdapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NODE,
      adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NODE,
      threads: false,
      properties: generatePropertyArray(launchProperties, launchRequired, launchVisible),
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
      vsAdapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NODE,
      adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NODE,
      threads: false,
      properties: generatePropertyArray(attachProperties, attachRequired, attachRequired),
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
    name: 'ocamldebugExecutable',
    type: 'string',
    description: 'Path to ocamldebug or launch script',
    required: true,
    visible: true
  };
  const executablePath = {
    name: 'executablePath',
    type: 'string',
    description: 'Input the executable path you want to launch (leave blank if using an ocamldebug launch script)',
    required: false,
    visible: true
  };
  const argumentsProperty = {
    name: 'arguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to the executable',
    required: false,
    defaultValue: '',
    visible: true
  };
  const environmentVariables = {
    name: 'environmentVariables',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: '',
    visible: true
  };
  const workingDirectory = {
    name: 'workingDirectory',
    type: 'string',
    description: 'Working directory for the launched executable',
    required: true,
    visible: true
  };
  const additionalIncludeDirectories = {
    name: 'includeDirectories',
    type: 'array',
    itemType: 'string',
    description: 'Additional include directories that debugger will use to search for source code',
    required: false,
    defaultValue: '',
    visible: true
  };
  const breakAfterStart = {
    name: 'breakAfterStart',
    type: 'boolean',
    description: '',
    required: false,
    defaultValue: true,
    visible: true
  };
  const logLevel = {
    name: 'logLevel',
    type: 'string',
    description: '',
    required: false,
    defaultValue: (_vscodeDebugadapter || _load_vscodeDebugadapter()).Logger.LogLevel.Verbose,
    visible: false
  };

  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.OCAML,
    adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.OCAML,
    threads: false,
    properties: [debugExecutable, executablePath, argumentsProperty, environmentVariables, workingDirectory, additionalIncludeDirectories, breakAfterStart, logLevel],
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
    var _ref13 = (0, _asyncToGenerator.default)(function* ({ rootUri, command }) {
      const attachProcessInfo = yield getPythonAttachTargetProcessInfo(rootUri, command.target);
      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-python-debugger-auto-attach');
      debuggerService.startDebugging(attachProcessInfo);
      // Otherwise, we're already debugging that target.
    });

    return function (_x21) {
      return _ref13.apply(this, arguments);
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