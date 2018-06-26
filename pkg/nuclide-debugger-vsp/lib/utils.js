'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrepackAutoGenConfig = getPrepackAutoGenConfig;
exports.getNativeAutoGenConfig = getNativeAutoGenConfig;
exports.getNativeVSPLaunchProcessConfig = getNativeVSPLaunchProcessConfig;
exports.getNativeVSPAttachProcessConfig = getNativeVSPAttachProcessConfig;

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
    header: null,
    getProcessName(values) {
      return values.fileToPrepack + ' (Prepack)';
    }
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null
  };
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
    ),
    getProcessName(values) {
      let processName = values.program;
      const lastSlash = processName.lastIndexOf('/');
      if (lastSlash >= 0) {
        processName = processName.substring(lastSlash + 1, processName.length);
      }
      processName += ' (' + debugTypeMessage + ')';
      return processName;
    }
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
    ),
    getProcessName(values) {
      return 'Pid: ' + values.pid + ' (' + debugTypeMessage + ')';
    }
  };
  return {
    launch: autoGenLaunchConfig,
    attach: autoGenAttachConfig
  };
}

function getNativeVSPLaunchProcessConfig(adapterType, program, config) {
  return {
    targetUri: program,
    debugMode: 'launch',
    adapterType,
    config: Object.assign({
      program: (_nuclideUri || _load_nuclideUri()).default.getPath(program)
    }, config)
  };
}

function getNativeVSPAttachProcessConfig(adapterType, targetUri, config) {
  return {
    targetUri,
    debugMode: 'attach',
    adapterType,
    config
  };
}