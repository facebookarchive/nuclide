'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../nuclide-commons-atom/createPackage'));
}

var _AutoGenLaunchAttachProvider;

function _load_AutoGenLaunchAttachProvider() {
  return _AutoGenLaunchAttachProvider = require('../../nuclide-debugger-common/AutoGenLaunchAttachProvider');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../nuclide-debugger-common');
}

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider() {
    return {
      type: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.OCAML,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).AutoGenLaunchAttachProvider((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterNames.OCAML, connection, getOCamlAutoGenConfig());
      }
    };
  }
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */

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
    defaultValue: [],
    visible: true
  };
  const environmentVariables = {
    name: 'environmentVariables',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g. SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: [],
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
    defaultValue: [],
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
    threads: false,
    properties: [debugExecutable, executablePath, argumentsProperty, environmentVariables, workingDirectory, additionalIncludeDirectories, breakAfterStart, logLevel],
    scriptPropertyName: 'executable',
    cwdPropertyName: 'working directory',
    header: null,
    getProcessName(values) {
      return values.debugExecutable + ' (OCaml)';
    }
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null
  };
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);