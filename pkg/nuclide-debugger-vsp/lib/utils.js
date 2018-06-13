'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrepackAutoGenConfig = getPrepackAutoGenConfig;
exports.resolveConfiguration = resolveConfiguration;
exports.getNativeAutoGenConfig = getNativeAutoGenConfig;
exports.getNativeVSPLaunchProcessInfo = getNativeVSPLaunchProcessInfo;
exports.getNativeVSPAttachProcessInfo = getNativeVSPAttachProcessInfo;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');
}

var _react = _interopRequireWildcard(require('react'));

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

function getPrepackAutoGenConfig() {
  const fileToPrepack = {
    name: 'sourceFile',
    type: 'string',
    description: 'Input the file you want to Prepack. Use absolute paths.',
    required: true,
    visible: true
  };
  const prepackRuntimePath = {
    name: 'prepackRuntime',
    type: 'string',
    description: 'Prepack executable path (e.g. lib/prepack-cli.js). Use absolute paths.',
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

async function lldbVspAdapterWrapperPath(program) {
  try {
    // $FlowFB
    return require('./fb-LldbVspAdapterPath').getLldbVspAdapterPath(program);
  } catch (ex) {
    return 'lldb-vscode';
  }
}

async function resolveConfiguration(configuration) {
  const { adapterExecutable, targetUri } = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }

  const debuggerService = (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).getVSCodeDebuggerAdapterServiceByNuclideUri)(configuration.targetUri);
  let sourcePath = configuration.config.sourcePath;

  if (sourcePath == null || sourcePath.trim() === '') {
    if (configuration.debugMode === 'launch') {
      sourcePath = await debuggerService.getBuckRootFromUri(configuration.config.program);
    } else if (configuration.config.pid != null) {
      sourcePath = await debuggerService.getBuckRootFromPid(configuration.config.pid);
    }
  }

  const config = configuration.config;
  if (sourcePath != null && sourcePath.trim() !== '') {
    config.sourcePath = await debuggerService.realpath(sourcePath);
  }

  adapterExecutable.command = await lldbVspAdapterWrapperPath(targetUri);

  return Object.assign({}, configuration, {
    config,
    adapterExecutable
  });
}

function getNativeAutoGenConfig(vsAdapterType) {
  const program = {
    name: 'program',
    type: 'path',
    description: 'Input the program/executable you want to launch',
    required: true,
    visible: true
  };
  const cwd = {
    name: 'cwd',
    type: 'path',
    description: 'Working directory for the launched executable',
    required: true,
    visible: true
  };
  const args = {
    name: 'args',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to the executable',
    required: false,
    defaultValue: '',
    visible: true
  };
  const env = {
    name: 'env',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: '',
    visible: true
  };
  const sourcePath = {
    name: 'sourcePath',
    type: 'path',
    description: 'Optional base path for sources',
    required: false,
    defaultValue: '',
    visible: true
  };

  const debugTypeMessage = `using ${vsAdapterType === (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_GDB ? 'gdb' : 'lldb'}`;

  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType,
    threads: true,
    properties: [program, cwd, args, env, sourcePath],
    scriptPropertyName: 'program',
    cwdPropertyName: 'working directory',
    header: _react.createElement(
      'p',
      null,
      'Debug native programs ',
      debugTypeMessage,
      '.'
    )
  };

  const pid = {
    name: 'pid',
    type: 'process',
    description: '',
    required: true,
    visible: true
  };
  const autoGenAttachConfig = {
    launch: false,
    vsAdapterType,
    threads: true,
    properties: [pid, sourcePath],
    header: _react.createElement(
      'p',
      null,
      'Attach to a running native process ',
      debugTypeMessage
    )
  };
  return {
    launch: autoGenLaunchConfig,
    attach: autoGenAttachConfig
  };
}

async function getNativeVSPLaunchProcessInfo(adapter, program, args) {
  return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(program, 'launch', adapter, null, Object.assign({
    program: (_nuclideUri || _load_nuclideUri()).default.getPath(program)
  }, args), { threads: true });
}

async function getNativeVSPAttachProcessInfo(adapter, targetUri, args) {
  return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, 'attach', adapter, null, args, {
    threads: true
  });
}