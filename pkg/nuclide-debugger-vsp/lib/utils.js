"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNativeAutoGenConfig = getNativeAutoGenConfig;
exports.getNativeVSPLaunchProcessConfig = getNativeVSPLaunchProcessConfig;
exports.getNativeVSPAttachProcessConfig = getNativeVSPAttachProcessConfig;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
  const debugTypeMessage = `using ${vsAdapterType === _nuclideDebuggerCommon().VsAdapterTypes.NATIVE_GDB ? 'gdb' : 'lldb'}`;
  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType,
    threads: true,
    properties: [program, cwd, args, env, sourcePath],
    scriptPropertyName: 'program',
    cwdPropertyName: 'working directory',
    header: React.createElement("p", null, "Debug native programs ", debugTypeMessage, "."),

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
    header: React.createElement("p", null, "Attach to a running native process ", debugTypeMessage),

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
      program: _nuclideUri().default.getPath(program)
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